"""RPD compressor implementation with RLV2, PLV2 and ELV1 layers."""

from __future__ import annotations

import argparse
import base64
import collections
import dataclasses
import hashlib
import heapq
import io
import itertools
import json
import logging
import math
import struct
import time
import zlib
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple


LOGGER = logging.getLogger("rpd")


def canonical_json(obj: Any) -> bytes:
    return json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def _prepare_input(obj_or_bytes: Any) -> Tuple[Any, bytes]:
    if isinstance(obj_or_bytes, bytes):
        data_obj = json.loads(obj_or_bytes.decode("utf-8"))
        canonical = canonical_json(data_obj)
        return data_obj, canonical
    if isinstance(obj_or_bytes, str):
        data_obj = json.loads(obj_or_bytes)
        canonical = canonical_json(data_obj)
        return data_obj, canonical
    canonical = canonical_json(obj_or_bytes)
    return obj_or_bytes, canonical


def zigzag_encode(value: int) -> int:
    return (value << 1) ^ (value >> 63)


def zigzag_decode(value: int) -> int:
    return (value >> 1) ^ -(value & 1)


def encode_varint(value: int) -> bytes:
    if value < 0:
        raise ValueError("varint expects non-negative integers")
    out = bytearray()
    while True:
        to_write = value & 0x7F
        value >>= 7
        if value:
            out.append(to_write | 0x80)
        else:
            out.append(to_write)
            break
    return bytes(out)


def decode_varint(stream: io.BytesIO) -> int:
    shift = 0
    result = 0
    while True:
        b = stream.read(1)
        if not b:
            raise EOFError("unexpected end of stream while decoding varint")
        byte = b[0]
        result |= (byte & 0x7F) << shift
        if not (byte & 0x80):
            break
        shift += 7
    return result


def encode_varint_list(values: Iterable[int]) -> bytes:
    buf = bytearray()
    for value in values:
        buf.extend(encode_varint(value))
    return bytes(buf)


def decode_varint_list(data: bytes, count: int, signed: bool = False) -> List[int]:
    stream = io.BytesIO(data)
    result = []
    for _ in range(count):
        value = decode_varint(stream)
        if signed:
            value = zigzag_decode(value)
        result.append(value)
    remaining = stream.read(1)
    if remaining:
        raise ValueError("extra bytes after varint list")
    return result


def encode_ints_as_varints(values: Sequence[int]) -> bytes:
    return encode_varint_list(zigzag_encode(v) for v in values)


def decode_ints_from_varints(data: bytes, count: int) -> List[int]:
    return decode_varint_list(data, count, signed=True)


def floats_to_bytes(values: Sequence[float]) -> bytes:
    buf = bytearray()
    for value in values:
        buf.extend(struct.pack("<d", float(value)))
    return bytes(buf)


def floats_from_bytes(data: bytes) -> List[float]:
    if len(data) % 8:
        raise ValueError("float byte stream misaligned")
    count = len(data) // 8
    return [struct.unpack("<d", data[i * 8 : (i + 1) * 8])[0] for i in range(count)]


def bools_to_bitmap(flags: Sequence[bool]) -> bytes:
    bits = 0
    bit_count = 0
    out = bytearray()
    for flag in flags:
        if flag:
            bits |= 1 << bit_count
        bit_count += 1
        if bit_count == 8:
            out.append(bits)
            bits = 0
            bit_count = 0
    if bit_count:
        out.append(bits)
    return bytes(out)


def bitmap_to_bools(bitmap: bytes, count: int) -> List[bool]:
    result: List[bool] = []
    byte_index = 0
    bit_index = 0
    for byte in bitmap:
        for bit in range(8):
            result.append(bool(byte & (1 << bit)))
            if len(result) == count:
                return result
        byte_index += 1
        bit_index = 0
    return result


def pack_bits(values: Sequence[int], bit_width: int) -> bytes:
    if bit_width <= 0:
        return b""
    out = bytearray()
    bit_buffer = 0
    bits_in_buffer = 0
    mask = (1 << bit_width) - 1
    for value in values:
        bit_buffer |= (value & mask) << bits_in_buffer
        bits_in_buffer += bit_width
        while bits_in_buffer >= 8:
            out.append(bit_buffer & 0xFF)
            bit_buffer >>= 8
            bits_in_buffer -= 8
    if bits_in_buffer:
        out.append(bit_buffer & 0xFF)
    return bytes(out)


def unpack_bits(data: bytes, count: int, bit_width: int) -> List[int]:
    if bit_width == 0:
        return [0] * count
    result: List[int] = []
    bit_buffer = 0
    bits_in_buffer = 0
    iterator = iter(data)
    for _ in range(count):
        while bits_in_buffer < bit_width:
            try:
                byte = next(iterator)
            except StopIteration as exc:  # pragma: no cover - safety
                raise ValueError("insufficient bitpacked data") from exc
            bit_buffer |= byte << bits_in_buffer
            bits_in_buffer += 8
        value = bit_buffer & ((1 << bit_width) - 1)
        bit_buffer >>= bit_width
        bits_in_buffer -= bit_width
        result.append(value)
    return result


def detect_email(value: str) -> Optional[Tuple[str, str, List[str]]]:
    if "@" not in value:
        return None
    local, domain = value.split("@", 1)
    if not local or not domain or "." not in domain:
        return None
    return local, "@", domain.split(".")


def detect_url(value: str) -> Optional[Tuple[str, str, List[str], List[str]]]:
    if "://" not in value:
        return None
    scheme, rest = value.split("://", 1)
    if not scheme:
        return None
    host = rest
    path_tokens: List[str] = []
    query_tokens: List[str] = []
    if "/" in rest:
        host, path = rest.split("/", 1)
        path_tokens = [token for token in path.split("/") if token]
    if "?" in rest:
        path_part, query = rest.split("?", 1)
        path_tokens = [token for token in path_part.split("/") if token]
        query_tokens = [token for token in query.split("&") if token]
    return scheme, host, path_tokens, query_tokens


