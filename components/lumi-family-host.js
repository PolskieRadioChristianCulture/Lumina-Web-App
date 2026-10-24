import { getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { createFamilyClient } from './lumi-family-client.js?v=20261019_family1';
import { mountFamilyView } from './lumi-family-view.js?v=20261023_pin1';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js';
import { createFamilyPinGate } from './lumi-family-pin.js?v=20261023_pin1';

let active = null;
export function openFamilyPanel({ nameForUid } = {}) {
    if (active) { active.dialog.focus(); return; }
    if (!document.getElementById('lumi-family-css')) {
        const link = document.createElement('link'); link.id = 'lumi-family-css'; link.rel = 'stylesheet';
        link.href = '/css/lumi-family.css?v=20261019_family1'; document.head.append(link);
    }
    const dialog = document.createElement('dialog'); dialog.className = 'lumi-family-dialog';
    dialog.setAttribute('aria-label', 'Pokoje rodzinne'); document.body.append(dialog);
    dialog.showModal();
    if (!getApps().length || !getAuth(getApp()).currentUser || getAuth(getApp()).currentUser.isAnonymous) {
        const text = document.createElement('p'); text.textContent = 'Zaloguj się do LUMINA, aby otworzyć swoją rodzinę.';
        const close = document.createElement('button'); close.textContent = 'Zamknij'; close.onclick = () => dialog.close();
        dialog.append(text, close); dialog.addEventListener('close', () => { dialog.remove(); active = null; }, { once: true });
        active = { dialog }; return;
    }
    const app = getApp(), auth = getAuth(app), db = sdk.getFirestore(app), uid = auth.currentUser.uid;
    const pinCall = httpsCallable(getFunctions(app, 'europe-west1'), 'familyRoomPin', {timeout: 12000});
    const unlockRoom = createFamilyPinGate({document, call: async data => (await pinCall(data)).data});
    const client = createFamilyClient({ db, auth, sdk: { ...sdk, onAuthStateChanged }, enabled: true });
    const names = new Map([[uid, 'Ty']]);
    const resolveName = async memberUid => {
        if (names.has(memberUid)) return names.get(memberUid);
        let name = nameForUid ? await nameForUid(memberUid) : null;
        if (!name) for (const path of ['kids_profiles', 'lumina_profiles']) {
            try {
                const s = await sdk.getDocFromServer(sdk.doc(db, path, memberUid));
                if (s.exists()) { name = s.data().displayName || s.data().name; if (name) break; }
            } catch { /* Names are optional; no additional privileges or collection scans. */ }
        }
        name = typeof name === 'string' && name.trim() ? name.slice(0, 80) : 'Członek rodziny';
        names.set(memberUid, name); return name;
    };
    const resolveUid = async input => {
        if (!input) return input;
        const clean = String(input).trim().replace(/^@/, '');
        try {
            const s = await sdk.getDocFromServer(sdk.doc(db, 'lumina_profiles', clean));
            if (s.exists() && s.data()?.uid) return s.data().uid;
        } catch {}
        return clean;
    };
    const view = mountFamilyView({ element: dialog, client, userUid: uid, nameForUid: resolveName, resolveUid, unlockRoom,
        inviteContacts: async () => {
            const contactMap = new Map();
            // 1. Sprawdź konfigurację kids_pilot jeśli istnieje
            try {
                const config = await sdk.getDocFromServer(sdk.doc(db, 'kids_pilot', 'config'));
                if (config.exists()) {
                    const c = config.data();
                    const uids = [...new Set([c.childUid, ...(Array.isArray(c.contacts) ? c.contacts : [])])]
                        .filter(x => typeof x === 'string' && x && x !== uid);
                    for (const memberUid of uids) {
                        contactMap.set(memberUid, { uid: memberUid, name: await resolveName(memberUid) });
                    }
                }
            } catch {}

            // 2. Dodaj profile rodzinne (Wioletta Rogowska)
            try {
                const wSnap = await sdk.getDocFromServer(sdk.doc(db, 'lumina_profiles', 'wiolettarogowska'));
                if (wSnap.exists()) {
                    const wData = wSnap.data();
                    const wUid = wData.uid || 'wiolettarogowska';
                    if (wUid !== uid && !contactMap.has(wUid)) {
                        contactMap.set(wUid, { uid: wUid, name: wData.displayName || wData.name || 'Wioletta Rogowska' });
                    }
                } else if (uid !== 'wiolettarogowska') {
                    contactMap.set('wiolettarogowska', { uid: 'wiolettarogowska', name: 'Wioletta Rogowska' });
                }
            } catch {
                if (uid !== 'wiolettarogowska') {
                    contactMap.set('wiolettarogowska', { uid: 'wiolettarogowska', name: 'Wioletta Rogowska' });
                }
            }

            // 3. Dodaj kontakty z CCGlobalChat
            try {
                const globalMembers = window.CCGlobalChat?.members || window.CCGlobalChat?.getMembers?.() || [];
                if (Array.isArray(globalMembers)) {
                    for (const m of globalMembers) {
                        const mUid = typeof m === 'string' ? m : (m.uid || m.id);
                        if (mUid && mUid !== uid && !contactMap.has(mUid)) {
                            const name = (typeof m === 'object' && (m.name || m.displayName)) ? (m.name || m.displayName) : await resolveName(mUid);
                            contactMap.set(mUid, { uid: mUid, name });
                        }
                    }
                }
            } catch {}

            return Array.from(contactMap.values()).slice(0, 15);
        }, onClose: () => dialog.close() });
    let stopAuth = () => {};
    active = { dialog, view, client };
    dialog.addEventListener('close', () => { view.dispose(); client.dispose(); stopAuth(); names.clear(); dialog.remove(); active = null; }, { once: true });
    stopAuth = onAuthStateChanged(auth, u => { if (u?.uid !== uid) dialog.close(); });
}
if (typeof window !== 'undefined') {
    window.openFamilyPanel = openFamilyPanel;
}
