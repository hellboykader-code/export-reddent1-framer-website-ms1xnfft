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
  // routes Framer (SANS slash final, SANS index.html)
  var LINKS=[['Accueil','/'],['À propos','/about'],['Soins','/service'],['Équipe','/doctors']];
  function hideOriginalHeader(){
    if(document.getElementById('rd-hidehead')) return;
    var st=document.createElement('style'); st.id='rd-hidehead';
    st.textContent='header,[data-framer-name="Header"]{display:none !important}';
    (document.head||document.documentElement).appendChild(st);
  }
  // navigation SPA interne : on met à jour l'historique + on notifie le routeur Framer
  // (évite le rechargement + la redirection GitHub qui ajoute un / final => plus de 404)
  function navTo(path){
    var url=BASE+path;
    try{
      history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate',{state:{}}));
    }catch(err){ window.location.assign(url); }
  }
  function go(path){ return function(e){ e.preventDefault(); e.stopPropagation(); navTo(path); }; }
  function buildNavbar(){
    hideOriginalHeader();
    if(document.getElementById('rd-navbar')) return;
    var bar=document.createElement('div'); bar.id='rd-navbar';
    bar.style.cssText='position:fixed;top:0;left:0;width:100%;z-index:2147483000;display:flex;'
      +'align-items:center;justify-content:space-between;gap:20px;padding:16px 5%;box-sizing:border-box;'
      +'background:transparent;'
      +"font-family:'Figtree','Inter',system-ui,sans-serif;";
    // logo (rendu blanc)
    var lg=document.createElement('a'); lg.href=BASE+'/'; lg.addEventListener('click',go('/'));
    lg.style.cssText='display:flex;align-items:center;flex:0 0 auto;cursor:pointer';
    var img=document.createElement('img'); img.src=LOGO; img.alt='RedDent';
    img.style.cssText='height:34px;width:auto;display:block;filter:brightness(0) invert(1)';
    lg.appendChild(img); bar.appendChild(lg);
    // liens
    var mid=document.createElement('div');
    mid.style.cssText='display:flex;flex-direction:row;align-items:center;gap:34px;flex-wrap:nowrap';
    LINKS.forEach(function(p){
      var a=document.createElement('a'); a.href=BASE+p[1]; a.textContent=p[0]; a.addEventListener('click',go(p[1]));
      a.style.cssText='color:#fff;font-size:16px;font-weight:500;text-decoration:none;white-space:nowrap;cursor:pointer;'
        +'text-shadow:0 1px 3px rgba(0,0,0,.35)';
      mid.appendChild(a);
    });
    bar.appendChild(mid);
    // bouton Contact
    var ct=document.createElement('a'); ct.href=BASE+'/contact'; ct.textContent='Contact'; ct.addEventListener('click',go('/contact'));
    ct.style.cssText='background:#d0fc6d;color:#0b1e17;font-size:16px;font-weight:600;text-decoration:none;'
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
    "Write your message":"Votre message"
  };
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
  var CONTACT=BASE+'/contact/index.html';
  function toRDV(el){
    setText(el,'Prendre rendez-vous');
    if(el.tagName==='A') el.setAttribute('href',CONTACT);
    if(!el.__rdcta){ el.__rdcta=1; el.style.cursor='pointer';
      el.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.location.href=CONTACT; }, true); }
  }
  function fixServiceCards(){
    // 1) boutons repérés par TEXTE (le href peut être « void(0) » / « # »)
    document.querySelectorAll('a,button').forEach(function(el){
      var kids=[].filter.call(el.children,function(c){return c.tagName!=='SPAN'&&c.tagName!=='SVG'&&c.tagName!=='svg';});
      if(kids.length>0) return;
      var t=norm(el.textContent);
      if(t==='En savoir plus'||t==='Lire la suite'||t==='Read more'||t==='More info'||t==='Discover More'||t==='En savoir plus »'){ toRDV(el); }
    });
    // 2) liens directs vers les pages détail supprimées -> Contact
    document.querySelectorAll('a[href*="/service/"]').forEach(function(a){
      var h=a.getAttribute('href')||'';
      if(/\/service\/[a-z0-9-]+\/?(index\.html)?($|[?#])/i.test(h) && !/\/service\/?(index\.html)?($|[?#])/i.test(h)){
        a.setAttribute('href', CONTACT);
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

  function apply(){ injectCSS(); buildNavbar(); translateContent(); fixServiceCards(); cleanFooter(); }
  var t=null; function schedule(){ if(t) return; t=setTimeout(function(){t=null;apply();},150); }
  function boot(){
    apply(); [200,500,1000,2000,3500,5000,8000].forEach(function(ms){setTimeout(apply,ms);});
    var obs=new MutationObserver(schedule);
    try{ obs.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    setTimeout(function(){ try{obs.disconnect();}catch(e){} },20000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