def detect_hex(value: str) -> Optional[List[str]]:
    stripped = value.replace("-", "")
    if len(stripped) < 16 or len(stripped) % 2:
        return None
    for ch in stripped:
        if ch not in "0123456789abcdefABCDEF":
            return None
    return [stripped[i : i + 2] for i in range(0, len(stripped), 2)]


def detect_base64(value: str) -> Optional[bytes]:
    if len(value) < 16 or len(value) % 4:
        return None
    try:
        decoded = base64.b64decode(value, validate=True)
        if decoded:
            return decoded
    except (ValueError, base64.binascii.Error):
        return None
    return None


def tokenize_string(value: str) -> Dict[str, Any]:
    tokens: Dict[str, Any] = {"original": value}
    email = detect_email(value)
    if email:
        tokens["email"] = {"local": email[0], "domain_tokens": email[2]}
        return tokens
    url = detect_url(value)
    if url:
        tokens["url"] = {
            "scheme": url[0],
            "host": url[1],
            "path_tokens": url[2],
            "query_tokens": url[3],
        }
        return tokens
    hex_tokens = detect_hex(value)
    if hex_tokens:
        tokens["hex"] = hex_tokens
        return tokens
    b64 = detect_base64(value)
    if b64 is not None:
        tokens["base64"] = True
        tokens["blob_size"] = len(b64)
        return tokens
    return tokens


# ---------------------------------------------------------------------------
# RLV2 layer
# ---------------------------------------------------------------------------


@dataclass
class ColumnData:
    schema_id: int
    key_id: int
    key_name: str
    logical_type: str
    values: List[Any] = field(default_factory=list)
    nulls: List[bool] = field(default_factory=list)


@dataclass
class RLV2Representation:
    schemas: Dict[int, List[int]]
    columns: Dict[Tuple[int, int], ColumnData]
    control_rows: List[int]
    key_dictionary: List[str]
    string_dictionary: List[Dict[str, Any]]
    blob_store: List[bytes]
    top_level: str

    def serialize(self) -> bytes:
        import pickle

        payload = {
            "schemas": self.schemas,
            "columns": {
                f"{schema_id}:{key_id}": {
                    "schema_id": column.schema_id,
                    "key_id": column.key_id,
                    "key_name": column.key_name,
                    "logical_type": column.logical_type,
                    "values": column.values,
                    "nulls": column.nulls,
                }
                for (schema_id, key_id), column in self.columns.items()
            },
            "control_rows": self.control_rows,
            "key_dictionary": self.key_dictionary,
            "string_dictionary": self.string_dictionary,
            "blob_store": [base64.b64encode(blob).decode("ascii") for blob in self.blob_store],
            "top_level": self.top_level,
        }
        return pickle.dumps(payload, protocol=4)


class RLV2Encoder:
    def __init__(self) -> None:
        self.key_to_id: Dict[str, int] = {}
        self.string_to_id: Dict[str, int] = {}
        self.string_metadata: Dict[int, Dict[str, Any]] = {}
        self.schemas: Dict[Tuple[int, ...], int] = {}
        self.schema_keys: Dict[int, List[int]] = {}
        self.columns: Dict[Tuple[int, int], ColumnData] = {}
        self.control_rows: List[int] = []
        self.blob_store: List[bytes] = []
        self.top_level: str = "array"

    def encode(self, data: Any) -> RLV2Representation:
        if isinstance(data, list):
            rows = data
        elif isinstance(data, dict):
            rows = [data]
            self.top_level = "object"
        else:
            raise TypeError("Top level JSON must be an object or array of objects")

        for row in rows:
            if not isinstance(row, dict):
                raise TypeError("RLV2 currently only supports arrays of objects")
            key_ids: List[int] = []
            key_names = list(row.keys())
            for key in key_names:
                key_ids.append(self._get_key_id(key))
            schema_key = tuple(key_ids)
            schema_id = self.schemas.setdefault(schema_key, len(self.schemas))
            if schema_id not in self.schema_keys:
                self.schema_keys[schema_id] = list(key_ids)
            self.control_rows.append(schema_id)
            for key, key_id in zip(key_names, key_ids):
                column = self.columns.get((schema_id, key_id))
                if column is None:
                    column = ColumnData(
                        schema_id=schema_id,
                        key_id=key_id,
                        key_name=key,
                        logical_type="unknown",
                    )
                    self.columns[(schema_id, key_id)] = column
                value = row.get(key)
                if value is None:
                    column.nulls.append(True)
                    column.values.append(0)
                else:
                    logical_type, stored = self._normalise_value(value)
                    if column.logical_type == "unknown":
                        column.logical_type = logical_type
                    column.nulls.append(False)
                    column.values.append(stored)

        string_dict = [self.string_metadata[idx] for idx in range(len(self.string_metadata))]
        key_dict = [key for key, _ in sorted(self.key_to_id.items(), key=lambda kv: kv[1])]
        return RLV2Representation(
            schemas=self.schema_keys,
            columns=self.columns,
            control_rows=self.control_rows,
            key_dictionary=key_dict,
            string_dictionary=string_dict,
            blob_store=self.blob_store,
            top_level=self.top_level,
        )

    def _get_key_id(self, key: str) -> int:
        if key not in self.key_to_id:
            self.key_to_id[key] = len(self.key_to_id)
        return self.key_to_id[key]

    def _get_string_id(self, value: str) -> int:
        existing = self.string_to_id.get(value)
        if existing is not None:
            return existing
        idx = len(self.string_to_id)
        meta = tokenize_string(value)
        blob_index: Optional[int] = None
        if meta.get("base64"):
            decoded = detect_base64(value)
            if decoded is not None:
                self.blob_store.append(decoded)
                blob_index = len(self.blob_store) - 1
        self.string_to_id[value] = idx
        self.string_metadata[idx] = {
            "value": value,
            "tokens": meta,
            "blob": blob_index,
        }
        return idx

    def _normalise_value(self, value: Any) -> Tuple[str, Any]:
        if isinstance(value, bool):
            return "bool", int(value)
        if isinstance(value, int) and not isinstance(value, bool):
            return "int", value
        if isinstance(value, float):
            bits = struct.unpack("<Q", struct.pack("<d", float(value)))[0]
            return "float", bits
        if isinstance(value, str):
            return "string", self._get_string_id(value)
        if value is None:
            return "null", 0
        if isinstance(value, list) or isinstance(value, dict):
            encoded = canonical_json(value).decode("utf-8")
            string_id = self._get_string_id(encoded)
            return "json", string_id
        return "string", self._get_string_id(str(value))


