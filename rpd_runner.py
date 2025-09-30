import math
import random
import time
import tracemalloc
import zlib
import lzma

from rpd import canonical_json, rpd_compress_with_stats, rpd_decompress


TARGET_SIZE = 1 << 20  # ~1 MiB


def build_dataset(row_fn, target_size=TARGET_SIZE):
    rows = []
    i = 0
    while True:
        rows.append(row_fn(i))
        if i % 100 == 0 and len(rows) > 1000:
            size = len(canonical_json(rows))
            if size >= target_size:
                break
        i += 1
    return rows


def dataset_structured_logs():
    base_ts = 1609459200
    users = [f"user{i}" for i in range(20)]
    levels = ["DEBUG", "INFO", "WARN", "ERROR"]
    urls = [
        "https://example.com/dashboard",
        "https://example.com/login",
        "https://example.com/api/items",
        "https://cdn.example.com/assets/css/main.css",
    ]
    random.seed(1)

    def row_fn(i):
        return {
            "id": i + 1,
            "ts": base_ts + i * 60,
            "user": random.choice(users),
            "active": random.random() > 0.1,
            "level": random.choice(levels),
            "url": random.choice(urls) + f"?q={i%50}",
        }

    return build_dataset(row_fn)


def dataset_semi_structured():
    random.seed(2)
    rare_keys = ["extra_notes", "session_id", "metadata", "region", "feature_flag"]

    def row_fn(i):
        row = {
            "id": i,
            "name": f"item_{i%500}",
            "status": random.choice(["ok", "warning", "error"]),
            "score": random.randint(0, 1000),
            "flags": {
                "beta": random.random() < 0.3,
                "gamma": random.random() < 0.2,
            },
            "updated": 1609459200 + i * 45,
        }
        if random.random() < 0.1:
            extra_key = random.choice(rare_keys)
            if extra_key == "extra_notes":
                row[extra_key] = random.choice([None, f"note_{i}"])
            elif extra_key == "session_id":
                row[extra_key] = f"sess-{i:08x}"
            elif extra_key == "metadata":
                row[extra_key] = {"attempts": random.randint(0, 5), "last": i % 7}
            elif extra_key == "region":
                row[extra_key] = random.choice(["us-east", "us-west", "eu", "apac"])
            elif extra_key == "feature_flag":
                row[extra_key] = random.random() < 0.5
        return row

    return build_dataset(row_fn)


def random_string(length=12):
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(random.choice(alphabet) for _ in range(length))


def dataset_random_content():
    random.seed(3)
    hosts = ["https://random.example.com", "https://api.random.example.com"]

    def row_fn(i):
        url = f"{random.choice(hosts)}/item/{i}/{random.randint(0,9999)}"
        return {
            "id": i,
            "rand_str": random_string(12),
            "rand_num": random.randint(0, 10 ** 9),
            "flag": random.choice([True, False, None]),
            "url": url,
        }

    return build_dataset(row_fn)


def dataset_time_series():
    random.seed(4)
    base_ts = 1609459200
    status_values = ["ok", "degraded", "offline"]

    def row_fn(i):
        ts = base_ts + i * 55 + int(5 * math.sin(i / 10))
        value = 100.0 + 0.5 * i + math.sin(i / 5) * 2
        status = status_values[int(abs(math.sin(i))) % len(status_values)]
        note = None if random.random() < 0.2 else f"note_{i%1000}"
        return {
            "ts": ts,
            "value": round(value, 5),
            "status": status,
            "quality": random.choice(["good", "bad", "unknown"]),
            "note": note,
        }

    return build_dataset(row_fn)


def dataset_string_heavy():
    random.seed(5)
    hosts = ["https://service.example.com", "https://cdn.service.io", "mailto:support@example.com"]
    emails = [f"user{i}@example.com" for i in range(50)]

    def row_fn(i):
        host = random.choice(hosts)
        path = f"/user/{i}/profile/{random.randint(0, 9999)}"
        return {
            "id": i,
            "email": random.choice(emails),
            "profile_url": host + path,
            "avatar": f"https://images.example.com/avatar/{i:05d}.png",
            "active": random.random() > 0.2,
        }

    return build_dataset(row_fn)


def run_benchmark(name, data):
    raw_bytes = canonical_json(data)
    raw_size = len(raw_bytes)

    tracemalloc.start()
    start = time.perf_counter()
    compressed, stats = rpd_compress_with_stats(data)
    comp_time = time.perf_counter() - start
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    start = time.perf_counter()
    decompressed = rpd_decompress(compressed)
    decomp_time = time.perf_counter() - start
    assert decompressed == raw_bytes

    throughput = raw_size / comp_time / (1024 * 1024)

    gzip_default = len(zlib.compress(raw_bytes))
    gzip_max = len(zlib.compress(raw_bytes, level=9))
    lzma_size = len(lzma.compress(raw_bytes))

    return {
        "Dataset": name,
        "Raw": raw_size,
        "RLV2": stats["rlv2_size"],
        "RLV2+PLV2": stats["plv2_size"],
        "RPD": stats["final_size"],
        "RPD Ratio": stats["final_size"] / raw_size,
        "gzip": gzip_default,
        "gzip Ratio": gzip_default / raw_size,
        "lzma": lzma_size,
        "lzma Ratio": lzma_size / raw_size,
        "Comp Time": comp_time,
        "Decomp Time": decomp_time,
        "Throughput": throughput,
        "Peak Memory": peak,
        "gzip max": gzip_max,
    }


def main():
    datasets = {
        "Structured Logs": dataset_structured_logs(),
        "Semi-structured API": dataset_semi_structured(),
        "Random Content": dataset_random_content(),
        "Time-series": dataset_time_series(),
        "String heavy": dataset_string_heavy(),
    }

    results = []
    for name, data in datasets.items():
        print(f"Benchmarking {name} ({len(data)} rows)...")
        result = run_benchmark(name, data)
        results.append(result)
        print(
            f"  RPD size {result['RPD']} bytes, ratio {result['RPD Ratio']:.3f}, "
            f"throughput {result['Throughput']:.2f} MB/s, peak memory {result['Peak Memory']/1024/1024:.2f} MiB"
        )

    headers = [
        "Dataset",
        "Raw (B)",
        "RLV2 (B)",
        "RLV2+PLV2 (B)",
        "RPD Final (B)",
        "RPD Ratio",
        "gzip (B)",
        "gzip Ratio",
        "lzma (B)",
        "lzma Ratio",
        "Comp Time RPD",
        "Decomp Time RPD",
    ]

    print("\nFinal Results:")
    row_format = "{:<24} {:>10} {:>10} {:>14} {:>13} {:>10} {:>10} {:>11} {:>10} {:>11} {:>14} {:>16}"
    print(row_format.format(*headers))
    for result in results:
        print(
            row_format.format(
                result["Dataset"],
                result["Raw"],
                result["RLV2"],
                result["RLV2+PLV2"],
                result["RPD"],
                f"{result['RPD Ratio']:.3f}",
                result["gzip"],
                f"{result['gzip Ratio']:.3f}",
                result["lzma"],
                f"{result['lzma Ratio']:.3f}",
                f"{result['Comp Time']:.3f}s",
                f"{result['Decomp Time']:.3f}s",
            )
        )

    print("\nNotes:")
    print("- gzip max level sizes (level 9):")
    for result in results:
        print(f"  {result['Dataset']}: {result['gzip max']} bytes")
    print("- Throughput and peak memory measured for RPD compression phase only.")


if __name__ == "__main__":
    main()
