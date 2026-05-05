import os
from PIL import Image

def crop_transparent(img_path):
    try:
        if not os.path.exists(img_path):
            return
        img = Image.open(img_path).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            # Crop to the bounding box of non-transparent areas
            cropped = img.crop(bbox)
            
            # Now we want it on a standardized "square" canvas, because object-fit: contain might skew 
            # if we don't, but no wait, object-fit: contain maintains aspect ratio.
            # But the user said: "For the best results, re-export all your icons on a standardized square canvas"
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
            print(f"Processed: {img_path}")
    except Exception as e:
        print(f"Failed {img_path}: {e}")

icons_dir = "public/case-studies/icons/"
if os.path.exists(icons_dir):
    for f in os.listdir(icons_dir):
        if f.endswith(".png"):
            crop_transparent(os.path.join(icons_dir, f))

crop_transparent("public/kiosk_icon.png")
crop_transparent("public/case-studies/kiosk_icon_transparent.png")

