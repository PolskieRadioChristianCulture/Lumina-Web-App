/**
 * ══════════════════════════════════════════════════════════════════════════
 * CC CONTENT REGISTRY — CLIENT ENGINE
 * Master Plan CC Global 2030 (Faza 1: CC Content Core)
 * ══════════════════════════════════════════════════════════════════════════
 */

import { ensureDbReady, getCurrentUser, getCurrentProfile } from '../lumina-db.js?v=registry_1';

let firestoreDb = null;
let currentItems = [];
let lastVisibleDoc = null;
let firstVisibleDoc = null;
let activeFilters = {
    search: '',
    type: '',
    status: '',
    language: ''
};

// Inicjalizacja komponentu
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initModalControls();
    initSearchAndFilters();
    initNewContentForm();

    try {
        const { db } = await ensureDbReady();
        firestoreDb = db;
        await loadContentRegistry();
    } catch (err) {
        console.error('[REGISTRY] Błąd inicjalizacji bazy Firestore:', err);
        renderError('Nie udało się połączyć z bazą danych CC Content Core: ' + err.message);
    }
});

// Paginowane ładowanie rejestru treści z Firestore (Cost Guard)
async function loadContentRegistry() {
    const tbody = document.getElementById('registryTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="10" class="py-12 text-center text-slate-500">
                <i class="fa-solid fa-circle-notch fa-spin text-cc-gold text-lg mb-2"></i>
                <div>Odpytywanie CC Content Core...</div>
            </td>
        </tr>
    `;

    try {
        const { collection, getDocs, query, orderBy, limit, where } = await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
        const colRef = collection(firestoreDb, 'cc_content');

        let q = query(colRef, orderBy('createdAt', 'desc'), limit(25));

        if (activeFilters.type) {
            q = query(colRef, where('type', '==', activeFilters.type), orderBy('createdAt', 'desc'), limit(25));
        } else if (activeFilters.status) {
            q = query(colRef, where('status', '==', activeFilters.status), orderBy('createdAt', 'desc'), limit(25));
        } else if (activeFilters.language) {
            q = query(colRef, where('originalLanguage', '==', activeFilters.language), orderBy('createdAt', 'desc'), limit(25));
        }

        const snapshot = await getDocs(q);
        currentItems = [];

        snapshot.forEach(docSnap => {
            currentItems.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Filtr wyszukiwania lokalnego
        let filtered = currentItems;
        if (activeFilters.search) {
            const term = activeFilters.search.toLowerCase().trim();
            filtered = currentItems.filter(item => {
                return (
                    (item.contentId && item.contentId.toLowerCase().includes(term)) ||
                    (item.title && item.title.toLowerCase().includes(term)) ||
                    (item.author && item.author.toLowerCase().includes(term)) ||
                    (item.series && item.series.toLowerCase().includes(term))
                );
            });
        }

        renderTable(filtered);
        document.getElementById('paginationSummary').textContent = `Wyświetlono ${filtered.length} z ${currentItems.length} załadowanych pozycji`;

    } catch (err) {
        console.error('[REGISTRY] Błąd odczytu kolekcji cc_content:', err);
        renderError('Błąd odczytu danych: ' + err.message);
    }
}

// Renderowanie tabeli rejestru
function renderTable(items) {
    const tbody = document.getElementById('registryTableBody');
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="py-12 text-center text-slate-500">
                    <i class="fa-solid fa-folder-open text-2xl mb-2 text-slate-600"></i>
                    <div>Brak materiałów spełniających kryteria.</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const rightsType = item.rights?.ownership || 'UNKNOWN';
        const rightsBadgeClass = rightsType === 'CC_OWNED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
            (rightsType === 'UNKNOWN' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30');

        const statusClass = item.status === 'PUBLISHED' || item.status === 'VERIFIED' ? 'text-emerald-400' :
            (item.status === 'ARCHIVED' ? 'text-slate-500 line-through' : 'text-amber-400');

        const createdDate = item.createdAt ? item.createdAt.substring(0, 10) : '-';

        return `
            <tr class="hover:bg-white/[0.02] transition cursor-pointer group" onclick="window.openDetailModal('${item.contentId}')">
                <td class="py-3 px-4 font-mono font-bold text-cc-gold group-hover:underline whitespace-nowrap">
                    ${item.contentId || item.id}
                </td>
                <td class="py-3 px-4">
                    <div class="font-bold text-slate-200 line-clamp-1">${escapeHtml(item.title || 'Bez tytułu')}</div>
                    <div class="text-[11px] text-slate-500 line-clamp-1">${escapeHtml(item.series || item.category || '-')}</div>
                </td>
                <td class="py-3 px-4 font-mono text-[11px] text-slate-300">
                    ${item.type || 'DEVOTIONAL'}
                </td>
                <td class="py-3 px-4 font-bold uppercase text-[11px]">
                    ${item.originalLanguage || 'pl'}
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${rightsBadgeClass}">
                        ${rightsType}
                    </span>
                </td>
                <td class="py-3 px-4 font-semibold text-[11px] ${statusClass}">
                    ${item.status || 'DRAFT'}
                </td>
                <td class="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                    ${item.variantsCount || '3'}
                </td>
                <td class="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                    ${item.publicationsCount || '3'}
                </td>
                <td class="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    ${createdDate}
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap" onclick="event.stopPropagation()">
                    <button type="button" onclick="window.openDetailModal('${item.contentId}')" class="px-2.5 py-1 rounded bg-obsidian border border-obsidian-border text-slate-300 hover:text-cc-gold hover:border-cc-gold/40 transition mr-1" title="Podgląd">
                        <i class="fa-solid fa-eye text-[11px]"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Otwieranie karty szczegółów materiału
window.openDetailModal = async function(contentId) {
    const modal = document.getElementById('detailModal');
    if (!modal) return;

    modal.classList.remove('hidden');

    document.getElementById('detailBadgeId').textContent = contentId;
    document.getElementById('detailDocId').textContent = contentId;
    document.getElementById('detailTitle').textContent = 'Pobieranie szczegółów...';

    try {
        const { doc, getDoc, collection, getDocs, orderBy, query } = await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
        const docRef = doc(firestoreDb, 'cc_content', contentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert('Treść nie istnieje w bazie.');
            modal.classList.add('hidden');
            return;
        }

        const data = docSnap.data();

        // 1. Overview
        document.getElementById('detailTitle').textContent = data.title || 'Bez tytułu';
        document.getElementById('detailType').textContent = data.type || 'DEVOTIONAL';
        document.getElementById('detailStatus').textContent = data.status || 'DRAFT';
        document.getElementById('detailAuthor').textContent = data.author || 'Christian Culture';
        document.getElementById('detailSeries').textContent = data.series || '-';
        document.getElementById('detailCategory').textContent = data.category || '-';
        document.getElementById('detailSummary').textContent = data.summary || 'Brak podsumowania.';
        document.getElementById('detailDescription').textContent = data.description || 'Brak opisu rozszerzonego.';

        // Rights
        const ownership = data.rights?.ownership || 'UNKNOWN';
        document.getElementById('detailRightsOwnership').textContent = ownership;
        document.getElementById('detailRightsLicense').textContent = data.rights?.licenseName || 'Standard CC';

        // Biblical References
        const bibleContainer = document.getElementById('detailBibleList');
        if (data.biblicalReferences && data.biblicalReferences.length > 0) {
            bibleContainer.innerHTML = data.biblicalReferences.map(b => `
                <div class="p-2 rounded bg-obsidian-card border border-obsidian-border">
                    <div class="font-bold text-cc-gold">${b.book} ${b.chapter}:${b.verseStart}${b.verseEnd ? '-' + b.verseEnd : ''} (${b.translation || 'UBG'})</div>
                    ${b.quoteText ? `<div class="italic text-slate-300 mt-1">„${escapeHtml(b.quoteText)}”</div>` : ''}
                </div>
            `).join('');
        } else {
            bibleContainer.textContent = 'Brak przypisanych wersetów biblijnych.';
        }

        // Legacy Sources
        const legacyContainer = document.getElementById('detailLegacyList');
        if (data.legacySources && data.legacySources.length > 0) {
            legacyContainer.innerHTML = data.legacySources.map(l => `
                <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">${l.system}</span>
                    <span class="text-slate-300">${l.collection} / <code>${l.documentId}</code></span>
                </div>
            `).join('');
        } else {
            legacyContainer.textContent = 'Brak powiązań legacy.';
        }

        // 2. Podkolekcje: Variants, Assets, Publications, Audit
        const [varSnap, astSnap, pubSnap, audSnap] = await Promise.all([
            getDocs(collection(docRef, 'variants')),
            getDocs(collection(docRef, 'assets')),
            getDocs(collection(docRef, 'publications')),
            getDocs(query(collection(docRef, 'audit'), orderBy('timestamp', 'desc')))
        ]);

        document.getElementById('countVariants').textContent = varSnap.size;
        document.getElementById('countAssets').textContent = astSnap.size;
        document.getElementById('countPubs').textContent = pubSnap.size;
        document.getElementById('countAudit').textContent = audSnap.size;

        renderVariantsList(varSnap);
        renderAssetsList(astSnap);
        renderPublicationsList(pubSnap);
        renderAuditList(audSnap);

    } catch (err) {
        console.error('[REGISTRY] Błąd ładowania szczegółów:', err);
        alert('Błąd pobierania danych szczegółowych: ' + err.message);
    }
};

function renderVariantsList(snap) {
    const container = document.getElementById('variantsContainer');
    if (snap.empty) {
        container.innerHTML = '<div class="text-slate-500 italic">Brak zarejestrowanych wariantów.</div>';
        return;
    }
    container.innerHTML = snap.docs.map(d => {
        const v = d.data();
        return `
            <div class="p-3 bg-obsidian rounded-xl border border-obsidian-border space-y-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-cc-gold">${v.variantId}</span>
                        <span class="px-1.5 py-0.5 rounded bg-cc-gold/10 text-cc-gold border border-cc-gold/30 uppercase text-[10px] font-bold">${v.language || 'pl'} (${v.locale || 'pl-PL'})</span>
                        <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">${v.format}</span>
                    </div>
                    <span class="text-emerald-400 font-bold">${v.qualityStatus || 'VERIFIED'}</span>
                </div>
                <div class="text-slate-200 font-semibold">${escapeHtml(v.title || '')}</div>
                <div class="p-2.5 rounded bg-obsidian-card font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap">${escapeHtml(v.body || '')}</div>
            </div>
        `;
    }).join('');
}

function renderAssetsList(snap) {
    const container = document.getElementById('assetsContainer');
    if (snap.empty) {
        container.innerHTML = '<div class="text-slate-500 italic">Brak zarejestrowanych zasobów.</div>';
        return;
    }
    container.innerHTML = snap.docs.map(d => {
        const a = d.data();
        return `
            <div class="p-3 bg-obsidian rounded-xl border border-obsidian-border flex items-center justify-between">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-cc-gold font-bold">${a.assetId}</span>
                        <span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold">${a.type}</span>
                        <span class="text-slate-400 text-[11px]">${a.mimeType}</span>
                    </div>
                    <div class="text-[11px] font-mono text-slate-500">SHA-256: ${a.checksum || 'NOT_COMPUTED'}</div>
                    <div class="text-[11px] text-slate-400 truncate max-w-lg">${a.url}</div>
                </div>
                <div class="text-right">
                    <div class="font-mono text-slate-300">${(a.size ? (a.size / 1024).toFixed(1) + ' KB' : '-')}</div>
                    <a href="${a.url}" target="_blank" class="text-cc-gold hover:underline text-[11px]">Otwórz <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>
                </div>
            </div>
        `;
    }).join('');
}

function renderPublicationsList(snap) {
    const container = document.getElementById('publicationsContainer');
    if (snap.empty) {
        container.innerHTML = '<div class="text-slate-500 italic">Brak zarejestrowanych publikacji.</div>';
        return;
    }
    container.innerHTML = snap.docs.map(d => {
        const p = d.data();
        const isVer = p.status === 'VERIFIED';
        return `
            <div class="p-3 bg-obsidian rounded-xl border border-obsidian-border space-y-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-white">${p.platform}</span>
                        <span class="font-mono text-[11px] text-slate-400">(${p.publicationId})</span>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isVer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}">
                        ${p.status}
                    </span>
                </div>
                <div class="text-slate-300">
                    <span class="text-slate-500">Public URL:</span>
                    <a href="${p.publicUrl}" target="_blank" class="text-cc-gold hover:underline ml-1">${p.publicUrl || 'Brak'}</a>
                </div>
                ${p.verificationEvidence ? `
                    <div class="p-2 rounded bg-obsidian-card font-mono text-[10px] text-slate-400 border border-obsidian-border">
                        <span class="text-emerald-400 font-bold">DOWÓD WERYFIKACJI:</span> ${p.verificationEvidence.statusText || p.verificationEvidence.method}
                        <div>Data: ${p.verificationEvidence.timestamp} | Weryfikator: ${p.verificationEvidence.verifiedBy}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderAuditList(snap) {
    const container = document.getElementById('auditContainer');
    if (snap.empty) {
        container.innerHTML = '<div class="text-slate-500 italic">Brak wpisów w historii audytu.</div>';
        return;
    }
    container.innerHTML = snap.docs.map(d => {
        const a = d.data();
        return `
            <div class="p-2 rounded bg-obsidian border border-obsidian-border flex items-center justify-between">
                <div>
                    <span class="text-cc-gold font-bold">${a.action}</span>
                    <span class="text-slate-400 ml-2">przez: ${escapeHtml(a.actor || 'system')}</span>
                    <div class="text-slate-500 text-[10px]">Źródło: ${escapeHtml(a.source || '-')}</div>
                </div>
                <div class="text-slate-500">${a.timestamp ? a.timestamp.replace('T', ' ').substring(0, 19) : '-'}</div>
            </div>
        `;
    }).join('');
}

// Inicjalizacja zakładek modala
function initTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => {
                b.classList.remove('border-cc-gold', 'text-cc-gold');
                b.classList.add('border-transparent', 'text-slate-400');
            });
            btn.classList.add('border-cc-gold', 'text-cc-gold');
            btn.classList.remove('border-transparent', 'text-slate-400');

            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
            const target = document.getElementById(tabId);
            if (target) target.classList.remove('hidden');
        });
    });
}

