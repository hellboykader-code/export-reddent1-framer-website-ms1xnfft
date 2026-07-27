/* RedDent — post-hydratation Framer.
   1) Barre de nav propre : Accueil · À propos · Soins · Équipe (+ bouton Contact)
   2) Traducteur runtime (le .mjs peut être servi en cache anglais)
   3) Cartes de soins : bouton -> « Prendre rendez-vous » vers la page Contact
   4) Footer : retrait UNIQUEMENT du bloc « S'abonner » + crédit « Conçu par ©RedDevs »
   Robuste aux re-render React (MutationObserver + ré-application). */
(function(){
  var BASE="/export-reddent1-framer-website-ms1xnfft";
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
  function setText(el,val){
    var walk=function(n){for(var i=0;i<n.childNodes.length;i++){var c=n.childNodes[i];
      if(c.nodeType===3 && c.nodeValue && c.nodeValue.trim()){c.nodeValue=val;
        for(var j=i+1;j<n.childNodes.length;j++){var d=n.childNodes[j];
          if(d.nodeType===3 && d.nodeValue && d.nodeValue.trim()) d.nodeValue='';}
        return true;}
      if(c.nodeType===1 && walk(c))return true;}return false;};
    if(!walk(el)) el.textContent=val;
  }
  function norm(s){ return (s||'').replace(/\s+/g,' ').trim(); }

  // ---------- 1) BARRE DE NAV 100% CUSTOM (indépendante de React) ----------
  // On masque l'en-tête Framer d'origine et on injecte NOTRE barre dans <body>
  // (hors racine React => jamais supprimée). URLs en « / » (routes Framer, pas index.html).
  var LOGO=BASE+"/assets/framer/images/748Yvl23yjwdTa9ptR8Op9Z7c.svg";
  // URLs en RÉPERTOIRE avec « / » final (SANS index.html) : Framer normalise le slash
  // final (Ei: path.replace(/^\/|\/$/,'')) => la route matche. Simple lien <a> = navigation
  // complète fiable (c'est ainsi que fonctionnent les liens profonds d'un export statique).
  // « Soins » n'est PLUS une page : c'est un scroll vers la section Soins de l'accueil.
  var LINKS=[['Accueil',BASE+'/'],['À propos',BASE+'/about/'],['Soins','#soins'],['Équipe',BASE+'/doctors/']];
  var SOINS_SEL='[data-framer-name="Service Section"]';
  function onHome(){ var p=(location.pathname||'').replace(/\/+$/,''); return p===BASE||p===''||p===BASE+'/index.html'; }
  function scrollSoins(){
    var s=document.querySelector(SOINS_SEL); if(!s) return false;
    var y=s.getBoundingClientRect().top+(window.pageYOffset||document.documentElement.scrollTop)-70;
    window.scrollTo({top:y,behavior:'smooth'}); return true;
  }
  function gotoSoins(e){
    if(e){e.preventDefault(); e.stopPropagation();}
    if(onHome()){ if(!scrollSoins()){ var n=0,t=setInterval(function(){ if(scrollSoins()||++n>12) clearInterval(t); },250); } }
    else{ location.assign(BASE+'/#soins'); }
  }
  function hideOriginalHeader(){
    if(document.getElementById('rd-hidehead')) return;
    var st=document.createElement('style'); st.id='rd-hidehead';
    st.textContent='header,[data-framer-name="Header"]{display:none !important}';
    (document.head||document.documentElement).appendChild(st);
  }
  // ⭐ Framer traite TOUS les <a> internes (href -> « javascript:void(0) ») et peut
  // remplacer le nœud => nos handlers sautent. Donc on n'utilise PAS de <a> : nos
  // boutons sont des <div>/<span> (Framer ne les touche pas), avec un handler de clic
  // qui fait une navigation complète vers /route/ (que le routeur Framer résout).
  function navItem(tag,label,url){
    var el=document.createElement(tag);
    if(label!=null) el.textContent=label;
    el.setAttribute('role','link'); el.setAttribute('tabindex','0');
    var goFn=function(e){ if(e){e.preventDefault(); e.stopPropagation();} window.location.assign(url); };
    el.addEventListener('click',goFn);
    el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ') goFn(e); });
    el.style.cursor='pointer';
    return el;
  }
  function buildNavbar(){
    hideOriginalHeader();
    if(document.getElementById('rd-navbar')) return;
    var bar=document.createElement('div'); bar.id='rd-navbar';
    bar.style.cssText='position:fixed;top:0;left:0;width:100%;z-index:2147483000;display:flex;'
      +'align-items:center;justify-content:space-between;gap:20px;padding:16px 5%;box-sizing:border-box;'
      +'background:transparent;'
      +"font-family:'Figtree','Inter',system-ui,sans-serif;";
    // logo (rendu blanc) — <div> cliquable, pas un <a>
    var lg=navItem('div',null,BASE+'/');
    lg.style.cssText='display:flex;align-items:center;flex:0 0 auto;cursor:pointer';
    var img=document.createElement('img'); img.src=LOGO; img.alt='RedDent';
    img.style.cssText='height:34px;width:auto;display:block;filter:brightness(0) invert(1);pointer-events:none';
    lg.appendChild(img); bar.appendChild(lg);
    // liens
    var mid=document.createElement('div');
    mid.style.cssText='display:flex;flex-direction:row;align-items:center;gap:34px;flex-wrap:nowrap';
    LINKS.forEach(function(p){
      var a;
      if(p[1]==='#soins'){ // Soins = scroll vers la section de l'accueil (plus de page)
        a=document.createElement('div'); a.textContent=p[0];
        a.setAttribute('role','link'); a.setAttribute('tabindex','0');
        a.addEventListener('click',gotoSoins);
        a.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ') gotoSoins(e); });
      } else { a=navItem('div',p[0],p[1]); }
      a.style.cssText='color:#fff;font-size:16px;font-weight:500;white-space:nowrap;cursor:pointer;'
        +'text-shadow:0 1px 3px rgba(0,0,0,.35)';
      mid.appendChild(a);
    });
    bar.appendChild(mid);
    // bouton Contact
    var ct=navItem('div','Contact',BASE+'/contact/');
    ct.style.cssText='background:#d0fc6d;color:#0b1e17;font-size:16px;font-weight:600;'
      +'padding:11px 24px;border-radius:999px;white-space:nowrap;flex:0 0 auto;cursor:pointer';
    bar.appendChild(ct);
    document.body.appendChild(bar);
  }

  // ---------- 2) TRADUCTEUR RUNTIME ----------
  var TR={
    "Pediatric Dentistry":"Dentisterie pédiatrique","Cosmetic Dentistry":"Dentisterie esthétique",
    "Restorative Dentistry":"Dentisterie restauratrice","Orthodontics Care":"Orthodontie",
    "Preventive Dentistry":"Dentisterie préventive","Emergency Dentistry":"Dentisterie d’urgence",
    "General Dentistry":"Dentisterie générale",
    "Protect your teeth with regular cleanings, fluoride treatments, and check-ups.":
      "Protégez vos dents grâce aux détartrages réguliers, aux traitements au fluor et aux contrôles.",
    "Make your smile shine with some whitening, veneers, and a bunch of other cool options!":
      "Faites briller votre sourire grâce au blanchiment, aux facettes et à bien d’autres solutions !",
    "We've got fillings, crowns, and implants to help you get your smile back and feel great!":
      "Plombages, couronnes et implants : nous redonnons vie à votre sourire pour votre bien-être !",
    "We’ve got fillings, crowns, and implants to help you get your smile back and feel great!":
      "Plombages, couronnes et implants : nous redonnons vie à votre sourire pour votre bien-être !",
    "Achieve a great smile with classic metal braces or discreet clear aligners!":
      "Un beau sourire grâce aux bagues métalliques classiques ou aux gouttières transparentes discrètes !",
    "Dental Exams & Cleanings":"Examens & détartrages","Teeth Whitening":"Blanchiment des dents",
    "Cavity Fillings":"Traitement des caries","Dental Sealants":"Scellements dentaires",
    "Dental Fillings & Crowns":"Plombages & couronnes","Dental Implants & Bridges":"Implants & bridges",
    "Wisdom Teeth Removal":"Extraction des dents de sagesse","Traditional Metal Braces":"Bagues métalliques traditionnelles",
    "Invisalign & Clear Aligners":"Invisalign & gouttières transparentes","Fluoride Treatments":"Traitements au fluor",
    "Root Canal Therapy":"Traitement de canal","Dental Cleanings":"Détartrages",
    "Consultation & Assessment":"Consultation & bilan","Personalized Treatment Plan":"Plan de traitement personnalisé",
    "Treatment & Follow-Up":"Traitement & suivi","Treatment & Follow Up":"Traitement & suivi",
    "See All Services":"Voir tous nos soins","Discover More":"En savoir plus","Load More":"Voir plus",
    "Our Team":"Notre équipe","Our Specialist":"Nos praticiens","Why choose us":"Pourquoi nous choisir",
    "Make an Appointment":"Prendre rendez-vous","Make An Appointment":"Prendre rendez-vous",
    "Chief Dental Officer":"Chirurgien-dentiste en chef","Dental Practice Director":"Directeur du cabinet dentaire",
    "Lead Dentist":"Dentiste référent","Simple online scheduling":"Réservation en ligne simple",
    "General":"Général","Dental":"Dentaire","injury":"Urgence dentaire",
    "Write your message":"Votre message","Doctor":"Nos praticiens","Our Services":"Nos soins"
  };
  // Footer : traduire les libellés de nav + masquer News/Blogs (le .mjs réinjecte l'anglais)
  function fixFooter(){
    var M={'Home':'Accueil','About':'À propos','Service':'Soins','Services':'Soins','Doctors':'Équipe','Doctor':'Équipe','Contact Us':'Contact'};
    document.querySelectorAll('footer a, [data-framer-name*="Footer"] a').forEach(function(a){
      var t=norm(a.textContent); var h=a.getAttribute('href')||'';
      if(t==='News'||t==='Blogs'||t==='Blog'||t==='Journal'||/\/blog/.test(h)){ (a.closest('li')||a).style.display='none'; a.style.display='none'; return; }
      if(M[t]) setText(a,M[t]);
      // Soins/Service dans le footer -> scroll section (la page est supprimée)
      if(t==='Service'||t==='Services'||t==='Soins'||/\/service/.test(h)){
        a.setAttribute('href',BASE+'/#soins');
        if(!a.__rdsoins){ a.__rdsoins=1; a.addEventListener('click',gotoSoins,true); }
      }
    });
  }
  function translateContent(){
    document.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,button,li,option').forEach(function(el){
      if(el.getAttribute('data-frtr')==='1') return;
      var rich=[].filter.call(el.children,function(c){return c.tagName!=='SPAN'||c.children.length>0;});
      if(rich.length>0 && el.tagName!=='OPTION') return;
      var fr=TR[norm(el.textContent)]; if(!fr) return;
      setText(el,fr); el.setAttribute('data-frtr','1');
    });
    // placeholders restés en anglais
    document.querySelectorAll('input,textarea').forEach(function(inp){
      var p=inp.getAttribute('placeholder')||'';
      if(p==='Write your message') inp.setAttribute('placeholder','Votre message');
      if(p==='Jane Smith') inp.setAttribute('placeholder','Votre prénom');
    });
  }

  // ---------- 3) CARTES SOINS : « En savoir plus » -> « Prendre rendez-vous » / page Contact ----------
  var CONTACT=BASE+'/contact/';
  function toRDV(el){
    setText(el,'Prendre rendez-vous');
    if(el.tagName==='A') el.setAttribute('href',CONTACT);
    if(!el.__rdcta){ el.__rdcta=1; el.style.cursor='pointer';
      el.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.location.href=CONTACT; }, true); }
  }
  // « En savoir plus », « Lire la suite »… quels que soient les guillemets/flèche/icône
  function isMoreLabel(t){
    t=norm(t).replace(/[«»↗→›»→↗\s]+/g,' ').trim().toLowerCase();
    return t==='en savoir plus'||t==='lire la suite'||t==='read more'||t==='more info'
         ||t==='discover more'||t==='learn more'||t==='voir le soin'||t==='savoir plus';
  }
  function fixServiceCards(){
    // 1) boutons repérés par TEXTE (le href peut être « void(0) » / « # ») — inclut <div role>
    document.querySelectorAll('a,button,[role="link"],[role="button"]').forEach(function(el){
      if(el.id==='rd-navbar'||el.closest('#rd-navbar')) return;   // jamais la nav
      var t=norm(el.textContent);
      if(t.length>42) return;              // évite d'attraper une carte entière
      if(isMoreLabel(t)) toRDV(el);
    });
    // 2) liens vers les pages détail supprimées -> Contact
    document.querySelectorAll('a[href*="/service/"]').forEach(function(a){
      var h=a.getAttribute('href')||'';
      if(/\/service\/[a-z0-9-]+\/?(index\.html)?($|[?#])/i.test(h) && !/\/service\/?(index\.html)?($|[?#])/i.test(h)){
        a.setAttribute('href', CONTACT);
      }
    });
    // 3) « Voir tous nos soins » -> SUPPRIMÉ ; « À propos de RedDent » -> page À propos ;
    //    autres liens vers la page Soins supprimée -> scroll section.
    document.querySelectorAll('a,button,[role="link"],[role="button"]').forEach(function(el){
      if(el.id==='rd-navbar'||el.closest('#rd-navbar')||el.__rdcta3) return;
      var t=norm(el.textContent).toLowerCase().replace(/[«»↗→\s]+/g,' ').trim();
      var h=(el.getAttribute&&el.getAttribute('href'))||'';
      // a) bouton « Voir tous nos soins » -> masquer complètement
      if(t==='voir tous nos soins'||t==='voir tous les soins'||t==='see all services'){
        el.__rdcta3=1; el.style.display='none';
        var pr=el.parentElement; if(pr && norm(pr.textContent).toLowerCase().replace(/[«»↗→\s]+/g,' ').trim()===t) pr.style.display='none';
        return;
      }
      // b) « À propos de RedDent » (CTA void(0)) -> page À propos
      if(t==='à propos de reddent'||t==='a propos de reddent'||t==='à propos de red dent'){
        el.__rdcta3=1; el.style.cursor='pointer';
        if(el.tagName==='A') el.setAttribute('href',BASE+'/about/');
        el.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); location.assign(BASE+'/about/'); },true);
        return;
      }
      // c) autre lien direct vers /service/ (footer…) -> scroll section
      if(/\/service\/?(index\.html)?($|[?#])/i.test(h)){
        el.__rdcta3=1; el.style.cursor='pointer';
        if(el.tagName==='A') el.setAttribute('href',BASE+'/#soins');
        el.addEventListener('click',gotoSoins,true);
      }
    });
  }

  // ---------- 4) FOOTER : retrait bloc « S'abonner » + crédit ----------
  function cleanFooter(){
    document.querySelectorAll('a,button,p,span,div').forEach(function(el){
      if(el.children.length>0) return;
      var t=norm(el.textContent);
      if(t==="S’abonner"||t==="S'abonner"||t==="Subscribe"||t==="Subscribe Now"){
        var box=el; for(var i=0;i<5 && box.parentElement;i++){ box=box.parentElement;
          if(box.querySelector('input')) break; }
        box.style.display='none';
      }
      if(/^(Conçu par|©\s*RedDevs|Made in Framer|Made by)/i.test(t) || /RedDevs/.test(t)){
        (el.closest('div')||el).style.display='none'; el.style.display='none';
      }
    });
    document.querySelectorAll('a[href*="framer.com"],a[href*="framer.link"],a[href*="framer.website"]').forEach(function(a){
      (a.closest('li')||a).style.display='none'; a.style.display='none';
    });
  }

  function apply(){ injectCSS(); buildNavbar(); translateContent(); fixServiceCards(); fixFooter(); cleanFooter(); }
  var t=null; function schedule(){ if(t) return; t=setTimeout(function(){t=null;apply();},150); }
  function boot(){
    apply(); [200,500,1000,2000,3500,5000,8000].forEach(function(ms){setTimeout(apply,ms);});
    var obs=new MutationObserver(schedule);
    try{ obs.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    setTimeout(function(){ try{obs.disconnect();}catch(e){} },20000);
    // arrivée sur l'accueil avec #soins => descendre vers la section Soins
    if(onHome() && location.hash==='#soins'){
      var n=0,t2=setInterval(function(){ if(scrollSoins()||++n>16) clearInterval(t2); },300);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
