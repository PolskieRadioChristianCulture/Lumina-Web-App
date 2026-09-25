/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — CANONICAL PROJECT STORE (js/yis-project-store.js)
 * ============================================================================
 * Jeden spójny, wersjonowany model danych projektu (ETAP 4: Project -> Order).
 * Standardy:
 *   - Schema Version 2
 *   - Czytelny identyfikator klienta: YIS-2026-XXXXX (unikalny 5-znakowy kod)
 *   - Wersjonowanie snapshotów: v1 -> v2 -> v3 (niezmienna historia zlecenia)
 *   - Niezależne stany: Guest (localStorage) vs. LUMINA Cloud (Firestore)
 *   - Prawdziwy wskaźnik synchronizacji: Zapisywanie / Zapisano / Brak sieci
 *   - Truthful UI: brak deklaracji "zapisano w chmurze" bez faktycznego sukcesu
 * ============================================================================
 */

(function (window) {
  'use strict';

  const SCHEMA_VERSION = 2;
  const DRAFT_STORAGE_KEY = 'yis_project_draft_v2';
  const REVISIONS_STORAGE_KEY = 'yis_project_revisions_v2';
  const HISTORY_STORAGE_KEY = 'yis_orders_history_v2';

  // Alfabet bez mylących znaków (bez O, 0, I, 1, L)
  const ID_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  /**
   * Generuje czytelny, bezpieczny identyfikator projektu dla klienta
   * Format: YIS-2026-AB7K4
   */
  function generateFriendlyProjectId(year = 2026) {
    let code = '';
    const bytes = new Uint8Array(5);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
      for (let i = 0; i < 5; i++) {
        code += ID_CHARSET[bytes[i] % ID_CHARSET.length];
      }
    } else {
      for (let i = 0; i < 5; i++) {
        code += ID_CHARSET[Math.floor(Math.random() * ID_CHARSET.length)];
      }
    }
    return `YIS-${year}-${code}`;
  }

  /**
   * Tworzy kanoniczną, zunifikowaną strukturę projektu YIS (Schema v2)
   */
  function createCanonicalProject(state, existingProject = null) {
    const timestamp = Date.now();
    const isoDate = new Date(timestamp).toISOString();

    // Wylicz cennik z jedynego silnika prawdy
    const pricingResult = window.YisPricing ? window.YisPricing.calculateYisPricing(state) : { total: 0 };

    // Pobierz stan obiektów Canvas (przód / tył)
    const canvasData = (window.YisCanvas && window.YisCanvas.getProjectState)
      ? window.YisCanvas.getProjectState()
      : (state.canvasProjectState || { sides: { front: { objects: [] }, back: { objects: [] } } });

    // Parametry jakości druku
    const qualityReport = state.imageQualityReport || {};
    const imgAnalysis = state.imageAnalysis || {};

    const projectId = existingProject?.projectId || generateFriendlyProjectId(2026);
    const internalId = existingProject?.internalId || ('proj_' + timestamp.toString(36) + '_' + Math.random().toString(36).slice(2, 7));
    const currentRevision = (existingProject?.revision || 0) + 1;

    // Model danych projektu
    const project = {
      schemaVersion: SCHEMA_VERSION,
      projectId: projectId,
      internalId: internalId,
      revision: currentRevision,
      createdAt: existingProject?.createdAt || isoDate,
      updatedAt: isoDate,
      userId: state.luminaUser ? state.luminaUser.uid : 'guest',
      userEmail: state.email || (state.luminaUser ? state.luminaUser.email : null),
      isGuest: !state.luminaUser,
      status: existingProject?.status || 'SZKIC',

      product: {
        type: state.selectedProductType || 'Koszulka',
        color: state.selectedColor || '36 (Czarny)',
        colorHex: state.selectedColorHex || '#1A1A1A',
        size: state.selectedSize || 'M',
        quantity: Math.max(1, parseInt(state.quantity, 10) || 1),
        basePrice: state.productBasePrice || 45
      },

      design: {
        front: {
          layers: canvasData.sides?.front?.objects || [],
          hasContent: (canvasData.sides?.front?.objects || []).length > 0
        },
        back: {
          layers: canvasData.sides?.back?.objects || [],
          hasContent: (canvasData.sides?.back?.objects || []).length > 0
        },
        personalizedText: (state.personalizedText || '').trim(),
        graphicMode: state.graphicMode || 'preset',
        presetSampleGraphic: state.graphicMode === 'preset' ? '/images/yis/jezus_jest_droga.png' : null
      },

      print: {
        placement: state.selectedPrintPlacement || 'Przód',
        technology: (state.selectedProductType === 'Kubek' || state.selectedProductType === 'Czapka') ? 'Termotransfer / Haft' : 'DTF / Sitodruk Premium',
        format: state.selectedFormat || 'Standard',
        physicalDimensions: qualityReport.printDimensions || 'Ok. 24 × 30 cm',
        printZone: 'Strefa bezpieczna YIS'
      },

      quality: {
        sourceWidthPx: imgAnalysis.width || null,
        sourceHeightPx: imgAnalysis.height || null,
        fileSizeFormatted: imgAnalysis.fileSizeFormatted || null,
        effectiveDpi: qualityReport.dpi || null,
        qualityTier: qualityReport.tier || (state.graphicMode === 'preset' ? 'excellent' : 'unknown'),
        transparency: imgAnalysis.hasTransparency !== undefined ? imgAnalysis.hasTransparency : null,
        warnings: qualityReport.requiresWarningCheck ? ['Niska rozdzielczość pliku (< 150 DPI)'] : [],
        lowDpiAccepted: !!state.lowDpiAccepted
      },

      designPackage: {
        tier: state.designPackage || 1,
        concepts: state.designPackage === 1 ? 1 : (state.designPackage === 2 ? 2 : 3),
        name: state.designPackage === 1 ? '1 koncepcja (GRATIS)' : (state.designPackage === 2 ? '2 koncepcje (+30 zł)' : '3 koncepcje (+50 zł)'),
        price: state.designPackage === 2 ? 30 : (state.designPackage === 3 ? 50 : 0),
        fee: state.designPackage === 2 ? 30 : (state.designPackage === 3 ? 50 : 0)
      },

      pricing: {
        productBase: pricingResult.itemBase || 0,
        print: pricingResult.printTotal || 0,
        design: pricingResult.designFee || 0,
        shipping: state.shippingCost || 17,
        estimatedTotal: pricingResult.total || 0,
        formattedTotal: pricingResult.formattedTotal || '0,00 zł',
        currency: 'PLN',
        isEstimate: true
      },

      customer: {
        firstName: (state.firstName || '').trim(),
        lastName: (state.lastName || '').trim(),
        email: (state.email || '').trim(),
        phone: (state.phoneNumber || '').trim(),
        deliveryAddress: (state.address || '').trim(),
        shippingMethod: state.selectedShippingMethod || 'Paczkomat InPost'
      },

      verification: {
        required: true,
        submittedAt: null,
        channel: null,
        notes: (state.orderNotes || '').trim()
      },

      statusHistory: existingProject?.statusHistory || [
        { status: 'SZKIC', timestamp: isoDate, actor: 'client', note: 'Utworzenie szkicu projektu' }
      ]
    };

    return project;
  }

  /**
   * Zapisuje snapshot wersji projektu (Niezmienna rewizja)
   */
  function createRevisionSnapshot(project, channel = 'email') {
    const timestamp = Date.now();
    const isoDate = new Date(timestamp).toISOString();

    const snapshot = JSON.parse(JSON.stringify(project));
    snapshot.status = 'DO WERYFIKACJI';
    snapshot.verification.submittedAt = isoDate;
    snapshot.verification.channel = channel;
    snapshot.statusHistory.push({
      status: 'DO WERYFIKACJI',
      timestamp: isoDate,
      actor: 'client',
      note: `Przekazano rewizję v${snapshot.revision} do weryfikacji YIS (${channel})`
    });

    try {
      const raw = localStorage.getItem(REVISIONS_STORAGE_KEY) || '[]';
      const revisions = JSON.parse(raw);
      revisions.unshift(snapshot);
      // Zachowaj do 20 ostatnich rewizji
      if (revisions.length > 20) revisions.pop();
      localStorage.setItem(REVISIONS_STORAGE_KEY, JSON.stringify(revisions));
    } catch (e) {
      console.warn('YisProjectStore: error saving revision snapshot:', e);
    }

    return snapshot;
  }

  /**
   * Zapis lokalny szkicu roboczego (Guest & Offline Safety)
   */
  function saveLocalDraft(project) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(project));
      return { success: true, storage: 'LOCAL_STORAGE' };
    } catch (err) {
      console.warn('YisProjectStore: saveLocalDraft error:', err);
      return { success: false, error: err.message };
    }
  }

  function loadLocalDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('YisProjectStore: loadLocalDraft error:', err);
      return null;
    }
  }

  function getRevisions() {
    try {
      const raw = localStorage.getItem(REVISIONS_STORAGE_KEY) || '[]';
      return JSON.parse(raw);
    } catch (err) {
      return [];
    }
  }

  /**
   * Generuje kompletny, sformatowany tekst specyfikacji zlecenia (Truthful UI)
   */
  function buildHandoffText(project) {
    const p = project || {};
    const prod = p.product || {};
    const pr = p.print || {};
    const q = p.quality || {};
    const pkg = p.designPackage || {};
    const prc = p.pricing || {};
    const c = p.customer || {};

    return `=====================================================
YIS DESIGN STUDIO • KARTA SPECYFIKACJI PROJEKTU
Identyfikator: ${p.projectId || 'Szkic'} (Rewizja: v${p.revision || 1})
Status: ${p.status || 'DO WERYFIKACJI'}
Data: ${p.updatedAt || new Date().toISOString()}
=====================================================

1. PRODUKT BAZOWY:
• Typ: ${prod.type || 'Koszulka'}
• Kolor: ${prod.color || 'Czarny'}
• Rozmiar: ${prod.size || 'M'}
• Nakład: ${prod.quantity || 1} szt.
• Cena bazowa produktu: ${prod.basePrice || 45} zł/szt.

2. SPECYFIKACJA NADRUKU:
• Umiejscowienie: ${pr.placement || 'Przód'}
• Technologia docelowa: ${pr.technology || 'DTF / Sitodruk Premium'}
• Format / Strefa: ${pr.format || 'Standard'} (${pr.physicalDimensions || 'Ok. 24 × 30 cm'})
• Treść personalizacji: ${p.design?.personalizedText ? `„${p.design.personalizedText}”` : '(brak tekstu)'}

3. ANALIZA PLIKU I JAKOŚĆ (PRINT QUALITY ENGINE):
• Rozdzielczość robocza: ${q.sourceWidthPx && q.sourceHeightPx ? `${q.sourceWidthPx} × ${q.sourceHeightPx} px` : '(brak pliku / grafika bazowa)'}
• Rozmiar pliku: ${q.fileSizeFormatted || 'N/D'}
• Efektywne DPI: ${q.effectiveDpi ? `${q.effectiveDpi} DPI (${q.qualityTier === 'excellent' ? 'Bardzo dobra' : (q.qualityTier === 'warning' ? 'Wymaga uwagi' : 'Niska jakość')})` : 'Standard YIS'}
• Przezroczystość (kanał alfa): ${q.transparency === true ? 'Wykryto przezroczystość (kanał alfa)' : (q.transparency === false ? 'Grafika z jednolitym tłem' : 'Brak danych')}
${q.lowDpiAccepted ? '• OSTRZEŻENIE: Klient świadomie zaakceptował niższą rozdzielczość (<150 DPI) i prosi o wsparcie grafika.' : ''}

4. PAKIET KREATYWNY YIS:
• Pakiet: ${pkg.name || '1 koncepcja (GRATIS)'}
• Koszt przygotowania projektu: ${pkg.price ? `${pkg.price} zł` : '0 zł (w cenie produktu)'}

5. SZACUNKOWY KOSZTORYS ZLECENIA:
• Baza produktu (${prod.quantity || 1} szt.): ${prc.productBase || 0} zł
• Znakowanie / nadruk: ${prc.print || 0} zł
• Pakiet projektowy YIS: ${prc.design || 0} zł
• Dostawa (${c.shippingMethod || 'Paczkomat InPost'}): ${prc.shipping || 0} zł
• ŁĄCZNA SZACUNKOWA KWOTA: ~${prc.formattedTotal || '0,00 zł'}
* Uwaga: Kwota jest wyceną orientacyjną. Ostateczny kosztorys i czas realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej przez studio YIS.

6. DANE ZAMAWIAJĄCEGO I DOSTAWA:
• Imię i nazwisko: ${c.firstName || ''} ${c.lastName || ''}
• E-mail kontaktowy: ${c.email || ''}
• Telefon: ${c.phone || ''}
• Adres dostawy / Paczkomat: ${c.deliveryAddress || ''}
• Metoda wysyłki: ${c.shippingMethod || 'Paczkomat InPost'}
• Status konta: ${p.isGuest ? 'Użytkownik Gość (zapis lokalny na urządzeniu)' : `Zalogowany Użytkownik LUMINA (${p.userId})`}

=====================================================
Zlecenie wygenerowane automatycznie przez YIS Design Studio 2.0
Adres kreatora: https://polskieradio.cc/projektant
Studio: Your Imagination Studio & Christian Culture
E-mail: yourimaginationstudio@gmail.com
WhatsApp: https://chat.whatsapp.com/Gq54lFzdH5AFhrMEDvnwVD
=====================================================`;
  }

  /**
   * Prawdziwa synchronizacja chmurowa Firestore z rzetelnym statusem Truthful UI
   */
  async function syncToLuminaCloud(project, dbInstance = null) {
    if (!project || !project.projectId) {
      return { success: false, status: 'ERROR', message: 'Brak obiektu projektu' };
    }

    // Tryb Gość - zapis wyłącznie lokalny
    const authUser = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
      ? firebase.auth().currentUser
      : null;

    if (!authUser || authUser.isAnonymous) {
      saveLocalDraft(project);
      return {
        success: true,
        status: 'LOCAL_ONLY',
        message: 'Projekt zapisany na tym urządzeniu (tryb gościa)',
        projectId: project.projectId
      };
    }

    try {
      const db = dbInstance || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
      if (!db) {
        saveLocalDraft(project);
        return {
          success: true,
          status: 'LOCAL_ONLY',
          message: 'Projekt zapisany lokalnie (brak modułu bazy)',
          projectId: project.projectId
        };
      }

      const projectPayload = JSON.parse(JSON.stringify(project));
      projectPayload.userId = authUser.uid;
      projectPayload.userEmail = authUser.email || projectPayload.userEmail;
      projectPayload.syncedAt = new Date().toISOString();

      await db.collection('yis_projects').doc(project.projectId).set(projectPayload, { merge: true });
      saveLocalDraft(project);

      return {
        success: true,
        status: 'CLOUD_SYNCED',
        message: 'Zsynchronizowano z kontem LUMINA w chmurze',
        projectId: project.projectId
      };
    } catch (err) {
      console.warn('YisProjectStore: błąd synchronizacji z chmurą:', err);
      saveLocalDraft(project);
      return {
        success: false,
        status: 'LOCAL_ONLY',
        message: 'Zapisano lokalnie na urządzeniu (błąd synchronizacji)',
        error: err.message,
        projectId: project.projectId
      };
    }
  }

  // Eksport API
  window.YisProjectStore = {
    SCHEMA_VERSION,
    DRAFT_STORAGE_KEY,
    REVISIONS_STORAGE_KEY,
    generateFriendlyProjectId,
    createCanonicalProject,
    createProjectPayload: createCanonicalProject,
    createRevisionSnapshot,
    saveLocalDraft,
    loadLocalDraft,
    getRevisions,
    buildHandoffText,
    syncToLuminaCloud
  };

})(typeof window !== 'undefined' ? window : globalThis);