# ---------------------------------------------------------------------------
# PLV2 layer (pattern transforms)
# ---------------------------------------------------------------------------


@dataclass
class Segment:
    start: int
    length: int
    mode: str
    params: Dict[str, Any]
    payload: bytes
    raw_size: int
    transformed_size: int


@dataclass
class ColumnTransformed:
    schema_id: int
    key_id: int
    key_name: str
    logical_type: str
    length: int
    null_bitmap: bytes
    segments: List[Segment]


@dataclass
class PLV2Representation:
    columns: Dict[Tuple[int, int], ColumnTransformed]

    def serialize(self) -> bytes:
        import pickle

        payload = {
            f"{schema_id}:{key_id}": {
                "schema_id": column.schema_id,
                "key_id": column.key_id,
                "key_name": column.key_name,
                "logical_type": column.logical_type,
                "length": column.length,
                "null_bitmap": base64.b64encode(column.null_bitmap).decode("ascii"),
                "segments": [
                    {
                        "start": segment.start,
                        "length": segment.length,
                        "mode": segment.mode,
                        "params": segment.params,
                        "payload": base64.b64encode(segment.payload).decode("ascii"),
                        "raw_size": segment.raw_size,
                        "transformed_size": segment.transformed_size,
                    }
                    for segment in column.segments
                ],
            }
            for (schema_id, key_id), column in self.columns.items()
        }
        return pickle.dumps(payload, protocol=4)


MODE_IDS = {
    "RAW": 0,
    "RLE": 1,
    "MRLE": 2,
    "DELTA": 3,
    "DELTA2": 4,
    "BITPACK": 5,
    "SWD": 6,
}


