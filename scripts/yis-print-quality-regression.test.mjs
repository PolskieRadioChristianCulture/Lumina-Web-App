import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlContent = fs.readFileSync(path.join(rootDir, 'projektant.html'), 'utf8');
const printQualityJsContent = fs.readFileSync(path.join(rootDir, 'js', 'yis-print-quality.js'), 'utf8');

// Mock window environment to test YisPrintQuality algorithms directly
const mockWindow = {};
const runScript = new Function('window', printQualityJsContent);
runScript(mockWindow);
const YisPQ = mockWindow.YisPrintQuality;

test('PrintQuality: module exports all required functions and constants', () => {
  assert.ok(YisPQ, 'Module must be loaded');
  assert.equal(typeof YisPQ.computeEffectiveDpi, 'function');
  assert.equal(typeof YisPQ.evaluateQuality, 'function');
  assert.equal(typeof YisPQ.formatBytes, 'function');
  assert.ok(YisPQ.PHYSICAL_PRINT_LIMITS_CM.Koszulka);
  assert.equal(YisPQ.PHYSICAL_PRINT_LIMITS_CM.Koszulka.width, 30.0);
});

test('PrintQuality: formatBytes formats sizes accurately', () => {
  assert.equal(YisPQ.formatBytes(512), '512 B');
  assert.equal(YisPQ.formatBytes(1024), '1 KB');
  assert.equal(YisPQ.formatBytes(3.5 * 1024 * 1024), '3.5 MB');
});

test('PrintQuality: computeEffectiveDpi calculates accurate real-world DPI across scales', () => {
  // 2400px szerokości przy skali 140px/230px na koszulce (strefa 30cm)
  // printWidthCm = 30 * (140/230) = 18.26 cm = 7.18 cala
  // DPI = 2400 / 7.18 = ~334 DPI
  const res1 = YisPQ.computeEffectiveDpi(2400, 3000, 'Koszulka', 140);
  assert.ok(res1.effectiveDpi >= 320 && res1.effectiveDpi <= 350, `Expected ~334 DPI, got ${res1.effectiveDpi}`);
  assert.equal(res1.printWidthCm, 18.3);

  // Mały plik 600px rozciągnięty na pełną szerokość 230px (30 cm = 11.81 cala)
  // DPI = 600 / 11.81 = ~51 DPI
  const res2 = YisPQ.computeEffectiveDpi(600, 600, 'Koszulka', 230);
  assert.ok(res2.effectiveDpi <= 60, `Expected low DPI (<60), got ${res2.effectiveDpi}`);
  assert.equal(res2.printWidthCm, 30.0);
});

test('PrintQuality: evaluateQuality classifies 3 tiers correctly (Green, Yellow, Red)', () => {
  // Green: >= 250 DPI
  const green = YisPQ.evaluateQuality(312, 18.0, 22.0, true, false);
  assert.equal(green.level, 'high');
  assert.equal(green.requiresWarningCheck, false);
  assert.ok(green.title.includes('312 DPI'));
  assert.ok(green.message.includes('nadaje się do nadruku'));

  // Yellow: 150-249 DPI
  const yellow = YisPQ.evaluateQuality(185, 25.0, 30.0, false, false);
  assert.equal(yellow.level, 'medium');
  assert.equal(yellow.requiresWarningCheck, false);
  assert.ok(yellow.title.includes('185 DPI'));
  assert.ok(yellow.message.includes('drobne detale mogą być lekko zmiękczone'));

  // Red: < 150 DPI
  const red = YisPQ.evaluateQuality(118, 28.0, 35.0, true, false);
  assert.equal(red.level, 'low');
  assert.equal(red.requiresWarningCheck, true);
  assert.ok(red.title.includes('118 DPI'));
  assert.ok(red.message.includes('grafika może być nieostra'));

  // Preset: always high
  const preset = YisPQ.evaluateQuality(100, 20.0, 20.0, true, true);
  assert.equal(preset.level, 'high');
  assert.equal(preset.requiresWarningCheck, false);
});

test('PrintQuality UI: HTML contains script import, analysis widget and low-DPI warning checkbox', () => {
  assert.ok(htmlContent.includes('<script src="/js/yis-print-quality.js"></script>'), 'Must load script');
  assert.ok(htmlContent.includes('id="print-quality-analysis-box"'), 'Must have analysis widget in step 5');
  assert.ok(htmlContent.includes('id="summary-low-dpi-warning"'), 'Must have low DPI warning box in step 10');
  assert.ok(htmlContent.includes('id="ack-low-dpi-checkbox"'), 'Must have conscious acknowledgement checkbox');
  assert.ok(htmlContent.includes('Pliki wektorowe (SVG, PDF) prześlij bezpośrednio do weryfikacji mailowej'), 'Must instruct safely on SVG');
});
