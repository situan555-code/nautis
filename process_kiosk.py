import sys
from PIL import Image

def remove_green(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # If green is the dominant color and sufficiently bright
        if g > 150 and g > r + 30 and g > b + 30:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Optional: crop to bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

remove_green("resume assets/use/Gemini_Generated_Image_563u46563u46563u (1).jpeg", "public/case-studies/kiosk_icon_transparent.png")
print("Done")
