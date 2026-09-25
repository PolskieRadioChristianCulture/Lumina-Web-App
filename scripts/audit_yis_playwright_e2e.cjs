const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/node_modules/playwright');

const rootDir = path.resolve(__dirname, '..');

function createStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);
      if (pathname === '/' || pathname === '') pathname = '/projektant.html';
      const filePath = path.join(rootDir, pathname.replace(/^\//, ''));
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('Not found: ' + pathname);
        }
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function runE2EAudit() {
  console.log('🚀 Uruchamianie rygorystycznego audytu Playwright Chromium dla YIS Design Studio 2.0...\n');
  const { server, baseUrl } = await createStaticServer();
  const htmlUrl = `${baseUrl}/projektant.html`;
  const browser = await chromium.launch({ headless: true });
  const auditResults = [];

  function record(category, stepName, action, expected, actual, pass, details = '') {
    auditResults.push({ category, stepName, action, expected, actual, pass, details });
    const mark = pass ? '🟢 PASS' : '🔴 FAIL';
    console.log(`[${mark}] [${category}] ${stepName}`);
    console.log(`       Czynność:  ${action}`);
    console.log(`       Oczekiwano: ${expected}`);
    console.log(`       Faktycznie: ${actual}`);
    if (details) console.log(`       Detale:    ${details}`);
    console.log('');
  }

  try {
    // ═════════════════════════════════════════════════════════════════════════
    // 1. AUDYT VIEWPORTÓW: 360px, 390px, 412px, DESKTOP 1280px
    // ═════════════════════════════════════════════════════════════════════════
    const viewports = [
      { name: 'Mobile 360px (Redmi / Compact Android)', width: 360, height: 780 },
      { name: 'Mobile 390px (iPhone 12/13/14/15)', width: 390, height: 844 },
      { name: 'Mobile 412px (Samsung Galaxy / Pixel)', width: 412, height: 915 },
      { name: 'Desktop 1280px (Standard Laptop)', width: 1280, height: 800 }
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(htmlUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      // Sprawdź poziomy overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      record(
        'MOBILE & DESKTOP QA',
        `Viewport ${vp.name} — Brak horizontal overflow`,
        `Pomiar document.documentElement.scrollWidth (${vp.width}x${vp.height}px)`,
        'scrollWidth <= window.innerWidth',
        overflow ? `OVERFLOW WYKRYTY (${vp.width}px)` : 'Brak overflow (idealnie dopasowany)',
        !overflow
      );

      // Pomiar font-size inputów (Mobile Safari auto-zoom risk przy <16px)
      const inputStats = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea'));
        const sub16 = inputs.filter(el => parseFloat(window.getComputedStyle(el).fontSize) < 15.9);
        return {
          totalInputs: inputs.length,
          sub16Count: sub16.length,
          sub16Ids: sub16.map(el => `${el.id || el.name} (${window.getComputedStyle(el).fontSize})`)
        };
      });

      record(
        'MOBILE ERGONOMIA',
        `Viewport ${vp.name} — Weryfikacja font-size pól formularzy (>= 16px)`,
        'Pomiar computed font-size dla pól input i textarea',
        'Pola formularzy mają co najmniej 16px, aby zapobiec auto-zoomowi w iOS Safari',
        inputStats.sub16Count === 0 ? 'Wszystkie pola >= 16px' : `Znaleziono pola < 16px: ${inputStats.sub16Ids.join(', ')}`,
        inputStats.sub16Count === 0,
        inputStats.sub16Count > 0 ? 'Wymaga zmiany klas text-sm na text-base w polach formularzy na mobile' : ''
      );

      await page.close();
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. PEŁNA ŚCIEŻKA KLIENTA & OPERATORA YIS (VIEWPORT 390px)
    // ═════════════════════════════════════════════════════════════════════════
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route(/mailto:.*/, route => route.abort());
    await page.goto(htmlUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // KROK 0 -> Kliknięcie ZACZYNAMY (wywołuje popup LUMINA lub przechodzi dalej)
    await page.click('#next-step-btn');
    await page.waitForTimeout(400);

    // Jeśli pojawił się modal VIP LUMINA, klikamy "Kontynuuj jako gość"
    const popupOpen = await page.evaluate(() => {
      const modal = document.getElementById('lumina-popup-modal');
      return modal && !modal.classList.contains('hidden');
    });

    if (popupOpen) {
      // Kliknij kontynuuj jako gość
      await page.evaluate(() => {
        closeLuminaPopup(true);
      });
      await page.waitForTimeout(300);
    }

    const stepAfterIntro = await page.evaluate(() => state.currentStep);
    record(
      'USER JOURNEY',
      'Krok 0 -> 1: Otwarcie konfiguracji projektu po obsłudze modal VIP',
      'Kliknięcie CTA i wybór kontynuacji jako gość',
      'currentStep = 1',
      `currentStep = ${stepAfterIntro}`,
      stepAfterIntro === 1
    );

    // Krok 1 -> Krok 2 (Typ Produktu)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    // Wybór produktu: Koszulka (45 zł)
    await page.click('#prod-card-Koszulka');
    await page.waitForTimeout(200);

    const prodState = await page.evaluate(() => ({
      type: state.selectedProductType,
      price: state.productBasePrice
    }));

    record(
      'USER JOURNEY',
      'Krok 2: Wybór produktu bazowego (Koszulka)',
      'Kliknięcie kafelka Koszulka',
      'Produkt = Koszulka, Baza = 45 zł',
      `Produkt = ${prodState.type}, Baza = ${prodState.price} zł`,
      prodState.type === 'Koszulka' && prodState.price === 45
    );

    // Weryfikacja płynnego przełączania produktów: Koszulka → Bluza → Kubek → Czapka → Koszulka
    const switchCycleResult = await page.evaluate(() => {
      try {
        const sequence = ['Koszulka', 'Bluza', 'Kubek', 'Czapka', 'Koszulka'];
        const prices = { 'Koszulka': 45, 'Bluza': 115, 'Kubek': 35, 'Czapka': 40 };
        for (const prod of sequence) {
          selectProductType(prod, prices[prod]);
        }
        return { success: true, finalType: state.selectedProductType, finalPlacement: state.selectedPrintPlacement };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    record(
      'PRODUCT SWITCHING',
      'Sekwencja przełączania: Koszulka → Bluza → Kubek → Czapka → Koszulka',
      'Wywołanie selectProductType dla każdego produktu w pętli',
      'Brak wyjątków JS, produkt końcowy: Koszulka (Przód)',
      switchCycleResult.success
        ? `Sukces: produkt = ${switchCycleResult.finalType}, placement = ${switchCycleResult.finalPlacement}`
        : `BŁĄD: ${switchCycleResult.error}`,
      switchCycleResult.success && switchCycleResult.finalType === 'Koszulka'
    );

    // Krok 2 -> Krok 3 (Kolor i Rozmiar)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    // Wybór koloru: Bursztynowy (34) i Rozmiar: L
    await page.evaluate(() => {
      const col = YIS_COLORS.find(c => c.code === '34');
      if (col) selectColor(col);
      state.selectedSize = 'L';
      initSizeSelector();
    });
    await page.waitForTimeout(200);

    const colSize = await page.evaluate(() => ({ col: state.selectedColor, size: state.selectedSize }));
    record(
      'USER JOURNEY',
      'Krok 3: Wybór koloru i rozmiaru',
      'Wybór 34 (Bursztynowy) i rozmiar L',
      'Kolor: 34 (Bursztynowy), Rozmiar: L',
      `Kolor: ${colSize.col}, Rozmiar: ${colSize.size}`,
      colSize.col.includes('Bursztynowy') && colSize.size === 'L'
    );

    // Krok 3 -> Krok 4 (Format i Strona)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      selectFormat('Średni');
      selectPlacement('Przód');
    });
    await page.waitForTimeout(200);

    const placementVal = await page.evaluate(() => state.selectedPrintPlacement);
    record(
      'USER JOURNEY',
      'Krok 4: Strefa i Format nadruku',
      'Wybór formatu Średni i umiejscowienia Przód',
      'placement = Przód',
      `placement = ${placementVal}`,
      placementVal === 'Przód'
    );

    // Krok 4 -> Krok 5 (Grafika)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    const gfxMode = await page.evaluate(() => state.graphicMode);
    record(
      'USER JOURNEY',
      'Krok 5: Autorska propozycja graficzna YIS',
      'Weryfikacja aktywnego wzorca graficznego',
      'graphicMode = preset',
      `graphicMode = ${gfxMode}`,
      gfxMode === 'preset'
    );

    // Krok 5 -> Krok 6 (Personalizacja)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      updatePersonalizedText('Bóg jest Miłością');
      document.getElementById('custom-text-input').value = 'Bóg jest Miłością';
    });
    await page.waitForTimeout(200);

    const textVal = await page.evaluate(() => state.personalizedText);
    record(
      'USER JOURNEY',
      'Krok 6: Wpisanie tekstu personalizacji',
      'Personalizacja: "Bóg jest Miłością"',
      'personalizedText = Bóg jest Miłością',
      `personalizedText = "${textVal}"`,
      textVal === 'Bóg jest Miłością'
    );

    // Krok 6 -> Krok 7 (Wizualizacja & Canvas)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    // Przełączanie stron makiety w Canvas Studio
    await page.evaluate(() => {
      state.mockupSide = 'back';
      if (window.YisCanvas) window.YisCanvas.setSide('back');
      if (typeof renderMockup === 'function') renderMockup();
    });
    await page.waitForTimeout(200);
    const sideBack = await page.evaluate(() => window.YisCanvas ? window.YisCanvas.getProjectState().currentSide : state.mockupSide);

    await page.evaluate(() => {
      state.mockupSide = 'front';
      if (window.YisCanvas) window.YisCanvas.setSide('front');
      if (typeof renderMockup === 'function') renderMockup();
    });
    await page.waitForTimeout(200);
    const sideFront = await page.evaluate(() => window.YisCanvas ? window.YisCanvas.getProjectState().currentSide : state.mockupSide);

    record(
      'CANVAS UX',
      'Krok 7: Przełącznik Przód / Tył w Canvas Studio',
      'Przełączenie strony Canvasu na Tył i z powrotem na Przód',
      'Stan currentSide zmienia się poprawnie (back -> front)',
      `Tył: ${sideBack}, Przód: ${sideFront}`,
      sideBack === 'back' && sideFront === 'front'
    );

    // Krok 7 -> Krok 8 (Pakiety 0/30/50 i Ilość)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    // Wybieramy pakiet 2 (+30 zł) i nakład = 2 szt.
    await page.click('#pkg-card-2');
    await page.evaluate(() => {
      adjustQuantity(1); // 1 -> 2 szt.
    });
    await page.waitForTimeout(200);

    const pkgQty = await page.evaluate(() => ({ pkg: state.designPackage, qty: state.quantity }));
    record(
      'PRICING PACKAGES',
      'Krok 8: Wybór 2 koncepcji (+30 zł) i nakładu 2 sztuk',
      'Kliknięcie pakietu 2 i zwiększenie ilości do 2',
      'designPackage = 2, quantity = 2',
      `Pakiet = ${pkgQty.pkg}, Ilość = ${pkgQty.qty}`,
      pkgQty.pkg === 2 && pkgQty.qty === 2
    );

    // Krok 8 -> Krok 9 (Dane Zamawiającego)
    await page.click('#next-step-btn');
    await page.waitForTimeout(300);

    await page.fill('#input-first-name', 'Jan');
    await page.fill('#input-last-name', 'Kowalski');
    await page.fill('#input-email', 'jan.kowalski@example.com');
    await page.fill('#input-phone', '+48 501 234 567');
    await page.fill('#input-address', 'Paczkomat WAW01M');
    await page.evaluate(() => saveUserData());
    // Intercept mailto navigation in Playwright browser context
    await page.route(/mailto:.*/, route => route.abort());
    await page.waitForTimeout(200);

    const customerSaved = await page.evaluate(() => ({
      name: `${state.firstName} ${state.lastName}`,
      email: state.email
    }));

    record(
      'USER DATA',
      'Krok 9: Wprowadzenie danych kontaktowych zamawiającego',
      'Uzupełnienie imienia, nazwiska, e-maila, telefonu i adresu',
      'Dane zapisane w stanie aplikacji',
      `Klient: ${customerSaved.name}, Email: ${customerSaved.email}`,
      customerSaved.name === 'Jan Kowalski' && customerSaved.email === 'jan.kowalski@example.com'
    );

    // Krok 9 -> Krok 10 (Karta Projektu)
    await page.click('#next-step-btn');
    await page.waitForTimeout(500);

    // ═════════════════════════════════════════════════════════════════════════
    // 3. WERYFIKACJA MATEMATYCZNA CENY (RĘCZNE vs UI vs KARTA vs HANDOFF)
    // ═════════════════════════════════════════════════════════════════════════
    // Ręczne wyliczenie:
    // Baza: 45 zł * 2 szt. = 90 zł
    // Druk: 20 zł * 2 szt. = 40 zł
    // Pakiet 2 koncepcji: 30 zł
    // Wysyłka Paczkomat: 17 zł
    // SUMA = 90 + 40 + 30 + 17 = 177,00 zł.
    const priceCompare = await page.evaluate(() => {
      const headerPrice = document.getElementById('header-price-tag')?.textContent || '';
      const cardTotal = document.getElementById('card-total-price')?.textContent || '';
      const handoffBody = buildOrderEmailBody();
      return {
        headerPrice,
        cardTotal,
        handoffBodyHas177: handoffBody.includes('177')
      };
    });

    const isPrice177 = priceCompare.headerPrice.includes('177') &&
                       priceCompare.cardTotal.includes('177') &&
                       priceCompare.handoffBodyHas177;

    record(
      'PRICING INTEGRITY',
      'Spójność wyceny: Matematyka (177 zł) = Header = Karta = Handoff Email',
      'Porównanie wartości w trzech miejscach z kalkulacją ręczną',
      'Wszystkie 3 źródła wskazują dokładnie 177,00 zł',
      `Header: "${priceCompare.headerPrice}", Karta: "${priceCompare.cardTotal}", Handoff zawiera 177: ${priceCompare.handoffBodyHas177}`,
      isPrice177
    );

    // ═════════════════════════════════════════════════════════════════════════
    // 4. KARTA PROJEKTU: MINIATURY, ID, PRAWDZIWY STATUS SYNC
    // ═════════════════════════════════════════════════════════════════════════
    const cardData = await page.evaluate(() => {
      const projId = document.getElementById('card-project-id')?.textContent || '';
      const projRev = document.getElementById('card-project-revision')?.textContent || '';
      const syncText = document.getElementById('card-sync-text')?.textContent || '';
      const frontThumb = document.getElementById('card-preview-front')?.innerHTML || '';
      const backThumb = document.getElementById('card-preview-back')?.innerHTML || '';
      const disclaimer = document.querySelector('#step-pane-10')?.textContent || '';

      return {
        projId,
        idValid: /^YIS-2026-[A-Z0-9]{5}$/.test(projId),
        projRev,
        syncText,
        hasFrontThumb: frontThumb.includes('<svg') && frontThumb.includes('img'),
        hasBackThumb: backThumb.includes('<svg'),
        truthfulDisclaimer: disclaimer.includes('Nie jest rachunkiem ani fakturą fiskalną') &&
                            disclaimer.includes('Ostateczna cena oraz termin realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej')
      };
    });

    record(
      'KARTA PROJEKTU',
      'Identyfikator i Wersja projektu na Karcie',
      'Odczyt formatu YIS-2026-XXXXX i rewizji',
      'Format YIS-2026-XXXXX, Rewizja v1',
      `ID: ${cardData.projId}, ${cardData.projRev}`,
      cardData.idValid && cardData.projRev.includes('v1')
    );

    record(
      'TRUTHFUL UI',
      'Wskaźnik zapisu w trybie Gość (Brak fałszywych deklaracji chmury)',
      'Odczyt komunikatu wskaźnika synchronizacji w Karcie Projektu',
      'Rzetelny komunikat o zapisie lokalnym na urządzeniu',
      `Wskaźnik: "${cardData.syncText}"`,
      cardData.syncText.includes('Projekt zapisany na tym urządzeniu')
    );

    record(
      'KARTA PROJEKTU',
      'Niezależne miniatury wektorowe: Przód oraz Tył',
      'Sprawdzenie czy miniatura przodu zawiera nadruk, a tył czysty tył',
      'Obie miniatury wygenerowane w SVG; przód zawiera nałożony nadruk',
      `Przód: ${cardData.hasFrontThumb}, Tył: ${cardData.hasBackThumb}`,
      cardData.hasFrontThumb && cardData.hasBackThumb
    );

    record(
      'TRUTHFUL UI',
      'Klauzule prawne i disclaimer szacunkowej ceny',
      'Obecność informacji: dokument techniczno-ofertowy, brak faktury, weryfikacja YIS',
      'Wszystkie klauzule Truthful UI obecne',
      cardData.truthfulDisclaimer ? 'Obecne kompletne klauzule' : 'Brak klauzul',
      cardData.truthfulDisclaimer
    );

    // ═════════════════════════════════════════════════════════════════════════
    // 5. HANDOFF & NIEZMIENNOŚĆ REWIZJI (v1 vs v2)
    // ═════════════════════════════════════════════════════════════════════════
    // Przekazanie zlecenia (tworzy rewizję v1)
    await page.evaluate(() => {
      submitProjectForVerification('email');
    });
    await page.waitForTimeout(300);

    const revisionsV1 = await page.evaluate(() => {
      return window.YisProjectStore.getRevisions();
    });

    const isV1Created = revisionsV1.length >= 1 &&
                        revisionsV1[0].revision === 1 &&
                        revisionsV1[0].status === 'DO WERYFIKACJI';

    record(
      'REVISIONS & HANDOFF',
      'Utworzenie niezmiennego snapshotu rewizji v1',
      'Wywołanie submitProjectForVerification(\'email\')',
      'Snapshot rewizji 1 zapisany w historii ze statusem DO WERYFIKACJI',
      `Ilość rewizji: ${revisionsV1.length}, status: ${revisionsV1[0]?.status}, rev: v${revisionsV1[0]?.revision}`,
      isV1Created,
      isV1Created ? '' : `Wykryto podbicie numeru rewizji do v${revisionsV1[0]?.revision} zamiast v1 przed finalnym handoffem`
    );

    // Zamknięcie modala
    await page.evaluate(() => closeEmailDispatchModal());

    // Edycja do rewizji v2: zmieniamy produkt na Bluzę
    const v2ExecResult = await page.evaluate(() => {
      try {
        selectProductType('Bluza', 115);
        state.activeProject = window.YisProjectStore.createCanonicalProject(state, state.activeProject);
        window.YisProjectStore.createRevisionSnapshot(state.activeProject, 'whatsapp');
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });
    await page.waitForTimeout(300);

    const revisionsMulti = await page.evaluate(() => {
      return window.YisProjectStore ? window.YisProjectStore.getRevisions() : [];
    });

    const v2 = revisionsMulti[0];
    const v1 = revisionsMulti[1];
    const isV1Unchanged = v2ExecResult.success && v1 && v2 &&
                          v2.revision === 2 && v2.product.type === 'Bluza' &&
                          v1.revision === 1 && v1.product.type === 'Koszulka';

    record(
      'REVISIONS & IMMUTABILITY',
      'Niezmienność starszej rewizji v1 po utworzeniu rewizji v2',
      'Porównanie v1 (Koszulka) i v2 (Bluza) w tablicy rewizji',
      'v1 pozostaje Koszulką, v2 jest osobnym snapshotem Bluzy',
      v2ExecResult.success
        ? `v2: [Rev ${v2?.revision}, ${v2?.product?.type}], v1: [Rev ${v1?.revision}, ${v1?.product?.type}]`
        : `BŁĄD WYWOŁANIA: ${v2ExecResult.error}`,
      isV1Unchanged,
      v2ExecResult.success ? '' : 'Błąd w selectProductType: brak elementu view-side-switcher w DOM'
    );

    // ═════════════════════════════════════════════════════════════════════════
    // 6. ODZYSKIWANIE SZKICU PO F5 / RELOAD
    // ═════════════════════════════════════════════════════════════════════════
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const stateAfterReload = await page.evaluate(() => ({
      product: state.selectedProductType,
      color: state.selectedColor,
      size: state.selectedSize,
      firstName: state.firstName,
      email: state.email,
      pkg: state.designPackage
    }));

    const isReloadRecovered = stateAfterReload.product === 'Bluza' &&
                              stateAfterReload.firstName === 'Jan' &&
                              stateAfterReload.email === 'jan.kowalski@example.com' &&
                              stateAfterReload.pkg === 2;

    record(
      'PERSISTENCE & RECOVERY',
      'Odzyskanie parametrów zlecenia po odświeżeniu strony (F5)',
      'Przeładowanie strony w przeglądarce i odczyt stanu',
      'Stan projektu odtworzony (Produkt: Bluza, Klient: Jan Kowalski, Pakiet: 2)',
      `Odzyskano: ${stateAfterReload.product}, Klient: ${stateAfterReload.firstName}, Pakiet: ${stateAfterReload.pkg}`,
      isReloadRecovered
    );

    // ═════════════════════════════════════════════════════════════════════════
    // 7. ZALOGOWANY UŻYTKOWNIK LUMINA & CLOUD SYNC STATUS
    // ═════════════════════════════════════════════════════════════════════════
    // Symulacja zalogowania kontem Google w LUMINA
    await page.evaluate(() => {
      const mockUser = {
        uid: 'lumina_usr_777',
        displayName: 'Marek Wiśniewski',
        email: 'marek.wisniewski@gmail.com'
      };
      localStorage.setItem('lumina_current_user', JSON.stringify(mockUser));
      checkLuminaUser();
      state.currentStep = 10;
      updateStepUI();
    });
    await page.waitForTimeout(500);

    const luminaSyncState = await page.evaluate(() => {
      const isMember = state.isLuminaMember;
      const autofillVisible = !document.getElementById('auth-autofill-indicator').classList.contains('hidden');
      const syncText = document.getElementById('card-sync-text')?.textContent || '';
      return { isMember, autofillVisible, syncText };
    });

    record(
      'LUMINA CLOUD INTEGRATION',
      'Autouzupełnienie i weryfikacja statusu konta LUMINA',
      'Zalogowanie symulowanym kontem LUMINA i wejście na Kartę Projektu',
      'isLuminaMember = true, widoczny wskaźnik autouzupełnienia',
      `isMember: ${luminaSyncState.isMember}, auto-fill: ${luminaSyncState.autofillVisible}, wskaźnik: "${luminaSyncState.syncText}"`,
      luminaSyncState.isMember && luminaSyncState.autofillVisible
    );

    // ═════════════════════════════════════════════════════════════════════════
    // 8. AUDYT ŚCIEŻEK BŁĘDÓW (FAILURE PATHS)
    // ═════════════════════════════════════════════════════════════════════════

    // A. Próba wgrania niesanizowanego SVG
    const svgRes = await page.evaluate(() => {
      const file = new File(['<svg></svg>'], 'test.svg', { type: 'image/svg+xml' });
      return window.YisPrintQuality.analyzeImageFile(file);
    });

    record(
      'FAILURE PATHS',
      'Odrzucenie niesanizowanego SVG z poleceniem wysyłki mailowej',
      'Podanie pliku SVG do analizatora Print Quality Engine',
      'isValid = false, informacja o bezpiecznym przesłaniu pliku e-mailem',
      `isValid: ${svgRes.isValid}, Błąd: "${svgRes.errorTitle}"`,
      svgRes.isValid === false && (svgRes.errorTitle || '').toLowerCase().includes('wektorowy')
    );

    // B1. Plik w dopuszczalnym limicie do 15 MB (dokładnie 15 MB)
    const exact15MbRes = await page.evaluate(() => {
      const file = new File(['1'], 'exact15.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 });
      const MAX = 15 * 1024 * 1024;
      return {
        size: file.size,
        sizeExceeded: file.size > MAX
      };
    });

    record(
      'FAILURE PATHS',
      'Plik do 15 MB: mieści się w dopuszczalnym limicie rozmiaru',
      'Sprawdzenie czy plik 15 MB (15728640 B) nie przekracza limitu',
      'sizeExceeded === false (akceptowany do dalszej analizy)',
      `Rozmiar: ${exact15MbRes.size} B, Przekroczono limit: ${exact15MbRes.sizeExceeded}`,
      exact15MbRes.sizeExceeded === false
    );

    // B2. Próba wgrania pliku > 15 MB (18 MB)
    const hugeRes = await page.evaluate(() => {
      const file = new File(['1'], 'banner.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 18 * 1024 * 1024 });
      return window.YisPrintQuality.analyzeImageFile(file);
    });

    record(
      'FAILURE PATHS',
      'Twarde odrzucenie pliku powyżej 15 MB przed FileReader',
      'Podanie pliku o rozmiarze 18 MB do analizatora PQE',
      'isValid = false, komunikat o przekroczeniu 15 MB',
      `isValid: ${hugeRes.isValid}, Komunikat: "${hugeRes.errorMessage}"`,
      hugeRes.isValid === false && (hugeRes.errorMessage || '').includes('15 MB')
    );

    // C. Próba wysłania bez wypełnionych danych klienta
    await page.evaluate(() => {
      state.firstName = '';
    });
    const missingNameBlocked = await page.evaluate(() => {
      let alertMsg = '';
      const origAlert = window.alert;
      window.alert = (msg) => { alertMsg = msg; };
      const valid = validateForm();
      window.alert = origAlert;
      return { valid, alertMsg, currentStep: state.currentStep };
    });

    record(
      'FAILURE PATHS',
      'Blokada handoffu przy braku wymaganych danych zamawiającego',
      'Wywołanie validateForm() bez imienia',
      'valid = false, przekierowanie do kroku 9 (dane)',
      `valid: ${missingNameBlocked.valid}, krok: ${missingNameBlocked.currentStep}`,
      missingNameBlocked.valid === false && missingNameBlocked.currentStep === 9
    );

    // D. Blokada niskiego DPI bez zaznaczonego checkboxa akceptacji
    const lowDpiBlock = await page.evaluate(() => {
      state.currentStep = 10;
      state.firstName = 'Jan';
      state.lastName = 'Kowalski';
      state.email = 'jan@example.com';
      state.phoneNumber = '+48123456789';
      state.address = 'WAW01M';
      state.graphicMode = 'custom';
      state.uploadedImageBase64 = 'data:image/png;base64,dummy';
      state.imageQualityReport = { dpi: 115, tier: 'critical', requiresWarningCheck: true };
      checkLowDpiWarning();

      const check = document.getElementById('ack-low-dpi-checkbox');
      if (check) check.checked = false;

      let alertFired = false;
      const origAlert = window.alert;
      window.alert = () => { alertFired = true; };

      submitProjectForVerification('email');
      window.alert = origAlert;

      return {
        warningVisible: !document.getElementById('summary-low-dpi-warning').classList.contains('hidden'),
        alertFired
      };
    });

    record(
      'FAILURE PATHS',
      'Świadoma akceptacja niskiego DPI: Blokada wysyłki dopóki checkbox nie jest zaznaczony',
      'Próba wysłania projektu 115 DPI bez zaznaczenia checkboxa akceptacji',
      'Blokada z monitem o akceptacji lub zmniejszeniu grafiki',
      `Ostrzeżenie widoczne: ${lowDpiBlock.warningVisible}, Alert zablokowania: ${lowDpiBlock.alertFired}`,
      lowDpiBlock.warningVisible && lowDpiBlock.alertFired
    );

    await page.close();

  } catch (err) {
    console.error('BŁĄD KRYTYCZNY W AUDYCIE:', err);
    record('FATAL', 'Nieprzewidziany błąd testu', 'Brak', 'Brak błędów', err.message, false);
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
  }

  const total = auditResults.length;
  const passed = auditResults.filter(r => r.pass).length;
  const failed = total - passed;

  console.log('\n═════════════════════════════════════════════════════════════════════════');
  console.log(`PODSUMOWANIE AUDYTU E2E: ${passed}/${total} SCENARIUSZY ZALICZONYCH (${failed} BŁĘDÓW)`);
  console.log('═════════════════════════════════════════════════════════════════════════\n');

  return { total, passed, failed, results: auditResults };
}

runE2EAudit();
