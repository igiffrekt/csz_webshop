"""
Process Product Images: Remove Background & Add Shadow

This script:
1. Fetches all product images from Strapi
2. Removes backgrounds using rembg (AI-powered)
3. Adds a soft drop shadow
4. Re-uploads processed images to Strapi

Usage:
    python scripts/migration/process-images.py

Required environment variables:
    STRAPI_URL - Strapi base URL (default: http://localhost:1337)
    STRAPI_ADMIN_TOKEN - Strapi API token with write access
"""

import os
import sys
import time
import requests
from io import BytesIO
from pathlib import Path

# Load .env.local
env_path = Path(__file__).parent.parent.parent / 'apps' / 'web' / '.env.local'
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

STRAPI_URL = os.environ.get('STRAPI_URL', 'http://localhost:1337')
STRAPI_TOKEN = os.environ.get('STRAPI_ADMIN_TOKEN')

# Lazy imports for heavy libraries
rembg = None
Image = None
ImageFilter = None
ImageDraw = None

def init_libraries():
    """Initialize heavy libraries on first use."""
    global rembg, Image, ImageFilter, ImageDraw
    if rembg is None:
        print("Loading AI model (first run may take a minute)...")
        from rembg import remove
        from PIL import Image as PILImage, ImageFilter as PILFilter, ImageDraw as PILDraw
        rembg = remove
        Image = PILImage
        ImageFilter = PILFilter
        ImageDraw = PILDraw


def add_shadow(img, offset=(8, 8), shadow_color=(0, 0, 0, 80), blur_radius=15, padding=30):
    """Add a soft drop shadow to a transparent PNG image."""
    # Ensure RGBA
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Create new canvas with padding for shadow
    new_width = img.width + padding * 2 + abs(offset[0])
    new_height = img.height + padding * 2 + abs(offset[1])

    # Create shadow layer
    shadow = Image.new('RGBA', (new_width, new_height), (255, 255, 255, 0))

    # Get alpha channel from original image for shadow shape
    alpha = img.split()[3]
    shadow_shape = Image.new('RGBA', img.size, shadow_color)
    shadow_shape.putalpha(alpha)

    # Paste shadow with offset
    shadow_x = padding + offset[0]
    shadow_y = padding + offset[1]
    shadow.paste(shadow_shape, (shadow_x, shadow_y))

    # Blur the shadow
    for _ in range(3):  # Multiple passes for smoother blur
        shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius // 3))

    # Create final image with white background
    final = Image.new('RGBA', (new_width, new_height), (255, 255, 255, 255))

    # Composite shadow onto white background
    final = Image.alpha_composite(final, shadow)

    # Paste original image on top
    img_x = padding
    img_y = padding
    final.paste(img, (img_x, img_y), img)

    # Convert to RGB for JPEG output (optional, keeps as PNG for transparency)
    return final


def get_all_strapi_files():
    """Fetch all image files from Strapi."""
    print("Fetching files from Strapi...")

    response = requests.get(
        f"{STRAPI_URL}/api/upload/files",
        headers={"Authorization": f"Bearer {STRAPI_TOKEN}"}
    )

    if not response.ok:
        raise Exception(f"Failed to fetch files: {response.status_code}")

    all_files = response.json()

    # Filter to only original images (exclude thumbnails)
    images = [
        f for f in all_files
        if f.get('mime', '').startswith('image/')
        and not f.get('hash', '').startswith(('thumbnail_', 'small_', 'medium_', 'large_', 'xsmall_'))
    ]

    print(f"  Found {len(images)} original images")
    return images


def get_products_with_images():
    """Get all products that have images."""
    print("Fetching products with images...")
    products = []
    page = 1

    while True:
        response = requests.get(
            f"{STRAPI_URL}/api/products?populate=images&pagination[page]={page}&pagination[pageSize]=100",
            headers={"Authorization": f"Bearer {STRAPI_TOKEN}"}
        )

        if not response.ok:
            raise Exception(f"Failed to fetch products: {response.status_code}")

        data = response.json()
        if not data.get('data'):
            break

        for product in data['data']:
            if product.get('images') and len(product['images']) > 0:
                products.append({
                    'id': product['id'],
                    'documentId': product['documentId'],
                    'name': product['name'],
                    'image': product['images'][0]
                })

        if len(data['data']) < 100:
            break
        page += 1

    print(f"  Found {len(products)} products with images")
    return products