class PLV2Transformer:
    def transform(self, rep: RLV2Representation) -> PLV2Representation:
        columns: Dict[Tuple[int, int], ColumnTransformed] = {}
        for (schema_id, key_id), column in rep.columns.items():
            null_bitmap = bools_to_bitmap(column.nulls)
            values = column.values
            segment = self._select_segment(column.logical_type, values)
            LOGGER.info(
                "PLV2 column %s mode=%s raw=%d transformed=%d",
                column.key_name,
                segment.mode,
                segment.raw_size,
                segment.transformed_size,
            )
            columns[(schema_id, key_id)] = ColumnTransformed(
                schema_id=schema_id,
                key_id=key_id,
                key_name=column.key_name,
                logical_type=column.logical_type,
                length=len(values),
                null_bitmap=null_bitmap,
                segments=[segment],
            )
        return PLV2Representation(columns=columns)

    def _select_segment(self, logical_type: str, values: Sequence[Any]) -> Segment:
        if logical_type in {"int", "string", "bool", "float"}:
            return self._best_integer_segment(logical_type, values)
        raw_bytes = encode_ints_as_varints([int(v) for v in values])
        return Segment(0, len(values), "RAW", {}, raw_bytes, len(raw_bytes), len(raw_bytes))

    def _best_integer_segment(self, logical_type: str, values: Sequence[Any]) -> Segment:
        ints = [int(v) for v in values]
        raw_payload = encode_ints_as_varints(ints)
        best = Segment(0, len(values), "RAW", {}, raw_payload, len(raw_payload), len(raw_payload))

        # RLE
        rle_payload = self._encode_rle(ints)
        if rle_payload is not None and len(rle_payload) + 1 < best.transformed_size:
            best = Segment(0, len(values), "RLE", {}, rle_payload, len(raw_payload), len(rle_payload))

        # MRLE
        mrle = self._encode_mrle(ints)
        if mrle is not None and len(mrle["payload"]) + 4 < best.transformed_size:
            best = Segment(
                0,
                len(values),
                "MRLE",
                {"pattern_length": mrle["pattern_length"]},
                mrle["payload"],
                len(raw_payload),
                len(mrle["payload"]),
            )

        # DELTA
        delta = self._encode_delta(ints)
        if delta is not None and delta["size"] < best.transformed_size:
            best = Segment(
                0,
                len(values),
                "DELTA",
                {"start": delta["start"], "step": delta["step"]},
                b"",
                len(raw_payload),
                delta["size"],
            )

        # DELTA2
        delta2 = self._encode_delta2(ints)
        if delta2 is not None and delta2["size"] < best.transformed_size:
            best = Segment(
                0,
                len(values),
                "DELTA2",
                {
                    "start": delta2["start"],
                    "next": delta2["next"],
                    "second": delta2["second"],
                },
                b"",
                len(raw_payload),
                delta2["size"],
            )

        # BITPACK
        bitpack = self._encode_bitpack(ints)
        if bitpack is not None and len(bitpack["payload"]) + 5 < best.transformed_size:
            best = Segment(
                0,
                len(values),
                "BITPACK",
                {"min": bitpack["min"], "bit_width": bitpack["bit_width"]},
                bitpack["payload"],
                len(raw_payload),
                len(bitpack["payload"]),
            )

        # SWD
        swd_payload = self._encode_swd(ints)
        if swd_payload is not None and len(swd_payload) + 5 < best.transformed_size:
            best = Segment(0, len(values), "SWD", {"window": 32}, swd_payload, len(raw_payload), len(swd_payload))

        return best

    def _encode_rle(self, values: Sequence[int]) -> Optional[bytes]:
        if not values:
            return None
        runs: List[Tuple[int, int]] = []
        current = values[0]
        count = 1
        for value in values[1:]:
            if value == current:
                count += 1
            else:
                runs.append((current, count))
                current = value
                count = 1
        runs.append((current, count))
        if len(runs) >= len(values):
            return None
        buf = bytearray()
        for value, count in runs:
            buf.extend(encode_varint(zigzag_encode(value)))
            buf.extend(encode_varint(count))
        return bytes(buf)

    def _encode_mrle(self, values: Sequence[int]) -> Optional[Dict[str, Any]]:
        n = len(values)
        if n == 0:
            return None
        for pattern_length in range(2, min(5, n + 1)):
            pattern = values[:pattern_length]
            repeats = 0
            for i in range(0, n, pattern_length):
                if values[i : i + pattern_length] != pattern:
                    break
                repeats += 1
            if repeats * pattern_length == n and repeats > 1:
                payload = bytearray()
                payload.extend(encode_varint(pattern_length))
                payload.extend(encode_varint(repeats))
                payload.extend(encode_ints_as_varints(pattern))
                return {"pattern_length": pattern_length, "payload": bytes(payload)}
        return None

    def _encode_delta(self, values: Sequence[int]) -> Optional[Dict[str, Any]]:
        if len(values) < 2:
            return None
        step = values[1] - values[0]
        for prev, current in zip(values, values[1:]):
            if current - prev != step:
                return None
        size = len(encode_varint(zigzag_encode(values[0]))) + len(encode_varint(zigzag_encode(step)))
        return {"start": values[0], "step": step, "size": size}

    def _encode_delta2(self, values: Sequence[int]) -> Optional[Dict[str, Any]]:
        if len(values) < 3:
            return None
        first_diff = values[1] - values[0]
        second_diff = values[2] - values[1]
        second = second_diff - first_diff
        if second != 0:
            return None
        for a, b, c in zip(values, values[1:], values[2:]):
            if (c - b) - (b - a) != 0:
                return None
        size = (
            len(encode_varint(zigzag_encode(values[0])))
            + len(encode_varint(zigzag_encode(values[1])))
            + len(encode_varint(zigzag_encode(0)))
        )
        return {"start": values[0], "next": values[1], "second": 0, "size": size}

    def _encode_bitpack(self, values: Sequence[int]) -> Optional[Dict[str, Any]]:
        if not values:
            return None
        min_value = min(values)
        max_value = max(values)
        span = max_value - min_value
        if span < 0:
            return None
        bit_width = span.bit_length()
        if bit_width == 0:
            bit_width = 1
        if bit_width >= 16:
            return None
        adjusted = [value - min_value for value in values]
        payload = pack_bits(adjusted, bit_width)
        return {"min": min_value, "bit_width": bit_width, "payload": payload}

    def _encode_swd(self, values: Sequence[int], window: int = 32) -> Optional[bytes]:
        if not values:
            return None
        window_values: List[int] = []
        tokens = bytearray()
        changes = 0
        for value in values:
            try:
                index = window_values.index(value)
            except ValueError:
                index = -1
            if index >= 0:
                tokens.append(1)
                tokens.extend(encode_varint(index))
                window_values.pop(index)
            else:
                tokens.append(0)
                tokens.extend(encode_varint(zigzag_encode(value)))
                changes += 1
            window_values.insert(0, value)
            if len(window_values) > window:
                window_values.pop()
        if changes == len(values):
            return None
        return bytes(tokens)


def serialize_segment(segment: Segment) -> bytes:
    buf = bytearray()
    buf.append(MODE_IDS[segment.mode])
    buf.extend(encode_varint(segment.start))
    buf.extend(encode_varint(segment.length))
    params_bytes = serialize_params(segment.mode, segment.params)
    buf.extend(encode_varint(len(params_bytes)))
    buf.extend(params_bytes)
    buf.extend(encode_varint(len(segment.payload)))
    buf.extend(segment.payload)
    return bytes(buf)


def serialize_params(mode: str, params: Dict[str, Any]) -> bytes:
    buf = bytearray()
    if mode == "DELTA":
        buf.extend(encode_varint(zigzag_encode(params["start"])))
        buf.extend(encode_varint(zigzag_encode(params["step"])))
    elif mode == "DELTA2":
        buf.extend(encode_varint(zigzag_encode(params["start"])))
        buf.extend(encode_varint(zigzag_encode(params["next"])))
        buf.extend(encode_varint(zigzag_encode(params["second"])))
    elif mode == "BITPACK":
        buf.extend(encode_varint(zigzag_encode(params["min"])))
        buf.append(int(params["bit_width"]))
    elif mode == "MRLE":
        buf.extend(encode_varint(params.get("pattern_length", 0)))
    elif mode == "SWD":
        buf.extend(encode_varint(params.get("window", 32)))
    return bytes(buf)


