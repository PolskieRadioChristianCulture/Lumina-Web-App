/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — PRICING ENGINE & TIERS (js/yis-pricing.js)
 * ============================================================================
 * Silnik przejrzystej i transparentnej wyceny w czasie rzeczywistym.
 * Model usługi graficznej YIS:
 *   - 1 koncepcja graficzna  — GRATIS (0 zł)
 *   - 2 koncepcje projektowe — +30 ZŁ
 *   - 3 koncepcje projektowe — +50 ZŁ
 * Ważne: Traktowane jako liczba autorskich wariantów przygotowywanych przez
 * studio YIS dla klienta, a nie limit plików dodawanych w kreatorze.
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Pakiety projektowe YIS (liczba przygotowywanych wariantów autorskich)
  const YIS_DESIGN_PACKAGES = {
    1: {
      id: 'pkg-1',
      count: 1,
      name: '1 koncepcja',
      price: 0,
      badge: 'GRATIS',
      title: '1 KONCEPCJA — GRATIS',
      desc: '1 autorska propozycja grafiki przygotowana przez YIS — bezpłatnie w ramach projektu.'
    },
    2: {
      id: 'pkg-2',
      count: 2,
      name: '2 koncepcje',
      price: 30,
      badge: '+30 ZŁ',
      title: '2 KONCEPCJE — 30 ZŁ',
      desc: '2 różne autorskie propozycje — klient wybiera preferowany kierunek wizualny.'
    },
    3: {
      id: 'pkg-3',
      count: 3,
      name: '3 koncepcje',
      price: 50,
      badge: '+50 ZŁ',
      title: '3 KONCEPCJE — 50 ZŁ',
      desc: '3 różne propozycje — największa swoboda wyboru i dopasowania detali.'
    }
  };

  /**
   * Główna funkcja kalkulacji ceny w czasie rzeczywistym.
   * @param {Object} params Parametry wyceny
   * @returns {Object} Wynik wyceny
   */
  function calculateYisPricing(params) {
    const {
      currentStep = 0,
      selectedProductType = '',
      productBasePrice = 0,
      quantity = 1,
      selectedPrintPlacement = 'Przód',
      designPackage = 1,
      shippingCost = 17
    } = params;

    // Reguła Anti-Premature: Kroki 1 i 2 (indeksy 0 i 1) oraz brak wybranego produktu = ściśle 0,00 zł
    if (currentStep < 2 || !selectedProductType || productBasePrice <= 0) {
      return {
        total: 0,
        itemBase: 0,
        printTotal: 0,
        designFee: 0,
        singlePrintCost: 0,
        shipping: 0,
        designPackageDetails: YIS_DESIGN_PACKAGES[1],
        formattedTotal: '0,00 zł',
        isEstimate: true,
        displayLabel: 'Szacunkowa cena: 0,00 zł'
      };
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // 1. Koszt bazy produktu (naliczany od wyboru w kroku 3, indeks >= 2)
    const itemBase = (parseFloat(productBasePrice) || 0) * qty;

    // 2. Koszt nadruku - sumowany w czasie rzeczywistym od wyboru formatu druku (krok 5, indeks >= 4)
    let singlePrintCost = 0;
    if (currentStep >= 4) {
      if (selectedPrintPlacement === 'Oba') {
        singlePrintCost = 40;
      } else if (selectedPrintPlacement === 'Przód' || selectedPrintPlacement === 'Tył') {
        singlePrintCost = 20;
      } else if (selectedProductType === 'Kubek' || selectedProductType === 'Czapka') {
        singlePrintCost = 15;
      }
    }
    const printTotal = singlePrintCost * qty;

    // 3. Pakiet koncepcji projektowych YIS (1 = 0 zł, 2 = 30 zł, 3 = 50 zł) - naliczany w krokach opcji (indeks >= 8)
    const selectedPkg = YIS_DESIGN_PACKAGES[designPackage] || YIS_DESIGN_PACKAGES[1];
    const designFee = (currentStep >= 8) ? selectedPkg.price : 0;

    // 4. Koszt dostawy - doliczany dopiero w kroku wyboru metody wysyłki (indeks >= 8)
    const shipping = (currentStep >= 8) ? (parseFloat(shippingCost) || 0) : 0;

    // Suma bieżąca w czasie rzeczywistym
    const total = itemBase + printTotal + designFee + shipping;
    const formattedTotal = `${total.toFixed(2).replace('.', ',')} zł`;

    return {
      total,
      itemBase,
      printTotal,
      designFee,
      singlePrintCost,
      shipping,
      designPackageDetails: selectedPkg,
      formattedTotal,
      isEstimate: true,
      displayLabel: `Szacunkowa cena: ~${formattedTotal}`
    };
  }

  function formatPackageLabel(packageNumber) {
    const pkg = YIS_DESIGN_PACKAGES[packageNumber] || YIS_DESIGN_PACKAGES[1];
    if (pkg.count === 1) {
      return '1 koncepcja (GRATIS — 0 zł)';
    } else if (pkg.count === 2) {
      return '2 koncepcje (+30 zł)';
    } else {
      return '3 koncepcje (+50 zł)';
    }
  }

  // Eksport globalny
  window.YisPricing = {
    YIS_DESIGN_PACKAGES,
    calculateYisPricing,
    formatPackageLabel
  };

})(typeof window !== 'undefined' ? window : globalThis);
