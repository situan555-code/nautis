import sys
import glob
from PIL import Image

def remove_green(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # If green is the dominant color
        if g > 150 and g > r + 30 and g > b + 30:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

icons = {
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_50th_1776444906344.png": "icon_50th.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_vr_1776444927599.png": "icon_vr.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_crane_1776444951669.png": "icon_crane.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_brain_1776444963261.png": "icon_brain.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_tv_1776444977887.png": "icon_tv.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_cabinet_1776444990804.png": "icon_cabinet.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_linkedin_1776445010524.png": "icon_linkedin.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_movie_1776445024189.png": "icon_movie.png",
    "/Users/nautis/.gemini/antigravity/brain/bbe24a75-aea6-4a3c-8c58-a5d6c1ff5368/icon_cgi_1776445036563.png": "icon_cgi.png"
}

for src, name in icons.items():
    print(f"Processing {name}...")
    remove_green(src, "public/case-studies/icons/" + name)
print("Done")