def deserialize_params(mode: str, data: bytes) -> Dict[str, Any]:
    stream = io.BytesIO(data)
    if mode == "DELTA":
        start = zigzag_decode(decode_varint(stream))
        step = zigzag_decode(decode_varint(stream))
        return {"start": start, "step": step}
    if mode == "DELTA2":
        start = zigzag_decode(decode_varint(stream))
        next_value = zigzag_decode(decode_varint(stream))
        second = zigzag_decode(decode_varint(stream))
        return {"start": start, "next": next_value, "second": second}
    if mode == "BITPACK":
        minimum = zigzag_decode(decode_varint(stream))
        bit_width = stream.read(1)
        if not bit_width:
            raise ValueError("missing bit width")
        return {"min": minimum, "bit_width": bit_width[0]}
    if mode == "MRLE":
        length = decode_varint(stream)
        return {"pattern_length": length}
    if mode == "SWD":
        return {"window": decode_varint(stream)}
    return {}


# ---------------------------------------------------------------------------
# ELV1 layer (entropy coding)
# ---------------------------------------------------------------------------


@dataclass
class EntropyChunk:
    codec_id: int
    original_size: int
    encoded_bits: int
    table: List[Tuple[int, int]]
    payload: bytes


@dataclass
class StreamEncoding:
    name: str
    chunks: List[EntropyChunk]

    def to_bytes(self) -> bytes:
        buf = bytearray()
        buf.extend(struct.pack("<I", len(self.chunks)))
        for chunk in self.chunks:
            header = bytearray()
            header.extend(struct.pack("<BIIH", chunk.codec_id, chunk.original_size, chunk.encoded_bits, len(chunk.table)))
            for symbol, length in chunk.table:
                header.extend(struct.pack("<BB", symbol, length))
            header.extend(struct.pack("<I", len(chunk.payload)))
            header.extend(chunk.payload)
            buf.extend(struct.pack("<I", len(header)))
            buf.extend(header)
        return bytes(buf)

    @classmethod
    def from_bytes(cls, name: str, data: bytes) -> "StreamEncoding":
        stream = io.BytesIO(data)
        chunk_count_bytes = stream.read(4)
        if len(chunk_count_bytes) != 4:
            raise ValueError("invalid stream encoding header")
        chunk_count = struct.unpack("<I", chunk_count_bytes)[0]
        chunks: List[EntropyChunk] = []
        for _ in range(chunk_count):
            size_bytes = stream.read(4)
            if len(size_bytes) != 4:
                raise ValueError("invalid chunk size header")
            chunk_size = struct.unpack("<I", size_bytes)[0]
            chunk_data = stream.read(chunk_size)
            if len(chunk_data) != chunk_size:
                raise ValueError("incomplete chunk data")
            chunk_stream = io.BytesIO(chunk_data)
            header_bytes = chunk_stream.read(11)
            if len(header_bytes) != 11:
                raise ValueError("truncated entropy chunk header")
            codec_id, original_size, encoded_bits, table_len = struct.unpack("<BIIH", header_bytes)
            table: List[Tuple[int, int]] = []
            for _ in range(table_len):
                symbol, length = struct.unpack("<BB", chunk_stream.read(2))
                table.append((symbol, length))
            payload_len_bytes = chunk_stream.read(4)
            if len(payload_len_bytes) != 4:
                raise ValueError("missing payload length")
            payload_len = struct.unpack("<I", payload_len_bytes)[0]
            payload = chunk_stream.read(payload_len)
            if len(payload) != payload_len:
                raise ValueError("truncated payload")
            chunks.append(EntropyChunk(codec_id, original_size, encoded_bits, table, payload))
        return cls(name=name, chunks=chunks)


def build_huffman_code_lengths(frequencies: Dict[int, int]) -> Dict[int, int]:
    if len(frequencies) == 1:
        symbol = next(iter(frequencies))
        return {symbol: 1}

    counter = 0
    heap: List[Tuple[int, int, Dict[str, Any]]] = []
    for symbol, freq in frequencies.items():
        node = {"symbol": symbol, "left": None, "right": None}
        heapq.heappush(heap, (freq, counter, node))
        counter += 1

    while len(heap) > 1:
        freq1, _, node1 = heapq.heappop(heap)
        freq2, _, node2 = heapq.heappop(heap)
        parent = {"symbol": None, "left": node1, "right": node2}
        heapq.heappush(heap, (freq1 + freq2, counter, parent))
        counter += 1

    _, _, root = heapq.heappop(heap)
    code_lengths: Dict[int, int] = {}

    def traverse(node: Dict[str, Any], depth: int) -> None:
        if node["symbol"] is not None:
            code_lengths[node["symbol"]] = max(depth, 1)
        else:
            traverse(node["left"], depth + 1)
            traverse(node["right"], depth + 1)

    traverse(root, 0)
    return code_lengths


def canonical_codes(code_lengths: Dict[int, int]) -> Dict[int, Tuple[int, int]]:
    items = sorted(code_lengths.items(), key=lambda kv: (kv[1], kv[0]))
    codes: Dict[int, Tuple[int, int]] = {}
    code = 0
    prev_len = 0
    for symbol, length in items:
        code <<= length - prev_len
        codes[symbol] = (code, length)
        code += 1
        prev_len = length
    return codes


def _reverse_bits(code: int, length: int) -> int:
    result = 0
    for i in range(length):
        if code & (1 << (length - 1 - i)):
            result |= 1 << i
    return result


def huffman_encode(data: bytes) -> Tuple[List[Tuple[int, int]], bytes, int]:
    frequencies = collections.Counter(data)
    if not frequencies:
        return [], b"", 0
    code_lengths = build_huffman_code_lengths(frequencies)
    codes = canonical_codes(code_lengths)
    table = [(symbol, code_lengths[symbol]) for symbol in sorted(code_lengths)]
    bit_buffer = 0
    bits_in_buffer = 0
    out = bytearray()
    bit_count = 0
    for byte in data:
        code, length = codes[byte]
        rev_code = _reverse_bits(code, length)
        bit_buffer |= rev_code << bits_in_buffer
        bits_in_buffer += length
        bit_count += length
        while bits_in_buffer >= 8:
            out.append(bit_buffer & 0xFF)
            bit_buffer >>= 8
            bits_in_buffer -= 8
    if bits_in_buffer:
        out.append(bit_buffer & 0xFF)
    return table, bytes(out), bit_count


