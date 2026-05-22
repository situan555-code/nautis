from pathlib import Path
from PIL import Image


SOURCE_DIR = Path("asset-source/icons")
OUTPUT_DIR = Path("public/case-studies/icons")


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
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")


def main():
    if not SOURCE_DIR.exists():
        print(f"No icon source directory found at {SOURCE_DIR}.")
        return

    for source in SOURCE_DIR.glob("*.png"):
        output = OUTPUT_DIR / source.name
        print(f"Processing {source.name}...")
        remove_green(source, output)

    print("Done")


if __name__ == "__main__":
    main()
