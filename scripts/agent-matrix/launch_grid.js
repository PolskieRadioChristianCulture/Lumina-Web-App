/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA AGENT MATRIX — 7-GRID PLAYWRIGHT LAUNCHER
 * ══════════════════════════════════════════════════════════════════════════
 * Uruchamia 7 niezależnych, odizolowanych instancji mobilnych obok siebie
 * w automatycznie obliczonym układzie kafelkowym na ekranie komputera.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scenarios } from './scenarios.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wczytaj konfigurację matrycy
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Wybór środowiska: production vs local
const isLocal = process.argv.includes('--local') || process.env.MATRIX_ENV === 'local';
const baseUrl = isLocal ? config.baseUrlLocal : config.baseUrlProduction;

console.log(`
╔═════════════════════════════════════════════════════════════════════════════╗
║                  🏛️  LUMINA AGENT MATRIX (7-GRID SIMULATOR)                 ║
║         Wieloinstancyjny Symulator Agentów & Użytkowników Społeczności      ║
╚═════════════════════════════════════════════════════════════════════════════╝
Target URL:  ${baseUrl}
Środowisko:  ${isLocal ? 'LOKALNE (localhost:3000)' : 'PRODUKCJA (polskieradio.cc)'}
Liczba okien: ${config.agents.length} instancji mobilnych (iPhone/Pixel 390x844px)
`);

async function launchMatrix() {
  const instances = [];
  const baseSessionsDir = path.join(__dirname, '.matrix_sessions');
  if (!fs.existsSync(baseSessionsDir)) {
    fs.mkdirSync(baseSessionsDir, { recursive: true });
  }

  const { outerWidth, outerHeight, columns, spacingX, spacingY, startX, startY } = config.window;

  for (let i = 0; i < config.agents.length; i++) {
    const agent = config.agents[i];
    const col = i % columns;
    const row = Math.floor(i / columns);

    const posX = startX + col * (outerWidth + spacingX);
    const posY = startY + row * (outerHeight + spacingY);

    const userDataDir = path.join(baseSessionsDir, agent.id);

    console.log(`[Matrix] Uruchamiam okno #${i + 1}: ${agent.name} [Pozycja: X=${posX}, Y=${posY}]`);

    try {
      const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: config.window.width, height: config.window.height },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1 LUMINA_AgentMatrix/1.0',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        args: [
          `--window-position=${posX},${posY}`,
          `--window-size=${outerWidth},${outerHeight}`,
          '--disable-blink-features=AutomationControlled',
          '--no-default-browser-check',
          '--no-first-run'
        ]
      });

      const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
      const targetUrl = `${baseUrl}${agent.startPath}`;

      // Inicjalizacja lokalnej tożsamości agenta w przeglądarce
      await page.addInitScript((agentData) => {
        try {
          localStorage.setItem('lumina_current_user_slug', agentData.slug);
          localStorage.setItem('lumina_current_user_name', agentData.name);
          localStorage.setItem('lumina_current_user_role', agentData.role);
          localStorage.setItem('lumina_matrix_simulated', 'true');
        } catch (e) {}
      }, agent);

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(err => {
        console.warn(`[Matrix:${agent.name}] Ostrzeżenie ładowania strony: ${err.message}`);
      });

      instances.push({ agent, context, page });

      // Uruchomienie scenariusza w tle
      if (scenarios[agent.scenario]) {
        scenarios[agent.scenario](page, agent).catch(err => {
          console.warn(`[Matrix:${agent.name}] Błąd scenariusza: ${err.message}`);
        });
      }
    } catch (err) {
      console.error(`[Matrix] Błąd uruchamiania agenta ${agent.name}:`, err.message);
    }
  }

  console.log(`\n✅ Wszystkie ${instances.length} okna matrycy zostały uruchomione i ułożone na ekranie.`);
  console.log(`Naciśnij Ctrl+C w terminalu, aby zamknąć wszystkie okna symulatora.\n`);

  // Obsługa bezpiecznego zamykania
  process.on('SIGINT', async () => {
    console.log('\n[Matrix] Zamykanie wszystkich instancji symulatora...');
    for (const inst of instances) {
      try {
        await inst.context.close();
      } catch (e) {}
    }
    console.log('[Matrix] Wszystkie okna zamknięte pomyślnie. Cześć!');
    process.exit(0);
  });
}

launchMatrix().catch(err => {
  console.error('[Matrix:Fatal] Błąd matrycy:', err);
  process.exit(1);
});
