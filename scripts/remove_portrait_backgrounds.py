import os
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

def main():
    print("Initializing AI background removal session (u2net)...")
    session = new_session("u2net")

    base_dir = Path("BiblijneUwielbienie_Antigravity/public/images")
    out_dir = Path("images/biblijne-uwielbienie")
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. Cezary Rogowski (Host)
    # We want head, chin on hand, shoulders and upper torso
    print("Processing Host (Cezary Rogowski)...")
    host_img = Image.open(base_dir / "host.png")
    # Crop to upper body: left: 240, top: 70, width: 640, height: 600
    host_cropped = host_img.crop((240, 70, 240 + 640, 70 + 600))
    host_cutout = remove(host_cropped, session=session)
    host_cutout.save(out_dir / "host-cutout.png", format="PNG")
    host_cutout.save(out_dir / "host.webp", format="WEBP", quality=95)
    print("Saved host-cutout.png and host.webp")

    # 2. Brunette Artist (Artist One)
    print("Processing Artist One (Brunette)...")
    a1_img = Image.open(base_dir / "artist-one.jpg")
    # Crop from top: 0 to preserve all hair updo, width: 720, height: 800
    a1_cropped = a1_img.crop((150, 0, 150 + 720, 800))
    a1_cutout = remove(a1_cropped, session=session)
    a1_cutout.save(out_dir / "artist-one-cutout.png", format="PNG")
    a1_cutout.save(out_dir / "artist-one.webp", format="WEBP", quality=95)
    print("Saved artist-one-cutout.png and artist-one.webp")

    # 3. Blonde Artist (Artist Two)
    print("Processing Artist Two (Blonde)...")
    a2_img = Image.open(base_dir / "artist-two.png")
    # Crop from top: 0 to preserve high ponytail, width: 1350, height: 1550
    a2_cropped = a2_img.crop((350, 0, 350 + 1350, 1550))
    a2_cutout = remove(a2_cropped, session=session)
    a2_cutout.save(out_dir / "artist-two-cutout.png", format="PNG")
    a2_cutout.save(out_dir / "artist-two.webp", format="WEBP", quality=95)
    print("Saved artist-two-cutout.png and artist-two.webp")

    print("All 3 cutouts successfully extracted with true alpha transparency!")

if __name__ == "__main__":
    main()
