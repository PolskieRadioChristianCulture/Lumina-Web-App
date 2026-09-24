/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — PRODUCT & CATALOG SPECIFICATION (js/yis-products.js)
 * ============================================================================
 * Czysta, modułowa definicja asortymentu produktów, technologii i palety barw
 * Your Imagination Studio (YIS) dla Christian Culture.
 * ============================================================================
 */

(function (window) {
  'use strict';

  // 21 Oficjalnych kolorów produkcyjnych YIS
  const YIS_COLORS = [
    { code: '36', name: '36 (Czarny)', hex: '#1A1A1A', isLight: false },
    { code: '30', name: '30 (Biały)', hex: '#FFFFFF', isLight: true },
    { code: 'AZ', name: 'AZ (Ciemnogranatowy)', hex: '#1B2233', isLight: false },
    { code: '40', name: '40 (Czerwony)', hex: '#D62229', isLight: false },
    { code: '94', name: '94 (Jasnoszary)', hex: '#C0C0C0', isLight: true },
    { code: '51', name: '51 (Niebieski)', hex: '#276EB4', isLight: false },
    { code: '32', name: '32 (Granatowy)', hex: '#0F2648', isLight: false },
    { code: '41', name: '41 (Bordowy)', hex: '#7A1521', isLight: false },
    { code: 'GL', name: 'GL (Grafitowy)', hex: '#4C4A48', isLight: false },
    { code: '34', name: '34 (Bursztynowy)', hex: '#DDA61C', isLight: false },
    { code: '38', name: '38 (Ciemnozielony)', hex: '#1E5235', isLight: false },
    { code: '57', name: '57 (Różowy)', hex: '#EA5487', isLight: false },
    { code: 'ZU', name: 'ZU (Turkusowy)', hex: '#109CB8', isLight: false },
    { code: '44', name: '44 (Pomarańczowy)', hex: '#E56925', isLight: false },
    { code: 'PE', name: 'PE (Fioletowy)', hex: '#5D27A1', isLight: false },
    { code: 'YT', name: 'YT (Błękitny)', hex: '#88C9EE', isLight: true },
    { code: 'LM', name: 'LM (Limonkowy)', hex: '#8CC134', isLight: false },
    { code: '59', name: '59 (Oliwkowy)', hex: '#6B7243', isLight: false },
    { code: 'K2', name: 'K2 (Żółty)', hex: '#FBDF0A', isLight: true },
    { code: '23', name: '23 (Khaki)', hex: '#5C5446', isLight: false },
    { code: '17', name: '17 (Beżowy)', hex: '#D1C4B0', isLight: true }
  ];

  // Dostępne rozmiary tekstylne
  const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

  // Oficjalna autorska grafika chrześcijańska YIS do bezpłatnego wykorzystania w projekcie
  const PRESET_SAMPLE_GRAPHIC = '/images/yis/jezus_jest_droga.png';

  // Katalog produktów YIS z pełnymi parametrami technologicznymi i strefami nadruku
  const YIS_PRODUCTS = {
    'Koszulka': {
      id: 'prod-tshirt',
      name: 'Koszulka',
      category: 'Apparel',
      basePrice: 115,
      supportsBack: true,
      allowedPlacements: ['Przód', 'Tył', 'Oba'],
      defaultPlacement: 'Przód',
      availableSizes: AVAILABLE_SIZES,
      defaultSize: 'M',
      printZones: {
        front: { x: '50%', y: 72, width: 88, height: 88, maxAreaMm: '300x400' },
        back: { x: '50%', y: 72, width: 88, height: 88, maxAreaMm: '300x400' }
      },
      description: 'Klasyczna koszulka bawełniana Premium o gramaturze 190g/m² ze wzmocnionym ściągaczem.'
    },
    'Bluza': {
      id: 'prod-hoodie',
      name: 'Bluza',
      category: 'Apparel',
      basePrice: 160,
      supportsBack: true,
      allowedPlacements: ['Przód', 'Tył', 'Oba'],
      defaultPlacement: 'Przód',
      availableSizes: AVAILABLE_SIZES,
      defaultSize: 'L',
      printZones: {
        front: { x: '50%', y: 76, width: 88, height: 88, maxAreaMm: '280x350' },
        back: { x: '50%', y: 74, width: 88, height: 88, maxAreaMm: '300x420' }
      },
      description: 'Bluza z kapturem (Hoodie) z miękkim czesanym wnętrzem, 280g/m².'
    },
    'Kubek': {
      id: 'prod-mug',
      name: 'Kubek',
      category: 'Ceramics',
      basePrice: 45,
      supportsBack: false,
      allowedPlacements: ['N/D'],
      defaultPlacement: 'N/D',
      availableSizes: ['330ml'],
      defaultSize: '330ml',
      printZones: {
        front: { x: '50%', y: 76, width: 68, height: 68, maxAreaMm: '80x80' }
      },
      description: 'Ceramiczny kubek premium z powłoką odporną na zmywanie w zmywarce.'
    },
    'Czapka': {
      id: 'prod-cap',
      name: 'Czapka',
      category: 'Headwear',
      basePrice: 55,
      supportsBack: false,
      allowedPlacements: ['N/D'],
      defaultPlacement: 'N/D',
      availableSizes: ['Uni'],
      defaultSize: 'Uni',
      printZones: {
        front: { x: '50%', y: 110, width: 52, height: 32, maxAreaMm: '100x50' }
      },
      description: 'Klasyczna 6-panelowa czapka z daszkiem z regulowanym zapięciem.'
    }
  };

  // Metody pomocnicze
  function getProduct(type) {
    return YIS_PRODUCTS[type] || YIS_PRODUCTS['Koszulka'];
  }

  function getColorByHex(hex) {
    return YIS_COLORS.find(c => c.hex.toLowerCase() === (hex || '').toLowerCase()) || YIS_COLORS[0];
  }

  function getColorByName(name) {
    return YIS_COLORS.find(c => c.name === name) || YIS_COLORS[0];
  }

  // Eksport globalny
  window.YisProducts = {
    YIS_COLORS,
    AVAILABLE_SIZES,
    PRESET_SAMPLE_GRAPHIC,
    YIS_PRODUCTS,
    getProduct,
    getColorByHex,
    getColorByName
  };

  // Backward-compatibility aliases
  window.YIS_COLORS = YIS_COLORS;
  window.AVAILABLE_SIZES = AVAILABLE_SIZES;
  window.PRESET_SAMPLE_GRAPHIC = PRESET_SAMPLE_GRAPHIC;

})(typeof window !== 'undefined' ? window : globalThis);
