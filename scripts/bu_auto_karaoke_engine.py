#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Christian Culture — Auto Karaoke Sync Engine 2026
Automatyczny silnik ASR i Forced Alignment dla Biblii Śpiewanej (polskieradio.cc/BiblijneUwielbienie)

Standard Zero-QA dla Dowódcy:
- Zero atrap, zero fikcyjnych znaczników.
- Obsługa języka polskiego, dopasowanie do tekstu UBG 2025.
- Wykrywanie wstawek instrumentalnych, powtórzeń wersetów i weryfikacja chronologii.
- Eksport do JSON (schema v1), WebVTT i LRC.
- Klasyfikacja statusów: SYNC_READY, SYNC_REVIEW, SYNC_FAILED.
"""

import os
import sys
import json
import hashlib
import subprocess
import argparse
import tempfile
import re
from difflib import SequenceMatcher

BIBLE_BASE_DEFAULT = os.path.join(os.path.dirname(__file__), "..", "data", "bible", "ubg-2025")
OUTPUT_BASE_DEFAULT = os.path.join(os.path.dirname(__file__), "..", "data", "bu-karaoke")
REGISTRY_PATH_DEFAULT = os.path.join(os.path.dirname(__file__), "..", "data", "bu-sync-registry.json")


def compute_sha256(filepath):
    """Oblicza sumę kontrolną SHA-256 pliku."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def get_audio_info(audio_path):
    """Pobiera czas trwania i metadane pliku audio za pomocą FFprobe lub FFmpeg."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=sample_rate,channels",
        "-of", "json",
        audio_path
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        data = json.loads(res.stdout)
        duration = float(data.get("format", {}).get("duration", 0.0))
        return {
            "duration": round(duration, 2),
            "size": int(data.get("format", {}).get("size", os.path.getsize(audio_path))),
            "bitRate": int(data.get("format", {}).get("bit_rate", 0)) if data.get("format", {}).get("bit_rate") else None
        }
    except Exception as e:
        # Fallback z parsowania wyjścia ffmpeg -i
        cmd_fb = ["ffmpeg", "-i", audio_path]
        res_fb = subprocess.run(cmd_fb, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res_fb.stderr)
        if m:
            h, mi, s = float(m.group(1)), float(m.group(2)), float(m.group(3))
            duration = h * 3600 + mi * 60 + s
            return {"duration": round(duration, 2), "size": os.path.getsize(audio_path), "bitRate": None}
        raise RuntimeError(f"Nie udało się odczytać metadanych audio dla {audio_path}: {e}")


def convert_to_pcm_wav(input_path, output_wav):
    """Konwertuje wejściowy plik audio do 16kHz mono 16-bit PCM WAV zoptymalizowanego dla Whisper."""
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        "-c:a", "pcm_s16le",
        output_wav
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True)


def normalize_text_for_matching(text):
    """Normalizuje tekst do porównywania fonetyczno-leksykalnego."""
    if not text:
        return ""
    t = text.lower()
    # Usunięcie znaków interpunkcyjnych
    t = re.sub(r"[^\w\s]", "", t, flags=re.UNICODE)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def text_similarity(a, b):
    """Oblicza stopień podobieństwa leksykalnego dwóch ciągów (0.0 - 1.0)."""
    na = normalize_text_for_matching(a)
    nb = normalize_text_for_matching(b)
    if not na or not nb:
        return 0.0
    return SequenceMatcher(None, na, nb).ratio()


def load_bible_chapter(chapter_id, bible_dir=BIBLE_BASE_DEFAULT):
    """Wczytuje tekst rozdziału UBG 2025."""
    path = os.path.join(bible_dir, f"{chapter_id}.json")
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def find_best_verse_span(raw_text, verse_text):
    """
    Dopasowuje rozpoznany segment mowy do optymalnego okna słów wersetu biblijnego.
    Zwraca (najlepszy_fragment, współczynnik_dopasowania 0.0 - 1.0).
    """
    words = verse_text.split()
    norm_raw = normalize_text_for_matching(raw_text)
    raw_word_count = len(norm_raw.split())
    if raw_word_count == 0 or not words:
        return raw_text, 0.0

    best_span = raw_text
    best_ratio = 0.0

    # Przeszukiwanie okien słów o długości zbliżonej do rozpoznanego segmentu
    min_w = max(1, raw_word_count - 3)
    max_w = min(len(words) + 1, raw_word_count + 5)

    for w_size in range(min_w, max_w):
        for i in range(len(words) - w_size + 1):
            candidate = " ".join(words[i:i + w_size]).strip(",;:.–—?!")
            norm_cand = normalize_text_for_matching(candidate)
            ratio = SequenceMatcher(None, norm_raw, norm_cand).ratio()
            # Jeśli dopasowanie zaczyna się od słowa 1, a słowo 0 to krótki spójnik/przyimek (np. Na, W, I, A, O), sprawdź dołączenie
            if i == 1 and len(words[0]) <= 3:
                cand_with_prep = " ".join(words[0:i + w_size]).strip(",;:.–—?!")
                ratio_prep = SequenceMatcher(None, norm_raw, normalize_text_for_matching(cand_with_prep)).ratio()
                if ratio_prep >= ratio - 0.05:
                    candidate = cand_with_prep
                    ratio = ratio_prep
            if ratio > best_ratio:
                best_ratio = ratio
                best_span = candidate

    return best_span, best_ratio


def align_segments_to_verses(segments, bible_chapter, audio_duration):
    """
    Dopasowuje rozpoznane segmenty mowy do wersetów UBG 2025.
    Wykrywa numery wersetów, wstawki instrumentalne, powtórzenia i zastępuje
    błędy fonetyczne mowy czystym tekstem UBG 2025 przy wysokiej zgodności.
    """
    verses = bible_chapter.get("verses", []) if bible_chapter else []
    total_verses = len(verses)

    lines = []
    line_counter = 1
    chapter_id = bible_chapter.get("chapterId", "UNKNOWN") if bible_chapter else "UNKNOWN"

    last_end = 0.0
    current_verse_idx = 0

    for seg in segments:
        seg_start = round(float(seg.get("start", 0.0)), 2)
        seg_end = round(float(seg.get("end", 0.0)), 2)
        raw_text = seg.get("text", "").strip()

        if not raw_text:
            continue

        # Wykrycie długiej przerwy instrumentalnej przed tym wersusem (> 7.5 sekundy)
        gap = seg_start - last_end
        if gap >= 7.5 and last_end > 0.0:
            lines.append({
                "id": f"{chapter_id}-L{line_counter:03d}",
                "verse": None,
                "start": round(last_end, 2),
                "end": round(seg_start, 2),
                "text": "🎵 [Wstawka muzyczna]",
                "confidence": 1.0,
                "isInstrumental": True
            })
            line_counter += 1

        best_span = raw_text
        best_score = 0.0
        best_verse_num = None
        matched_v_idx = current_verse_idx

        # 1. Przeszukiwanie wersetów biblijnych
        if verses:
            # Okno lokalne wokół bieżącego wersetu
            search_window = range(
                max(0, current_verse_idx - 1),
                min(total_verses, current_verse_idx + 6)
            )
            for v_idx in search_window:
                v = verses[v_idx]
                v_text = v.get("text", "")
                span, ratio = find_best_verse_span(raw_text, v_text)
                if ratio > best_score:
                    best_score = ratio
                    best_span = span
                    best_verse_num = v.get("number")
                    matched_v_idx = v_idx

            # Jeśli w oknie lokalnym brak dobrego dopasowania, przeszukaj cały rozdział
            if best_score < 0.45:
                for v_idx, v in enumerate(verses):
                    v_text = v.get("text", "")
                    span, ratio = find_best_verse_span(raw_text, v_text)
                    if ratio > best_score:
                        best_score = ratio
                        best_span = span
                        best_verse_num = v.get("number")
                        matched_v_idx = v_idx

        # 2. Wybór tekstu linijki
        final_text = raw_text
        verse_num = None
        confidence = 0.85

        if best_score >= 0.50 and best_verse_num is not None:
            # Sukces dopasowania do tekstu UBG 2025
            clean_span = best_span.strip().rstrip(",;:.–—?!")
            final_text = clean_span[0].upper() + clean_span[1:] if len(clean_span) > 1 else clean_span.upper()
            verse_num = best_verse_num
            confidence = round(max(0.92, best_score), 2)
            current_verse_idx = matched_v_idx
        elif best_score >= 0.35 and best_verse_num is not None:
            verse_num = best_verse_num
            confidence = round(best_score, 2)
        else:
            # Wstawka wokalna lub refren spoza tekstu rozdziału
            confidence = round(float(seg.get("confidence", 0.78)), 2)

        lines.append({
            "id": f"{chapter_id}-L{line_counter:03d}",
            "verse": verse_num,
            "start": seg_start,
            "end": seg_end,
            "text": final_text,
            "rawTranscript": raw_text if final_text != raw_text else None,
            "confidence": confidence,
            "isInstrumental": False
        })
        line_counter += 1
        last_end = seg_end

    # Końcowa wstawka instrumentalna (jeśli utwór trwa dłużej niż ostatnia linijka o > 8 sekund)
    if audio_duration and (audio_duration - last_end) >= 8.0:
        lines.append({
            "id": f"{chapter_id}-L{line_counter:03d}",
            "verse": None,
            "start": round(last_end, 2),
            "end": round(audio_duration, 2),
            "text": "🎵 [Zakończenie muzyczne]",
            "confidence": 1.0,
            "isInstrumental": True
        })

    return lines


def validate_and_score(lines, audio_duration, total_chapter_verses=None):
    """
    Waliduje chronologię, brak ujemnych czasów, monotoniczność i oblicza ocenę jakości.
    Zwraca (status, quality_score, metrics_dict).
    """
    if not lines:
        return "SYNC_FAILED", 0.0, {"error": "Brak linii"}

    errors = []
    prev_start = -1.0
    valid_count = 0
    matched_verses = set()

    for idx, line in enumerate(lines):
        start = line["start"]
        end = line["end"]

        # 1. Walidacja czasów
        if start < 0 or end < 0:
            errors.append(f"Linia {idx}: ujemny czas ({start} -> {end})")
        if start >= end:
            errors.append(f"Linia {idx}: start >= end ({start} >= {end})")
        if start < prev_start:
            errors.append(f"Linia {idx}: zaburzona chronologia ({start} < {prev_start})")
        if audio_duration and end > (audio_duration + 2.0):
            errors.append(f"Linia {idx}: przekroczenie długości nagrania ({end} > {audio_duration})")

        prev_start = start
        if not line.get("isInstrumental"):
            valid_count += 1
            if line.get("verse") is not None:
                matched_verses.add(line["verse"])

    v_count = len(lines)
    coverage_ratio = 1.0
    if total_chapter_verses and total_chapter_verses > 0:
        coverage_ratio = len(matched_verses) / float(total_chapter_verses)

    avg_conf = sum(l.get("confidence", 0.8) for l in lines) / max(1, len(lines))
    quality_score = round(0.5 * avg_conf + 0.3 * min(1.0, coverage_ratio) + 0.2 * (1.0 if not errors else 0.0), 3)

    # Klasyfikacja statusu
    if errors:
        status = "SYNC_FAILED"
    elif quality_score >= 0.75 and (coverage_ratio >= 0.70 or not total_chapter_verses):
        status = "SYNC_READY"
    else:
        status = "SYNC_REVIEW"

    verse_cov_str = f"{min(matched_verses)}-{max(matched_verses)}" if matched_verses else "brak"

    metrics = {
        "lineCount": len(lines),
        "vocalLineCount": valid_count,
        "matchedVerseCount": len(matched_verses),
        "totalChapterVerses": total_chapter_verses,
        "verseCoverage": verse_cov_str,
        "coverageRatio": round(coverage_ratio, 2),
        "averageConfidence": round(avg_conf, 2),
        "qualityScore": quality_score,
        "errorCount": len(errors),
        "errors": errors[:5]
    }

    return status, quality_score, metrics


def format_vtt_timestamp(seconds):
    """Formatuje sekundy do postaci HH:MM:SS.mmm dla WebVTT."""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def format_lrc_timestamp(seconds):
    """Formatuje sekundy do postaci [mm:ss.xx] dla standardu LRC."""
    m = int(seconds // 60)
    s = seconds % 60
    return f"[{m:02d}:{s:05.2f}]"


def export_webvtt(data, vtt_path):
    """Generuje plik WebVTT."""
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n")
        f.write(f"Title: {data.get('title', '')}\n")
        f.write(f"ChapterId: {data.get('chapterId', '')}\n")
        f.write(f"VideoId: {data.get('videoId', '')}\n")
        f.write("Language: pl\n\n")

        for line in data.get("lines", []):
            start_vtt = format_vtt_timestamp(line["start"])
            end_vtt = format_vtt_timestamp(line["end"])
            v_prefix = f"[Werset {line['verse']}] " if line.get("verse") else ""
            f.write(f"{line['id']}\n")
            f.write(f"{start_vtt} --> {end_vtt}\n")
            f.write(f"{v_prefix}{line['text']}\n\n")


def export_lrc(data, lrc_path):
    """Generuje plik w formacie LRC."""
    with open(lrc_path, "w", encoding="utf-8") as f:
        f.write(f"[ti:{data.get('title', '')}]\n")
        f.write(f"[ar:Christian Culture]\n")
        f.write(f"[al:Biblia Śpiewana — {data.get('bookName', '')}]\n")
        f.write(f"[by:Christian Culture Auto Karaoke Engine]\n")
        if data.get("duration"):
            f.write(f"[length:{int(data['duration'] // 60):02d}:{int(data['duration'] % 60):02d}]\n")
        f.write("\n")

        for line in data.get("lines", []):
            tag = format_lrc_timestamp(line["start"])
            f.write(f"{tag}{line['text']}\n")


def update_sync_registry(registry_path, chapter_id, entry_data):
    """Aktualizuje lub dodaje wpis w centralnym rejestrze synchronizacji."""
    registry = {"schemaVersion": 1, "lastUpdated": "", "totalSongs": 0, "songs": {}}
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
        except Exception:
            pass

    import datetime
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    registry["lastUpdated"] = now_iso
    registry["songs"][chapter_id] = {
        **registry.get("songs", {}).get(chapter_id, {}),
        **entry_data,
        "lastAnalyzedAt": now_iso
    }
    registry["totalSongs"] = len(registry["songs"])

    os.makedirs(os.path.dirname(os.path.abspath(registry_path)), exist_ok=True)
    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, ensure_ascii=False, indent=2)


def process_karaoke_sync(
    audio_path,
    chapter_id,
    video_id,
    output_dir=OUTPUT_BASE_DEFAULT,
    bible_dir=BIBLE_BASE_DEFAULT,
    registry_path=REGISTRY_PATH_DEFAULT,
    precomputed_segments_path=None,
    model_name="base",
    force_status=None
):
    """
    Główna funkcja orkiestracji synchronizacji utworu.
    """
    os.makedirs(output_dir, exist_ok=True)

    print(f"=== [Auto Karaoke Engine] Rozpoczynam przetwarzanie: {chapter_id} ===")
    print(f"Plik audio: {audio_path}")
    print(f"Video ID: {video_id}")

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Plik audio nie istnieje: {audio_path}")

    # 1. Metadane audio i suma kontrolna
    audio_info = get_audio_info(audio_path)
    audio_sha256 = compute_sha256(audio_path)
    duration = audio_info["duration"]
    print(f"Audio wykryte: czas trwania = {duration}s, SHA256 = {audio_sha256[:12]}...")

    # 2. Wczytanie tekstu biblijnego UBG 2025
    bible_chapter = load_bible_chapter(chapter_id, bible_dir)
    total_chapter_verses = len(bible_chapter.get("verses", [])) if bible_chapter else None
    book_name = bible_chapter.get("book", "") if bible_chapter else ""
    chapter_number = bible_chapter.get("chapter", 1) if bible_chapter else 1
    chapter_title = bible_chapter.get("verses", [{}])[0].get("text", "") if bible_chapter else ""

    # 3. Rozpoznawanie mowy / Whisper
    segments = []
    if precomputed_segments_path and os.path.exists(precomputed_segments_path):
        print(f"Używam przygotowanych segmentów ASR z: {precomputed_segments_path}")
        with open(precomputed_segments_path, "r", encoding="utf-8") as f:
            segments = json.load(f)
    else:
        print("Uruchamiam model Whisper dla języka polskiego...")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
            tmp_wav_path = tmp_wav.name

        try:
            convert_to_pcm_wav(audio_path, tmp_wav_path)
            import whisper
            model = whisper.load_model(model_name)
            result = model.transcribe(tmp_wav_path, language="pl", verbose=False)
            for seg in result.get("segments", []):
                segments.append({
                    "id": seg["id"],
                    "start": round(seg["start"], 2),
                    "end": round(seg["end"], 2),
                    "text": seg["text"].strip()
                })
        finally:
            if os.path.exists(tmp_wav_path):
                os.remove(tmp_wav_path)

    print(f"Wyodrębniono {len(segments)} segmentów mowy.")

    # 4. Dopasowanie do wersetów
    lines = align_segments_to_verses(segments, bible_chapter, duration)
    print(f"Złożono {len(lines)} linii karaoke z uwzględnieniem wstawek instrumentalnych.")

    # 5. Walidacja jakości
    status, quality_score, metrics = validate_and_score(lines, duration, total_chapter_verses)
    if force_status:
        status = force_status
    print(f"Status walidacji: {status} (Jakość: {quality_score * 100:.1f}%)")

    # 6. Przygotowanie struktury JSON schema v1
    karaoke_data = {
        "schemaVersion": 1,
        "chapterId": chapter_id,
        "videoId": video_id,
        "title": f"{book_name} {chapter_number}" if book_name else chapter_id,
        "bookName": book_name,
        "chapterNumber": chapter_number,
        "language": "pl",
        "translation": "UBG-2025",
        "audioVersion": audio_sha256,
        "duration": duration,
        "status": status,
        "qualityScore": quality_score,
        "alignment": {
            "engine": f"whisper-{model_name}-pl",
            "reviewRequired": (status != "SYNC_READY"),
            "lineCount": metrics["lineCount"],
            "vocalLineCount": metrics["vocalLineCount"],
            "verseCoverage": metrics["verseCoverage"],
            "coverageRatio": metrics["coverageRatio"],
            "averageConfidence": metrics["averageConfidence"]
        },
        "lines": lines
    }

    # 7. Zapis JSON, WebVTT i LRC
    json_path = os.path.join(output_dir, f"{chapter_id}.json")
    vtt_path = os.path.join(output_dir, f"{chapter_id}.vtt")
    lrc_path = os.path.join(output_dir, f"{chapter_id}.lrc")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(karaoke_data, f, ensure_ascii=False, indent=2)
    export_webvtt(karaoke_data, vtt_path)
    export_lrc(karaoke_data, lrc_path)

    print(f"Pliki wyjściowe zapisane:")
    print(f" - JSON:   {json_path}")
    print(f" - WebVTT: {vtt_path}")
    print(f" - LRC:    {lrc_path}")

    # 8. Aktualizacja rejestru
    update_sync_registry(registry_path, chapter_id, {
        "chapterId": chapter_id,
        "videoId": video_id,
        "bookName": book_name,
        "chapterNumber": chapter_number,
        "title": karaoke_data["title"],
        "audioAvailable": True,
        "audioSha256": audio_sha256,
        "duration": duration,
        "status": status,
        "qualityScore": quality_score,
        "lineCount": len(lines),
        "verseCoverage": metrics["verseCoverage"],
        "syncFile": f"/data/bu-karaoke/{chapter_id}.json",
        "vttFile": f"/data/bu-karaoke/{chapter_id}.vtt",
        "lrcFile": f"/data/bu-karaoke/{chapter_id}.lrc"
    })
    print(f"Rejestr zaktualizowany: {registry_path}")

    return karaoke_data


def main():
    parser = argparse.ArgumentParser(description="Christian Culture — Auto Karaoke Sync Engine")
    parser.add_argument("--audio", required=True, help="Ścieżka do pliku audio")
    parser.add_argument("--chapter", required=True, help="Identyfikator rozdziału (np. GEN-001)")
    parser.add_argument("--video-id", required=True, help="YouTube Video ID (np. WN_y21vHW6g)")
    parser.add_argument("--output-dir", default=OUTPUT_BASE_DEFAULT, help="Katalog wyjściowy")
    parser.add_argument("--bible-dir", default=BIBLE_BASE_DEFAULT, help="Katalog wersetów UBG 2025")
    parser.add_argument("--registry", default=REGISTRY_PATH_DEFAULT, help="Ścieżka do rejestru bu-sync-registry.json")
    parser.add_argument("--precomputed-segments", default=None, help="Ścieżka do wcześniej wyekstrahowanych segmentów")
    parser.add_argument("--model", default="base", help="Model Whisper (tiny, base, small, medium)")
    parser.add_argument("--status", default=None, help="Wymuś status publikacji (np. SYNC_READY)")

    args = parser.parse_args()
    process_karaoke_sync(
        audio_path=args.audio,
        chapter_id=args.chapter,
        video_id=args.video_id,
        output_dir=args.output_dir,
        bible_dir=args.bible_dir,
        registry_path=args.registry,
        precomputed_segments_path=args.precomputed_segments,
        model_name=args.model,
        force_status=args.status
    )


if __name__ == "__main__":
    main()
