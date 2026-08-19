import os
import subprocess
import json
import shutil
import glob
import math

downloads_dir = r"C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\audio\worship_downloads"
output_dir = r"C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\audio\worship"
playlist_path = r"C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\worship_playlist.json"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def get_duration(filepath):
    try:
        result = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of",
            "default=noprint_wrappers=1:nokey=1", filepath
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        return math.ceil(float(result.stdout))
    except Exception as e:
        print(f"Error getting duration for {filepath}: {e}")
        return 240

playlist = []
track_id = 1

files = glob.glob(os.path.join(downloads_dir, "*.wav")) + glob.glob(os.path.join(downloads_dir, "*.mp3"))

for file in files:
    filename = os.path.basename(file)
    name_no_ext, ext = os.path.splitext(filename)
    output_filename = name_no_ext.strip() + ".mp3"
    output_filepath = os.path.join(output_dir, output_filename)
    
    print(f"Processing {filename}...")
    
    if ext.lower() == ".wav":
        if not os.path.exists(output_filepath):
            # Convert
            subprocess.run([
                "ffmpeg", "-y", "-i", file,
                "-b:a", "192k", output_filepath
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        if not os.path.exists(output_filepath):
            shutil.copy2(file, output_filepath)
            
    duration = get_duration(output_filepath)
    
    playlist.append({
        "id": f"worship_new_{track_id}",
        "title": name_no_ext.strip(),
        "artist": "Christian Culture Instrumental",
        "album": "Sanctuary Worship",
        "duration": duration,
        "url": f"./audio/worship/{output_filename}"
    })
    track_id += 1

# Overwrite playlist
with open(playlist_path, "w", encoding="utf-8") as f:
    json.dump(playlist, f, indent=2, ensure_ascii=False)

print(f"Finished. Generated {len(playlist)} tracks.")
