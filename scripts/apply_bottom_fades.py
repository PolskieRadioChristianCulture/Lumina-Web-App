from pathlib import Path
from PIL import Image
import numpy as np

def apply_bottom_fade(img_path, fade_start_ratio=0.72):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)
    height, width = arr.shape[:2]
    
    fade_start_y = int(height * fade_start_ratio)
    fade_len = height - fade_start_y
    
    for y in range(fade_start_y, height):
        factor = 1.0 - ((y - fade_start_y) / float(fade_len))
        # Smooth cosine or cubic ramp for ultra-soft feathering
        smooth_factor = 0.5 * (1.0 - np.cos(factor * np.pi))
        arr[y, :, 3] = (arr[y, :, 3].astype(float) * smooth_factor).astype(np.uint8)
        
    faded_img = Image.fromarray(arr, "RGBA")
    faded_img.save(img_path, format="WEBP", quality=95)
    print(f"Applied smooth bottom fade to {img_path.name} (from y={fade_start_y}/{height})")

def main():
    out_dir = Path("images/biblijne-uwielbienie")
    apply_bottom_fade(out_dir / "host.webp", fade_start_ratio=0.68)
    apply_bottom_fade(out_dir / "artist-one.webp", fade_start_ratio=0.70)
    apply_bottom_fade(out_dir / "artist-two.webp", fade_start_ratio=0.70)
    print("All bottom fades applied successfully!")

if __name__ == "__main__":
    main()
