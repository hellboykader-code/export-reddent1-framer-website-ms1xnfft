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

  // ---------- 1) NAV en place (pas d'injection => stable) ----------
  // Objectif : Accueil · À propos · Soins · Équipe (+ bouton Contact).
  // On modifie les éléments existants : « Nos pages » -> Soins, « Blog » -> Équipe.
  function headerScope(){ return document.querySelector('header')||document.querySelector('[data-framer-name*="Nav"]')||document.querySelector('[data-framer-name*="Header"]')||document.body; }
  function navCandidates(){
    var h=headerScope();
    return [].slice.call(h.querySelectorAll('a,button,div,p,span')).filter(function(el){
      var kids=[].filter.call(el.children,function(c){return c.tagName!=='SPAN'&&c.tagName!=='SVG'&&c.tagName!=='svg';});
      return kids.length===0;
    });
  }
  function killChevrons(el){ el.querySelectorAll('svg').forEach(function(s){ s.style.display='none'; }); }
  function toLink(el,label,href){
    setText(el,label);
    killChevrons(el);
    if(el.tagName==='A'){ el.setAttribute('href',href); }
    if(!el.__rdnav){ el.__rdnav=1;
      el.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.location.href=href; }, true);
      el.style.cursor='pointer';
    }
  }
  function fixNavInPlace(){
    navCandidates().forEach(function(el){
      var t=norm(el.textContent);
      if(t==='Nos pages'||t==='All Pages'){ toLink(el,'Soins',BASE+'/service/index.html'); }
      else if(t==='Blog'){ toLink(el,'Équipe',BASE+'/doctors/index.html'); }
      else if(t==='Journal'||t==='404'||t==='News'||t==='Blogs'){ (el.closest('li')||el).style.display='none'; el.style.display='none'; }
      else if(t==='Contact Us'){ setText(el,'Contact'); }
    });
    // masquer le panneau déroulant (overlay) « Nos pages » : contient « Autres pages » / « Le cabinet »
    document.querySelectorAll('div,section,nav,ul').forEach(function(el){
      if(el.getAttribute && el.getAttribute('data-rdpanel')==='1') { el.style.display='none'; return; }
      var t=el.textContent||'';
      if(t.length>0 && t.length<500 && /Autres pages/i.test(t) && /Le cabinet|Journal|404/i.test(t)){
        el.setAttribute&&el.setAttribute('data-rdpanel','1'); el.style.display='none';
      }
    });
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

  // ---------- 3) CARTES SOINS : bouton -> Prendre rendez-vous / page Contact ----------
  function fixServiceCards(){
    document.querySelectorAll('a[href*="/service/"]').forEach(function(a){
      var h=a.getAttribute('href')||'';
      // pages détail : /service/<slug>/ (pas la page liste /service/)
      if(/\/service\/[a-z0-9-]+\/?(index\.html)?($|[?#])/i.test(h) && !/\/service\/?(index\.html)?($|[?#])/i.test(h)){
        a.setAttribute('href', BASE+'/contact/index.html');
        if(/savoir plus|lire la suite|read more|more info|discover/i.test(a.textContent)) setText(a,'Prendre rendez-vous');
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

  function apply(){ injectCSS(); fixNavInPlace(); translateContent(); fixServiceCards(); cleanFooter(); }
  var t=null; function schedule(){ if(t) return; t=setTimeout(function(){t=null;apply();},150); }
  function boot(){
    apply(); [200,500,1000,2000,3500,5000,8000].forEach(function(ms){setTimeout(apply,ms);});
    var obs=new MutationObserver(schedule);
    try{ obs.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    setTimeout(function(){ try{obs.disconnect();}catch(e){} },20000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
