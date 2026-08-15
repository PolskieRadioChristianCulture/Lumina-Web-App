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
            'czarkr@gmail.com'
        ];
    }

    /**
     * Sprawdza czy bieżący użytkownik jest Głównym Administratorem Portalu
     */
    isMasterAdmin() {
        if (sessionStorage.getItem('lumina_auth_master_admin') === 'true') return true;
        
        try {
            const curUser = this.db.getCurrentUser?.();
            if (curUser && curUser.email && this.adminEmails.includes(curUser.email.toLowerCase())) {
                sessionStorage.setItem('lumina_auth_master_admin', 'true');
                return true;
            }
        } catch(e) {}
        return false;
    }

    /**
     * Odblokowanie uprawnień Administratora Master PIN-em (Wyłączność Dowódcy)
     */
    unlockMasterAdmin(pin) {
        if (!pin) return false;
        if (pin.trim() === '7777') {
            sessionStorage.setItem('lumina_auth_master_admin', 'true');
            return true;
        }
        return false;
    }

    /**
     * Blokada uprawnień Administratora (Wylogowanie z trybu Administratora)
     */
    lockMasterAdmin() {
        sessionStorage.removeItem('lumina_auth_master_admin');
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
