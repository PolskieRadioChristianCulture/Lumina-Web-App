/**
 * ============================================================================
 * YIS DESIGN STUDIO 2.0 — PROJECT STORE (js/yis-project-store.js)
 * ============================================================================
 * Moduł zarządzania strukturą projektu, lokalnym stanem szkiców i historią
 * zamówień w standardzie JSON.
 * Zgodność z Truthful UI:
 *   - Pamięć lokalna (localStorage) urządzenia klienta
 *   - Jawne oznaczanie statusu: 'SZKIC' | 'DO WERYFIKACJI' | 'WERYFIKACJA YIS'
 * ============================================================================
 */

(function (window) {
  'use strict';

  const DRAFT_STORAGE_KEY = 'yis_project_draft';
  const HISTORY_STORAGE_KEY = 'yis_orders_history';

  /**
   * Tworzy ustandaryzowaną strukturę projektu YIS
   */
  function createProjectPayload(state) {
    const pricing = window.YisPricing ? window.YisPricing.calculateYisPricing(state) : { total: 0 };
    const timestamp = Date.now();

    return {
      projectId: 'YIS-' + timestamp.toString(36).toUpperCase(),
      userId: state.luminaUser ? state.luminaUser.uid : null,
      userEmail: state.email || (state.luminaUser ? state.luminaUser.email : null),
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      storageType: 'LOCAL_STORAGE',
      product: {
        type: state.selectedProductType,
        color: state.selectedColor,
        colorHex: state.selectedColorHex,
        size: state.selectedSize,
        basePrice: state.productBasePrice
      },
      print: {
        placement: state.selectedPrintPlacement,
        format: state.selectedFormat,
        hasCustomImage: !!state.uploadedImageBase64 && !state.uploadedImageBase64.includes('jezus_jest_droga'),
        isPresetGraphic: !!state.uploadedImageBase64 && state.uploadedImageBase64.includes('jezus_jest_droga'),
        graphicMode: state.graphicMode,
        personalizedText: (state.personalizedText || '').trim()
      },
      designPackage: {
        tier: state.designPackage || 1,
        name: state.designPackage === 1 ? '1 koncepcja (GRATIS)' : (state.designPackage === 2 ? '2 koncepcje (+30 zł)' : '3 koncepcje (+50 zł)'),
        fee: state.designPackage === 2 ? 30 : (state.designPackage === 3 ? 50 : 0)
      },
      order: {
        quantity: state.quantity || 1,
        shippingMethod: state.selectedShippingMethod || 'Paczkomat InPost',
        shippingCost: state.shippingCost || 17,
        estimatedTotal: pricing.total,
        formattedTotal: pricing.formattedTotal
      },
      customer: {
        firstName: state.firstName || '',
        lastName: state.lastName || '',
        email: state.email || '',
        phoneNumber: state.phoneNumber || '',
        address: state.address || '',
        isLuminaMember: !!state.isLuminaMember
      },
      status: 'SZKIC' // 'SZKIC' | 'DO WERYFIKACJI' | 'WERYFIKACJA YIS' | 'WYCENIONY' | 'REALIZACJA'
    };
  }

  function saveLocalDraft(state) {
    try {
      const payload = {
        selectedProductType: state.selectedProductType,
        productBasePrice: state.productBasePrice,
        selectedColor: state.selectedColor,
        selectedColorHex: state.selectedColorHex,
        selectedSize: state.selectedSize,
        selectedFormat: state.selectedFormat,
        selectedPrintPlacement: state.selectedPrintPlacement,
        personalizedText: state.personalizedText,
        designPackage: state.designPackage || 1,
        quantity: state.quantity || 1,
        selectedShippingMethod: state.selectedShippingMethod,
        shippingCost: state.shippingCost,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phoneNumber: state.phoneNumber,
        address: state.address,
        updatedAt: Date.now()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('YisProjectStore: saveLocalDraft error:', err);
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

  function appendToHistory(orderData) {
    try {
      const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY) || '[]';
      const history = JSON.parse(historyRaw);
      history.unshift(orderData);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      return history;
    } catch (err) {
      console.warn('YisProjectStore: appendToHistory error:', err);
      return [];
    }
  }

  function getLocalHistory() {
    try {
      const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY) || '[]';
      return JSON.parse(historyRaw);
    } catch (err) {
      console.warn('YisProjectStore: getLocalHistory error:', err);
      return [];
    }
  }

  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (err) {
      console.warn('YisProjectStore: clearHistory error:', err);
    }
  }

  // Eksport globalny
  window.YisProjectStore = {
    DRAFT_STORAGE_KEY,
    HISTORY_STORAGE_KEY,
    createProjectPayload,
    saveLocalDraft,
    loadLocalDraft,
    appendToHistory,
    getLocalHistory,
    clearHistory
  };

})(typeof window !== 'undefined' ? window : globalThis);
