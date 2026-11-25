/* Iron Ring website translations.
   English is written straight into index.html (best for Google and for speed).
   To add a language:
     1. Copy i18n/en.json to i18n/xx.json (xx = language code, e.g. de, fr, es, it, pt, ru, tr, pl, ar).
     2. Translate the text on the right of each line. Keep the keys on the left unchanged.
     3. Add the language to LANGUAGES below, e.g.  de: "Deutsch",
   The site then picks the visitor's phone/browser language automatically and shows a language menu in the footer.
   A link like https://ironringgame-cmyk.github.io/?lang=de opens a specific language. */
(function(){
  var LANGUAGES = { en: "English" };          // add more here, e.g.  de: "Deutsch", fr: "Français"
  var RTL = ['ar','he','fa','ur'];
  var EXTRA = { "press.copied": "Copied", "meta.title": document.title };   // strings that are not visible in the page
  var dict = {}, en = {};

  // collect the English text from the page, so missing translations fall back to English
  function collect(){
    [].forEach.call(document.querySelectorAll('[data-i18n]'),function(el){ en[el.dataset.i18n]=el.textContent.trim(); });
    [].forEach.call(document.querySelectorAll('[data-i18n-alt]'),function(el){ en[el.dataset.i18nAlt]=el.alt; });
    for(var k in EXTRA) en[k]=EXTRA[k];
  }
  function t(key){ return (dict[key]!=null?dict[key]:en[key]) || ''; }
  function apply(){
    [].forEach.call(document.querySelectorAll('[data-i18n]'),function(el){ var v=t(el.dataset.i18n); if(v) el.textContent=v; });
    [].forEach.call(document.querySelectorAll('[data-i18n-alt]'),function(el){ var v=t(el.dataset.i18nAlt); if(v) el.alt=v; });
    if(dict['meta.title']) document.title=dict['meta.title'];
  }
  function pick(){
    var q=(location.search.match(/[?&]lang=([a-z-]+)/i)||[])[1];
    var saved=null; try{ saved=localStorage.getItem('ir_lang'); }catch(e){}
    var wanted=[q,saved].concat(navigator.languages||[navigator.language||'en']);
    for(var i=0;i<wanted.length;i++){ if(!wanted[i]) continue; var c=String(wanted[i]).toLowerCase(), b=c.split('-')[0];
      if(LANGUAGES[c]) return c; if(LANGUAGES[b]) return b; }
    return 'en';
  }
  function setLang(code){
    document.documentElement.lang=code;
    document.documentElement.dir=RTL.indexOf(code)>-1?'rtl':'ltr';
    if(code==='en'){ dict={}; apply(); return; }
    fetch('i18n/'+code+'.json').then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ dict=d; apply(); }).catch(function(){ dict={}; apply(); });
  }
  function picker(code){
    var codes=Object.keys(LANGUAGES); if(codes.length<2) return;
    var box=document.getElementById('langPick'); if(!box) return;
    var s='<label class="sr" for="langSel">Language</label><select id="langSel">';
    codes.forEach(function(c){ s+='<option value="'+c+'"'+(c===code?' selected':'')+'>'+LANGUAGES[c]+'</option>'; });
    box.innerHTML=s+'</select>'; box.hidden=false;
    document.getElementById('langSel').addEventListener('change',function(){ try{localStorage.setItem('ir_lang',this.value);}catch(e){} setLang(this.value); });
  }
  window.I18N={ t:t, set:setLang, languages:LANGUAGES };
  function start(){ collect(); var code=pick(); if(code!=='en') setLang(code); picker(code); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
