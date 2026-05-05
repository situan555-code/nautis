import os
from PIL import Image

def fix_icon(img_path):
    try:
        img = Image.open(img_path).convert("RGBA")
        
        # Get bounding box where alpha > 0
        alpha = img.split()[-1]
        bbox = alpha.point(lambda p: 255 if p > 5 else 0).getbbox()
        
        if bbox:
            cropped = img.crop(bbox)
            w, h = cropped.size
            size = max(w, h)
            # Create a new square transparent image
            new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            # Paste the cropped image in the center
            offset_x = (size - w) // 2
            offset_y = (size - h) // 2
            new_img.paste(cropped, (offset_x, offset_y))
            
            # Save it back (overwrite)
            new_img.save(img_path)
            print(f"Fixed perfectly: {img_path}")
        else:
            print(f"No non-transparent pixels in {img_path}")
    except Exception as e:
        print(f"Failed {img_path}: {e}")

icons_dir = "public/case-studies/icons/"
for f in os.listdir(icons_dir):
    if f.endswith(".png"):
        fix_icon(os.path.join(icons_dir, f))

fix_icon("public/kiosk_icon.png")
fix_icon("public/case-studies/kiosk_icon_transparent.png")
