/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA OWNER STUDIO & PROFILE EDITOR ENGINE
 * ══════════════════════════════════════════════════════════════════════════
 */

export function isLuminaAdmin() {
    let u = (window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') ? window.LuminaDB.getCurrentUser() : null;
    if (!u) {
        try { u = JSON.parse(localStorage.getItem('lumina_current_user') || 'null'); } catch(e) {}
    }
    let p = null;
    try { p = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null'); } catch(e) {}
    
    const email = ((u && u.email) || (p && p.email) || localStorage.getItem('lumina_user_email') || '').toLowerCase();
    const slug = ((p && p.slug) || (u && u.slug) || '').toLowerCase();
    const isMaster = (sessionStorage.getItem('lumina_auth_master_admin') === 'true') || 
                     (localStorage.getItem('lumina_auth_master_admin') === 'true') ||
                     (sessionStorage.getItem('lumina_auth_owner_cezaryrgowski') === 'true') ||
                     (localStorage.getItem('lumina_auth_owner_cezaryrgowski') === 'true') ||
                     (localStorage.getItem('lumina_admin') === '1');
    
    const isAdmin = (email === 'nazirczarkes@gmail.com' || email.includes('czarkes') || email.includes('christianculture') || slug.includes('cezary') || isMaster);
    if (isAdmin) {
        localStorage.setItem('lumina_admin', '1');
        localStorage.setItem('lumina_auth_master_admin', 'true');
    }
    return isAdmin;
}

export function openEditProfileModal(profileData) {
    if (!profileData && typeof window.getProfileData === 'function') {
        profileData = window.getProfileData();
    }
    if (!profileData) return;

    if (document.getElementById('editNameInput')) document.getElementById('editNameInput').value = profileData.name || '';
    if (document.getElementById('editAgeInput')) document.getElementById('editAgeInput').value = profileData.age || '';
    if (document.getElementById('editCityInput')) document.getElementById('editCityInput').value = profileData.city || '';
    if (document.getElementById('editDenomSelect')) document.getElementById('editDenomSelect').value = profileData.denom || 'Chrześcijanin';
    if (document.getElementById('editJobInput')) document.getElementById('editJobInput').value = profileData.job || profileData.role || '';
    if (document.getElementById('editChurchInput')) document.getElementById('editChurchInput').value = profileData.church || '';
    if (document.getElementById('editStatusInput')) document.getElementById('editStatusInput').value = profileData.status || '';
    if (document.getElementById('editVerseText')) document.getElementById('editVerseText').value = profileData.verse || '';
    if (document.getElementById('editVerseRef')) document.getElementById('editVerseRef').value = profileData.verseRef || '';
    if (document.getElementById('editBioInput')) document.getElementById('editBioInput').value = profileData.bio || '';
    if (document.getElementById('editTagsInput')) document.getElementById('editTagsInput').value = (profileData.tags || []).join(', ');
    if (document.getElementById('editPinInput')) document.getElementById('editPinInput').value = profileData.pin || '7777';

    const modal = document.getElementById('editProfileModal');
    if (modal) modal.classList.add('open');
}

export function saveProfileDataSubmit(slug, newData) {
    if (!slug) slug = 'cezaryrgowski';
    try {
        localStorage.setItem('lumina_profile_' + slug, JSON.stringify(newData));
        if (typeof window.showToast === 'function') {
            window.showToast('Twój profil został pomyślnie zaktualizowany! ✨');
        }
        const modal = document.getElementById('editProfileModal');
        if (modal) modal.classList.remove('open');
        if (typeof window.renderProfile === 'function') {
            window.renderProfile();
        }
    } catch(e) {
        console.error('Błąd zapisu profilu:', e);
    }
}

if (typeof window !== 'undefined') {
    window.isLuminaAdmin = isLuminaAdmin;
    window.openEditProfileModal = openEditProfileModal;
    window.saveProfileDataSubmit = saveProfileDataSubmit;
}
