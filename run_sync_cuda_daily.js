import { syncCudaDaily } from './sync_cuda_kazdego_dnia.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zasady bezpieczeństwa wdrożenia (@007, 26.10.2026, po incydencie 05:15: wdrożenie nieaktualnego
// katalogu roboczego cofnęło produkcję do 25.10):
// 1. przed commitem lokalny main dogania origin/main (pull --rebase --autostash);
// 2. bez udanego push do origin NIE MA wdrożenia;
// 3. wdrażamy wyłącznie czysty pakiet z plików śledzonych (scripts/build-pages-release.mjs),
//    nigdy katalogu roboczego („wrangler pages deploy .”), i tylko gdy HEAD == origin/main.
const CUDA_FILES = 'rozwazania_cuda_baza.json cuda_kazdego_dnia_* cuda_kazgo_dnia_current.webp';

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  try {
    fs.appendFileSync(path.join(__dirname, 'run_sync_cuda_daily.log'), line, 'utf8');
  } catch (e) {}
}

const sh = (cmd, cwd = __dirname) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

// Commit plików Cuda i push do origin; zwraca true tylko gdy origin/main zawiera commit.
function commitAndPush(dir, addCmd, name) {
  if (sh('git branch --show-current', dir) !== 'main') {
    log(`⛔ ${name}: katalog nie jest na gałęzi main — pomijam commit i push.`);
    return false;
  }
  sh('git fetch origin', dir);
  sh(addCmd, dir);
  if (sh('git diff --cached --name-only', dir)) sh('git commit -m "chore(cuda): auto-sync Cuda Kazdego Dnia"', dir);
  try {
    sh('git pull --rebase --autostash origin main', dir);
  } catch (e) {
    try { sh('git rebase --abort', dir); } catch (_) {}
    throw e;
  }
  sh('git push origin HEAD:main', dir);
  sh('git fetch origin', dir);
  const pushed = sh('git rev-parse HEAD', dir) === sh('git rev-parse origin/main', dir);
  log(pushed ? `✅ ${name}: pchnięto do origin/main.` : `⛔ ${name}: HEAD różni się od origin/main po push.`);
  return pushed;
}

function deployCleanRelease() {
  const head = sh('git rev-parse HEAD');
  if (head !== sh('git rev-parse origin/main')) {
    log('⛔ Deploy pominięty: lokalny HEAD nie jest równy origin/main.');
    return;
  }
  if (sh('git status --porcelain --untracked-files=no')) {
    log('⛔ Deploy pominięty: w katalogu są niezatwierdzone zmiany plików śledzonych (pakiet nie byłby czysty). Zmiana Cuda jest w origin/main i wejdzie z najbliższym wdrożeniem.');
    return;
  }
  const out = path.join(__dirname, '.pages-release');
  try {
    log('☁️ Buduję czysty pakiet i wdrażam na Cloudflare Pages...');
    sh('node scripts/build-pages-release.mjs');
    const deploy = `npx.cmd --yes wrangler pages deploy .pages-release --project-name polskieradio --branch main --commit-hash ${head}`;
    if (process.env.CC_CUDA_DRY_RUN === '1') { log(`[próba] ${deploy}`); return; } // test bez wdrożenia
    sh(deploy);
    log(`✅ Cloudflare Pages wdrożone (${head.slice(0, 8)}).`);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
}

async function main() {
  log("🚀 Rozpoczynam automatyczną procedurę synchronizacji Cuda Każdego Dnia...");
  try {
    const res = await syncCudaDaily();
    log(`Wynik synchronizacji: published=${res?.published}, success=${res?.success}`);

    // Sprawdź stan git w polskieradio.cc
    const gitStatus = sh('git status --porcelain');
    const hasCudaChanges = /cuda_kazdego_dnia|cuda_kazgo_dnia|rozwazania_cuda_baza\.json/i.test(gitStatus);

    if (hasCudaChanges || (res && res.published > 0)) {
      log("📦 Wykryto zmiany w Cuda Każdego Dnia — rozpoczynam wersjonowanie i deploy...");

      let pushed = false;
      try {
        pushed = commitAndPush(__dirname, `git add ${CUDA_FILES}`, 'polskieradio.cc');
        if (pushed) {
          try {
            sh('git push lumina-repo HEAD:main');
            log("✅ Pchnięto zmiany polskieradio.cc do lumina-repo/main.");
          } catch (lrErr) {
            log(`⚠️ lumina-repo push: ${lrErr.message}`);
          }
        }
      } catch (gitErr) {
        log(`⚠️ Błąd git commit/push polskieradio.cc: ${gitErr.message}`);
      }

      if (pushed) {
        try {
          deployCleanRelease();
        } catch (cfErr) {
          log(`⚠️ Błąd Cloudflare Pages deploy: ${cfErr.message}`);
        }
      } else {
        log('⛔ Deploy pominięty: zmiany nie trafiły do origin/main.');
      }

      // Sync repo Christian-Culture-Web-App
      const ccWebAppDir = path.resolve(__dirname, '..', 'Christian-Culture-Web-App');
      if (fs.existsSync(ccWebAppDir)) {
        try {
          const status = sh('git status --porcelain', ccWebAppDir);
          if (/rozwazania_cuda_baza\.json|cuda_kazdego_dnia/i.test(status)) {
            commitAndPush(ccWebAppDir, 'git add -f public/rozwazania_cuda_baza.json public/cuda_kazdego_dnia_*', 'Christian-Culture-Web-App');
          }
        } catch (e) {
          log(`⚠️ Błąd sync Christian-Culture-Web-App: ${e.message}`);
        }
      }

      // Sync repo cclite.pl
      const ccliteDir = path.resolve(__dirname, '..', 'cclite.pl');
      if (fs.existsSync(ccliteDir)) {
        try {
          const status = sh('git status --porcelain', ccliteDir);
          if (/rozwazania_cuda_baza\.json|cuda_kazdego_dnia/i.test(status)) {
            commitAndPush(ccliteDir, 'git add -f public/rozwazania_cuda_baza.json', 'cclite.pl');
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
