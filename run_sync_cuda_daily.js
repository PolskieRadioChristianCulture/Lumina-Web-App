import { syncCudaDaily } from './sync_cuda_kazdego_dnia.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  try {
    fs.appendFileSync(path.join(__dirname, 'run_sync_cuda_daily.log'), line, 'utf8');
  } catch (e) {}
}

async function main() {
  log("🚀 Rozpoczynam automatyczną procedurę synchronizacji Cuda Każdego Dnia...");
  try {
    const res = await syncCudaDaily();
    log(`Wynik synchronizacji: published=${res?.published}, success=${res?.success}`);

    // Sprawdź stan git w polskieradio.cc
    const gitStatus = execSync('git status --porcelain', { cwd: __dirname }).toString();
    const hasCudaChanges = /cuda_kazdego_dnia|cuda_kazgo_dnia|rozwazania_cuda_baza\.json/i.test(gitStatus);

    if (hasCudaChanges || (res && res.published > 0)) {
      log("📦 Wykryto zmiany w Cuda Każdego Dnia — rozpoczynam wersjonowanie i deploy...");

      try {
        execSync('git add rozwazania_cuda_baza.json cuda_kazdego_dnia_* cuda_kazgo_dnia_current.webp', { cwd: __dirname });
        execSync('git commit -m "chore(cuda): auto-sync Cuda Kazdego Dnia"', { cwd: __dirname });
        execSync('git push origin main', { cwd: __dirname });
        log("✅ Pchnięto zmiany polskieradio.cc do origin/main.");
        
        try {
          execSync('git push lumina-repo main', { cwd: __dirname });
          log("✅ Pchnięto zmiany polskieradio.cc do lumina-repo/main.");
        } catch (lrErr) {
          log(`⚠️ lumina-repo push: ${lrErr.message}`);
        }
      } catch (gitErr) {
        log(`⚠️ Błąd git commit/push polskieradio.cc: ${gitErr.message}`);
      }

      // Cloudflare Pages deploy
      try {
        log("☁️ Deploy na Cloudflare Pages...");
        execSync('npx.cmd --yes wrangler pages deploy . --project-name polskieradio --commit-dirty=true', { cwd: __dirname });
        log("✅ Cloudflare Pages wdrożone pomyślnie.");
      } catch (cfErr) {
        log(`⚠️ Błąd Cloudflare Pages deploy: ${cfErr.message}`);
      }

      // Sync repo Christian-Culture-Web-App
      const ccWebAppDir = path.resolve(__dirname, '..', 'Christian-Culture-Web-App');
      if (fs.existsSync(ccWebAppDir)) {
        try {
          const status = execSync('git status --porcelain', { cwd: ccWebAppDir }).toString();
          if (/rozwazania_cuda_baza\.json|cuda_kazdego_dnia/i.test(status)) {
            execSync('git add -f public/rozwazania_cuda_baza.json public/cuda_kazdego_dnia_*', { cwd: ccWebAppDir });
            execSync('git commit -m "chore(cuda): auto-sync Cuda Kazdego Dnia"', { cwd: ccWebAppDir });
            execSync('git push origin main', { cwd: ccWebAppDir });
            log("✅ Zsynchronizowano i pchnięto Christian-Culture-Web-App.");
          }
        } catch (e) {
          log(`⚠️ Błąd sync Christian-Culture-Web-App: ${e.message}`);
        }
      }

      // Sync repo cclite.pl
      const ccliteDir = path.resolve(__dirname, '..', 'cclite.pl');
      if (fs.existsSync(ccliteDir)) {
        try {
          const status = execSync('git status --porcelain', { cwd: ccliteDir }).toString();
          if (/rozwazania_cuda_baza\.json|cuda_kazdego_dnia/i.test(status)) {
            execSync('git add -f public/rozwazania_cuda_baza.json', { cwd: ccliteDir });
            execSync('git commit -m "chore(cuda): auto-sync Cuda Kazdego Dnia"', { cwd: ccliteDir });
            execSync('git push origin main', { cwd: ccliteDir });
            log("✅ Zsynchronizowano i pchnięto cclite.pl.");
          }
        } catch (e) {
          log(`⚠️ Błąd sync cclite.pl: ${e.message}`);
        }
      }

    } else {
      log("ℹ️ Brak nowych zmian w Cuda Każdego Dnia, git push i deploy pominięty.");
    }
  } catch (err) {
    log(`❌ Błąd krytyczny procedury: ${err.message}`);
  }
  log("🏁 Zakończono automatyczną procedurę synchronizacji Cuda Każdego Dnia.");
}

main();
