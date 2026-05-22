import sys
from pathlib import Path
from PIL import Image


def remove_green(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        r, g, b, a = item
        if g > 150 and g > r + 30 and g > b + 30:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")


def main():
    if len(sys.argv) != 3:
        print("Usage: python process_kiosk.py <input-image> <output-png>")
        raise SystemExit(1)

    remove_green(Path(sys.argv[1]), Path(sys.argv[2]))
    print("Done")


if __name__ == "__main__":
    main()
