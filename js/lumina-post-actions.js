/* Progressive presentation only: move original controls, preserve their handlers. */
(() => {
  'use strict';
  if (window.LuminaPostActions) return;
  let sequence = 0, opened = null, queued = false;
  function close(restoreFocus = false) {
    if (!opened) return;
    const {more, overflow} = opened;
    overflow.hidden = true;
    more.setAttribute('aria-expanded','false');
    opened = null;
    if (restoreFocus && more.isConnected) more.focus({preventScroll:true});
  }
  function allowedToMove(button, boundary) {
    for (let parent=button; parent && parent!==boundary; parent=parent.parentElement) {
      if (parent.hidden || parent.inert || getComputedStyle(parent).display==='none') return false;
    }
    return true;
  }
  function enhance(bar) {
    if (bar.dataset.ccPostActions || bar.hidden || bar.inert || getComputedStyle(bar).display==='none') return;
    // Pair only this toolbar's sibling dock, never a quoted/nested post's controls.
    const dock=bar.nextElementSibling?.matches('.post-share-dock')?bar.nextElementSibling:null;
    const like=bar.querySelector('.action-like');
    const comments=bar.querySelector('.action-comments');
    const facebook=dock?.querySelector('.share-fb');
    const postId=dock?.dataset.sharePostId;
    // Do not alter TV-only cards or make restricted controls visible.
    if (!like || !comments || !facebook || !postId || !allowedToMove(like,bar) || !allowedToMove(comments,bar) || !allowedToMove(facebook,dock)) return;
    const id=`ccPostActions_${++sequence}`;
    const primary=document.createElement('div');primary.className='cc-post-primary';
    const overflow=document.createElement('div');overflow.className='cc-post-overflow';overflow.id=id;
    overflow.hidden=true;overflow.setAttribute('role','group');overflow.setAttribute('aria-label','Pozostałe działania wpisu');
    const more=document.createElement('button');more.type='button';more.className='cc-post-more';more.textContent='…';
    more.title='Więcej działań wpisu';more.setAttribute('aria-label',more.title);more.setAttribute('aria-controls',id);more.setAttribute('aria-expanded','false');
    more.addEventListener('click',()=>{
      const wasOpen=opened?.more===more;close();
      if(!wasOpen){overflow.hidden=false;more.setAttribute('aria-expanded','true');opened={bar,more,overflow};}
    });
    like.setAttribute('aria-label',like.getAttribute('aria-label')||'Polub wpis');
    comments.setAttribute('aria-label',comments.getAttribute('aria-label')||'Komentarze');
    for(const [button,selector,suffix] of [[like,'.count','likes'],[comments,'.btn-text','comments']]) {
      const count=button.querySelector(selector);
      if(count){if(!count.id)count.id=`${id}_${suffix}`;button.setAttribute('aria-describedby',count.id);}
    }
    facebook.setAttribute('aria-label','Udostępnij na Facebooku');
    // Existing dock falls back to the generic modal when sharePostDirect is absent.
    // This explicit Facebook action always shares the post's public deep link.
    facebook.addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();close();
      if(typeof window.sharePostDirect==='function') {window.sharePostDirect(postId,'facebook');return;}
      const url=new URL('/tablica',location.origin);url.searchParams.set('post',postId);url.hash=postId;
      window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url.href),'_blank','noopener,noreferrer');
    },true);
    const secondary=[...bar.querySelectorAll('button,a'),...dock.querySelectorAll('button,a')];
    const generic=dock.querySelector('.share-more');
    const hasGeneric=generic && allowedToMove(generic,dock);
    primary.append(like,comments,facebook);
    primary.addEventListener('click',()=>close());
    for(const button of secondary) {
      if([like,comments,facebook].includes(button)) continue;
      const boundary=bar.contains(button)?bar:dock;
      if(!allowedToMove(button,boundary)) continue;
      // Both originals call the same generic share route. Keep one, not two icons.
      if(hasGeneric && button.matches('.action-share')) {button.hidden=true;continue;}
      const label=button.getAttribute('aria-label')||button.title||button.textContent.trim();
      if(label){button.setAttribute('aria-label',label);const text=document.createElement('span');text.className='cc-post-action-label';text.textContent=label;button.append(text);}
      overflow.append(button);
    }
    overflow.addEventListener('click',event=>{if(event.target.closest('button,a'))close();});
    bar.append(primary,more,overflow);
    bar.setAttribute('data-no-lumina',''); // The canonical L button is already in overflow; no auto-injected duplicate.
    bar.dataset.ccPostActions='true';bar.classList.add('cc-post-compact');
    dock.dataset.ccShareMerged='true';
  }
  function refresh() {
    queued=false;
    if(opened && !opened.bar.isConnected)close();
    document.querySelectorAll('.post-actions-bar:not([data-cc-post-actions])').forEach(enhance);
  }
  function start() {
    const feed=document.getElementById('feedStream1x1');
    if(!feed)return;
    refresh();
    new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(refresh);}}).observe(feed,{childList:true,subtree:true});
    document.addEventListener('click',event=>{if(opened && !opened.bar.contains(event.target))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&opened){event.preventDefault();close(true);}});
  }
  window.LuminaPostActions=Object.freeze({refresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
