"""
Image Processing Script: Background Removal + Cloudinary WebP Upload

Uses Python 3.11 with rembg for background removal,
then uploads to Cloudinary which serves as WebP.

Usage: python311 scripts/process-images.py
"""

import os
import sys
import io
import time
import requests
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Configure Cloudinary
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name="pixelkripta",
    api_key="526256412348358",
    api_secret="Vsxr8E0YvZLdMuqQNjJgqMT_FXI",
    secure=True
)

# Import rembg
from rembg import remove
from PIL import Image

# Strapi config - load from env or use defaults
STRAPI_URL = os.getenv("STRAPI_URL", "http://localhost:1337")
STRAPI_API_TOKEN = os.getenv("STRAPI_API_TOKEN", "")

# Try to load token from .env.local
env_path = Path(__file__).parent.parent / "apps/web/.env.local"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if line.startswith("STRAPI_API_TOKEN="):
                STRAPI_API_TOKEN = line.split("=", 1)[1].strip()
                break


def get_products_with_images():
    """Fetch all products with their images from Strapi"""
    products = []
    page = 1
    page_size = 25

    headers = {}
    if STRAPI_API_TOKEN:
        headers["Authorization"] = f"Bearer {STRAPI_API_TOKEN}"

    while True:
        url = f"{STRAPI_URL}/api/products?populate=images&pagination[page]={page}&pagination[pageSize]={page_size}"
        response = requests.get(url, headers=headers, timeout=30)

        if response.status_code != 200:
            print(f"Error fetching products: {response.status_code}")
            break

        data = response.json()
        batch = data.get("data", [])
        products.extend(batch)

        if len(batch) < page_size:
            break
        page += 1

    return products


def download_image(url: str) -> bytes | None:
    """Download image from URL"""
    try:
        if url.startswith("/"):
            url = f"{STRAPI_URL}{url}"

        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"    Download error: {e}")
        return None


def remove_background(image_data: bytes) -> bytes:
    """Remove background from image using rembg"""
    # Remove background - returns PNG with transparency
    output = remove(image_data)
    return output


def upload_to_cloudinary(image_data: bytes, public_id: str) -> dict | None:
    """Upload image to Cloudinary with WebP delivery"""
    try:
        # Upload as PNG (to preserve transparency), Cloudinary will serve as WebP
        result = cloudinary.uploader.upload(
            image_data,
            public_id=f"csz-webshop/{public_id}",
            resource_type="image",
            format="png",  # Store as PNG for transparency
            overwrite=True,
            transformation=[
                {"quality": "auto:good"},
                {"fetch_format": "auto"}  # Serve as WebP when browser supports
            ]
        )
        return result
    except Exception as e:
        print(f"    Cloudinary error: {e}")
        return None


def update_product_image_url(product_id: str, image_id: int, cloudinary_url: str) -> bool:
    """Update product in Strapi with Cloudinary URL"""
    # For now, we'll store the Cloudinary URL in a custom field or just log it
    # Strapi's media library doesn't directly support external URLs
    # We could either:
    # 1. Create a new field for cloudinary URLs
    # 2. Replace the image entirely
    # For simplicity, let's just track the processed images
    return True


def process_all_products():
    """Main processing function"""
    print("=" * 60)
    print("Image Processing: Background Removal + Cloudinary Upload")
    print("=" * 60)
    print(f"Strapi: {STRAPI_URL}")
    print(f"Token: {'[OK]' if STRAPI_API_TOKEN else '[MISSING]'}")
    print(f"Cloudinary: pixelkripta")
    print()

    if not STRAPI_API_TOKEN:
        print("Warning: No STRAPI_API_TOKEN found")

    print("Fetching products...")
    products = get_products_with_images()
    print(f"Found {len(products)} products\n")

    processed = 0
    skipped = 0
    errors = 0

    # Track Cloudinary URLs for later use
    cloudinary_urls = []

    for i, product in enumerate(products):
        name = product.get("name", "Unknown")[:45]
        images = product.get("images", [])
        doc_id = product.get("documentId", "")

        print(f"[{i+1}/{len(products)}] {name}...")

        if not images:
            print("    [SKIP] No images")
            skipped += 1
            continue

        # Process first image only (main product image)
        img = images[0]
        img_url = img.get("url", "")
        img_name = img.get("name", "image").replace(" ", "_")

        if not img_url:
            print("    [SKIP] No image URL")
            skipped += 1
            continue

        # Check if already processed (has cloudinary in URL)
        if "cloudinary" in img_url.lower():
            print("    [SKIP] Already on Cloudinary")
            skipped += 1
            continue

        # Download
        print("    [DL] Downloading...", end=" ", flush=True)
        image_data = download_image(img_url)
        if not image_data:
            errors += 1
            continue
        print("OK")

        # Remove background
        print("    [BG] Removing background...", end=" ", flush=True)
        try:
            processed_data = remove_background(image_data)
            print("OK")
        except Exception as e:
            print(f"Error: {e}")
            errors += 1
            continue

        # Upload to Cloudinary
        print("    [UP] Uploading to Cloudinary...", end=" ", flush=True)
        public_id = f"{doc_id}_{Path(img_name).stem}"
        result = upload_to_cloudinary(processed_data, public_id)

        if result:
            cloudinary_url = result.get("secure_url", "")
            # Get WebP URL
            webp_url = cloudinary_url.replace("/upload/", "/upload/f_webp/")
            print(f"OK")
            print(f"    [URL] {webp_url[:70]}...")
            cloudinary_urls.append({
                "product_id": doc_id,
                "product_name": name,
                "original_url": img_url,
                "cloudinary_url": webp_url
            })
            processed += 1
        else:
            errors += 1

        # Rate limiting
        time.sleep(0.5)

    print("\n" + "=" * 60)
    print("Processing Summary")
    print("=" * 60)
    print(f"  Processed: {processed}")
    print(f"  Skipped:   {skipped}")
    print(f"  Errors:    {errors}")
    print("=" * 60)

    # Save Cloudinary URLs to file for reference
    if cloudinary_urls:
        output_file = Path(__file__).parent / "cloudinary-urls.json"
        import json
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(cloudinary_urls, f, indent=2, ensure_ascii=False)
        print(f"\nCloudinary URLs saved to: {output_file}")

    return cloudinary_urls


if __name__ == "__main__":
    process_all_products()
