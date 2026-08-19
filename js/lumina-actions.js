/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA SHARED ACTIONS & SOCIAL INTERACTIONS
 * ══════════════════════════════════════════════════════════════════════════
 */

// Toast notification engine
let toastTimer = null;
export function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> <span id="toastMsg"></span>';
        document.body.appendChild(toast);
    }
    const msgEl = document.getElementById('toastMsg') || toast;
    msgEl.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// Modal open/close helpers
export function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

export function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

// Profile Heart (Like) Action with Live Counter
export function toggleProfileHeart(btn, profileSlug) {
    if (!btn) return;
    btn.classList.toggle('active');
    const countEl = btn.querySelector('#heartCountBadge') || btn.querySelector('.heart-count');
    const isLiked = btn.classList.contains('active');
    
    if (countEl) {
        let count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = isLiked ? (count + 1) : Math.max(0, count - 1);
    }
    
    showToast(isLiked ? 'Dodano profil do Twoich ulubionych połączeń! ❤️' : 'Usunięto z ulubionych');
    
    // Save to local storage
    try {
        const likedProfiles = JSON.parse(localStorage.getItem('lumina_liked_profiles') || '[]');
        if (isLiked && !likedProfiles.includes(profileSlug)) {
            likedProfiles.push(profileSlug);
        } else if (!isLiked) {
            const idx = likedProfiles.indexOf(profileSlug);
            if (idx >= 0) likedProfiles.splice(idx, 1);
        }
        localStorage.setItem('lumina_liked_profiles', JSON.stringify(likedProfiles));
    } catch(e) {}
}

// Profile Follow Action with Live Counter
export function toggleProfileFollow(btn, profileSlug) {
    if (!btn) return;
    btn.classList.toggle('following');
    const isFollowing = btn.classList.contains('following');
    const textEl = btn.querySelector('#followBtnText') || btn.querySelector('.follow-text');
    const iconEl = btn.querySelector('#followBtnIcon') || btn.querySelector('i');
    const countEl = btn.querySelector('#followCountBadge') || btn.querySelector('.follow-count');
    
    if (textEl) textEl.textContent = isFollowing ? 'Obserwujesz' : 'Obserwuj';
    if (iconEl) iconEl.className = isFollowing ? 'fa-solid fa-user-check' : 'fa-solid fa-user-plus';
    
    if (countEl) {
        let count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = isFollowing ? (count + 1) : Math.max(0, count - 1);
    }
    
    showToast(isFollowing ? 'Obserwujesz ten profil! Będziesz otrzymywać powiadomienia o nowych wpisach 🔔' : 'Przestałeś obserwować profil');
}

// Copy Profile Link
export function copyProfileLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link do profilu został skopiowany do schowka! 🔗');
    }).catch(() => {
        showToast('Skopiowano link!');
    });
}

// Radio Player Toggle
let isRadioPlaying = false;
const radioStreams = [
    "https://stream.zeno.fm/f97y7f6w30hvv",
    "https://stream.zeno.fm/f97y7f6w30hvv.aac"
];

export function toggleRadio() {
    const audio = document.getElementById('ccRadioAudio');
    const playIcon = document.getElementById('radioPlayIcon');
    if (!audio) return;
    
    if (!isRadioPlaying) {
        audio.src = radioStreams[0] + "?t=" + Date.now();
        audio.play().then(() => {
            isRadioPlaying = true;
            if (playIcon) playIcon.className = "fa-solid fa-pause";
            showToast('Radio Christian Culture Gra na Żywo! 📻✨');
        }).catch(e => {
            showToast('Błąd odtwarzania radia');
        });
    } else {
        audio.pause();
        isRadioPlaying = false;
        if (playIcon) playIcon.className = "fa-solid fa-play";
        showToast('Radio wstrzymane');
    }
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.toggleProfileHeart = toggleProfileHeart;
    window.toggleProfileFollow = toggleProfileFollow;
    window.copyProfileLink = copyProfileLink;
    window.toggleRadio = toggleRadio;
}