// Kontrola modalów
function initModalControls() {
    const detailModal = document.getElementById('detailModal');
    const newModal = document.getElementById('newContentModal');

    document.getElementById('btnCloseDetailModal')?.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });

    document.getElementById('btnOpenNewContent')?.addEventListener('click', () => {
        newModal.classList.remove('hidden');
    });

    document.getElementById('btnCloseNewModal')?.addEventListener('click', () => {
        newModal.classList.add('hidden');
    });

    document.getElementById('btnCancelNew')?.addEventListener('click', () => {
        newModal.classList.add('hidden');
    });

    // Soft delete z poziomu modala
    document.getElementById('btnArchiveContent')?.addEventListener('click', async () => {
        const contentId = document.getElementById('detailBadgeId').textContent;
        if (!confirm(`Czy na pewno chcesz zarchiwizować materiał ${contentId}? Operacja zachowa historię (Soft Delete).`)) return;

        try {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
            const docRef = doc(firestoreDb, 'cc_content', contentId);
            await updateDoc(docRef, {
                status: 'ARCHIVED',
                updatedAt: new Date().toISOString()
            });
            alert('Pomyślnie zarchiwizowano materiał ' + contentId);
            detailModal.classList.add('hidden');
            await loadContentRegistry();
        } catch (err) {
            alert('Błąd archiwizacji: ' + err.message);
        }
    });
}

