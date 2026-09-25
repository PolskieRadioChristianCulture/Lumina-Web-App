import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mock localStorage and window for testing pure modules in Node.js
const mockStorage = {};
globalThis.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Import YisProjectStore
await import(pathToFileURL(path.join(rootDir, 'js', 'yis-project-store.js')).href);
const { YisProjectStore } = globalThis;

test('YisProjectStore: Schema v2 canonical project creation', () => {
  assert.ok(YisProjectStore, 'YisProjectStore must be exported');
  assert.equal(YisProjectStore.SCHEMA_VERSION, 2, 'Schema version must be 2');

  const dummyState = {
    selectedProductType: 'Koszulka',
    productBasePrice: 45,
    selectedColor: '36 (Czarny)',
    selectedColorHex: '#1A1A1A',
    selectedSize: 'L',
    selectedFormat: 'Średni',
    selectedPrintPlacement: 'Przód',
    designPackage: 1,
    quantity: 2,
    selectedShippingMethod: 'Paczkomat InPost',
    shippingCost: 17,
    firstName: 'Cezary',
    lastName: 'Rogowski',
    email: 'cezary@example.com',
    phoneNumber: '+48 500 600 700',
    address: 'Paczkomat WAW01M, Warszawa'
  };

  const project = YisProjectStore.createCanonicalProject(dummyState);
  assert.ok(project.projectId.startsWith('YIS-2026-'), 'Must have YIS-2026-XXXXX friendly ID format');
  assert.equal(project.schemaVersion, 2);
  assert.equal(project.revision, 1);
  assert.equal(project.status, 'SZKIC');
  assert.equal(project.product.type, 'Koszulka');
  assert.equal(project.product.quantity, 2);
  assert.equal(project.customer.email, 'cezary@example.com');
  assert.equal(project.customer.firstName, 'Cezary');
  assert.equal(project.print.placement, 'Przód');
  assert.ok(Array.isArray(project.statusHistory), 'statusHistory must be an array');
  assert.equal(project.statusHistory[0].status, 'SZKIC');
});

test('YisProjectStore: Revision snapshots and history persistence', () => {
  localStorage.clear();

  const dummyState = {
    selectedProductType: 'Bluza',
    productBasePrice: 115,
    selectedColor: 'AZ (Ciemnogranatowy)',
    selectedSize: 'XL',
    selectedPrintPlacement: 'Oba',
    designPackage: 2,
    quantity: 1,
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna@example.com',
    phoneNumber: '+48 600 700 800',
    address: 'ul. Marszałkowska 1, 00-001 Warszawa'
  };

  const project = YisProjectStore.createCanonicalProject(dummyState);
  const snapshot = YisProjectStore.createRevisionSnapshot(project, 'email');

  assert.equal(snapshot.status, 'DO WERYFIKACJI');
  assert.equal(snapshot.verification.channel, 'email');
  assert.ok(snapshot.verification.submittedAt, 'Must have submittedAt timestamp');
  assert.equal(snapshot.statusHistory.length, 2, 'History must contain SZKIC and DO WERYFIKACJI');
  assert.equal(snapshot.statusHistory[1].status, 'DO WERYFIKACJI');

  // Verify retrieval from local revisions storage
  const revisions = YisProjectStore.getRevisions();
  assert.equal(revisions.length, 1);
  assert.equal(revisions[0].projectId, project.projectId);
  assert.equal(revisions[0].revision, 1);
});

test('YisProjectStore: buildHandoffText produces truthful structured specification', () => {
  const dummyProject = {
    projectId: 'YIS-2026-TEST1',
    revision: 1,
    status: 'DO WERYFIKACJI',
    product: { type: 'Koszulka', color: 'Czarny', size: 'M', quantity: 1, basePrice: 45 },
    print: { placement: 'Przód', technology: 'DTF / Sitodruk Premium', format: 'Standard', physicalDimensions: 'Ok. 24 × 30 cm' },
    quality: { sourceWidthPx: 1200, sourceHeightPx: 1200, effectiveDpi: 300, qualityTier: 'excellent', transparency: true },
    designPackage: { name: '1 koncepcja (GRATIS)', price: 0 },
    pricing: { productBase: 45, print: 20, design: 0, shipping: 17, formattedTotal: '82,00 zł' },
    customer: { firstName: 'Jan', lastName: 'Kowalski', email: 'jan@test.pl', phone: '+48123456789', deliveryAddress: 'WAW01M', shippingMethod: 'Paczkomat InPost' },
    isGuest: true
  };

  const handoffText = YisProjectStore.buildHandoffText(dummyProject);
  assert.ok(handoffText.includes('YIS-2026-TEST1'), 'Must include project ID');
  assert.ok(handoffText.includes('KARTA SPECYFIKACJI PROJEKTU'), 'Must include card title');
  assert.ok(handoffText.includes('300 DPI'), 'Must include print quality report');
  assert.ok(handoffText.includes('1 koncepcja (GRATIS)'), 'Must include design package');
  assert.ok(handoffText.includes('82,00 zł'), 'Must include estimated total');
  assert.ok(handoffText.includes('Nie stanowi faktury ani rachunku fiskalnego') || handoffText.includes('wyceną orientacyjną'), 'Truthful UI notice present');
});

test('Firestore Rules: yis_projects collection rules are present and secured', () => {
  const rulesPath = path.join(rootDir, 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  assert.ok(rules.includes('match /yis_projects/{projectId}'), 'Rule for yis_projects must exist');
  assert.ok(rules.includes('request.resource.data.userId == request.auth.uid'), 'Must isolate create by UID');
  assert.ok(rules.includes("request.resource.data.status in ['SZKIC', 'DO WERYFIKACJI']"), 'Must restrict allowed client statuses');
  assert.ok(rules.includes('isMasterAdmin()'), 'Master admin bypass must be present');
});

test('projektant.html: YIS Project Card UI and Handoff integrity', () => {
  const htmlPath = path.join(rootDir, 'projektant.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Project Card Header & Badges
  assert.ok(html.includes('id="card-project-id"'), 'Project ID field present');
  assert.ok(html.includes('id="card-project-revision"'), 'Revision badge present');
  assert.ok(html.includes('id="card-project-status"'), 'Status badge present');
  assert.ok(html.includes('id="card-sync-indicator"'), 'Truthful sync indicator present');

  // Preview Thumbnails
  assert.ok(html.includes('id="card-preview-front"'), 'Front mockup thumbnail present');
  assert.ok(html.includes('id="card-preview-back"'), 'Back mockup thumbnail present');

  // Technical Specification
  assert.ok(html.includes('id="card-prod-title"'), 'Product title field present');
  assert.ok(html.includes('id="card-prod-placement"'), 'Print placement field present');
  assert.ok(html.includes('id="card-prod-tech"'), 'Print technology field present');
  assert.ok(html.includes('id="card-pq-dpi"'), 'Effective DPI report present');

  // Truthful UI Legal Notices
  assert.ok(html.includes('Nie jest rachunkiem ani fakturą fiskalną'), 'Truthful non-invoice disclaimer present');
  assert.ok(html.includes('Ostateczna cena oraz termin realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej'), 'Truthful estimate disclaimer present');

  // Handoff buttons
  assert.ok(html.includes('submitProjectForVerification(\'email\')'), 'Email verification trigger present');
  assert.ok(html.includes('copyProjectSpecification()'), 'Copy specification trigger present');
  assert.ok(html.includes('submitProjectForVerification(\'whatsapp\')'), 'WhatsApp consultation trigger present');
});
