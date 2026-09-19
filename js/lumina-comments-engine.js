/**
 * ══════════════════════════════════════════════════════════════════════
 * LUMINA UNIVERSAL COMMENTS & FAITH DIALOGUE ENGINE v2.5.0
 * Pancerne działanie na każdej podstronie portalu bez wyjątków
 * ══════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function safeShowToast(msg) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg);
        } else {
            console.log('[LuminaComments]', msg);
        }
    }

    let _commentsBroadcastChan = null;
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            _commentsBroadcastChan = new BroadcastChannel('lumina_comments_channel');
        }
    } catch(e) {}

    const LuminaCommentsEngine = {
    _commentsKeyPrefix: 'lumina_comments_v2_',

    // Baza zaufanych profili misyjnych do naturalnego dialogu
    _trustedMissionProfiles: [
        { slug: 'andrzejthiel', name: 'Andrzej Thiel', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
        { slug: 'jolawojcik', name: 'Jola Wójcik', avatar: 'avatar_jolawojcik.jpg', badge: '🕊️ Wstawiennik LUMINA' },
        { slug: 'zbyszekgieron', name: 'Zbyszek Gieroń', avatar: 'avatar_zbyszek_gieron.jpg', badge: '🛡️ Świadectwo Wiary' },
        { slug: 'zofiadudek', name: 'Zofia Dudek', avatar: 'avatar_zofia_dudek.jpg', badge: '🌿 Mądrość & Modlitwa' },
        { slug: 'ccmen', name: 'CC MEN', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota' },
        { slug: 'ccwomen', name: 'CC WOMEN', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kobieca Formacja' },
        { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', avatar: 'studiodobregoslowa_avatar.jpg', badge: '🎬 Partner Medialny' },
        { slug: 'pawelmurawski', name: 'Paweł Murawski', avatar: 'avatar_pawel_murawski.jpg', badge: '✨ Społeczność LUMINA' },
        { slug: 'magdalena', name: 'Magdalena', avatar: 'avatar_magdalena.png', badge: '🕊️ Poznań' }
    ],

    // Szablony naturalnych wypowiedzi budujących wiarę
    _dialogueTemplates: {
        devotional: [
            "Amen! Chwała Bogu za to słowo na dzisiejszy dzień. Niech Boży pokój napełnia dziś każde serce i każdą rodzinę. 🕊️✨",
            "Dziękuję za to poranne umocnienie! Słowo Boże ma niesamowitą moc przemiany myślenia. Błogosławię całą społeczność! ❤️🙏",
            "Potężna prawda, która stawia na nogi w trudnym czasie. Chwała Panu Jezusowi! Stoję z Wami w braterskiej modlitwie. ✝️🛡️",
            "Cudowna, głęboka refleksja. Warto zatrzymać się w tym zabieganym świecie i oddać wszystko Stwórcy. Błogosławionego dnia! 🌿🌸",
            "Tak jest! Prawdziwa siła to wierność Bogu każdego dnia bez kompromisów. Chwała Najwyższemu! 🛡️⚡",
            "Dla wszystkich małżeństw i par polecam gorąco ten wspaniały biblijny wykład Romana Chałupki: https://polskieradio.cc/randki-malzenstwo - niesamowicie buduje relacje! ❤️💍",
            "Przepiękne słowa pełne nadziei. Polecam też to poruszające nagranie Słowa Bożego: https://www.youtube.com/watch?v=OWKwixyQq2c 🌸🕊️"
        ],
        prayer: [
            "Dołączam do modlitwy całym sercem! Jezus jest z Tobą w tej sytuacji i On ma ostatnie słowo. Trwaj w pokoju! 🙏🕊️",
            "Staję w wyłomie razem z Tobą, bracie/siostro. Żaden problem nie jest za duży dla naszego Pana! 🛡️✝️",
            "Wstawiam się w Imieniu Jezusa. Wierzymy i ufamy Bożej obietnicy uzdrowienia i ratunku! ✨🙏",
            "Pamiętajmy o narodowym wstawiennictwie na żywo: https://polskieradio.cc/modlitwa - módlmy się razem w czasie rzeczywistym! 🕊️🛡️",
            "Nie jesteś sam w tej walce. Nasza wspólnota łączy się w modlitwie. Bóg już działa! ❤️🕊️"
        ],
        media: [
            "Wspaniały klimat uwielbienia! Niech ta muzyka i Słowo zanoszą chwałę przed sam Boży Tron. Podajemy dalej! 🎬📖",
            "A na wieczorne umocnienie polecam wartościowe kino chrześcijańskie bez reklam: https://polskieradio.cc/vod - poruszające filmy wiary! 🍿✨",
            "Ta stacja wnosi tyle pokoju i światła do mojego domu. Słucham podczas codziennych obowiązków i odpoczynku. Dziękuję! 🎵🌿",
            "Doskonała jakość i niesamowite namaszczenie. Niech Bóg błogosławi całą redakcję Christian Culture! 📻✨"
        ],
        general: [
            "Piękne świadectwo Bożej obecności w codzienności! Dziękuję za podzielenie się tym na Tablicy. Błogosławieństwa! ✨🕊️",
            "Bardzo cenna i inspirująca myśl. Wzrastajmy razem w prawdzie i miłości Chrystusa. Pozdrawiam serdecznie! ❤️",
            "Bóg jest dobry w każdym czasie. Niech Jego łaska towarzyszy nam wszystkim przez cały ten tydzień! 🙏🌿",
            "Świetnie to ująłeś! Żywa wiara wyraża się w konkretnych czynach i życzliwości wobec drugiego człowieka. ✝️✨"
        ]
    },

    getCommentsCss() {
        return ".comments-section-v2displaynonebackgroundrgba(814280.96)backdrop-filterblur(14px)-webkit-backdrop-filterblur(14px)border-top1px solid rgba(212169740.22)border-radius0 0 20px 20pxpadding16px 18px 20pxbox-sizingborder-boxwidth100%animationcommentsSlideDown 0.26s cubic-bezier(0.1610.31).comments-section-v2.opendisplayblock@keyframes commentsSlideDownfromopacity0transformtranslateY(-8px)toopacity1transformtranslateY(0).comment-faith-chips-bardisplayflexgap8pxoverflow-xautopadding-bottom10pxmargin-bottom12pxscrollbar-widthnonebox-sizingborder-boxwidth100%.comment-faith-chips-bar-webkit-scrollbardisplaynone.comment-faith-chipbackgroundrgba(2552552550.06)border1px solid rgba(212169740.3)color#f1f5f9border-radius20pxpadding6px 13pxfont-size0.78remfont-weight600white-spacenowrapcursorpointerdisplayinline-flexalign-itemscentergap6pxtransitionall 0.2s cubic-bezier(0.20.80.21)user-selectnone.comment-faith-chiphoverbackgroundrgba(212169740.18)border-color#facc15color#ffftransformtranslateY(-1px).comment-faith-chipactivetransformscale(0.96).comment-input-composer-v2displayflexgap10pxalign-itemsflex-startmargin-bottom18pxbackgroundrgba(2552552550.03)padding10px 12pxborder-radius16pxborder1px solid rgba(2552552550.08)box-sizingborder-boxwidth100%.comment-my-avatarwidth38pxheight38pxborder-radius50%object-fitcoverborder1.5px solid rgba(212169740.4)flex-shrink0.comment-input-wrapflex1positionrelativedisplayflexflex-directioncolumngap6pxbox-sizingborder-boxmin-width0.comment-textarea-v2width100%box-sizingborder-boxbackgroundrgba(1523420.85)border1px solid rgba(2552552550.16)border-radius12pxpadding10px 14pxcolor#f8fafcfont-size0.88remfont-familyinheritresizenonemin-height44pxmax-height120pxoutlinenoneline-height1.45transitionborder-color 0.2sbox-shadow 0.2s.comment-textarea-v2focusborder-color#facc15box-shadow0 0 0 2px rgba(250204210.2).comment-submit-bardisplayflexjustify-contentspace-betweenalign-itemscenter.comment-replying-to-badgefont-size0.74remcolor#38bdf8displayflexalign-itemscentergap4px.comment-cancel-reply-btnbackgroundnonebordernonecolor#f87171cursorpointerfont-size0.72rempadding2px 4px.comment-submit-btn-v2backgroundlinear-gradient(135deg#d4a94a#facc15)color#0b1120bordernonefont-weight800font-size0.82rempadding8px 18pxborder-radius24pxcursorpointerdisplayinline-flexalign-itemscentergap6pxbox-shadow0 4px 12px rgba(212169740.35)transitionall 0.2smargin-leftautomin-height38px.comment-submit-btn-v2hovertransformtranslateY(-1px)box-shadow0 6px 16px rgba(212169740.5).comment-submit-btn-v2activetransformscale(0.97).comments-list-v2displayflexflex-directioncolumngap12px.comment-item-v2displayflexgap10pxpositionrelativetransitionbackground-color 0.2s.comment-item-v2.pinned-commentbackgroundrgba(250204210.05)border1px solid rgba(250204210.25)border-radius14pxpadding10pxbox-shadow0 2px 10px rgba(250204210.08).comment-avatar-linkflex-shrink0.comment-avatar-v2width34pxheight34pxborder-radius50%object-fitcoverborder1.5px solid rgba(2552552550.12).comment-body-v2flex1min-width0.comment-bubble-v2backgroundrgba(2552552550.05)border1px solid rgba(2552552550.08)border-radius14pxpadding9px 13pxcolor#f1f5f9font-size0.85remline-height1.5positionrelative.comment-header-rowdisplayflexalign-itemscenterjustify-contentspace-betweenmargin-bottom4pxgap8px.comment-author-namefont-weight700color#ffftext-decorationnonefont-size0.86remdisplayinline-flexalign-itemscentergap6px.comment-author-namehovercolor#facc15.comment-badge-pillfont-size0.65remfont-weight700padding1px 7pxborder-radius10pxbackgroundrgba(212169740.18)border1px solid rgba(212169740.35)color#fef08aletter-spacing0.3px.comment-pinned-indicatorfont-size0.68remfont-weight800color#facc15displayinline-flexalign-itemscentergap4pxmargin-bottom4px.comment-time-v2font-size0.72remcolor#94a3b8white-spacenowrap.comment-edited-tagfont-size0.68remcolor#94a3b8font-styleitalicmargin-left4px.comment-text-contentcolor#e2e8f0word-breakbreak-word.comment-actions-bar-v2displayflexalign-itemscentergap12pxmargin-top5pxpadding-left4px.comment-action-linkbackgroundnonebordernonecolor#94a3b8font-size0.75remfont-weight600cursorpointerdisplayinline-flexalign-itemscentergap4pxpadding2px 4pxtransitioncolor 0.15stransform 0.15s.comment-action-linkhovercolor#fff.comment-action-link.active-likecolor#f43f5e.comment-action-link.active-amencolor#facc15font-weight800.comment-more-btnbackgroundnonebordernonecolor#64748bcursorpointerpadding4px 6pxfont-size0.85remborder-radius6pxtransitionall 0.2smargin-leftauto.comment-more-btnhovercolor#cbd5e1backgroundrgba(2552552550.08).comment-dropdown-menupositionabsoluteright10pxtop30pxbackground#0f172aborder1px solid rgba(2552552550.15)border-radius12pxbox-shadow0 10px 25px rgba(0000.6)padding6pxz-index50displaynoneflex-directioncolumnmin-width140px.comment-dropdown-menu.opendisplayflex.comment-dropdown-itembackgroundnonebordernonecolor#cbd5e1font-size0.78rempadding7px 10pxtext-alignleftcursorpointerborder-radius8pxdisplayflexalign-itemscentergap8pxtransitionbackground 0.15s.comment-dropdown-itemhoverbackgroundrgba(2552552550.08)color#fff.comment-dropdown-item.item-dangercolor#f87171.comment-dropdown-item.item-dangerhoverbackgroundrgba(23968680.15).comment-hidden-placeholderbackgroundrgba(2552552550.03)border1px dashed rgba(2552552550.15)border-radius10pxpadding8px 12pxfont-size0.75remcolor#94a3b8displayflexalign-itemscenterjustify-contentspace-betweengap8px.btn-reveal-hiddenbackgroundnoneborder1px solid rgba(2552552550.2)color#facc15font-size0.72rempadding2px 8pxborder-radius10pxcursorpointer.comment-inline-edit-wrapdisplayflexflex-directioncolumngap8pxmargin-top4px.comment-inline-edit-textareawidth100%backgroundrgba(1523420.95)border1px solid #facc15border-radius10pxpadding8px 10pxcolor#ffffont-size0.85remfont-familyinheritresizeverticalmin-height50px.comment-inline-edit-buttonsdisplayflexjustify-contentflex-endgap6px.comment-edit-btn-savebackground#facc15color#0b1120bordernonefont-weight700font-size0.74rempadding4px 12pxborder-radius14pxcursorpointer.comment-edit-btn-cancelbackgroundrgba(2552552550.1)color#cbd5e1bordernonefont-size0.74rempadding4px 10pxborder-radius14pxcursorpointer.comment-active-linkcolor#38bdf8text-decorationunderlinetext-underline-offset3pxfont-weight600displayinline-flexalign-itemscentergap4pxword-breakbreak-alltransitioncolor 0.2s ease.comment-active-linkhovercolor#7dd3fctext-decorationunderline.comment-untrusted-linkcolor#94a3b8text-decorationnonefont-size0.84remword-breakbreak-all.comment-preview-cardmargin-top10pxbackgroundrgba(1523420.85)border1px solid rgba(212169740.35)border-radius14pxoverflowhiddendisplayflexflex-directioncolumnbox-shadow0 4px 16px rgba(0000.4)transitiontransform 0.2s easeborder-color 0.2s easemax-width100%box-sizingborder-box.comment-preview-cardhoverborder-colorrgba(250204210.7).comment-preview-thumb-wrappositionrelativewidth100%aspect-ratio16 / 9max-height180pxbackground#000overflowhidden.comment-preview-thumbwidth100%height100%object-fitcoverdisplayblocktransitiontransform 0.3s ease.comment-preview-cardhover .comment-preview-thumbtransformscale(1.03).comment-preview-play-overlaypositionabsolutetop50%left50%transformtranslate(-50%-50%)backgroundrgba(0000.65)border2px solid #facc15color#fffwidth46pxheight46pxborder-radius50%displayflexalign-itemscenterjustify-contentcenterfont-size1.1rembox-shadow0 0 16px rgba(250204210.5)cursorpointertransitionall 0.2s ease.comment-preview-cardhover .comment-preview-play-overlaybackground#facc15color#0b1120transformtranslate(-50%-50%) scale(1.1).comment-preview-bodypadding10px 14px 12pxdisplayflexflex-directioncolumngap4px.comment-preview-badge-rowdisplayflexalign-itemscenterjustify-contentspace-betweenmargin-bottom2px.comment-preview-badgefont-size0.68remfont-weight800text-transformuppercaseletter-spacing0.5pxpadding2px 8pxborder-radius6pxbackgroundrgba(212169740.2)color#fef08aborder1px solid rgba(212169740.4)displayinline-flexalign-itemscentergap4px.comment-preview-badge.badge-youtubebackgroundrgba(23968680.2)color#fca5a5border-colorrgba(23968680.4).comment-preview-domainfont-size0.7remcolor#94a3b8.comment-preview-titlefont-size0.88remfont-weight700color#fffline-height1.35margin0.comment-preview-descfont-size0.78remcolor#cbd5e1line-height1.4margin0display-webkit-box-webkit-line-clamp2-webkit-box-orientverticaloverflowhidden.comment-preview-footermargin-top6pxdisplayflexalign-itemscenterjustify-contentflex-endgap8px.comment-preview-btnbackgroundlinear-gradient(135deg#d4a94a#facc15)color#0b1120bordernonefont-weight700font-size0.74rempadding5px 12pxborder-radius14pxcursorpointerdisplayinline-flexalign-itemscentergap5pxtext-decorationnonetransitionfilter 0.2s easetransform 0.1s ease.comment-preview-btnhoverfilterbrightness(1.1)transformtranslateY(-1px).comment-yt-embed-wrappositionrelativewidth100%aspect-ratio16 / 9min-height180pxborder-radius12pxoverflowhiddenmargin-top8pxborder1px solid rgba(250204210.3)box-shadow0 4px 16px rgba(0000.5).comment-yt-embed-wrap iframewidth100%height100%bordernonedisplayblock";
    },

    ensureStylesInjected() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('lumina-comments-styles-v2')) return;
        try {
            const styleEl = document.createElement('style');
            styleEl.id = 'lumina-comments-styles-v2';
            styleEl.textContent = this.getCommentsCss();
            document.head.appendChild(styleEl);
        } catch(e) {}
    },

    _isAttaching: false,

    autoAttachToAllFeedCards() {
        if (typeof document === 'undefined' || this._isAttaching) return;
        this._isAttaching = true;
        try {
            this.ensureStylesInjected();
            const cards = document.querySelectorAll('.feed-card:not([data-comments-attached]), .feed-post-card:not([data-comments-attached]), .post-card:not([data-comments-attached]), article.feed-post-card:not([data-comments-attached]), article:not([data-comments-attached])');
            cards.forEach(card => {
                const footer = card.querySelector('.post-actions-bar, .post-actions, .post-footer, .feed-actions, .post-act-bar');
                if (!footer && !card.classList.contains('feed-card') && !card.classList.contains('feed-post-card') && !card.classList.contains('post-card')) {
                    return; // pomin karty bez paska akcji
                }
                card.setAttribute('data-comments-attached', 'true');
                let rawId = card.id || card.getAttribute('data-post-id');
                if (!rawId) {
                    const snippet = (card.textContent || '').trim().substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
                    rawId = 'post_gen_' + (snippet || 'card') + '_' + Math.abs((card.textContent || '').length);
                    card.id = rawId;
                }
                const postId = rawId.startsWith('post_') ? rawId.replace(/^post_/, '') : rawId;
                const targetSecId = 'comments_' + rawId;
                const fallbackSecId = 'comments_' + postId;

                let drawer = card.querySelector('.comments-section-v2');
                if (!drawer) {
                    drawer = document.createElement('div');
                    drawer.className = 'comments-section-v2';
                    drawer.id = targetSecId;
                    card.appendChild(drawer);
                }

                if (!card.querySelector('.action-comments')) {
                    if (footer) {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'post-action-btn action-comments post-act-btn';
                        btn.title = 'Komentarze';
                        const count = this.getCommentCount(rawId) || this.getCommentCount(postId) || 2;
                        btn.innerHTML = `<i class="fa-solid fa-comment-dots"></i><span class="btn-text"> Komentarze (${count})</span>`;
                        btn.setAttribute('onclick', `toggleComments('${rawId}')`);
                        btn.onclick = (e) => {
                            if (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                            this.toggleComments(rawId);
                        };

                        const shareOrMsg = footer.querySelector('.action-share, [onclick*="share"], [onclick*="openMessageModal"], .btn-action-secondary');
                        if (shareOrMsg) {
                            footer.insertBefore(btn, shareOrMsg);
                        } else {
                            footer.appendChild(btn);
                        }
                    }
                }
            });
        } catch(err) {
            console.warn('[LuminaComments] autoAttach note:', err);
        } finally {
            this._isAttaching = false;
        }
    },

    init() {
        this.ensureStylesInjected();
        this.autoAttachToAllFeedCards();

        if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
            let debounceTimer = null;
            const observer = new MutationObserver((mutations) => {
                if (this._isAttaching) return;
                let hasRelevantNodes = false;
                for (const m of mutations) {
                    for (const n of m.addedNodes) {
                        if (n.nodeType === 1 && !n.classList?.contains('comments-section-v2') && !n.classList?.contains('comment-item-v2')) {
                            hasRelevantNodes = true;
                            break;
                        }
                    }
                    if (hasRelevantNodes) break;
                }
                if (!hasRelevantNodes) return;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.autoAttachToAllFeedCards();
                }, 300);
            });
            const target = document.body || document.documentElement;
            if (target) {
                observer.observe(target, { childList: true, subtree: true });
            }
        }
        if (_commentsBroadcastChan && !this._hasBroadcastListener) {
            this._hasBroadcastListener = true;
            _commentsBroadcastChan.onmessage = (ev) => {
                const data = ev.data;
                if (data && data.postId) {
                    this.updatePostCommentCountBadge(data.postId);
                    const container = document.getElementById('comments_' + data.postId);
                    if (container && container.classList.contains('open')) {
                        this.refreshCommentsList(data.postId);
                    }
                }
            };
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (ev) => {
                if (ev.key && ev.key.startsWith(this._commentsKeyPrefix)) {
                    const postId = ev.key.replace(this._commentsKeyPrefix, '');
                    this.updatePostCommentCountBadge(postId);
                    const container = document.getElementById('comments_' + postId);
                    if (container && container.classList.contains('open')) {
                        this.refreshCommentsList(postId);
                    }
                }
            });
        }
    },

    getCurrentCommenter() {
        const curProfile = (typeof getCurrentProfile === 'function' ? getCurrentProfile() : null);
        const curUser = (typeof getCurrentUser === 'function' ? getCurrentUser() : null);

        let name = curProfile?.name || curUser?.displayName || 'Gość LUMINA';
        let slug = curProfile?.slug || (curUser?.email ? curUser.email.split('@')[0] : 'user');
        let avatar = curProfile?.avatar || curUser?.photoURL || 'lumina_icon.jpg';
        let badge = curProfile?.badge || curProfile?.job || 'Społeczność LUMINA';

        // Auto-detect Cezary Rogowski if admin
        const isAdmin = curProfile?.isAdmin || (curUser?.email && (curUser.email.includes('nazirczarkes') || curUser.email.includes('czarkes')));
        if (isAdmin || slug === 'cezaryrgowski') {
            name = 'Cezary Rogowski';
            slug = 'cezaryrgowski';
            avatar = 'avatar_cezary_official.jpg';
            badge = '👑 Założyciel CC';
        } else if (slug === 'wiolettarogowska' || name.toLowerCase().includes('wioletta')) {
            name = 'Wioletta Rogowska';
            slug = 'wiolettarogowska';
            avatar = 'avatar_wioletta_official.jpg';
            badge = '🌸 Współzałożycielka CC';
        } else {
            // KATEGORYCZNY ZAKAZ: Nikt poza Cezarym Rogowskim nie może otrzymać zdjęcia Dowódcy!
            if (avatar && (avatar.includes('cezary') || avatar.includes('christian_culture_carousel'))) {
                avatar = 'lumina_icon.jpg';
            }
        }

        return { name, slug, avatar, badge };
    },

    // Pancerny Strażnik Tożsamości Komentarzy (Identity Guard)
    _sanitizeComment(c) {
        if (!c) return c;
        const authorName = (c.author || '').toLowerCase();
        const authorSlug = (c.authorSlug || '').toLowerCase();
        const isCezary = (authorSlug === 'cezaryrgowski' || authorName.includes('cezary'));
        const isJola = (authorSlug === 'jolawojcik' || authorName.includes('jola'));
        const isZofia = (authorSlug === 'zofiadudek' || authorName.includes('zofia'));
        const isZbyszek = (authorSlug === 'zbyszekgieron' || authorName.includes('zbyszek') || authorName.includes('gieroń') || authorName.includes('gieron'));
        const isAndrzejThiel = (authorSlug === 'andrzejthiel' || authorName.includes('thiel'));
        const isAndrzejHamera = (authorSlug === 'andrzejhamera' || authorName.includes('hamera'));
        const isWioletta = (authorSlug === 'wiolettarogowska' || authorName.includes('wioletta'));

        if (isJola) {
            c.authorAvatar = 'avatar_jolawojcik.jpg';
        } else if (isZofia) {
            c.authorAvatar = 'avatar_zofia_dudek.jpg';
        } else if (isZbyszek) {
            c.authorAvatar = 'avatar_zbyszek_gieron.jpg';
        } else if (isAndrzejThiel) {
            c.authorAvatar = 'avatar_andrzej_thiel.jpg';
        } else if (isAndrzejHamera) {
            c.authorAvatar = 'avatar_andrzej_hamera.jpg';
        } else if (isWioletta) {
            c.authorAvatar = 'avatar_wioletta_official.jpg';
        } else if (!isCezary) {
            // BEZWZGLĘDNA REGUŁA: Nikt poza Dowódcą Cezarym Rogowskim nie ma prawa mieć Jego zdjęcia!
            if (c.authorAvatar && (c.authorAvatar.includes('cezary') || c.authorAvatar.includes('christian_culture_carousel'))) {
                c.authorAvatar = 'lumina_icon.jpg';
            }
        }
        if (!c.authorAvatar) {
            c.authorAvatar = isCezary ? 'avatar_cezary_official.jpg' : 'lumina_icon.jpg';
        }
        return c;
    },

    // Generowanie naturalnego dialogu profili misyjnych (tylko raz per post)
    generateNaturalMissionDialogue(postId, postContext = {}) {
        const authorSlug = (postContext.authorSlug || '').toLowerCase();
        let pool = this._trustedMissionProfiles.filter(p => p.slug !== authorSlug);
        if (pool.length === 0) pool = this._trustedMissionProfiles;

        // Określ typ postu
        const lowerId = String(postId).toLowerCase();
        const textLower = String(postContext.text || postContext.title || '').toLowerCase();

        let category = 'general';
        if (lowerId.startsWith('ref_') || textLower.includes('rozważanie') || textLower.includes('słowa mają moc') || textLower.includes('biblia') || textLower.includes('werset')) {
            category = 'devotional';
        } else if (textLower.includes('modlitw') || textLower.includes('intencj') || textLower.includes('błogosławi') || textLower.includes('uzdrowienie') || textLower.includes('chory')) {
            category = 'prayer';
        } else if (textLower.includes('live') || textLower.includes('transmisja') || textLower.includes('radio') || textLower.includes('worship') || textLower.includes('utwór')) {
            category = 'media';
        }

        const templates = this._dialogueTemplates[category] || this._dialogueTemplates.general;

        // Losuj 1 do 3 naturalnych komentarzy w oparciu o hash postId
        let hash = 0;
        for (let i = 0; i < postId.length; i++) {
            hash = (hash << 5) - hash + postId.charCodeAt(i);
            hash |= 0;
        }
        const absHash = Math.abs(hash);
        const count = (absHash % 3) + 1; // 1, 2 lub 3 komentarze

        const generated = [];
        const now = Date.now();
        const usedProfiles = new Set();

        for (let i = 0; i < count; i++) {
            const profileIdx = (absHash + i * 3) % pool.length;
            const profile = pool[profileIdx];
            if (usedProfiles.has(profile.slug)) continue;
            usedProfiles.add(profile.slug);

            const tmplIdx = (absHash + i * 7) % templates.length;
            const text = templates[tmplIdx];

            // Czas w przeszłości (np. 15m, 45m, 2h temu)
            const timeOffsetMinutes = 15 + ((absHash + i * 29) % 180);
            const commentTime = now - (timeOffsetMinutes * 60 * 1000);

            generated.push(this._sanitizeComment({
                id: `comm_${postId}_mission_${i}`,
                postId: postId,
                author: profile.name,
                authorSlug: profile.slug,
                authorAvatar: profile.avatar,
                authorBadge: profile.badge,
                text: text,
                timestamp: commentTime,
                likes: ((absHash + i * 5) % 4) + 1,
                amen: ((absHash + i * 7) % 6) + 2,
                likedByMe: false,
                amenByMe: false,
                pinned: (i === 0 && (absHash % 4 === 0)), // Czasem pierwszy jest przypięty
                hidden: false,
                edited: false,
                isMissionAuto: true
            }));
        }

        return generated;
    },

    getComments(postId, postContext = {}) {
        this.init();
        const key = this._commentsKeyPrefix + postId;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    let dirty = false;
                    const sanitized = parsed.map(c => {
                        const prevAvatar = c.authorAvatar;
                        const safe = this._sanitizeComment(c);
                        if (safe.authorAvatar !== prevAvatar) dirty = true;
                        return safe;
                    });
                    if (dirty) {
                        try { localStorage.setItem(key, JSON.stringify(sanitized)); } catch(e) {}
                    }
                    return this._sortComments(sanitized);
                }
            } catch(e) {}
        }

        // Pierwsza inicjalizacja dla postu -> wygeneruj dialog misyjny
        const autoComments = this.generateNaturalMissionDialogue(postId, postContext);
        try {
            localStorage.setItem(key, JSON.stringify(autoComments));
        } catch(e) {}
        return this._sortComments(autoComments);
    },

    _sortComments(list) {
        return [...list].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return a.timestamp - b.timestamp;
        });
    },

    saveComments(postId, comments) {
        const key = this._commentsKeyPrefix + postId;
        const sanitized = Array.isArray(comments) ? comments.map(c => this._sanitizeComment(c)) : [];
        try {
            localStorage.setItem(key, JSON.stringify(sanitized));
        } catch(e) {}

        this.updatePostCommentCountBadge(postId);

        if (_commentsBroadcastChan) {
            try {
                _commentsBroadcastChan.postMessage({ type: 'COMMENTS_UPDATED', postId: postId });
            } catch(e) {}
        }
    },

    getCommentCount(postId) {
        const comments = this.getComments(postId);
        return comments.filter(c => !c.hidden).length;
    },

    updatePostCommentCountBadge(postId) {
        const count = this.getCommentCount(postId);
        // Szukaj przycisków akcji dla tego postu
        const postCard = document.getElementById(postId) || document.querySelector(`[data-post-id="${postId}"]`);
        const searchScope = postCard || document;
        const btn = searchScope.querySelector(`.action-comments, [onclick*="toggleComments('${postId}')"]`);
        if (btn) {
            const countSpan = btn.querySelector('.comment-count-num') || btn.querySelector('.btn-text');
            if (countSpan) {
                countSpan.innerHTML = ` Komentarze (${count})`;
            }
        }
    },

    initAllPostCommentCounters() {
        document.querySelectorAll('[onclick*="toggleComments("]').forEach(btn => {
            const m = btn.getAttribute('onclick').match(/toggleComments\(['"]([^'"]+)['"]\)/);
            if (m && m[1]) {
                const postId = m[1];
                const count = this.getCommentCount(postId);
                const textEl = btn.querySelector('.btn-text') || btn;
                textEl.innerHTML = ` Komentarze (${count})`;
            }
        });
    },

    formatCommentText(text) {
        if (!text) return '';
        let safe = escapeHtml(text);
        // Formatuj hashtagi i wzmianki jeśli funkcja formatRichTextAndMedia jest dostępna
        try {
            if (window.LuminaDB && window.LuminaDB.formatRichTextAndMedia) {
                const formatted = window.LuminaDB.formatRichTextAndMedia(safe);
                return formatted.html || safe;
            }
        } catch(e) {}
        return safe.replace(/\n/g, '<br>');
    },

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Przed chwilą';
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / (60 * 1000));
        if (mins < 1) return 'Przed chwilą';
        if (mins < 60) return `${mins} min temu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} godz. temu`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} dni temu`;
        const date = new Date(timestamp);
        return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    },

    addComment(postId, text, replyToAuthor = null) {
        if (!text || !text.trim()) return null;
        const commenter = this.getCurrentCommenter();
        const comments = this.getComments(postId);

        let cleanText = text.trim();
        if (replyToAuthor && !cleanText.startsWith('@' + replyToAuthor)) {
            cleanText = `@${replyToAuthor} ${cleanText}`;
        }

        const newComment = {
            id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            postId: postId,
            author: commenter.name,
            authorSlug: commenter.slug,
            authorAvatar: commenter.avatar,
            authorBadge: commenter.badge,
            text: cleanText,
            timestamp: Date.now(),
            likes: 0,
            amen: 0,
            likedByMe: false,
            amenByMe: false,
            pinned: false,
            hidden: false,
            edited: false
        };

        comments.push(newComment);
        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof LuminaLivePrayer !== 'undefined' && LuminaLivePrayer.emitFaithParticles) {
            LuminaLivePrayer.emitFaithParticles();
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Twój komentarz został pomyślnie dodany! ✨🕊️');
        }

        return newComment;
    },

    editComment(postId, commentId, newText) {
        if (!newText || !newText.trim()) return false;
        const comments = this.getComments(postId);
        const idx = comments.findIndex(c => c.id === commentId);
        if (idx === -1) return false;

        comments[idx].text = newText.trim();
        comments[idx].edited = true;
        comments[idx].editedAt = Date.now();

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast('Komentarz został zaktualizowany. ✨');
        }
        return true;
    },

    deleteComment(postId, commentId) {
        if (!confirm('Czy na pewno chcesz usunąć ten komentarz?')) return;
        let comments = this.getComments(postId);
        comments = comments.filter(c => c.id !== commentId);
        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast('Komentarz został usunięty.');
        }
    },

    togglePinComment(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        const willPin = !target.pinned;
        // Odpinamy pozostałe
        comments.forEach(c => {
            if (c.id === commentId) c.pinned = willPin;
            else if (willPin) c.pinned = false;
        });

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast(willPin ? '📌 Komentarz został przypięty na samej górze!' : 'Komentarz został odpięty.');
        }
    },

    toggleHideComment(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        target.hidden = !target.hidden;
        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (typeof window.showToast === 'function') {
            window.showToast(target.hidden ? 'Komentarz został ukryty.' : 'Komentarz został odkryty.');
        }
    },

    toggleCommentLike(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        target.likedByMe = !target.likedByMe;
        target.likes = target.likedByMe ? (target.likes + 1) : Math.max(0, target.likes - 1);

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);
    },

    toggleCommentAmen(postId, commentId) {
        const comments = this.getComments(postId);
        const target = comments.find(c => c.id === commentId);
        if (!target) return;

        target.amenByMe = !target.amenByMe;
        target.amen = target.amenByMe ? (target.amen + 1) : Math.max(0, target.amen - 1);

        this.saveComments(postId, comments);
        this.refreshCommentsList(postId);

        if (target.amenByMe) {
            if (typeof LuminaLivePrayer !== 'undefined' && LuminaLivePrayer.emitFaithParticles) {
                LuminaLivePrayer.emitFaithParticles();
            }
            if (typeof window.showToast === 'function') {
                window.showToast('Twoje AMEN do komentarza zostało dodane! 🕊️✨');
            }
        }
    },

    isTrustedAuthor(comment) {
        if (!comment) return false;
        const slug = (comment.authorSlug || '').toLowerCase();
        const role = (comment.authorRole || comment.authorBadge || '').toLowerCase();
        const name = (comment.author || '').toLowerCase();

        const trustedSlugs = [
            'cezaryrgowski', 'cezary', 'wiolettarogowska', 'wioletta',
            'andrzejthiel', 'andrzej', 'jolawojcik', 'jola',
            'zbyszekgieron', 'zbyszek', 'zofiadudek', 'zofia',
            'ccmen', 'ccwomen', 'studiodobregoslowa', 'sds',
            'pawelmurawski', 'magdalena', 'radiocc', 'osobowoscplus'
        ];

        if (trustedSlugs.includes(slug)) return true;
        if (comment.isTrusted || comment.verified || comment.isMissionAuto) return true;
        if (role.includes('założyciel') || role.includes('współzałożyciel') || role.includes('lider') || 
            role.includes('wstawiennik') || role.includes('wspólnota') || role.includes('wydawnictwo') || 
            role.includes('świadectwo') || role.includes('formacja') || role.includes('partner') ||
            role.includes('profil misyjny') || role.includes('redakcja') || role.includes('oficjalny')) {
            return true;
        }
        if (name.includes('cezary') || name.includes('wioletta') || name.includes('andrzej thiel') || name.includes('studio dobrego')) {
            return true;
        }

        const me = this.getCurrentCommenter();
        if (me && me.slug === slug && (me.slug === 'cezaryrgowski' || me.badge)) {
            return true;
        }

        return false;
    },

    createCommentLinkPreviewCardHtml(url, commentId) {
        if (!url) return '';
        const rawUrl = String(url).trim();
        const safeUrl = encodeURI(rawUrl).replace(/"/g, '&quot;');
        const lowerUrl = rawUrl.toLowerCase();

        // 1. YouTube Video Preview
        const ytId = extractYouTubeId(rawUrl);
        if (ytId) {
            return `
                <div class="comment-preview-card" id="comment_preview_${commentId}">
                    <div class="comment-preview-thumb-wrap" onclick="LuminaComments.openCommentYouTubePlayer('${commentId}', '${ytId}')" title="Kliknij, aby odtworzyć wideo">
                        <img src="https://i.ytimg.com/vi/${ytId}/hqdefault.jpg" alt="Wideo YouTube" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='worship_logo.png';">
                        <div class="comment-preview-play-overlay"><i class="fa-solid fa-play"></i></div>
                    </div>
                    <div id="comment_yt_embed_${commentId}" class="comment-yt-embed-wrap" style="display:none;"></div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge badge-youtube"><i class="fa-brands fa-youtube"></i> Wideo YouTube</span>
                            <span class="comment-preview-domain">youtube.com</span>
                        </div>
                        <h4 class="comment-preview-title">Wideo Wiary • Obejrzyj nagranie w komentarzu</h4>
                        <p class="comment-preview-desc">Kliknij miniaturę powyżej, aby obejrzeć materiał wideo bezpośrednio na Tablicy, lub przejdź do YouTube.</p>
                        <div class="comment-preview-footer">
                            <button type="button" class="comment-preview-btn" onclick="LuminaComments.openCommentYouTubePlayer('${commentId}', '${ytId}')">
                                <i class="fa-solid fa-play"></i> Odtwórz wideo
                            </button>
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-active-link" style="font-size:0.75rem;">
                                YouTube <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. Randki & Małżeństwo (Roman Chałupka)
        if (lowerUrl.includes('randki-malzenstwo') || lowerUrl.includes('kurs-malzenski')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-thumb-wrap">
                        <img src="randki_malzenstwo_plakat_hq.webp" alt="Kurs Małżeński" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='tlo_profilowe_wioletta.jpg';">
                    </div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-heart"></i> Kurs Małżeński</span>
                            <span class="comment-preview-domain">polskieradio.cc</span>
                        </div>
                        <h4 class="comment-preview-title">Randki & Małżeństwo • Roman Chałupka</h4>
                        <p class="comment-preview-desc">Prawdziwe szczęście w rodzinie – 18 odcinków wykładów biblijnych dla narzeczonych, par i małżeństw. Oglądaj bez opłat.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-graduation-cap"></i> Otwórz Kurs 🕊️
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. Kino Chrześcijańskie VOD
        if (lowerUrl.includes('/vod') || lowerUrl.includes('kino')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-thumb-wrap">
                        <img src="vod_hity_kina.webp" alt="VOD Kino Chrześcijańskie" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='promo_dzj.jpg';">
                    </div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-film"></i> Kino Chrześcijańskie</span>
                            <span class="comment-preview-domain">polskieradio.cc/vod</span>
                        </div>
                        <h4 class="comment-preview-title">Kino VOD Christian Culture • Bez Opłat i Bez Reklam</h4>
                        <p class="comment-preview-desc">Poruszające filmy fabularne, biografie wiary i historyczne dramaty z polskim lektorem na żądanie 24/7.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-play"></i> Oglądaj w VOD 🍿
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 4. Dom Modlitwy & Wstawiennictwo Live
        if (lowerUrl.includes('/modlitwa') || lowerUrl.includes('zjednoczeni-za-polske')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-thumb-wrap">
                        <img src="lion_jewish_flag.jpg" alt="Dom Modlitwy" class="comment-preview-thumb" loading="lazy" onerror="this.onerror=null; this.src='avatar_cezary_official.jpg';">
                    </div>
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-hands-praying"></i> Wstawiennictwo Live</span>
                            <span class="comment-preview-domain">polskieradio.cc/modlitwa</span>
                        </div>
                        <h4 class="comment-preview-title">Narodowy Dom Modlitwy • Zjednoczeni za Polskę</h4>
                        <p class="comment-preview-desc">Wstawiennictwo czasu rzeczywistego. Zgłoś swoją intencję i módl się razem z tysiącami wierzących.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-hands-praying"></i> Módl się TERAZ 🕊️
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 5. MojaBiblia (Pismo Święte)
        if (lowerUrl.includes('mojabiblia')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-book-bible"></i> Pismo Święte</span>
                            <span class="comment-preview-domain">polskieradio.cc/mojabiblia</span>
                        </div>
                        <h4 class="comment-preview-title">MojaBiblia • Interlinearne Studium Słowa Bożego</h4>
                        <p class="comment-preview-desc">Tekst Pisma Świętego UBG, kody Stronga, słowniki greki i hebrajskiego oraz rozważania.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-book-open"></i> Czytaj Biblię 📖
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 6. Polskie Radio CC Live / Player
        if (lowerUrl.includes('polskieradio.cc') || lowerUrl.includes('player')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge"><i class="fa-solid fa-radio"></i> Radio na Żywo</span>
                            <span class="comment-preview-domain">polskieradio.cc</span>
                        </div>
                        <h4 class="comment-preview-title">Polskie Radio Christian Culture Live</h4>
                        <p class="comment-preview-desc">Muzyka Uwielbienia & Słowo Boże 24/7. Transmisja bez przerw, budująca wiarę w Twoim domu.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                                <i class="fa-solid fa-play"></i> Słuchaj na żywo 📻
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 7. Patronite
        if (lowerUrl.includes('patronite.pl')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge" style="background:rgba(239,68,68,0.2); color:#fca5a5; border-color:rgba(239,68,68,0.4);"><i class="fa-solid fa-heart"></i> Patronite CC</span>
                            <span class="comment-preview-domain">patronite.pl/osobowoscplus</span>
                        </div>
                        <h4 class="comment-preview-title">Wesprzyj Misję Christian Culture na Patronite</h4>
                        <p class="comment-preview-desc">Twoje wsparcie pozwala nam rozwijać bezpłatne media chrześcijańskie i wysyłać bezpłatne egzemplarze Biblii.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn" style="background:linear-gradient(135deg,#ef4444,#f97316); color:#fff;">
                                <i class="fa-solid fa-heart"></i> Zostań Patronem ❤️
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 8. WhatsApp
        if (lowerUrl.includes('chat.whatsapp.com')) {
            return `
                <div class="comment-preview-card">
                    <div class="comment-preview-body">
                        <div class="comment-preview-badge-row">
                            <span class="comment-preview-badge" style="background:rgba(34,197,94,0.2); color:#86efac; border-color:rgba(34,197,94,0.4);"><i class="fa-brands fa-whatsapp"></i> Społeczność WhatsApp</span>
                            <span class="comment-preview-domain">chat.whatsapp.com</span>
                        </div>
                        <h4 class="comment-preview-title">Oficjalna Grupa Wspólnotowa Christian Culture</h4>
                        <p class="comment-preview-desc">Dołącz do grupy modlitewno-wspólnotowej. Bądź na bieżąco z codziennymi rozważaniami i intencjami.</p>
                        <div class="comment-preview-footer">
                            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn" style="background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff;">
                                <i class="fa-brands fa-whatsapp"></i> Dołącz do Grupy 💬
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // 9. Dowolna inna witryna zewnętrzna
        let domain = rawUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        return `
            <div class="comment-preview-card">
                <div class="comment-preview-body">
                    <div class="comment-preview-badge-row">
                        <span class="comment-preview-badge"><i class="fa-solid fa-globe"></i> Link Zewnętrzny</span>
                        <span class="comment-preview-domain">${escapeHtml(domain)}</span>
                    </div>
                    <h4 class="comment-preview-title">${escapeHtml(domain)} • Odsłonięta treść polecana przez zaufany profil</h4>
                    <p class="comment-preview-desc">Zweryfikowany odnośnik opublikowany przez zaufanego członka społeczności.</p>
                    <div class="comment-preview-footer">
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-preview-btn">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Otwórz link 🔗
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    openCommentYouTubePlayer(commentId, ytId) {
        const previewCard = document.getElementById('comment_preview_' + commentId);
        if (!previewCard) return;
        const thumbWrap = previewCard.querySelector('.comment-preview-thumb-wrap');
        const embedWrap = document.getElementById('comment_yt_embed_' + commentId);
        if (thumbWrap && embedWrap) {
            thumbWrap.style.display = 'none';
            embedWrap.style.display = 'block';
            embedWrap.innerHTML = `
                <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
                        title="Wideo YouTube w komentarzu" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen></iframe>
            `;
        }
    },

    formatCommentText(rawText, comment = null) {
        if (!rawText) return '';
        const isTrusted = comment ? this.isTrustedAuthor(comment) : false;
        const commentId = comment?.id || ('tmp_' + Date.now());

        // Sanityzacja HTML
        let text = escapeHtml(rawText);

        // Regex wykrywający URL
        const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
        const foundUrls = text.match(urlRegex) || [];

        if (isTrusted) {
            // ZAUFANE PROFILE: aktywne, klikalne linki z ikoną
            text = text.replace(urlRegex, (url) => {
                let display = url.replace(/^https?:\/\/(www\.)?/, '');
                if (display.length > 40) display = display.substring(0, 37) + '...';
                const safeUrl = encodeURI(url).replace(/"/g, '&quot;');
                return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="comment-active-link"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem;"></i> ${display}</a>`;
            });
        } else {
            // NIEZAUFANE PROFILE: link bezpieczny bez podglądu
            text = text.replace(urlRegex, (url) => {
                let display = url.replace(/^https?:\/\/(www\.)?/, '');
                if (display.length > 40) display = display.substring(0, 37) + '...';
                return `<span class="comment-untrusted-link"><i class="fa-solid fa-link"></i> ${display}</span>`;
            });
        }

        // Formatuje @mentions
        text = text.replace(/(^|[\s>(])@([a-zA-Z0-9_]+)/g, (match, p1, handle) => {
            const hInfo = typeof resolveMentionHandle === 'function' ? resolveMentionHandle(handle) : null;
            const nameAttr = (hInfo && hInfo.name) ? escapeHtml(hInfo.name) : escapeHtml(handle);
            const urlAttr = (hInfo && hInfo.url) ? encodeURI(hInfo.url) : `lumina-profile.html?u=${encodeURIComponent(handle)}`;
            return `${p1}<a href="${urlAttr}" class="lumina-mention-pill" title="Profil: ${nameAttr}" onclick="event.stopPropagation()"><i class="fa-solid fa-at"></i>${escapeHtml(handle)}</a>`;
        });

        // Formatuje #hashtags
        text = text.replace(/(^|[\s>(])#([a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/g, (match, p1, tag) => {
            const safeTag = escapeHtml(tag);
            const encTag = encodeURIComponent(tag);
            return `${p1}<a href="lumina-tablica.html?q=%23${encTag}" class="lumina-hashtag-pill" data-tag="${safeTag}" title="Filtruj #${safeTag}" onclick="if(window.filterFeedByTag){event.preventDefault();event.stopPropagation();window.filterFeedByTag('${safeTag}');}else{event.stopPropagation();}"><i class="fa-solid fa-hashtag"></i>${safeTag}</a>`;
        });

        // Zamiana \n na <br>
        text = text.replace(/\n/g, '<br>');

        // JEŚLI PROFIL JEST ZAUFANY i w komentarzu jest co najmniej jeden link:
        // Odsłoń w komentarzu jego treść (Rich Preview Card / Embed Player)
        if (isTrusted && foundUrls.length > 0) {
            const firstUrl = foundUrls[0];
            const previewCardHtml = this.createCommentLinkPreviewCardHtml(firstUrl, commentId);
            if (previewCardHtml) {
                text += previewCardHtml;
            }
        }

        return text;
    },

    insertFaithChip(postId, chipText) {
        const input = document.getElementById('comment_input_' + postId);
        if (!input) return;
        const curVal = input.value.trim();
        input.value = curVal ? (curVal + ' ' + chipText) : chipText;
        input.focus();
    },

    replyToUser(postId, commentId, authorName) {
        const input = document.getElementById('comment_input_' + postId);
        const replyBadge = document.getElementById('comment_reply_badge_' + postId);
        if (input) {
            input.dataset.replyTo = authorName;
            input.value = `@${authorName} `;
            input.focus();
        }
        if (replyBadge) {
            replyBadge.innerHTML = `<span>Odpowiedź do: <b>@${escapeHtml(authorName)}</b></span> <button type="button" class="comment-cancel-reply-btn" onclick="LuminaComments.cancelReply('${postId}')">✕</button>`;
            replyBadge.style.display = 'flex';
        }
    },

    cancelReply(postId) {
        const input = document.getElementById('comment_input_' + postId);
        const replyBadge = document.getElementById('comment_reply_badge_' + postId);
        if (input) {
            delete input.dataset.replyTo;
            if (input.value.startsWith('@')) {
                input.value = '';
            }
        }
        if (replyBadge) {
            replyBadge.style.display = 'none';
        }
    },

    startInlineEdit(postId, commentId) {
        const commentItem = document.getElementById('comment_item_' + commentId);
        if (!commentItem) return;
        const textContent = commentItem.querySelector('.comment-text-content');
        const editBox = commentItem.querySelector('.comment-inline-edit-wrap');
        if (textContent && editBox) {
            textContent.style.display = 'none';
            editBox.style.display = 'flex';
            const textarea = editBox.querySelector('textarea');
            if (textarea) textarea.focus();
        }
        this.closeAllDropdowns();
    },

    cancelInlineEdit(postId, commentId) {
        const commentItem = document.getElementById('comment_item_' + commentId);
        if (!commentItem) return;
        const textContent = commentItem.querySelector('.comment-text-content');
        const editBox = commentItem.querySelector('.comment-inline-edit-wrap');
        if (textContent && editBox) {
            textContent.style.display = 'block';
            editBox.style.display = 'none';
        }
    },

    saveInlineEdit(postId, commentId) {
        const commentItem = document.getElementById('comment_item_' + commentId);
        if (!commentItem) return;
        const textarea = commentItem.querySelector('.comment-inline-edit-textarea');
        if (!textarea) return;
        const newText = textarea.value.trim();
        this.editComment(postId, commentId, newText);
    },

    toggleCommentDropdown(postId, commentId) {
        const menu = document.getElementById('comment_dropdown_' + commentId);
        if (!menu) return;
        const isOpen = menu.classList.contains('open');
        this.closeAllDropdowns();
        if (!isOpen) {
            menu.classList.add('open');
        }
    },

    closeAllDropdowns() {
        document.querySelectorAll('.comment-dropdown-menu.open').forEach(el => el.classList.remove('open'));
    },

    toggleComments(postId, postAuthorSlug) {
        this.ensureStylesInjected();
        let section = document.getElementById('comments_' + postId);
        if (!section && typeof postId === 'string' && postId.startsWith('post_')) {
            section = document.getElementById('comments_' + postId.replace(/^post_/, ''));
        }
        if (!section && typeof postId === 'string' && !postId.startsWith('post_')) {
            section = document.getElementById('comments_post_' + postId);
        }
        if (!section) return;

        const cleanPostId = section.id.replace(/^comments_/, '');
        const isOpen = section.classList.contains('open');
        if (isOpen) {
            section.classList.remove('open');
            section.style.display = 'none';
        } else {
            section.classList.add('open');
            section.style.display = 'block';
            this.refreshCommentsSection(cleanPostId, postAuthorSlug);
            setTimeout(() => {
                try {
                    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } catch(e) {}
                const input = document.getElementById('comment_input_' + cleanPostId);
                if (input) input.focus();
            }, 120);
        }
    },

    submitComment(postId) {
        let input = document.getElementById('comment_input_' + postId);
        if (!input && typeof postId === 'string' && postId.startsWith('post_')) {
            input = document.getElementById('comment_input_' + postId.replace(/^post_/, ''));
        }
        if (!input && typeof postId === 'string' && !postId.startsWith('post_')) {
            input = document.getElementById('comment_input_post_' + postId);
        }
        if (!input) return;
        const actualPostId = input.id.replace(/^comment_input_/, '');
        const text = input.value.trim();
        if (!text) return;
        const replyTo = input.dataset.replyTo || null;
        this.addComment(actualPostId, text, replyTo);
        input.value = '';
        this.cancelReply(actualPostId);
    },

    renderCommentsListHtml(postId, postAuthorSlug) {
        const comments = this.getComments(postId);
        const me = this.getCurrentCommenter();
        const isAdmin = me.slug === 'cezaryrgowski';
        const isPostAuthor = postAuthorSlug && (postAuthorSlug === me.slug);

        if (comments.length === 0) {
            return `<div style="text-align:center; padding:16px; color:#94a3b8; font-size:0.82rem; font-style:italic;">Bądź pierwszą osobą, która podzieli się słowem lub Amen! ✨🕊️</div>`;
        }

        return comments.map(c => {
            const isMyComment = (c.authorSlug && c.authorSlug === me.slug);
            const canManage = (isMyComment || isPostAuthor || isAdmin);

            if (c.hidden && !canManage) {
                return `
                    <div class="comment-item-v2" id="comment_item_${c.id}">
                        <div class="comment-hidden-placeholder" style="width:100%;">
                            <span><i class="fa-solid fa-eye-slash"></i> Ten komentarz został ukryty przez autora wpisu.</span>
                            <button type="button" class="btn-reveal-hidden" onclick="document.getElementById('hidden_body_${c.id}').style.display='block'; this.parentElement.style.display='none';">Pokaż mimo to</button>
                        </div>
                        <div id="hidden_body_${c.id}" style="display:none; width:100%;">
                            ${this._renderSingleCommentBubbleHtml(postId, c, canManage, isMyComment)}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="comment-item-v2 ${c.pinned ? 'pinned-comment' : ''}" id="comment_item_${c.id}">
                    <a href="${c.authorSlug ? ('lumina.html?u=' + c.authorSlug) : '#'}" class="comment-avatar-link">
                        <img loading="lazy" decoding="async" src="${(this._sanitizeComment(c)).authorAvatar || 'lumina_icon.jpg'}" alt="${escapeHtml(c.author)}" class="comment-avatar-v2" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                    </a>
                    <div class="comment-body-v2">
                        ${this._renderSingleCommentBubbleHtml(postId, c, canManage, isMyComment)}
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderSingleCommentBubbleHtml(postId, c, canManage, isMyComment) {
        return `
            <div class="comment-bubble-v2">
                ${c.pinned ? `<div class="comment-pinned-indicator"><i class="fa-solid fa-thumbtack"></i> Przypięty komentarz</div>` : ''}
                ${c.hidden ? `<div style="font-size:0.72rem; color:#f87171; margin-bottom:4px; font-weight:700;"><i class="fa-solid fa-eye-slash"></i> (Komentarz ukryty dla gości)</div>` : ''}
                
                <div class="comment-header-row">
                    <a href="${c.authorSlug ? ('lumina.html?u=' + c.authorSlug) : '#'}" class="comment-author-name">
                        <span>${escapeHtml(c.author)}</span>
                        ${c.authorBadge ? `<span class="comment-badge-pill">${escapeHtml(c.authorBadge)}</span>` : ''}
                    </a>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="comment-time-v2">${this.formatTimeAgo(c.timestamp)}</span>
                        ${c.edited ? `<span class="comment-edited-tag">(edytowano)</span>` : ''}
                        
                        ${canManage ? `
                            <button type="button" class="comment-more-btn" onclick="LuminaComments.toggleCommentDropdown('${postId}', '${c.id}')" title="Opcje komentarza">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                            <div class="comment-dropdown-menu" id="comment_dropdown_${c.id}">
                                ${isMyComment ? `
                                    <button type="button" class="comment-dropdown-item" onclick="LuminaComments.startInlineEdit('${postId}', '${c.id}')">
                                        <i class="fa-solid fa-pencil"></i> Edytuj
                                    </button>
                                ` : ''}
                                <button type="button" class="comment-dropdown-item" onclick="LuminaComments.togglePinComment('${postId}', '${c.id}')">
                                    <i class="fa-solid fa-thumbtack"></i> ${c.pinned ? 'Odepnij' : 'Przypnij na górze'}
                                </button>
                                <button type="button" class="comment-dropdown-item" onclick="LuminaComments.toggleHideComment('${postId}', '${c.id}')">
                                    <i class="fa-solid ${c.hidden ? 'fa-eye' : 'fa-eye-slash'}"></i> ${c.hidden ? 'Odkryj' : 'Ukryj'}
                                </button>
                                <button type="button" class="comment-dropdown-item item-danger" onclick="LuminaComments.deleteComment('${postId}', '${c.id}')">
                                    <i class="fa-solid fa-trash-can"></i> Usuń
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="comment-text-content">${this.formatCommentText(c.text, c)}</div>

                <!-- Inline Edit Form (Hidden by default) -->
                <div class="comment-inline-edit-wrap" style="display:none;">
                    <textarea class="comment-inline-edit-textarea">${escapeHtml(c.text)}</textarea>
                    <div class="comment-inline-edit-buttons">
                        <button type="button" class="comment-edit-btn-cancel" onclick="LuminaComments.cancelInlineEdit('${postId}', '${c.id}')">Anuluj</button>
                        <button type="button" class="comment-edit-btn-save" onclick="LuminaComments.saveInlineEdit('${postId}', '${c.id}')">Zapisz</button>
                    </div>
                </div>
            </div>

            <!-- Reactions and reply -->
            <div class="comment-actions-bar-v2">
                <button type="button" class="comment-action-link ${c.likedByMe ? 'active-like' : ''}" onclick="LuminaComments.toggleCommentLike('${postId}', '${c.id}')" title="Polub komentarz">
                    <i class="fa-solid fa-heart"></i> <span>${c.likes > 0 ? c.likes : ''} Lubię</span>
                </button>
                <button type="button" class="comment-action-link ${c.amenByMe ? 'active-amen' : ''}" onclick="LuminaComments.toggleCommentAmen('${postId}', '${c.id}')" title="Dodaj AMEN!">
                    <i class="fa-solid fa-hands-praying"></i> <span>${c.amen > 0 ? c.amen : ''} Amen!</span>
                </button>
                <button type="button" class="comment-action-link" onclick="LuminaComments.replyToUser('${postId}', '${c.id}', '${escapeHtml(c.author)}')" title="Odpowiedz temu autorowi">
                    <i class="fa-solid fa-reply"></i> <span>Odpowiedz</span>
                </button>
            </div>
        `;
    },

    refreshCommentsList(postId, postAuthorSlug) {
        const list = document.getElementById('comment_list_' + postId);
        if (list) {
            list.innerHTML = this.renderCommentsListHtml(postId, postAuthorSlug);
        }
    },

    refreshCommentsSection(postId, postAuthorSlug) {
        const container = document.getElementById('comments_' + postId);
        if (!container) return;
        const me = this.getCurrentCommenter();

        container.className = 'comments-section-v2 open';
        container.style.display = 'block';
        container.innerHTML = `
            <!-- Faith Quick-Chips -->
            <div class="comment-faith-chips-bar">
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '🕊️ Amen!')">🕊️ Amen!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '🙏 Błogosławię w Panu!')">🙏 Błogosławię w Panu!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '❤️ Piękne świadectwo!')">❤️ Piękne świadectwo!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '✨ Chwała Bogu!')">✨ Chwała Bogu!</button>
                <button type="button" class="comment-faith-chip" onclick="LuminaComments.insertFaithChip('${postId}', '📖 Słowo na czasie!')">📖 Słowo na czasie!</button>
            </div>

            <!-- Composer Input Row -->
            <div class="comment-input-composer-v2">
                <img loading="lazy" decoding="async" src="${me.avatar || 'lumina_icon.jpg'}" alt="${escapeHtml(me.name)}" class="comment-my-avatar" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                <div class="comment-input-wrap">
                    <div id="comment_reply_badge_${postId}" class="comment-replying-to-badge" style="display:none;"></div>
                    <textarea class="comment-textarea-v2" id="comment_input_${postId}" placeholder="Napisz budujący komentarz, świadectwo lub Amen..." rows="1" onkeypress="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); LuminaComments.submitComment('${postId}'); }"></textarea>
                    <div class="comment-submit-bar">
                        <span style="font-size:0.7rem; color:#64748b;">Naciśnij Enter, aby wysłać</span>
                        <button type="button" class="comment-submit-btn-v2" onclick="LuminaComments.submitComment('${postId}')">
                            <i class="fa-solid fa-paper-plane"></i> Opublikuj
                        </button>
                    </div>
                </div>
            </div>

            <!-- Comments Feed List -->
            <div class="comments-list-v2" id="comment_list_${postId}">
                ${this.renderCommentsListHtml(postId, postAuthorSlug)}
            </div>
        `;

        this.updatePostCommentCountBadge(postId);
    }
};

// Global Exposure


    // Globalne udostępnienie w window
    window.LuminaComments = LuminaCommentsEngine;
    window.LuminaCommentsEngine = LuminaCommentsEngine;
    window.LuminaDB = window.LuminaDB || {};
    window.LuminaDB.LuminaComments = LuminaCommentsEngine;

    window.toggleComments = function(postId, authorSlug) {
        LuminaCommentsEngine.toggleComments(postId, authorSlug);
    };

    window.submitComment = function(postId) {
        LuminaCommentsEngine.submitComment(postId);
    };

    // Auto-inicjalizacja natychmiast i po załadowaniu DOM
    LuminaCommentsEngine.init();

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                LuminaCommentsEngine.autoAttachToAllFeedCards();
                setTimeout(() => {
                    LuminaCommentsEngine.autoAttachToAllFeedCards();
                    LuminaCommentsEngine.initAllPostCommentCounters();
                }, 400);
            });
        } else {
            LuminaCommentsEngine.autoAttachToAllFeedCards();
            setTimeout(() => {
                LuminaCommentsEngine.autoAttachToAllFeedCards();
                LuminaCommentsEngine.initAllPostCommentCounters();
            }, 400);
        }
        window.addEventListener('load', () => {
            LuminaCommentsEngine.autoAttachToAllFeedCards();
            LuminaCommentsEngine.initAllPostCommentCounters();
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LuminaCommentsEngine;
    }

    console.log('[LUMINA COMMENTS] Universal Engine v2.5.0 initialized successfully');
})();
