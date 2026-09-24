import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import modular JS files into Node.js environment
await import('../js/yis-products.js');
await import('../js/yis-pricing.js');
await import('../js/yis-project-store.js');

const { YisProducts, YisPricing, YisProjectStore } = globalThis;

test('YisProducts: catalog specifications and colors', () => {
  assert.ok(YisProducts, 'YisProducts module should be defined');
  assert.equal(YisProducts.YIS_COLORS.length, 21, 'Must have exactly 21 official YIS colors');
  
  const tshirt = YisProducts.getProduct('Koszulka');
  assert.equal(tshirt.basePrice, 115);
  assert.ok(tshirt.supportsBack);
  assert.deepEqual(tshirt.allowedPlacements, ['Przód', 'Tył', 'Oba']);

  const mug = YisProducts.getProduct('Kubek');
  assert.equal(mug.basePrice, 45);
  assert.equal(mug.supportsBack, false);

  const whiteColor = YisProducts.getColorByHex('#FFFFFF');
  assert.equal(whiteColor.name, '30 (Biały)');
  assert.equal(whiteColor.isLight, true);
});

test('YisPricing: package tiers (0 zł / 30 zł / 50 zł)', () => {
  assert.ok(YisPricing, 'YisPricing module should be defined');
  const pkgs = YisPricing.YIS_DESIGN_PACKAGES;
  
  assert.equal(pkgs[1].price, 0, 'Package 1 (1 concept) must be 0 zł (GRATIS)');
  assert.equal(pkgs[1].badge, 'GRATIS');
  
  assert.equal(pkgs[2].price, 30, 'Package 2 (2 concepts) must be 30 zł');
  assert.equal(pkgs[2].badge, '+30 ZŁ');

  assert.equal(pkgs[3].price, 50, 'Package 3 (3 concepts) must be 50 zł');
  assert.equal(pkgs[3].badge, '+50 ZŁ');
});

test('YisPricing: calculateYisPricing anti-premature initial pricing rule', () => {
  // Step 0 or 1 without product selected must be strictly 0,00 zł
  const initPrice = YisPricing.calculateYisPricing({
    currentStep: 0,
    selectedProductType: '',
    productBasePrice: 0,
    quantity: 1
  });
  assert.equal(initPrice.total, 0);
  assert.equal(initPrice.formattedTotal, '0,00 zł');
});

test('YisPricing: calculateYisPricing real-time calculation across steps', () => {
  // Step 4 (Krok 5): Koszulka (115 zł) + Nadruk Przód (20 zł) = 135 zł
  const step4Price = YisPricing.calculateYisPricing({
    currentStep: 4,
    selectedProductType: 'Koszulka',
    productBasePrice: 115,
    quantity: 1,
    selectedPrintPlacement: 'Przód',
    designPackage: 1
  });
  assert.equal(step4Price.total, 135);
  assert.equal(step4Price.designFee, 0);

  // Step 8 (Opcje): Koszulka (115 zł) + Nadruk Przód (20 zł) + 2 Koncepcje (+30 zł) + Wysyłka (17 zł) = 182 zł
  const step8PricePkg2 = YisPricing.calculateYisPricing({
    currentStep: 8,
    selectedProductType: 'Koszulka',
    productBasePrice: 115,
    quantity: 1,
    selectedPrintPlacement: 'Przód',
    designPackage: 2,
    shippingCost: 17
  });
  assert.equal(step8PricePkg2.total, 182);
  assert.equal(step8PricePkg2.designFee, 30);

  // Step 8: Pakiet 3 (+50 zł) = 202 zł
  const step8PricePkg3 = YisPricing.calculateYisPricing({
    currentStep: 8,
    selectedProductType: 'Koszulka',
    productBasePrice: 115,
    quantity: 1,
    selectedPrintPlacement: 'Przód',
    designPackage: 3,
    shippingCost: 17
  });
  assert.equal(step8PricePkg3.total, 202);
  assert.equal(step8PricePkg3.designFee, 50);
});

test('YisProjectStore: createProjectPayload schema validity', () => {
  const dummyState = {
    selectedProductType: 'Koszulka',
    selectedColor: '36 (Czarny)',
    selectedColorHex: '#1A1A1A',
    selectedSize: 'L',
    productBasePrice: 115,
    selectedPrintPlacement: 'Przód',
    selectedFormat: 'A4',
    designPackage: 2,
    quantity: 1,
    selectedShippingMethod: 'Paczkomat InPost',
    shippingCost: 17,
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan@example.com',
    phoneNumber: '+48 500 600 700'
  };

  const payload = YisProjectStore.createProjectPayload(dummyState);
  assert.ok(payload.projectId.startsWith('YIS-'));
  assert.equal(payload.status, 'SZKIC');
  assert.equal(payload.designPackage.tier, 2);
  assert.equal(payload.designPackage.fee, 30);
  assert.equal(payload.product.type, 'Koszulka');
  assert.equal(payload.customer.email, 'jan@example.com');
});

test('projektant.html: structural integrity, modular scripts & truthful copy', () => {
  const htmlPath = path.join(rootDir, 'projektant.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Modular scripts
  assert.ok(html.includes('src="/js/yis-products.js"'), 'Must include yis-products.js');
  assert.ok(html.includes('src="/js/yis-pricing.js"'), 'Must include yis-pricing.js');
  assert.ok(html.includes('src="/js/yis-project-store.js"'), 'Must include yis-project-store.js');

  // Auto-dismiss hero intro banner & reopen pill
  assert.ok(html.includes('id="hero-header-card"'), 'Hero card container present');
  assert.ok(html.includes('id="hero-header-collapsed"'), 'Hero collapsed pill present');
  assert.ok(html.includes('dismissHeroIntro('), 'dismissHeroIntro function called or bound');
  assert.ok(html.includes('reopenHeroIntro('), 'reopenHeroIntro function called or bound');
  assert.ok(
    /setTimeout\(\s*\(\)\s*=>\s*\{?\s*dismissHeroIntro\(\)/.test(html) && html.includes('5000'),
    'Auto-dismiss timeout after 5s present'
  );

  // Step 8: Free technical verification & 3 design packages
  assert.ok(html.includes('Bezpłatna Weryfikacja Techniczna'), 'Free technical check card present');
  assert.ok(html.includes('1 KONCEPCJA — GRATIS'), '1 concept gratis option present');
  assert.ok(html.includes('2 KONCEPCJE — 30 ZŁ'), '2 concepts 30 zł option present');
  assert.ok(html.includes('3 KONCEPCJE — 50 ZŁ'), '3 concepts 50 zł option present');

  // Step 10: Truthful UI, disclaimers and action buttons
  assert.ok(html.includes('Ostateczna cena oraz termin realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej'), 'Legal verification disclaimer present');
  assert.ok(html.includes('WYŚLIJ SPECYFIKACJĘ DO BEZPŁATNEJ WERYFIKACJI (E-MAIL)'), 'Email button text compliant');
  assert.ok(html.includes('OTWÓRZ KONSULTACJĘ YIS NA WHATSAPP'), 'WhatsApp button text compliant');
  assert.ok(html.includes('Przygotowaliśmy wiadomość ze specyfikacją. Dokończ wysyłkę w swoim programie pocztowym lub Gmail'), 'Mail client guidance modal present');
});
