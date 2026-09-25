/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — PRINT QUALITY ENGINE (js/yis-print-quality.js)
 * ============================================================================
 * Inteligentny asystent przygotowania do druku (DPI & Print Readiness):
 *   - Analiza formatu: PNG, JPG, WebP (bezpieczne odrzucenie niesanizowanego SVG)
 *   - Detekcja wymiarów w pikselach (naturalWidth, naturalHeight)
 *   - Detekcja przezroczystości (analiza kanału alfa dla druku tekstylnego)
 *   - Obliczanie rzeczywistego rozmiaru nadruku w centymetrach (W x H cm)
 *   - Dynamiczne Effective DPI reagujące na skalowanie na Canvasie
 *   - Klasyfikacja: Zielony (>=250 DPI), Żółty (150-249 DPI), Czerwony (<150 DPI)
 *   - Truthful UI: brak twardej blokady, świadome potwierdzenie + bezpłatny audyt YIS
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Maksymalne fizyczne wymiary strefy nadruku w centymetrach
  const PHYSICAL_PRINT_LIMITS_CM = {
    'Koszulka': { width: 30.0, height: 40.0 },
    'Bluza':    { width: 28.0, height: 35.0 },
    'Kubek':    { width: 8.0,  height: 8.0 },
    'Czapka':   { width: 12.0, height: 6.0 }
  };

  // Szerokość strefy nadruku w wirtualnym układzie Canvas (px)
  const CANVAS_PRINT_ZONE_WIDTH = 230;

  /**
   * Sprawdza, czy obraz zawiera przezroczyste piksele (kanał Alpha < 250)
   */
  function checkTransparency(img) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      // Skaluj do próbki 64x64 dla błyskawicznej analizy wydajnościowej
      canvas.width = 64;
      canvas.height = 64;
      ctx.drawImage(img, 0, 0, 64, 64);
      const imgData = ctx.getImageData(0, 0, 64, 64).data;
      let transparentPixels = 0;
      for (let i = 3; i < imgData.length; i += 4) {
        if (imgData[i] < 250) {
          transparentPixels++;
        }
      }
      // Jeśli więcej niż 1% pikseli jest przezroczyste — uznajemy za grafikę z przezroczystością
      return transparentPixels > (64 * 64 * 0.01);
    } catch (e) {
      console.warn('YisPrintQuality transparency check skipped:', e);
      return false;
    }
  }

  /**
   * Formatuje rozmiar pliku w bajtach do czytelnego KB / MB
   */
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Asynchroniczna analiza pliku graficznego
   */
  function analyzeImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Brak pliku do analizy'));

      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      if (isSvg) {
        return resolve({
          isValid: false,
          isSvg: true,
          fileName: file.name,
          fileSize: file.size,
          fileSizeFormatted: formatBytes(file.size),
          errorTitle: 'Plik wektorowy SVG wymaga weryfikacji w studiu',
          errorMessage: 'Pliki wektorowe SVG oraz PDF ze względów bezpieczeństwa i kalibracji krzywych przyjmujemy bezpośrednio do weryfikacji mailowej. Prześlij plik jako załącznik do yourimaginationstudio@gmail.com, a grafik YIS bezpłatnie przygotuje go do druku.'
        });
      }

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name)) {
        return resolve({
          isValid: false,
          fileName: file.name,
          fileSize: file.size,
          fileSizeFormatted: formatBytes(file.size),
          errorTitle: 'Nieobsługiwany format pliku',
          errorMessage: 'W kreatorze online przyjmujemy pliki PNG, JPG oraz WebP. Wektory (AI, CDR, PDF) prześlij bezpośrednio do weryfikacji mailowej.'
        });
      }

      const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return resolve({
          isValid: false,
          fileName: file.name,
          fileSize: file.size,
          fileSizeFormatted: formatBytes(file.size),
          errorTitle: 'Rozmiar pliku przekracza 15 MB',
          errorMessage: `Twój plik ma ${formatBytes(file.size)}. Maksymalny rozmiar obsługiwany w kreatorze to 15 MB. Większe pliki (np. grafiki o wysokiej rozdzielczości) prześlij jako załącznik e-mailem bezpośrednio do weryfikacji YIS.`
        });
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const hasTransparency = checkTransparency(img);

          resolve({
            isValid: true,
            isSvg: false,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileSizeFormatted: formatBytes(file.size),
            width: width,
            height: height,
            hasTransparency: hasTransparency,
            dataUrl: dataUrl
          });
        };
        img.onerror = () => {
          resolve({
            isValid: false,
            fileName: file.name,
            errorTitle: 'Uszkodzony plik graficzny',
            errorMessage: 'Nie udało się wczytać zawartości pliku. Upewnij się, że plik nie jest uszkodzony.'
          });
        };
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Błąd odczytu pliku z dysku'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Oblicza dynamiczne Effective DPI i rzeczywisty rozmiar nadruku w centymetrach
   * @param {number} pixelWidth Szerokość obrazka w pikselach
   * @param {number} pixelHeight Wysokość obrazka w pikselach
   * @param {string} productType Typ produktu (Koszulka, Bluza, Kubek, Czapka)
   * @param {number} canvasItemWidth Szerokość obiektu na makiecie Canvas (px)
   */
  function computeEffectiveDpi(pixelWidth, pixelHeight, productType = 'Koszulka', canvasItemWidth = 140) {
    const limits = PHYSICAL_PRINT_LIMITS_CM[productType] || PHYSICAL_PRINT_LIMITS_CM['Koszulka'];
    
    // Oblicz fizyczną szerokość nadruku w cm
    const scaleFraction = Math.max(0.2, Math.min(1.0, canvasItemWidth / CANVAS_PRINT_ZONE_WIDTH));
    const printWidthCm = limits.width * scaleFraction;
    const aspect = (pixelHeight || 1) / (pixelWidth || 1);
    const printHeightCm = Math.min(limits.height, printWidthCm * aspect);

    // Przeliczenie cm na cale (1 cal = 2.54 cm)
    const printWidthInches = printWidthCm / 2.54;
    const effectiveDpi = Math.max(1, Math.round(pixelWidth / printWidthInches));

    return {
      effectiveDpi: effectiveDpi,
      printWidthCm: parseFloat(printWidthCm.toFixed(1)),
      printHeightCm: parseFloat(printHeightCm.toFixed(1)),
      dimensionsText: `${printWidthCm.toFixed(1)} × ${printHeightCm.toFixed(1)} cm`
    };
  }

  /**
   * Generuje ocenę jakości przygotowania do druku (Print Quality Report)
   */
  function evaluateQuality(effectiveDpi, printWidthCm, printHeightCm, hasTransparency = false, isPreset = false) {
    // Autorskie grafiki YIS są wektorowo skalowane w produkcji — zawsze najwyższa jakość
    if (isPreset) {
      return {
        level: 'high',
        tier: 'excellent',
        dpi: Math.max(300, effectiveDpi || 300),
        badgeText: 'Jakość idealna — Autorska Grafika YIS',
        colorHex: '#C4A35A',
        badgeBgClass: 'bg-gold/15 text-gold border-gold/40',
        title: 'Jakość idealna — Gotowa do druku',
        message: 'Oficjalna grafika Christian Culture YIS przygotowana w pełnym profilu produkcyjnym.',
        recommendation: 'Plik w 100% zoptymalizowany pod druk sitodrukowy i cyfrowy DTF.',
        hasTransparency: true,
        transparencyNote: 'Wykryto przezroczystość (kanał alfa). Autorska grafika YIS zoptymalizowana pod profil produkcyjny.',
        requiresWarningCheck: false
      };
    }

    const dimsText = `${printWidthCm} × ${printHeightCm} cm`;

    // 1. ZIELONY: >= 250 DPI (Idealna / Bardzo dobra)
    if (effectiveDpi >= 250) {
      return {
        level: 'high',
        tier: 'excellent',
        dpi: effectiveDpi,
        badgeText: `Jakość bardzo dobra — ${effectiveDpi} DPI`,
        colorHex: '#22c55e',
        badgeBgClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        title: `Jakość bardzo dobra — ${effectiveDpi} DPI`,
        message: `Plik nadaje się do nadruku w aktualnym rozmiarze (${dimsText}).`,
        recommendation: 'Krawędzie i detale będą ostre i wyraźne po przeniesieniu na materiał.',
        hasTransparency: hasTransparency,
        transparencyNote: hasTransparency
          ? 'Wykryto przezroczystość (kanał alfa). Tło nie wymaga automatycznego drukowania jako prostokątnego obszaru. Ostateczna przydatność pliku zostanie potwierdzona podczas bezpłatnej weryfikacji YIS.'
          : 'Grafika posiada jednolite tło (brak kanału alfa). Zostanie wydrukowana z widocznym tłem lub studio YIS oceni możliwość jego wycięcia podczas bezpłatnej weryfikacji.',
        requiresWarningCheck: false
      };
    }

    // 2. ŻÓŁTY: 150 - 249 DPI (Dopuszczalna / Ostrzegawcza)
    if (effectiveDpi >= 150) {
      return {
        level: 'medium',
        tier: 'warning',
        dpi: effectiveDpi,
        badgeText: `Jakość dopuszczalna — ${effectiveDpi} DPI`,
        colorHex: '#eab308',
        badgeBgClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        title: `Jakość dopuszczalna — ${effectiveDpi} DPI`,
        message: `Przy nadruku ${dimsText} drobne detale mogą być lekko zmiękczone.`,
        recommendation: 'Aby uzyskać idealną ostrość, zmniejsz nieco nadruk na makiecie lub prześlij plik o większej rozdzielczości.',
        hasTransparency: hasTransparency,
        transparencyNote: hasTransparency
          ? 'Wykryto przezroczystość (kanał alfa). Tło nie wymaga automatycznego drukowania jako prostokątnego obszaru. Ostateczna przydatność pliku zostanie potwierdzona podczas bezpłatnej weryfikacji YIS.'
          : 'Grafika posiada jednolite tło (brak kanału alfa). Zostanie wydrukowana z widocznym tłem lub studio YIS oceni możliwość jego wycięcia podczas bezpłatnej weryfikacji.',
        requiresWarningCheck: false
      };
    }

    // 3. CZERWONY: < 150 DPI (Niska jakość - ostrzeżenie + świadoma akceptacja)
    return {
      level: 'low',
      tier: 'critical',
      dpi: effectiveDpi,
      badgeText: `Niska jakość — ${effectiveDpi} DPI`,
      colorHex: '#ef4444',
      badgeBgClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      title: `Niska jakość — ${effectiveDpi} DPI`,
      message: `Przy nadruku ${dimsText} grafika może być nieostra lub pikselowata.`,
      recommendation: 'Zmniejsz nadruk na makiecie lub prześlij plik o większej rozdzielczości. Grafik YIS bezpłatnie zweryfikuje plik przed realizacją.',
      hasTransparency: hasTransparency,
      transparencyNote: hasTransparency
        ? 'Wykryto przezroczystość (kanał alfa). Tło nie wymaga automatycznego drukowania jako prostokątnego obszaru. Ostateczna przydatność pliku zostanie potwierdzona podczas bezpłatnej weryfikacji YIS.'
        : 'Grafika posiada jednolite tło (brak kanału alfa). Zostanie wydrukowana z widocznym tłem lub studio YIS oceni możliwość jego wycięcia podczas bezpłatnej weryfikacji.',
      requiresWarningCheck: true
    };
  }

  // Eksport API
  window.YisPrintQuality = {
    analyzeImageFile,
    computeEffectiveDpi,
    evaluateQuality,
    formatBytes,
    PHYSICAL_PRINT_LIMITS_CM
  };

})(typeof window !== 'undefined' ? window : globalThis);