def download_image(url):
    """Download image from URL."""
    if url.startswith('/'):
        url = f"{STRAPI_URL}{url}"

    response = requests.get(url, timeout=30)
    if not response.ok:
        return None

    return BytesIO(response.content)


def process_image(image_bytes):
    """Remove background and add shadow."""
    init_libraries()

    # Open image
    img = Image.open(image_bytes)

    # Remove background
    output = rembg(img)

    # Add shadow
    result = add_shadow(output)

    return result


def upload_image_to_strapi(img, filename):
    """Upload processed image to Strapi."""
    # Save to bytes
    buffer = BytesIO()

    # Save as PNG to preserve transparency, or JPEG for smaller size
    if filename.lower().endswith('.png'):
        img.save(buffer, format='PNG', optimize=True)
    else:
        # Convert to RGB for JPEG
        if img.mode == 'RGBA':
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])
            img = rgb_img
        img.save(buffer, format='JPEG', quality=90, optimize=True)

    buffer.seek(0)

    # Upload to Strapi
    files = {'files': (filename, buffer, 'image/png' if filename.endswith('.png') else 'image/jpeg')}

    response = requests.post(
        f"{STRAPI_URL}/api/upload",
        headers={"Authorization": f"Bearer {STRAPI_TOKEN}"},
        files=files
    )

    if not response.ok:
        return None

    result = response.json()
    if result and len(result) > 0:
        return result[0]['id']
    return None


def update_product_image(document_id, file_id):
    """Update product to use new image."""
    response = requests.put(
        f"{STRAPI_URL}/api/products/{document_id}",
        headers={
            "Authorization": f"Bearer {STRAPI_TOKEN}",
            "Content-Type": "application/json"
        },
        json={"data": {"images": [file_id]}}
    )
    return response.ok


def delete_old_file(file_id):
    """Delete old file from Strapi."""
    try:
        requests.delete(
            f"{STRAPI_URL}/api/upload/files/{file_id}",
            headers={"Authorization": f"Bearer {STRAPI_TOKEN}"}
        )
    except:
        pass


def main():
    print("=" * 50)
    print("  Image Background Removal & Shadow")
    print("=" * 50)
    print()

    if not STRAPI_TOKEN:
        print("ERROR: STRAPI_ADMIN_TOKEN is required")
        sys.exit(1)

    # Get products with images
    products = get_products_with_images()

    if not products:
        print("No products with images found!")
        return

    print(f"\nProcessing {len(products)} product images...\n")

    processed = 0
    failed = 0

    for i, product in enumerate(products):
        try:
            image = product['image']
            image_url = image.get('url', '')
            image_name = image.get('name', 'image.png')
            old_file_id = image.get('id')

            # Download
            image_bytes = download_image(image_url)
            if not image_bytes:
                print(f"  [SKIP] {product['name']}: download failed")
                failed += 1
                continue

            # Process (remove bg + add shadow)
            result_img = process_image(image_bytes)

            # Generate new filename
            base_name = Path(image_name).stem
            new_filename = f"{base_name}_processed.png"

            # Upload new image
            new_file_id = upload_image_to_strapi(result_img, new_filename)
            if not new_file_id:
                print(f"  [FAIL] {product['name']}: upload failed")
                failed += 1
                continue

            # Update product
            success = update_product_image(product['documentId'], new_file_id)
            if not success:
                print(f"  [FAIL] {product['name']}: link failed")
                failed += 1
                continue

            # Delete old file
            if old_file_id:
                delete_old_file(old_file_id)

            processed += 1
            print(f"  [{processed}/{len(products)}] {product['name']}")

            # Progress update
            if processed % 10 == 0:
                print(f"\n  Progress: {processed}/{len(products)} ({failed} failed)\n")

            # Small delay to avoid overloading
            time.sleep(0.1)

        except Exception as e:
            print(f"  [ERROR] {product['name']}: {str(e)}")
            failed += 1

    print()
    print("=" * 50)
    print(f"  Processed: {processed}")
    print(f"  Failed: {failed}")
    print("=" * 50)


if __name__ == "__main__":
    main()
