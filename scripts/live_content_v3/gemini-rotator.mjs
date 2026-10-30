/**
 * EkoCC LIVE CONTENT V3 — Gemini Key Rotator & Fallback Engine
 * 
 * Odpowiedzialność:
 * - Wczytuje pulę kluczy API (GEMINI_API_KEY, GEMINI_API_KEY_BACKUP_1, GEMINI_API_KEY_BACKUP_2, ...)
 * - Obsługuje błędy 429 (Rate Limit / Quota Exceeded) poprzez natychmiastową, automatyczną rotację na kolejne darmowe konto.
 * - Standard ZERO COST: obsługa wyłącznie darmowych limitów Free Tier bez przestojów redakcyjnych.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let cachedKeys = null;
let currentKeyIndex = 0;

export function resetRotator() {
  cachedKeys = null;
  currentKeyIndex = 0;
}

export function loadGeminiKeys(customEnvPath = null) {
  currentKeyIndex = 0;
  const keys = [];
  const searchPaths = [];

  if (customEnvPath) {
    searchPaths.push(customEnvPath);
  } else {
    // 1. Bieżący projekt
    searchPaths.push(path.resolve(process.cwd(), '.env'));
    // 2. Katalog domowy użytkownika (~/.env)
    searchPaths.push(path.join(os.homedir(), '.env'));
  }

  for (const envFile of searchPaths) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^(GEMINI_API_KEY(?:_BACKUP_\d+|_\d+)?)\s*=\s*(["']?)(.*?)\2$/);
          if (match && match[3]) {
            const keyVal = match[3].trim();
            if (keyVal && !keys.includes(keyVal)) {
              keys.push(keyVal);
            }
          }
        }
      } catch (err) {
        // Cichy fallback przy braku uprawnień odczytu
      }
    }
  }

  // Sprawdź także zmienne środowiskowe procesu
  if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
    keys.unshift(process.env.GEMINI_API_KEY);
  }
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_BACKUP_${i}`];
    if (k && !keys.includes(k)) {
      keys.push(k);
    }
  }

  cachedKeys = keys;
  return keys;
}

export function getActiveGeminiKey() {
  if (!cachedKeys || cachedKeys.length === 0) {
    loadGeminiKeys();
  }
  if (!cachedKeys || cachedKeys.length === 0) {
    return null;
  }
  return cachedKeys[currentKeyIndex % cachedKeys.length];
}

export function rotateGeminiKey() {
  if (!cachedKeys || cachedKeys.length <= 1) {
    return null; // Brak alternatywnych kluczy
  }
  currentKeyIndex = (currentKeyIndex + 1) % cachedKeys.length;
  console.log(`[Gemini Rotator] Przełączono na klucz zapasowy #${currentKeyIndex + 1} z ${cachedKeys.length}.`);
  return cachedKeys[currentKeyIndex];
}

export function getPoolStatus() {
  if (!cachedKeys) loadGeminiKeys();
  return {
    totalKeys: cachedKeys.length,
    currentIndex: currentKeyIndex,
    hasBackups: cachedKeys.length > 1
  };
}

/**
 * Bezpieczne wywołanie funkcji API z automatyczną rotacją przy błędzie 429
 */
export async function executeWithGeminiFallback(apiCallFn, maxAttempts = 3) {
  const pool = cachedKeys || loadGeminiKeys();
  const attempts = Math.min(maxAttempts, Math.max(pool.length, 1));

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const currentKey = getActiveGeminiKey();
    try {
      return await apiCallFn(currentKey);
    } catch (err) {
      const isRateLimit = err?.status === 429 || 
                          err?.message?.includes('429') || 
                          err?.message?.includes('quota') || 
                          err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isRateLimit && pool.length > 1 && attempt < attempts) {
        console.warn(`[Gemini Rotator] Napotkano Rate Limit (429). Rotacja klucza... (Próba ${attempt}/${attempts})`);
        rotateGeminiKey();
        continue;
      }
      throw err;
    }
  }
}
