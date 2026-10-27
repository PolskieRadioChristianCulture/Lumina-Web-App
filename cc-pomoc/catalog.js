'use strict';
// Keep the debt pilot's existing language switch compatible with this static catalogue.
function syncHelpCatalogueLanguage(){
 const lang=document.documentElement.lang==='en'?'en':'pl';
 document.querySelectorAll('[data-help-pl]').forEach(el=>{el.textContent=el.getAttribute('data-help-'+lang);});
 document.querySelectorAll('[data-help-href-pl]').forEach(el=>{el.setAttribute('href',el.getAttribute('data-help-href-'+lang));});
}
syncHelpCatalogueLanguage();
new MutationObserver(syncHelpCatalogueLanguage).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
