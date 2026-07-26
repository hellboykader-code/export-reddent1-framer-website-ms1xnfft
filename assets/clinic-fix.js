/* RedDent — post-hydratation Framer : nav FR, options de formulaire FR,
   titres animés (SplitText) FR, masquage avis + blog/news + promo.
   Robuste aux re-render React (MutationObserver + ré-application). */
(function(){
  // --- masquage CSS (survit à l'hydratation) : avis + blog + news ---
  function injectCSS(){
    if(document.getElementById('reddent-fix-css')) return;
    var css=[
      '[data-framer-name*="Testimonial"]{display:none !important}',
      '[data-framer-name*="Review"]{display:none !important}',
      '[data-framer-name*="Blog Section"]{display:none !important}',
      '[data-framer-name*="Blog Card"]{display:none !important}'
    ].join('');
    var st=document.createElement('style'); st.id='reddent-fix-css'; st.textContent=css;
    (document.head||document.documentElement).appendChild(st);
  }
  // remplace le TEXTE d'un élément sans détruire ses <span> stylés
  function setText(el,val){
    var walk=function(n){for(var i=0;i<n.childNodes.length;i++){var c=n.childNodes[i];
      if(c.nodeType===3 && c.nodeValue && c.nodeValue.trim()){c.nodeValue=val;
        // vider d'éventuels autres nœuds texte frères
        for(var j=i+1;j<n.childNodes.length;j++){var d=n.childNodes[j];
          if(d.nodeType===3 && d.nodeValue && d.nodeValue.trim()) d.nodeValue='';}
        return true;}
      if(c.nodeType===1 && walk(c))return true;}return false;};
    if(!walk(el)) el.textContent=val;
  }
  // --- NAV + FOOTER : libellés FR (route inchangée), masquer News/Blogs ---
  var NAV={ 'Home':'Accueil','About':'À propos','Service':'Soins','Services':'Soins',
            'Doctors':'Équipe','Doctor':'Équipe' };
  function fixNav(){
    document.querySelectorAll('nav a, header a, footer a, [data-framer-name*="Nav"] a, [data-framer-name*="Menu"] a, [data-framer-name*="Footer"] a').forEach(function(a){
      var t=(a.textContent||'').replace(/\s+/g,' ').trim();
      var h=a.getAttribute('href')||'';
      if(t==='News'||t==='Blogs'||t==='Blog'||/\/blog/.test(h)){ (a.closest('li')||a).style.display='none'; a.style.display='none'; return; }
      if(NAV[t]){ setText(a,NAV[t]); }
    });
  }
  // --- options du formulaire (Service *) ---
  var OPT={ 'General':'Général','Dental':'Dentaire','injury':'Urgence dentaire' };
  function fixOptions(){
    document.querySelectorAll('option').forEach(function(o){
      var t=(o.textContent||'').trim(); if(OPT[t]){ o.textContent=OPT[t]; }
    });
  }
  // --- libellés/eyebrows exacts restés en anglais (rendus côté client) ---
  var EXACT={ 'Doctor':'Notre équipe' };
  // --- titres animés (SplitText) : correspondance textContent normalisé ---
  var SPLIT={
    'Our Services':'Nos soins',
    'Our Service':'Nos soins',
    'Working Process':'Notre méthode',
    'Our Process':'Notre méthode',
    'Our Team':'Notre équipe',
    'Team Members':'Notre équipe',
    'Why choose us':'Pourquoi nous choisir',
    'Our Specialist':'Nos praticiens'
  };
  function norm(s){ return (s||'').replace(/\s+/g,' ').trim(); }
  function fixSplit(){
    document.querySelectorAll('h1,h2,h3,h4,p').forEach(function(el){
      if(el.getAttribute('data-frfix')==='1') return;
      var t=norm(el.textContent); var fr=SPLIT[t]||EXACT[t]; if(!fr) return;
      var ref=el.querySelector('span')||el, cs=window.getComputedStyle(ref);
      var sp=document.createElement('span'); sp.textContent=fr;
      sp.style.color=cs.color; sp.style.fontFamily=cs.fontFamily; sp.style.fontSize=cs.fontSize;
      sp.style.fontWeight=cs.fontWeight; sp.style.letterSpacing=cs.letterSpacing;
      el.innerHTML=''; el.appendChild(sp); el.setAttribute('data-frfix','1');
    });
  }
  // --- masquage JS de secours (avis/blog/news + promo Framer) ---
  function mainRoot(){ return document.querySelector('[data-framer-name="Main"]')||document.querySelector('main')||document.body; }
  var AVIS=/Client Testimonials|amazing clients say about us|Témoignages|avis de nos patients/i;
  function safeSection(el){
    var r=mainRoot(), c=el, best=null;
    for(var i=0;i<7 && c && c!==r && c.parentElement; i++){
      c=c.parentElement; if(c===r) break;
      if(c.querySelector && c.querySelector('[data-framer-name*="Hero"],[data-framer-name*="Nav"],[data-framer-name*="Header"]')) break;
      var h=c.getBoundingClientRect().height; if(h > window.innerHeight*1.6) break;
      best=c;
    }
    return best;
  }
  function hideFiller(){
    var r=mainRoot(); if(r){
      r.querySelectorAll('h1,h2,h3,h4,p').forEach(function(el){
        var t=(el.textContent||''); if(t.length<160 && AVIS.test(t)){ var s=safeSection(el); if(s) s.style.display='none'; }
      });
    }
    document.querySelectorAll('a[href*="framer.com"],a[href*="framer.link"],a[href*="framer.website"],a[href*="/blog"]').forEach(function(a){
      (a.closest('li')||a).style.display='none'; a.style.display='none';
    });
    document.querySelectorAll('p,span,a,div').forEach(function(el){
      if(el.children.length>0) return;
      var t=(el.textContent||'').trim();
      if(/^(Made in Framer|Made by|Framer|Create a free website)/.test(t)){ (el.closest('div')||el).style.display='none'; el.style.display='none'; }
    });
  }
  function apply(){ injectCSS(); fixNav(); fixOptions(); fixSplit(); hideFiller(); }
  var t=null; function schedule(){ if(t) return; t=setTimeout(function(){t=null;apply();},160); }
  function boot(){
    apply(); [250,700,1500,3000,5000,8000].forEach(function(ms){setTimeout(apply,ms);});
    var obs=new MutationObserver(schedule);
    try{ obs.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    setTimeout(function(){ try{obs.disconnect();}catch(e){} },14000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
