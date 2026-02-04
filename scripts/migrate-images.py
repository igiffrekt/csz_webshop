"""
Image Migration Script: WooCommerce -> Strapi
Downloads images, converts to WebP, uploads to Strapi

Usage: python scripts/migrate-images.py "path/to/export.csv"
"""

import os
import sys
import csv
import requests
import io
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv
from urllib.parse import urlparse, unquote
import time
import re

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load environment variables
script_dir = Path(__file__).parent.parent
load_dotenv(script_dir / "apps/web/.env.local")
load_dotenv(script_dir / ".env")

STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:1337")
STRAPI_API_TOKEN = os.getenv("STRAPI_API_TOKEN")


def download_image(url: str) -> bytes | None:
    """Download image from URL"""
    try:
        url = url.strip()
        if not url:
            return None

        response = requests.get(url, timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"    [WARN] Download failed: {e}")
        return None


def process_image(image_data: bytes, max_size: int = 1200) -> tuple[bytes, str]:
    """Resize image and convert to JPEG (Strapi handles WebP conversion)"""
    img = Image.open(io.BytesIO(image_data))

    # Resize if larger than max_size
    if img.width > max_size or img.height > max_size:
        ratio = min(max_size / img.width, max_size / img.height)
        new_width = int(img.width * ratio)
        new_height = int(img.height * ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    output_buffer = io.BytesIO()

    # Check for transparency
    has_transparency = (
        img.mode == "RGBA" or
        (img.mode == "P" and "transparency" in img.info)
    )

    if has_transparency:
        # Use PNG for images with transparency
        if img.mode == "P":
            img = img.convert("RGBA")
        img.save(output_buffer, format="PNG", optimize=True)
        return output_buffer.getvalue(), "png"
    else:
        # Use JPEG for images without transparency
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(output_buffer, format="JPEG", quality=85, optimize=True)
        return output_buffer.getvalue(), "jpg"


def upload_to_strapi(image_data: bytes, filename: str, ext: str = "jpg") -> int | None:
    """Upload image to Strapi and return file ID"""
    try:
        # Set extension and mime type based on format
        filename = Path(filename).stem + f'.{ext}'
        mime_type = "image/png" if ext == "png" else "image/jpeg"

        files = {
            'files': (filename, image_data, mime_type)
        }

        headers = {}
        if STRAPI_API_TOKEN:
            headers['Authorization'] = f'Bearer {STRAPI_API_TOKEN}'

        response = requests.post(
            f"{STRAPI_URL}/api/upload",
            files=files,
            headers=headers,
            timeout=60
        )

        if response.status_code not in [200, 201]:
            print(f"[WARN] Upload failed: {response.status_code} - {response.text[:200]}")
            return None

        data = response.json()
        if data and len(data) > 0:
            return data[0].get('id')
        return None

    except Exception as e:
        print(f"[WARN] Upload error: {e}")
        return None


def get_product_by_sku(sku: str) -> dict | None:
    """Get product from Strapi by SKU"""
    try:
        headers = {}
        if STRAPI_API_TOKEN:
            headers['Authorization'] = f'Bearer {STRAPI_API_TOKEN}'

        encoded_sku = requests.utils.quote(sku)
        response = requests.get(
            f"{STRAPI_URL}/api/products?filters[sku][$eq]={encoded_sku}&populate=images",
            headers=headers,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('data') and len(data['data']) > 0:
                return data['data'][0]
        return None

    except Exception as e:
        print(f"[WARN] Product fetch error: {e}")
        return None


def update_product_images(document_id: str, image_ids: list[int]) -> bool:
    """Update product with image references"""
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        if STRAPI_API_TOKEN:
            headers['Authorization'] = f'Bearer {STRAPI_API_TOKEN}'

        response = requests.put(
            f"{STRAPI_URL}/api/products/{document_id}",
            json={
                'data': {
                    'images': image_ids
                }
            },
            headers=headers,
            timeout=30
        )

        return response.status_code == 200

    except Exception as e:
        print(f"[WARN] Update error: {e}")
        return False


def get_filename_from_url(url: str) -> str:
    """Extract filename from URL"""
    parsed = urlparse(url)
    path = unquote(parsed.path)
    filename = Path(path).name
    filename = filename.split('?')[0]
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    return filename


def process_csv(csv_path: str):
    """Process CSV and migrate images"""
    print(f"\n[CSV] Reading: {csv_path}\n")

    products = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Get type - column name has accent
            tipus = row.get('Típus', '')
            if tipus != 'simple':
                continue

            # Get published status
            published = row.get('Közzétéve', '')
            if published != '1':
                continue

            sku = row.get('Cikkszám', '').strip()
            name = row.get('Név', '').strip()
            images_str = row.get('Képek', '').strip()

            if not name or not images_str:
                continue

            if not sku:
                woo_id = row.get('Azonosító', '').strip()
                if woo_id:
                    sku = f"WOO-{woo_id}"

            if not sku:
                continue

            image_urls = [url.strip() for url in images_str.split(',') if url.strip()]

            if image_urls:
                products.append({
                    'sku': sku,
                    'name': name,
                    'image_urls': image_urls
                })

    print(f"Found {len(products)} products with images\n")

    processed = 0
    skipped = 0
    failed = 0

    for i, product in enumerate(products):
        sku = product['sku']
        name = product['name']
        image_urls = product['image_urls']

        print(f"[{i+1}/{len(products)}] {name[:50]}...")

        strapi_product = get_product_by_sku(sku)

        if not strapi_product:
            print(f"    [SKIP] Not found (SKU: {sku})")
            skipped += 1
            continue

        existing_images = strapi_product.get('images', [])
        if existing_images and len(existing_images) > 0:
            print(f"    [SKIP] Has {len(existing_images)} images")
            skipped += 1
            continue

        document_id = strapi_product['documentId']
        uploaded_ids = []

        for j, url in enumerate(image_urls[:3]):
            print(f"    [DL] Image {j+1}...", end=" ", flush=True)

            image_data = download_image(url)
            if not image_data:
                continue

            try:
                processed_data, ext = process_image(image_data)
            except Exception as e:
                print(f"[WARN] {e}")
                continue

            filename = get_filename_from_url(url)
            file_id = upload_to_strapi(processed_data, filename, ext)

            if file_id:
                uploaded_ids.append(file_id)
                print(f"[OK] ID:{file_id}")
            else:
                print("[X]")

            time.sleep(0.2)

        if uploaded_ids:
            if update_product_images(document_id, uploaded_ids):
                print(f"    [OK] Linked {len(uploaded_ids)} images")
                processed += 1
            else:
                print(f"    [WARN] Link failed")
                failed += 1
        else:
            print(f"    [WARN] No images")
            failed += 1

        time.sleep(0.3)

    print(f"\n{'='*50}")
    print(f"[STATS] Image Migration Summary")
    print(f"{'='*50}")
    print(f"   Processed: {processed}")
    print(f"   Skipped:   {skipped}")
    print(f"   Failed:    {failed}")
    print(f"{'='*50}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/migrate-images.py \"path/to/export.csv\"")
        sys.exit(1)

    csv_path = sys.argv[1]

    if not Path(csv_path).exists():
        print(f"[X] File not found: {csv_path}")
        sys.exit(1)

    print("[IMG] Starting Image Migration (WebP conversion)")
    print(f"   Strapi: {STRAPI_URL}")
    print(f"   Token: {'[OK]' if STRAPI_API_TOKEN else '[X]'}")

    process_csv(csv_path)