// Wyszukiwanie i filtry
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    const filterLanguage = document.getElementById('filterLanguage');
    const btnRefresh = document.getElementById('btnRefreshList');

    let debounceTimer;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            activeFilters.search = e.target.value;
            loadContentRegistry();
        }, 300);
    });

    filterType?.addEventListener('change', (e) => {
        activeFilters.type = e.target.value;
        loadContentRegistry();
    });

    filterStatus?.addEventListener('change', (e) => {
        activeFilters.status = e.target.value;
        loadContentRegistry();
    });

    filterLanguage?.addEventListener('change', (e) => {
        activeFilters.language = e.target.value;
        loadContentRegistry();
    });

    btnRefresh?.addEventListener('click', () => {
        loadContentRegistry();
    });
}

// Obsługa formularza nowej treści
function initNewContentForm() {
    const form = document.getElementById('newContentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('newTitle').value.trim();
        const type = document.getElementById('newType').value;
        const language = document.getElementById('newLanguage').value;
        const status = document.getElementById('newStatus').value;
        const author = document.getElementById('newAuthor').value.trim();
        const series = document.getElementById('newSeries').value.trim();
        const summary = document.getElementById('newSummary').value.trim();
        const description = document.getElementById('newDescription').value.trim();
        const ownership = document.getElementById('newOwnership').value;
        const translationAllowed = document.getElementById('chkTranslation').checked;
        const redistributionAllowed = document.getElementById('chkRedist').checked;

        if (ownership === 'UNKNOWN' && (status === 'PUBLISHED' || status === 'VERIFIED')) {
            alert('BŁĄD RIGHTS GUARD: Materiał z prawami autorskimi UNKNOWN nie może zostać opublikowany!');
            return;
        }

        const btnSubmit = document.getElementById('btnSubmitNew');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Zapisywanie w CC Content Core...';

        try {
            const { doc, runTransaction } = await import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js');
            const year = new Date().getFullYear();
            const counterRef = doc(firestoreDb, 'cc_content_meta', 'counters');

            // Bezpieczna transakcja generowania ID
            const newContentId = await runTransaction(firestoreDb, async (transaction) => {
                const cDoc = await transaction.get(counterRef);
                const yearKey = `year_${year}`;
                let nextNum = 1;
                if (cDoc.exists()) {
                    nextNum = (cDoc.data()[yearKey] || 0) + 1;
                    transaction.update(counterRef, { [yearKey]: nextNum, lastUpdatedAt: new Date().toISOString() });
                } else {
                    transaction.set(counterRef, { [yearKey]: nextNum, lastUpdatedAt: new Date().toISOString() });
                }
                return `CC-${year}-${String(nextNum).padStart(6, '0')}`;
            });

            const contentRef = doc(firestoreDb, 'cc_content', newContentId);
            const now = new Date().toISOString();

            const masterPayload = {
                contentId: newContentId,
                schemaVersion: 1,
                type,
                status,
                originalLanguage: language,
                title,
                description,
                summary,
                author: author || 'Christian Culture',
                publisher: 'Christian Culture',
                series,
                category: 'Formacja Duchowa',
                tags: [type.toLowerCase(), series.toLowerCase()].filter(Boolean),
                biblicalReferences: [],
                source: 'Mission Control UI',
                sourceType: 'ORIGINAL_PRODUCTION',
                sourceUrl: null,
                rights: {
                    ownership,
                    translationAllowed,
                    editingAllowed: true,
                    redistributionAllowed,
                    monetizationAllowed: false,
                    licenseName: 'Christian Culture Standard CC-BY-NC-ND 4.0'
                },
                legacySources: [],
                legacySourceKeys: [],
                parentContentId: null,
                relationshipType: null,
                media: {
                    thumbnailAssetId: null,
                    masterAudioAssetId: null,
                    masterVideoAssetId: null
                },
                createdAt: now,
                updatedAt: now,
                publishedAt: (status === 'PUBLISHED' ? now : null),
                createdBy: 'Mission Control UI',
                updatedBy: 'Mission Control UI'
            };

            await runTransaction(firestoreDb, async (tx) => {
                tx.set(contentRef, masterPayload);
            });

            alert(`✅ Pomyślnie utworzono materiał w CC Content Core:\nID: ${newContentId}\nTytuł: ${title}`);
            document.getElementById('newContentModal').classList.add('hidden');
            form.reset();
            await loadContentRegistry();

        } catch (err) {
            console.error('[REGISTRY] Błąd zapisu materiału:', err);
            alert('Błąd zapisu nowej treści: ' + err.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Zarejestruj w CC Content Core';
        }
    });
}

function renderError(msg) {
    const tbody = document.getElementById('registryTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="py-12 text-center text-red-400">
                    <i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
                    <div>${escapeHtml(msg)}</div>
                </td>
            </tr>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
