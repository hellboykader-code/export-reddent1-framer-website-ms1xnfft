/* RedDent — post-hydratation Framer.
   1) nav propre : Accueil · À propos · Soins · Équipe · Contact (masque « Nos pages » + Blog, injecte les liens)
   2) traducteur runtime (le .mjs peut être servi en cache anglais) : soins, puces, étapes
   3) footer : retrait « S'abonner » + « Conçu par ©RedDevs »
   Robuste aux re-render React (MutationObserver + ré-application). */
(function(){
  var BASE="/export-reddent1-framer-website-ms1xnfft";
  function injectCSS(){
    if(document.getElementById('reddent-fix-css')) return;
    var css=[
      '[data-framer-name="Testimonial Section"]{display:none !important}',
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

  // ---------- 1) NAV ----------
  function navLinks(){
    return [].slice.call(document.querySelectorAll('nav a, header a, [data-framer-name*="Nav"] a, [data-framer-name*="Menu"] a, [data-framer-name*="Header"] a'));
  }
  function fixNav(){
    navLinks().forEach(function(a){
      var t=norm(a.textContent); var h=a.getAttribute('href')||'';
      if(t==='Nos pages'||t==='All Pages'||t==='Blog'||t==='News'||t==='Blogs'||t==='Journal'||t==='404'||/\/blog/.test(h)){
        (a.closest('li')||a).style.display='none'; a.style.display='none';
      }
      if(t==='Contact Us'){ setText(a,'Contact'); }
    });
    injectNav();
  }
  // injecte Soins / Équipe / Contact en clonant le lien « À propos »
  function injectNav(){
    var about=null;
    navLinks().forEach(function(a){ if(norm(a.textContent)==='À propos') about=a; });
    if(!about) return;
    var host=about.parentElement; if(!host) return;
    // On remplace « Nos pages » + « Blog » (masqués) par 2 liens -> même densité, une seule ligne.
    // « Contact » existe déjà en bouton à droite (5e page).
    var want=[['Soins',BASE+'/service/index.html'],['Équipe',BASE+'/doctors/index.html']];
    var have={}; navLinks().forEach(function(a){ have[norm(a.textContent)]=true; });
    var after=about;
    want.forEach(function(p){
      if(have[p[0]]) return;
      if(host.querySelector('a[data-frnav="'+p[0]+'"]')) return;
      var c=about.cloneNode(true);
      c.setAttribute('data-frnav',p[0]);
      c.setAttribute('href',p[1]);
      c.removeAttribute('data-framer-name');
      setText(c,p[0]);
      if(after.nextSibling) host.insertBefore(c,after.nextSibling); else host.appendChild(c);
      after=c;
    });
  }

  // ---------- 2) TRADUCTEUR RUNTIME (contenu servi en cache anglais) ----------
  var TR={
    // noms de soins
    "Pediatric Dentistry":"Dentisterie pédiatrique","Cosmetic Dentistry":"Dentisterie esthétique",
    "Restorative Dentistry":"Dentisterie restauratrice","Orthodontics Care":"Orthodontie",
    "Preventive Dentistry":"Dentisterie préventive","Emergency Dentistry":"Dentisterie d’urgence",
    "General Dentistry":"Dentisterie générale",
    // descriptions cartes
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
    // puces
    "Dental Exams & Cleanings":"Examens & détartrages","Teeth Whitening":"Blanchiment des dents",
    "Cavity Fillings":"Traitement des caries","Dental Sealants":"Scellements dentaires",
    "Dental Fillings & Crowns":"Plombages & couronnes","Dental Implants & Bridges":"Implants & bridges",
    "Wisdom Teeth Removal":"Extraction des dents de sagesse","Traditional Metal Braces":"Bagues métalliques traditionnelles",
    "Invisalign & Clear Aligners":"Invisalign & gouttières transparentes","Fluoride Treatments":"Traitements au fluor",
    "Root Canal Therapy":"Traitement de canal","Dental Cleanings":"Détartrages",
    // étapes / process
    "Consultation & Assessment":"Consultation & bilan","Personalized Treatment Plan":"Plan de traitement personnalisé",
    "Treatment & Follow-Up":"Traitement & suivi","Treatment & Follow Up":"Traitement & suivi",
    // divers boutons/titres
    "See All Services":"Voir tous nos soins","Discover More":"En savoir plus","Load More":"Voir plus",
    "Our Service":"Nos soins","Our Services":"Nos soins","Working Process":"Notre méthode",
    "Our Team":"Notre équipe","Our Specialist":"Nos praticiens","Why choose us":"Pourquoi nous choisir",
    "Make an Appointment":"Prendre rendez-vous","Make An Appointment":"Prendre rendez-vous"
  };
  function translateContent(){
    document.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,button,li').forEach(function(el){
      if(el.getAttribute('data-frtr')==='1') return;
      var rich=[].filter.call(el.children,function(c){return c.tagName!=='SPAN'||c.children.length>0;});
      if(rich.length>0) return;
      var fr=TR[norm(el.textContent)]; if(!fr) return;
      setText(el,fr); el.setAttribute('data-frtr','1');
    });
  }

  // ---------- 3) FOOTER : retrait S'abonner + crédit ----------
  function cleanFooter(){
    // bloc newsletter : bouton « S'abonner » -> masquer son conteneur (avec l'input e-mail)
    document.querySelectorAll('a,button,p,span,div').forEach(function(el){
      if(el.children.length>0) return;
      var t=norm(el.textContent);
      if(t==="S’abonner"||t==="S'abonner"||t==="Subscribe"||t==="Subscribe Now"){
        var box=el; for(var i=0;i<5 && box.parentElement;i++){ box=box.parentElement;
          if(box.querySelector('input')) break; }
        box.style.display='none';
      }
    });
    // champ e-mail template jane@framer.com
    document.querySelectorAll('input').forEach(function(inp){
      var v=(inp.getAttribute('placeholder')||inp.value||'');
      if(/framer\.com/i.test(v)){ var b=inp; for(var i=0;i<5&&b.parentElement;i++){b=b.parentElement;} b.style.display='none'; }
    });
    // crédit « Conçu par ©RedDevs … »
    document.querySelectorAll('p,span,div,a').forEach(function(el){
      if(el.children.length>0) return;
      var t=norm(el.textContent);
      if(/Conçu par|RedDevs|©\s*RedDevs|Made in Framer|Made by/i.test(t)){
        (el.closest('div')||el).style.display='none'; el.style.display='none';
      }
    });
    document.querySelectorAll('a[href*="framer.com"],a[href*="framer.link"],a[href*="framer.website"]').forEach(function(a){
      (a.closest('li')||a).style.display='none'; a.style.display='none';
    });
  }

  function apply(){ injectCSS(); fixNav(); translateContent(); cleanFooter(); }
  var t=null; function schedule(){ if(t) return; t=setTimeout(function(){t=null;apply();},150); }
  function boot(){
    apply(); [200,500,1000,2000,3500,5000,8000].forEach(function(ms){setTimeout(apply,ms);});
    var obs=new MutationObserver(schedule);
    try{ obs.observe(document.body,{childList:true,subtree:true}); }catch(e){}
    setTimeout(function(){ try{obs.disconnect();}catch(e){} },20000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
