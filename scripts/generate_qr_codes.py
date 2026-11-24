#!/usr/bin/env python3
"""Generate 30 table-specific QR codes for the Mama at 60 website."""

import argparse
from pathlib import Path

try:
    import qrcode
except ImportError as exc:
    raise SystemExit(
        "Missing dependency. Install it with: python -m pip install -r requirements.txt"
    ) from exc


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        required=True,
        help="Deployed website origin, e.g. https://mama-at-60.example.com",
    )
    parser.add_argument(
        "--output",
        default="table-qr-codes",
        help="Folder to save the PNG files (default: table-qr-codes)",
    )
    args = parser.parse_args()

    base_url = args.base_url.strip().rstrip("/")
    if not base_url.startswith(("https://", "http://")):
        parser.error("--base-url must begin with https:// or http://")

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    for number in range(1, 31):
        table = f"{number:02d}"
        url = f"{base_url}/table/{table}"
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=14,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        image = qr.make_image(fill_color="black", back_color="white")
        image.save(output_dir / f"table-{table}.png")
        print(f"Table {table}: {url}")

    print(f"\nCreated 30 QR codes in: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