def huffman_decode(table: List[Tuple[int, int]], data: bytes, bit_length: int, original_size: int) -> bytes:
    if not table:
        return b""
    code_lengths = {symbol: length for symbol, length in table}
    codes = canonical_codes(code_lengths)
    decode_map = {(_reverse_bits(code, length), length): symbol for symbol, (code, length) in codes.items()}
    result = bytearray()
    current_code = 0
    current_length = 0
    bits_consumed = 0
    for byte in data:
        for i in range(8):
            if bits_consumed >= bit_length:
                break
            bit = (byte >> i) & 1
            current_code |= bit << current_length
            current_length += 1
            bits_consumed += 1
            key = (current_code, current_length)
            if key in decode_map:
                result.append(decode_map[key])
                current_code = 0
                current_length = 0
                if len(result) == original_size:
                    return bytes(result)
    return bytes(result)


class ELV1EntropyCoder:
    CHUNK_SIZE = 64 * 1024

    def encode_stream(self, name: str, data: bytes) -> StreamEncoding:
        chunks: List[EntropyChunk] = []
        for offset in range(0, len(data), self.CHUNK_SIZE):
            chunk_data = data[offset : offset + self.CHUNK_SIZE]
            table, encoded, bit_length = huffman_encode(chunk_data)
            if not table or len(encoded) >= len(chunk_data):
                chunk = EntropyChunk(0, len(chunk_data), len(chunk_data) * 8, [], chunk_data)
            else:
                chunk = EntropyChunk(1, len(chunk_data), bit_length, table, encoded)
            chunks.append(chunk)
        if not chunks:
            chunks.append(EntropyChunk(0, 0, 0, [], b""))
        return StreamEncoding(name=name, chunks=chunks)

    def decode_stream(self, encoding: StreamEncoding) -> bytes:
        out = bytearray()
        for chunk in encoding.chunks:
            if chunk.codec_id == 0:
                out.extend(chunk.payload)
            elif chunk.codec_id == 1:
                out.extend(huffman_decode(chunk.table, chunk.payload, chunk.encoded_bits, chunk.original_size))
            else:
                raise ValueError(f"Unsupported codec_id {chunk.codec_id}")
        return bytes(out)


def serialize_column_stream(column: ColumnTransformed) -> bytes:
    buf = bytearray()
    buf.extend(encode_varint(column.length))
    buf.extend(encode_varint(len(column.null_bitmap)))
    buf.extend(column.null_bitmap)
    buf.extend(encode_varint(len(column.segments)))
    for segment in column.segments:
        encoded = serialize_segment(segment)
        buf.extend(encode_varint(len(encoded)))
        buf.extend(encoded)
    return bytes(buf)


def deserialize_column_stream(data: bytes) -> Tuple[int, bytes, List[Segment]]:
    stream = io.BytesIO(data)
    length = decode_varint(stream)
    bitmap_size = decode_varint(stream)
    null_bitmap = stream.read(bitmap_size)
    segment_count = decode_varint(stream)
    segments: List[Segment] = []
    for _ in range(segment_count):
        seg_len = decode_varint(stream)
        segment_data = stream.read(seg_len)
        if len(segment_data) != seg_len:
            raise ValueError("segment truncated")
        segments.append(deserialize_segment(segment_data))
    return length, null_bitmap, segments


def deserialize_segment(data: bytes) -> Segment:
    stream = io.BytesIO(data)
    mode_id = stream.read(1)
    if not mode_id:
        raise ValueError("missing mode id")
    mode_lookup = {v: k for k, v in MODE_IDS.items()}
    mode = mode_lookup[mode_id[0]]
    start = decode_varint(stream)
    length = decode_varint(stream)
    params_len = decode_varint(stream)
    params_data = stream.read(params_len)
    params = deserialize_params(mode, params_data)
    payload_len = decode_varint(stream)
    payload = stream.read(payload_len)
    return Segment(start, length, mode, params, payload, 0, 0)


def decode_segment(segment: Segment) -> List[int]:
    mode = segment.mode
    length = segment.length
    if mode == "RAW":
        return decode_ints_from_varints(segment.payload, length)
    if mode == "RLE":
        stream = io.BytesIO(segment.payload)
        values: List[int] = []
        while len(values) < length:
            value = zigzag_decode(decode_varint(stream))
            count = decode_varint(stream)
            values.extend([value] * count)
        return values[:length]
    if mode == "MRLE":
        stream = io.BytesIO(segment.payload)
        pattern_length = decode_varint(stream)
        repeats = decode_varint(stream)
        pattern_bytes = stream.read()
        pattern = decode_ints_from_varints(pattern_bytes, pattern_length)
        return (pattern * repeats)[:length]
    if mode == "DELTA":
        start = segment.params["start"]
        step = segment.params["step"]
        return [start + step * i for i in range(length)]
    if mode == "DELTA2":
        start = segment.params["start"]
        next_value = segment.params["next"]
        second = segment.params["second"]
        values = [start, next_value]
        for _ in range(2, length):
            next_value = values[-1] + (values[-1] - values[-2]) + second
            values.append(next_value)
        return values[:length]
    if mode == "BITPACK":
        minimum = segment.params["min"]
        bit_width = segment.params["bit_width"]
        adjusted = unpack_bits(segment.payload, length, bit_width)
        return [minimum + value for value in adjusted]
    if mode == "SWD":
        window = segment.params.get("window", 32)
        window_values: List[int] = []
        stream = io.BytesIO(segment.payload)
        values: List[int] = []
        while len(values) < length:
            flag = stream.read(1)
            if not flag:
                break
            if flag[0] == 1:
                index = decode_varint(stream)
                if index >= len(window_values):
                    raise ValueError("SWD reference out of range")
                value = window_values[index]
                window_values.pop(index)
            else:
                encoded = decode_varint(stream)
                value = zigzag_decode(encoded)
            window_values.insert(0, value)
            if len(window_values) > window:
                window_values.pop()
            values.append(value)
        if len(values) != length:
            values.extend([0] * (length - len(values)))
        return values
    raise ValueError(f"Unsupported segment mode {mode}")


