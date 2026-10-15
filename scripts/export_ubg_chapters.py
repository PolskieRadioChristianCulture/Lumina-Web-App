import os
import json
import zipfile
import re
import html

EPUB_PATH = r"C:\Users\czark\Desktop\@ICC\Misja CC\Pismo_Swiete_UBG_2025.epub"
OUTPUT_DIR = r"C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\data\bible\ubg-2025"
BOOKS_CANON_PATH = r"C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\scripts\bible_books_canon.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(BOOKS_CANON_PATH, "r", encoding="utf-8") as f:
    books_canon = json.load(f)

def clean_text(raw_html):
    # Remove <sup>...</sup>
    s = re.sub(r"<sup[^>]*>.*?</sup>", "", raw_html, flags=re.DOTALL)
    # Remove all other tags
    s = re.sub(r"<[^>]+>", "", s)
    # Unescape HTML entities
    s = html.unescape(s)
    # Replace non-breaking spaces and collapse spaces
    s = s.replace("\u00a0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

with zipfile.ZipFile(EPUB_PATH, "r") as z:
    manifest_entries = []
    total_written_chapters = 0
    total_written_verses = 0

    for book_idx, book_info in enumerate(books_canon, start=1):
        epub_fname = f"OEBPS/Text/PL-{book_idx:02d}.xhtml"
        if epub_fname not in z.namelist():
            raise FileNotFoundError(f"Missing {epub_fname} in EPUB!")
        
        content = z.read(epub_fname).decode("utf-8", errors="replace")
        
        # Match all verse paragraphs: id="BG-ch_v"
        matches = re.findall(r'<p[^>]+id="BG-(\d+)_(\d+)"[^>]*>([\s\S]*?)</p>', content)
        if not matches:
            raise ValueError(f"No verses found in {epub_fname} ({book_info['code']})")
        
        # Group by chapter
        chapters_map = {}
        for ch_str, v_str, text_raw in matches:
            ch = int(ch_str)
            v = int(v_str)
            cleaned = clean_text(text_raw)
            if not cleaned:
                raise ValueError(f"Empty verse {book_info['code']} {ch}:{v}")
            if ch not in chapters_map:
                chapters_map[ch] = []
            chapters_map[ch].append({"number": v, "text": cleaned})
        
        # Verify chapter count matches book_info['chapters']
        if len(chapters_map) != book_info["chapters"]:
            raise ValueError(f"Chapter count mismatch for {book_info['code']}: expected {book_info['chapters']}, got {len(chapters_map)}")
        
        # Write each chapter JSON
        for ch_num in range(1, book_info["chapters"] + 1):
            if ch_num not in chapters_map:
                raise ValueError(f"Missing chapter {ch_num} in {book_info['code']}")
            
            verses = chapters_map[ch_num]
            # Verify verse numbering 1..N
            for idx, v in enumerate(verses, start=1):
                if v["number"] != idx:
                    raise ValueError(f"Verse sequence mismatch in {book_info['code']} {ch_num}: expected {idx}, got {v['number']}")
            
            chapter_id = f"{book_info['code']}-{ch_num:03d}"
            
            # Check for psalm or chapter intro
            # e.g., if there's a heading before BG-ch_1
            intro_match = re.search(
                rf'<h3[^>]*>.*?{ch_num}\b.*?</h3>\s*<p class="BiblieIndent"[^>]*>([\s\S]*?)</p>\s*<p[^>]+id="BG-{ch_num}_1"',
                content,
                flags=re.IGNORECASE
            )
            intro_text = None
            if intro_match:
                intro_clean = clean_text(intro_match.group(1))
                if intro_clean:
                    intro_text = intro_clean
            
            data = {
                "chapterId": chapter_id,
                "translation": "UBG-2025",
                "translationName": "Uwspółcześniona Biblia Gdańska",
                "copyright": "Uwspółcześniona Biblia Gdańska (UBG) © Fundacja Wrota Nadziei / Logos Media. Wykorzystanie ewangelizacyjne na licencji CC BY-ND 4.0.",
                "book": book_info["name"],
                "bookCode": book_info["code"],
                "testament": book_info["testament"],
                "chapter": ch_num,
                "totalVerses": len(verses),
                "verses": verses
            }
            if intro_text:
                data["intro"] = intro_text
            
            out_path = os.path.join(OUTPUT_DIR, f"{chapter_id}.json")
            with open(out_path, "w", encoding="utf-8") as out_f:
                json.dump(data, out_f, ensure_ascii=False, indent=2)
            
            total_written_chapters += 1
            total_written_verses += len(verses)
            manifest_entries.append({
                "chapterId": chapter_id,
                "book": book_info["name"],
                "bookCode": book_info["code"],
                "chapter": ch_num,
                "totalVerses": len(verses),
                "file": f"/data/bible/ubg-2025/{chapter_id}.json"
            })

    # Write manifest.json
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump({
            "translation": "UBG-2025",
            "translationName": "Uwspółcześniona Biblia Gdańska",
            "copyright": "Uwspółcześniona Biblia Gdańska (UBG) © Fundacja Wrota Nadziei / Logos Media. Wykorzystanie ewangelizacyjne na licencji CC BY-ND 4.0.",
            "totalBooks": len(books_canon),
            "totalChapters": total_written_chapters,
            "totalVerses": total_written_verses,
            "chapters": manifest_entries
        }, mf, ensure_ascii=False, indent=2)

print(f"SUCCESS! Written {total_written_chapters} chapters and {total_written_verses} verses across 66 books to {OUTPUT_DIR}")
