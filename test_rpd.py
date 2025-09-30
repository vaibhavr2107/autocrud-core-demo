import unittest

from rpd import (
    Segment,
    canonical_json,
    decode_segment,
    huffman_decode,
    huffman_encode,
    pack_bits,
    rpd_compress,
    rpd_decompress,
    unpack_bits,
    zigzag_decode,
    zigzag_encode,
    PLV2Transformer,
)


class VarintTests(unittest.TestCase):
    def test_zigzag_roundtrip(self) -> None:
        values = [0, -1, 1, -12345, 123456789, -987654321]
        encoded = [zigzag_encode(v) for v in values]
        decoded = [zigzag_decode(v) for v in encoded]
        self.assertEqual(values, decoded)


class BitpackingTests(unittest.TestCase):
    def test_bitpacking_roundtrip(self) -> None:
        values = [0, 1, 3, 7, 15, 31]
        packed = pack_bits(values, 5)
        unpacked = unpack_bits(packed, len(values), 5)
        self.assertEqual(values, unpacked)


class DeltaTests(unittest.TestCase):
    def setUp(self) -> None:
        self.transformer = PLV2Transformer()

    def test_delta(self) -> None:
        sequence = [10, 20, 30, 40]
        encoded = self.transformer._encode_delta(sequence)
        self.assertIsNotNone(encoded)
        segment = Segment(0, len(sequence), "DELTA", encoded, b"", 0, 0)
        decoded = decode_segment(segment)
        self.assertEqual(sequence, decoded)

    def test_delta2(self) -> None:
        sequence = [5, 7, 9, 11, 13]
        encoded = self.transformer._encode_delta2(sequence)
        self.assertIsNotNone(encoded)
        segment = Segment(0, len(sequence), "DELTA2", encoded, b"", 0, 0)
        decoded = decode_segment(segment)
        self.assertEqual(sequence, decoded)

    def test_rle(self) -> None:
        sequence = [4, 4, 4, 4, 4]
        payload = self.transformer._encode_rle(sequence)
        self.assertIsNotNone(payload)
        segment = Segment(0, len(sequence), "RLE", {}, payload, 0, 0)
        decoded = decode_segment(segment)
        self.assertEqual(sequence, decoded)

    def test_mrle(self) -> None:
        sequence = [1, 2, 1, 2, 1, 2]
        payload = self.transformer._encode_mrle(sequence)
        self.assertIsNotNone(payload)
        segment = Segment(0, len(sequence), "MRLE", {"pattern_length": payload["pattern_length"]}, payload["payload"], 0, 0)
        decoded = decode_segment(segment)
        self.assertEqual(sequence, decoded)

    def test_swd(self) -> None:
        sequence = [1, 2, 3, 1, 2, 3]
        payload = self.transformer._encode_swd(sequence)
        self.assertIsNotNone(payload)
        segment = Segment(0, len(sequence), "SWD", {"window": 32}, payload, 0, 0)
        decoded = decode_segment(segment)
        self.assertEqual(sequence, decoded)


class HuffmanTests(unittest.TestCase):
    def test_huffman_roundtrip(self) -> None:
        data = b"hello hello hello"
        table, encoded, bit_length = huffman_encode(data)
        decoded = huffman_decode(table, encoded, bit_length, len(data))
        self.assertEqual(data, decoded)


class EndToEndTests(unittest.TestCase):
    def test_roundtrip(self) -> None:
        payload = {
            "items": [
                {"id": 1, "name": "Alice", "email": "alice@example.com", "active": True},
                {"id": 2, "name": "Bob", "email": "bob@example.com", "active": False},
            ],
            "meta": {"count": 2, "next": None},
        }
        compressed = rpd_compress(payload)
        decompressed = rpd_decompress(compressed)
        self.assertEqual(decompressed, canonical_json(payload))


if __name__ == "__main__":
    unittest.main()