# ---------------------------------------------------------------------------
# Container assembly and API
# ---------------------------------------------------------------------------


MAGIC = b"RPD1"
VERSION = 0x00020000


def _json_dumps(obj: Any) -> bytes:
    return json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def serialize_container(
    rep: RLV2Representation,
    plv2: PLV2Representation,
    streams: Dict[str, StreamEncoding],
    original_json: bytes,
) -> bytes:
    dictionary_section = _json_dumps(
        {
            "keys": rep.key_dictionary,
            "strings": rep.string_dictionary,
            "blobs": [base64.b64encode(blob).decode("ascii") for blob in rep.blob_store],
        }
    )
    schema_section = _json_dumps({str(schema_id): keys for schema_id, keys in rep.schemas.items()})
    control_section = _json_dumps({"rows": rep.control_rows, "top_level": rep.top_level})
    column_directory = []
    for (schema_id, key_id), column in plv2.columns.items():
        column_directory.append(
            {
                "schema_id": schema_id,
                "key_id": key_id,
                "key_name": column.key_name,
                "logical_type": column.logical_type,
                "length": column.length,
                "stream": f"col_{schema_id}_{key_id}",
            }
        )
    column_section = _json_dumps(column_directory)

    streams_blob = bytearray()
    stream_directory = []
    offset = 0
    for name, encoding in streams.items():
        data = encoding.to_bytes()
        stream_directory.append({"name": name, "offset": offset, "size": len(data)})
        streams_blob.extend(data)
        offset += len(data)
    stream_directory_section = _json_dumps(stream_directory)

    footer_section = _json_dumps(
        {
            "original_size": len(original_json),
            "crc32": zlib.crc32(original_json) & 0xFFFFFFFF,
            "sha1": hashlib.sha1(original_json).hexdigest(),
        }
    )

    container = bytearray()
    container.extend(MAGIC)
    container.extend(struct.pack("<I", VERSION))
    for section in [
        dictionary_section,
        schema_section,
        control_section,
        column_section,
        stream_directory_section,
    ]:
        container.extend(struct.pack("<I", len(section)))
        container.extend(section)
    container.extend(struct.pack("<I", len(streams_blob)))
    container.extend(streams_blob)
    container.extend(struct.pack("<I", len(footer_section)))
    container.extend(footer_section)
    return bytes(container)


def parse_container(data: bytes) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any], List[Dict[str, Any]], Dict[str, bytes], Dict[str, Any]]:
    stream = io.BytesIO(data)
    magic = stream.read(4)
    if magic != MAGIC:
        raise ValueError("invalid RPD magic")
    version_bytes = stream.read(4)
    if len(version_bytes) != 4:
        raise ValueError("missing version")
    version = struct.unpack("<I", version_bytes)[0]
    if version != VERSION:
        raise ValueError(f"unsupported RPD version {version}")

    sections = []
    for _ in range(5):
        size_bytes = stream.read(4)
        if len(size_bytes) != 4:
            raise ValueError("missing section size")
        size = struct.unpack("<I", size_bytes)[0]
        section_data = stream.read(size)
        if len(section_data) != size:
            raise ValueError("truncated section")
        sections.append(json.loads(section_data.decode("utf-8")))

    streams_size_bytes = stream.read(4)
    if len(streams_size_bytes) != 4:
        raise ValueError("missing streams size")
    streams_size = struct.unpack("<I", streams_size_bytes)[0]
    streams_blob = stream.read(streams_size)
    stream_directory = sections[4]
    streams: Dict[str, bytes] = {}
    for entry in stream_directory:
        offset = entry["offset"]
        size = entry["size"]
        name = entry["name"]
        streams[name] = streams_blob[offset : offset + size]

    footer_size_bytes = stream.read(4)
    if len(footer_size_bytes) != 4:
        raise ValueError("missing footer size")
    footer_size = struct.unpack("<I", footer_size_bytes)[0]
    footer_data = stream.read(footer_size)
    footer = json.loads(footer_data.decode("utf-8"))

    dictionary, schemas, control, columns, _ = sections
    return dictionary, schemas, control, columns, streams, footer


def _decode_column_values(
    logical_type: str,
    length: int,
    null_bitmap: bytes,
    segments: List[Segment],
) -> List[Any]:
    values: List[int] = []
    for segment in segments:
        values.extend(decode_segment(segment))
    values = values[:length]
    nulls = bitmap_to_bools(null_bitmap, length)
    typed: List[Any] = []
    for index in range(length):
        if nulls[index]:
            typed.append(None)
            continue
        raw_value = values[index]
        if logical_type == "int":
            typed.append(raw_value)
        elif logical_type == "bool":
            typed.append(bool(raw_value))
        elif logical_type in {"string", "json"}:
            typed.append(raw_value)
        elif logical_type == "float":
            typed.append(struct.unpack("<d", struct.pack("<Q", raw_value))[0])
        else:
            typed.append(raw_value)
    return typed


