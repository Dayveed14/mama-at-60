#!/usr/bin/env python3
"""Generate 30 labelled table QR codes for the Mama at 60 website."""

import argparse
from pathlib import Path
import re

import qrcode
from PIL import Image, ImageDraw, ImageFont

TABLE_LABELS = {
    1: "Lizzy",
    2: "PASTORS 1",
    3: "PASTORS 2",
    4: "PASTORS 3",
    5: "DEACONS AND DEACONESSES",
    6: "DEACONS AND DEACONESSES 2",
    7: "EPE",
    8: "BOA",
    9: "78/83 SET",
    10: "RESERVE 1",
    11: "RESERVE 2",
    12: "RESERVE 3",
    13: "RESERVE 4",
    14: "RESERVES",
    15: "CONGRESS COURT RESIDENTS",
    16: "UNSPEAKABLE JOY",
    17: "PRAYING WOMEN",
    18: "OAUGF",
    19: "SISB",
    20: "LAIPEKS",
    21: "LAIPEKS II",
    22: "FAMILY",
    23: "TABLE 23",
    24: "TABLE 24",
    25: "TABLE 25",
    26: "TABLE 26",
    27: "TABLE 27",
    28: "TABLE 28",
    29: "TABLE 29",
    30: "TABLE 30",
}


def load_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


def safe_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default="https://mama-at-60.vercel.app",
        help="Deployed website origin (default: https://mama-at-60.vercel.app)",
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
    number_font = load_font(42)
    label_font = load_font(30)

    for number, label in TABLE_LABELS.items():
        table = f"{number:02d}"
        url = f"{base_url}/table/{table}"
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=16,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white").convert("RGB")

        # Add a clear caption so organisers can identify each image before sharing.
        padding = 42
        caption_height = 150
        canvas = Image.new("RGB", (qr_image.width + padding * 2, qr_image.height + caption_height), "white")
        canvas.paste(qr_image, (padding, padding // 2))
        draw = ImageDraw.Draw(canvas)
        number_text = f"TABLE {table}"
        label_box = draw.textbbox((0, 0), number_text, font=number_font)
        number_x = (canvas.width - (label_box[2] - label_box[0])) // 2
        draw.text((number_x, qr_image.height + 12), number_text, fill="#7B1E3A", font=number_font)

        label_box = draw.textbbox((0, 0), label, font=label_font)
        label_x = (canvas.width - (label_box[2] - label_box[0])) // 2
        draw.text((label_x, qr_image.height + 68), label, fill="#1E2A4F", font=label_font)

        filename = f"table-{table}-{safe_slug(label)}.png"
        canvas.save(output_dir / filename, dpi=(300, 300))
        print(f"Table {table} — {label}: {url}")

    print(f"\nCreated 30 labelled QR codes in: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
