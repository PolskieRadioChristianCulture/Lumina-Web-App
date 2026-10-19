import { getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { createFamilyClient } from './lumi-family-client.js?v=20261019_family1';
import { mountFamilyView } from './lumi-family-view.js?v=20261019_family1';

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
    const view = mountFamilyView({ element: dialog, client, userUid: uid, nameForUid: resolveName,
        inviteContacts: async () => {
            const config = await sdk.getDocFromServer(sdk.doc(db, 'kids_pilot', 'config'));
            if (auth.currentUser?.uid !== uid || !config.exists()) return [];
            const c = config.data();
            const uids = [...new Set([c.childUid, ...(Array.isArray(c.contacts) ? c.contacts : [])])]
                .filter(x => typeof x === 'string' && x && x !== uid).slice(0, 10);
            return Promise.all(uids.map(async memberUid => ({ uid: memberUid, name: await resolveName(memberUid) })));
        }, onClose: () => dialog.close() });
    let stopAuth = () => {};
    active = { dialog, view, client };
    dialog.addEventListener('close', () => { view.dispose(); client.dispose(); stopAuth(); names.clear(); dialog.remove(); active = null; }, { once: true });
    stopAuth = onAuthStateChanged(auth, u => { if (u?.uid !== uid) dialog.close(); });
}
