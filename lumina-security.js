/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA SECURITY ENGINE (lumina-security.js)
 * Master Administrator Exclusive Access & Self-Only User Profile Editing
 * Ekosystem: Christian Culture | Standard: Enterprise Grade
 * ══════════════════════════════════════════════════════════════════════════
 */

import * as LuminaDB from './lumina-db.js';

class LuminaSecurityEngine {
    constructor() {
        this.db = LuminaDB;
        this.adminEmails = [
            'polskieradio.cc@gmail.com',
            'czarkr@gmail.com',
            'nazirczarkes@gmail.com'
        ];
    }

    /**
     * Sprawdza czy bieżący użytkownik jest Głównym Administratorem Portalu.
     * Domyślnie NIEzalogowany (szara tarcza), wymaga podania autoryzowanego PINu 0455.
     */
    isMasterAdmin() {
        return sessionStorage.getItem('lumina_auth_master_admin') === 'true' || localStorage.getItem('lumina_auth_master_admin') === 'true';
    }

    /**
     * Bezpieczne kryptograficzne hashowanie SHA-256 w przeglądarce
     */
    async _hashPin(pin) {
        const msgBuffer = new TextEncoder().encode((pin || '').trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Odblokowanie uprawnień Administratora wyłącznie bezpiecznym hashem SHA-256
     */
    async unlockMasterAdmin(pin) {
        if (!pin) return false;
        const hash = await this._hashPin(pin);
        if (hash === 'eec0ae2663b74fdb9fb9981e92f1b2cc2a8b42444d358776d872580c79454c91') {
            sessionStorage.setItem('lumina_auth_master_admin', 'true');
            localStorage.setItem('lumina_auth_master_admin', 'true');
            if (typeof document !== 'undefined' && document.body) {
                document.body.classList.add('lumina-admin-mode');
                document.body.classList.add('owner-mode-active');
            }
            return true;
        }
        return false;
    }

    /**
     * Blokada uprawnień Administratora (Wylogowanie z trybu Administratora)
     */
    lockMasterAdmin() {
        sessionStorage.removeItem('lumina_auth_master_admin');
        localStorage.removeItem('lumina_auth_master_admin');
        localStorage.removeItem('lumina_admin');
        sessionStorage.removeItem('lumina_auth_owner_cezaryrgowski');
        localStorage.removeItem('lumina_auth_owner_cezaryrgowski');
        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.remove('lumina-admin-mode');
            document.body.classList.remove('owner-mode-active');
        }
    }

    /**
     * Ścisła weryfikacja uprawnień do edycji profilu:
     * - Administrator ma wyłączny dostęp do edycji DOWOLNEGO profilu i kanału misyjnego.
     * - Zwykły użytkownik może edytować WYŁĄCZNIE swój własny profil.
     * - Niezalogowany gość ma dostęp wyłącznie do odczytu.
     */
    canEditProfile(targetSlug, targetUid = null) {
        if (!targetSlug) return false;
        
        // 1. Główny Administrator portalu -> pełna wyłączność na edycję każdego profilu
        if (this.isMasterAdmin()) return true;

        // Kanały misyjne mogą być edytowane WYŁĄCZNIE przez Administratora Portalu
        const missionSlugs = ['ccwomen', 'ccmen', 'osobowoscplus', 'radiocc', 'cctv'];
        if (missionSlugs.includes(targetSlug.toLowerCase())) {
            return false;
        }

        // 2. Zwykły zalogowany użytkownik -> sprawdzenie czy edytuje SWÓJ WŁASNY profil
        try {
            const curUser = this.db.getCurrentUser?.();
            const curProf = this.db.getCurrentProfile?.() || JSON.parse(localStorage.getItem('lumina_current_user_profile') || 'null');

            if (!curUser && !curProf) return false; // Niezalogowany -> brak uprawnień

            // Porównanie po UID
            if (curUser && targetUid && curUser.uid === targetUid) return true;
            if (curUser && curUser.uid === targetSlug) return true;

            // Porównanie po Slug własnego profilu
            if (curProf && curProf.slug && curProf.slug.toLowerCase() === targetSlug.toLowerCase()) return true;
            if (curProf && curProf.uid && curProf.uid === targetSlug) return true;
            if (curProf && targetUid && curProf.uid === targetUid) return true;
        } catch(e) {}

        return false;
    }
}

// Singleton na oknie globalnym
window.LuminaSecurity = new LuminaSecurityEngine();

export const isMasterAdmin = () => window.LuminaSecurity.isMasterAdmin();
export const unlockMasterAdmin = (pin) => window.LuminaSecurity.unlockMasterAdmin(pin);
export const lockMasterAdmin = () => window.LuminaSecurity.lockMasterAdmin();
export const canEditProfile = (slug, uid) => window.LuminaSecurity.canEditProfile(slug, uid);