def _build_streams(plv2: PLV2Representation) -> Tuple[Dict[str, StreamEncoding], Dict[str, int]]:
    coder = ELV1EntropyCoder()
    streams: Dict[str, StreamEncoding] = {}
    raw_sizes: Dict[str, int] = {}
    for (schema_id, key_id), column in plv2.columns.items():
        name = f"col_{schema_id}_{key_id}"
        raw_bytes = serialize_column_stream(column)
        raw_sizes[name] = len(raw_bytes)
        streams[name] = coder.encode_stream(name, raw_bytes)
    return streams, raw_sizes


def _reconstruct_rows(
    dictionary: Dict[str, Any],
    schemas: Dict[str, Any],
    control: Dict[str, Any],
    column_data: Dict[Tuple[int, int], List[Any]],
    column_meta: Dict[Tuple[int, int], Dict[str, Any]],
) -> Any:
    key_dict: List[str] = dictionary["keys"]
    string_entries: List[Dict[str, Any]] = dictionary["strings"]
    strings = [entry["value"] for entry in string_entries]
    schema_map = {int(schema_id): [int(k) for k in keys] for schema_id, keys in schemas.items()}
    indices: Dict[Tuple[int, int], int] = collections.defaultdict(int)
    rows: List[Dict[str, Any]] = []
    for schema_id in control["rows"]:
        schema_id_int = int(schema_id)
        keys = schema_map[schema_id_int]
        row: Dict[str, Any] = {}
        for key_id in keys:
            column_key = (schema_id_int, key_id)
            values = column_data[column_key]
            idx = indices[column_key]
            indices[column_key] += 1
            value = values[idx]
            logical_type = column_meta[column_key]["logical_type"]
            key_name = key_dict[key_id]
            if value is None:
                row[key_name] = None
            elif logical_type == "string":
                if value >= len(strings):
                    raise ValueError("string dictionary reference out of range")
                row[key_name] = strings[value]
            elif logical_type == "json":
                if value >= len(strings):
                    raise ValueError("string dictionary reference out of range")
                row[key_name] = json.loads(strings[value])
            else:
                row[key_name] = value
        rows.append(row)
    return rows


def rpd_compress_with_stats(obj_or_bytes: Any) -> Tuple[bytes, Dict[str, Any]]:
    data_obj, canonical = _prepare_input(obj_or_bytes)
    encoder = RLV2Encoder()
    rep = encoder.encode(data_obj)
    rlv2_bytes = rep.serialize()
    transformer = PLV2Transformer()
    plv2 = transformer.transform(rep)
    plv2_bytes = plv2.serialize()
    streams, raw_sizes = _build_streams(plv2)
    container = serialize_container(rep, plv2, streams, canonical)
    stats = {
        "rlv2_size": len(rlv2_bytes),
        "plv2_size": len(plv2_bytes),
        "streams_raw_size": sum(raw_sizes.values()),
        "final_size": len(container),
        "column_modes": {
            f"col_{schema}_{key}": plv2.columns[(schema, key)].segments[0].mode
            for (schema, key) in plv2.columns
        },
    }
    return container, stats


def rpd_compress(obj_or_bytes: Any) -> bytes:
    compressed, _ = rpd_compress_with_stats(obj_or_bytes)
    return compressed


def rpd_decompress(data: bytes) -> bytes:
    dictionary, schemas, control, columns, streams_blob, footer = parse_container(data)
    coder = ELV1EntropyCoder()
    column_data: Dict[Tuple[int, int], List[Any]] = {}
    column_meta: Dict[Tuple[int, int], Dict[str, Any]] = {}
    for entry in columns:
        schema_id = int(entry["schema_id"])
        key_id = int(entry["key_id"])
        name = entry["stream"]
        stream_bytes = streams_blob[name]
        encoding = StreamEncoding.from_bytes(name, stream_bytes)
        raw_bytes = coder.decode_stream(encoding)
        length, null_bitmap, segments = deserialize_column_stream(raw_bytes)
        values = _decode_column_values(entry["logical_type"], length, null_bitmap, segments)
        column_key = (schema_id, key_id)
        column_data[column_key] = values
        column_meta[column_key] = {"logical_type": entry["logical_type"]}
    reconstructed = _reconstruct_rows(dictionary, schemas, control, column_data, column_meta)
    if control.get("top_level") == "array":
        result_obj = reconstructed
    else:
        result_obj = reconstructed[0] if reconstructed else {}
    output = canonical_json(result_obj)
    if (zlib.crc32(output) & 0xFFFFFFFF) != footer["crc32"]:
        raise ValueError("CRC mismatch during decompression")
    return output


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="RPD compressor/decompressor")
    subparsers = parser.add_subparsers(dest="command", required=True)

    compress_parser = subparsers.add_parser("compress", help="Compress JSON input into RPD format")
    compress_parser.add_argument("input", help="Input JSON file")
    compress_parser.add_argument("output", help="Output .rpd file")

    decompress_parser = subparsers.add_parser("decompress", help="Decompress RPD file to JSON")
    decompress_parser.add_argument("input", help="Input .rpd file")
    decompress_parser.add_argument("output", help="Output JSON file")

    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

    if args.command == "compress":
        with open(args.input, "rb") as f:
            data = f.read()
        compressed = rpd_compress(data)
        with open(args.output, "wb") as f:
            f.write(compressed)
        LOGGER.info("Compressed %s -> %s (%d bytes)", args.input, args.output, len(compressed))
    elif args.command == "decompress":
        with open(args.input, "rb") as f:
            compressed = f.read()
        output = rpd_decompress(compressed)
        with open(args.output, "wb") as f:
            f.write(output)
        LOGGER.info("Decompressed %s -> %s (%d bytes)", args.input, args.output, len(output))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

