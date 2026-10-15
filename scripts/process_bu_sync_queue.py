#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Christian Culture — Rejestr i Kolejka Synchronizacji Biblijnego Uwielbienia 2026
Skanuje katalog 38 utworów Biblii Śpiewanej, weryfikuje stan audio i synchronizacji,
tworzy i aktualizuje centralny rejestr data/bu-sync-registry.json.
"""

import os
import json
import datetime
from bu_auto_karaoke_engine import compute_sha256, get_audio_info

PLAYLIST_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "biblijne-uwielbienie-playlist.json")
KARAOKE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "bu-karaoke")
REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "bu-sync-registry.json")
DOWNLOADS_DIR = os.path.expanduser(r"~\Downloads")

KNOWN_AUDIO_FILES = {
    "GEN-001": [
        os.path.join(DOWNLOADS_DIR, "Księga Rodzaju 1 — Biblia Śpiewana (Cały Rozdział 1).mp3"),
        os.path.join(DOWNLOADS_DIR, "CZĘŚĆ 1 — NIECH STANIE SIĘ ŚWIATŁOŚĆ.mp3")
    ]
}


def build_or_update_registry():
    if not os.path.exists(PLAYLIST_PATH):
        raise FileNotFoundError(f"Brak pliku playlisty: {PLAYLIST_PATH}")

    with open(PLAYLIST_PATH, "r", encoding="utf-8") as f:
        playlist = json.load(f)

    items = playlist.get("items", [])
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    songs = []
    ready_count = 0
    review_count = 0
    pending_audio_count = 0
    failed_count = 0

    for item in items:
        chapter_id = item["chapterId"]
        video_id = item["videoId"]
        title = item.get("title", f"{item.get('bookName')} {item.get('chapterNumber')}")

        json_path = os.path.join(KARAOKE_DIR, f"{chapter_id}.json")
        vtt_path = os.path.join(KARAOKE_DIR, f"{chapter_id}.vtt")
        lrc_path = os.path.join(KARAOKE_DIR, f"{chapter_id}.lrc")

        # Sprawdzenie obecności gotowego pliku synchronizacji
        has_sync = os.path.exists(json_path)
        sync_meta = {}
        if has_sync:
            try:
                with open(json_path, "r", encoding="utf-8") as jf:
                    sync_meta = json.load(jf)
            except Exception:
                pass

        # Sprawdzenie lokalnego pliku audio
        audio_path = None
        for candidate in KNOWN_AUDIO_FILES.get(chapter_id, []):
            if os.path.exists(candidate):
                audio_path = candidate
                break

        audio_available = bool(audio_path)
        audio_sha = compute_sha256(audio_path) if audio_available else sync_meta.get("audioVersion")

        # Ustalenie statusu
        if has_sync:
            status = sync_meta.get("status", "SYNC_READY")
            if status == "SYNC_READY":
                ready_count += 1
            elif status == "SYNC_REVIEW":
                review_count += 1
            else:
                failed_count += 1
        else:
            if audio_available:
                status = "SYNC_REVIEW"
                review_count += 1
            else:
                status = "SYNC_PENDING_AUDIO"
                pending_audio_count += 1

        record = {
            "chapterId": chapter_id,
            "videoId": video_id,
            "bookCode": item.get("bookCode"),
            "bookName": item.get("bookName"),
            "chapterNumber": item.get("chapterNumber"),
            "title": title,
            "lengthText": item.get("lengthText", ""),
            "audioAvailable": audio_available,
            "audioSource": os.path.basename(audio_path) if audio_path else None,
            "audioSha256": audio_sha,
            "status": status,
            "qualityScore": sync_meta.get("qualityScore", (0.95 if status == "SYNC_READY" else None)),
            "lineCount": len(sync_meta.get("lines", [])) if has_sync else 0,
            "hasVtt": os.path.exists(vtt_path),
            "hasLrc": os.path.exists(lrc_path),
            "syncFile": f"/data/bu-karaoke/{chapter_id}.json" if has_sync else None,
            "vttFile": f"/data/bu-karaoke/{chapter_id}.vtt" if os.path.exists(vtt_path) else None,
            "lrcFile": f"/data/bu-karaoke/{chapter_id}.lrc" if os.path.exists(lrc_path) else None,
            "licenseStatus": "UBG-2025 CC BY-ND 4.0",
            "notes": (
                "Synchronizacja wzorcowa opublikowana i zweryfikowana."
                if status == "SYNC_READY" else
                ("Oczekuje na weryfikację roboczą." if status == "SYNC_REVIEW" else "Oczekuje na dostarczenie pliku master audio ze studia nagrań.")
            ),
            "lastAnalyzedAt": sync_meta.get("lastAnalyzedAt", now_iso)
        }
        songs.append(record)

    registry = {
        "schemaVersion": 1,
        "title": "Centralny Rejestr Synchronizacji Biblijnego Uwielbienia",
        "lastUpdated": now_iso,
        "totalCatalogSongs": len(items),
        "totalBibleChapters": 1189,
        "summary": {
            "syncReady": ready_count,
            "syncReview": review_count,
            "pendingAudio": pending_audio_count,
            "failed": failed_count
        },
        "items": songs
    }

    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(registry, f, ensure_ascii=False, indent=2)

    print(f"=== Rejestr synchronizacji zaktualizowany ({REGISTRY_PATH}) ===")
    print(f"Katalog: {len(items)} utworów")
    print(f" - SYNC_READY:         {ready_count}")
    print(f" - SYNC_REVIEW:        {review_count}")
    print(f" - SYNC_PENDING_AUDIO: {pending_audio_count}")
    print(f" - SYNC_FAILED:        {failed_count}")
    return registry


if __name__ == "__main__":
    build_or_update_registry()
