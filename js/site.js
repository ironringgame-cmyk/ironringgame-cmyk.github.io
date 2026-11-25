/* Iron Ring website: small, dependency-free behaviour. */
(function(){
  var $=function(s,el){return (el||document).querySelector(s)}, $$=function(s,el){return [].slice.call((el||document).querySelectorAll(s))};
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- top bar + mobile menu ---- */
  var bar=$('#bar'), nav=$('#nav'), mb=$('#menuBtn');
  function onScrollBar(){bar.classList.toggle('solid',scrollY>40||nav.classList.contains('open'));}
  addEventListener('scroll',onScrollBar,{passive:true}); onScrollBar();
  function closeMenu(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');onScrollBar();}
  mb.addEventListener('click',function(){var o=!nav.classList.contains('open');nav.classList.toggle('open',o);mb.setAttribute('aria-expanded',String(o));onScrollBar();});
  $$('#nav a').forEach(function(a){a.addEventListener('click',closeMenu);});
  addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});

  /* ---- reveal on scroll ---- */
  if('IntersectionObserver' in window && !still){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    $$('.rv').forEach(function(el){io.observe(el);});
  } else $$('.rv').forEach(function(el){el.classList.add('in');});

  /* ---- gentle parallax on the hero ---- */
  var hero=$('.hero'), sea=$('#sea'), par=$$('[data-parallax]');
  if(!still){
    var ticking=false;
    addEventListener('scroll',function(){ if(ticking) return; ticking=true; requestAnimationFrame(function(){
      ticking=false; var y=scrollY; if(y>hero.offsetHeight) return;
      sea.style.transform='translate3d(0,'+(y*0.28)+'px,0)';
      par.forEach(function(el){el.style.transform='translate3d(0,'+(y*parseFloat(el.dataset.parallax))+'px,0)';});
    });},{passive:true});
  }

  /* ---- marching troops: the game's own token art, each army led by its general ---- */
  var ARMIES=['rome','carthage','greeks','macedon','epirus','persia','mongols','chinese','goths','caliphate'];
  var track=$('#marchTrack');
  if(track){
    var half=ARMIES.map(function(a){return '<picture><source srcset="img/troops/'+a+'-march.webp" type="image/webp">'+
      '<img class="formation" src="img/troops/'+a+'-march.png" width="434" height="136" alt="" decoding="async"></picture>';}).join('');
    track.innerHTML=half+half;
  }

  /* ---- gallery ---- */
  var gt=$('#galTrack'), items=$$('.gal-item',gt), dotsEl=$('#galDots');
  dotsEl.innerHTML=items.map(function(){return '<i></i>';}).join('');
  var dots=$$('i',dotsEl);
  function current(){var mid=gt.scrollLeft+gt.clientWidth/2, best=0, bd=1e9;
    items.forEach(function(it,i){var c=it.offsetLeft+it.offsetWidth/2, d=Math.abs(c-mid); if(d<bd){bd=d;best=i;}}); return best;}
  function mark(){var c=current(); dots.forEach(function(d,i){d.classList.toggle('on',i===c);});}
  function go(i){i=Math.max(0,Math.min(items.length-1,i)); var it=items[i];
    gt.scrollTo({left:it.offsetLeft-(gt.clientWidth-it.offsetWidth)/2,behavior:still?'auto':'smooth'});}
  var st; gt.addEventListener('scroll',function(){clearTimeout(st);st=setTimeout(mark,60);},{passive:true});
  $('#galPrev').addEventListener('click',function(){go(current()-1);});
  $('#galNext').addEventListener('click',function(){go(current()+1);});
  mark();

  /* ---- lightbox ---- */
  var lb=$('#lb'), lbImg=$('#lbImg'), lbCap=$('#lbCap'), btns=$$('.gal-btn'), idx=0, lastFocus=null;
  var webp=(function(){try{return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp')===0;}catch(e){return false;}})();
  function show(i){idx=(i+btns.length)%btns.length; var b=btns[idx], im=$('img',b);
    lbImg.src=webp?b.dataset.full:b.dataset.fullFallback; lbImg.alt=im.alt; lbCap.textContent=$('.cap',b).textContent;}
  function open(i){lastFocus=document.activeElement; show(i); lb.hidden=false; document.body.style.overflow='hidden';
    requestAnimationFrame(function(){lb.classList.add('open');}); $('#lbClose').focus();}
  function close(){lb.classList.remove('open'); document.body.style.overflow='';
    setTimeout(function(){lb.hidden=true; lbImg.removeAttribute('src');},still?0:300); if(lastFocus) lastFocus.focus();}
  btns.forEach(function(b,i){b.addEventListener('click',function(){open(i);});});
  $('#lbClose').addEventListener('click',close);
  $('#lbPrev').addEventListener('click',function(){show(idx-1);});
  $('#lbNext').addEventListener('click',function(){show(idx+1);});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='FIGURE')close();});
  addEventListener('keydown',function(e){ if(lb.hidden) return;
    if(e.key==='Escape')close(); else if(e.key==='ArrowRight')show(idx+1); else if(e.key==='ArrowLeft')show(idx-1);
    else if(e.key==='Tab'){var f=$$('button',lb), a=f.indexOf(document.activeElement);
      if(e.shiftKey&&a<=0){e.preventDefault();f[f.length-1].focus();} else if(!e.shiftKey&&a===f.length-1){e.preventDefault();f[0].focus();}}});
  var sx=null; lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){if(sx===null)return; var d=e.changedTouches[0].clientX-sx; if(Math.abs(d)>45)show(idx+(d<0?1:-1)); sx=null;});

  /* ---- copy press texts ---- */
  var toast=$('#toast');
  function say(t){toast.textContent=t; toast.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){toast.classList.remove('show');},2000);}
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
    var el=document.getElementById(b.dataset.copy), txt=$$('p',el).length?$$('p',el).map(function(p){return p.textContent.trim();}).join('\n\n'):el.textContent.trim();
    var done=function(){say((window.I18N&&I18N.t('press.copied'))||'Copied');};
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,function(){fallback(txt);done();}); else {fallback(txt);done();}
  });});
  function fallback(t){var ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} ta.remove();}
})();
