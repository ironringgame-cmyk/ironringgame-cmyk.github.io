/* Iron Ring: animated sea behind the hero (from the game's flat-style sea, night colours).
   Light on purpose: max 30 fps, only tiles on screen, stops when the hero is off screen
   or the tab is hidden, and draws one still frame when "reduce motion" is on. */
(function(){
  var cv=document.getElementById('sea'); if(!cv||!cv.getContext) return;
  var g=cv.getContext('2d',{alpha:false});
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TILE=1200, WIND=0.35;              // slow drift towards the lower right
  function rnd(s){return function(){s=(s*16807)%2147483647;return s/2147483647}}
  var r=rnd(12345), arcs=[], dots=[], patches=[], i;
  for(i=0;i<300;i++)arcs.push({x:r()*TILE,y:r()*TILE,w:12+r()*18,ph:r()*6.28,sp:0.6+r()*0.8,a:0.18+r()*0.17,dbl:r()<0.3});
  for(i=0;i<380;i++)dots.push({x:r()*TILE,y:r()*TILE,s:1+r()*2.6,ph:r()*6.28});
  for(i=0;i<26;i++)patches.push({x:r()*TILE,y:r()*TILE,rad:60+r()*110,ph:r()*6.28,light:r()<0.55});
  var W=0,H=0,dpr=1;
  function size(){
    dpr=Math.min(window.devicePixelRatio||1, innerWidth<700?1.5:1.25);
    W=cv.clientWidth; H=cv.clientHeight;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
  }
  function draw(t){
    g.setTransform(dpr,0,0,dpr,0,0);
    var wx=Math.cos(WIND), wy=Math.sin(WIND);
    var ox=-(wx*t*7), oy=-(wy*t*7);
    g.fillStyle='#123a5c'; g.fillRect(0,0,W,H);
    var x0=Math.floor(-ox/TILE), y0=Math.floor(-oy/TILE), x1=Math.floor((W-ox)/TILE), y1=Math.floor((H-oy)/TILE);
    g.lineCap='round';
    for(var tx=x0;tx<=x1;tx++)for(var ty=y0;ty<=y1;ty++){
      var bx=ox+tx*TILE, by=oy+ty*TILE, k, p, d, a, s;
      for(k=0;k<patches.length;k++){p=patches[k];var px=bx+p.x,py=by+p.y;
        if(px+p.rad<0||px-p.rad>W||py+p.rad<0||py-p.rad>H) continue;
        var b=0.5+0.5*Math.sin(t*0.25+p.ph), gr=g.createRadialGradient(px,py,0,px,py,p.rad);
        gr.addColorStop(0,p.light?'rgba(70,130,185,'+(0.22*b)+')':'rgba(6,26,48,'+(0.3*b)+')'); gr.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gr; g.fillRect(px-p.rad,py-p.rad,p.rad*2,p.rad*2);}
      for(k=0;k<dots.length;k++){d=dots[k];var dx=bx+d.x,dy=by+d.y; if(dx<-4||dx>W+4||dy<-4||dy>H+4) continue;
        g.fillStyle='rgba(70,125,175,'+(0.32+0.18*Math.sin(t*0.8+d.ph))+')';
        g.beginPath(); g.arc(dx,dy,d.s,0,6.283); g.fill();}
      g.lineWidth=1.6;
      for(k=0;k<arcs.length;k++){a=arcs[k];var ax=bx+a.x; if(ax<-40||ax>W+40) continue;
        s=Math.sin(t*a.sp+a.ph); var life=0.5+0.5*s, ay=by+a.y-2*s; if(ay<-40||ay>H+40) continue;
        var al=Math.min(a.a*(0.35+0.65*life),0.7)*0.85, w=a.w*(0.85+0.25*life);
        g.strokeStyle='rgba(150,190,225,'+al+')';
        g.beginPath(); g.arc(ax,ay+w*0.55,w*0.6,Math.PI*1.18,Math.PI*1.82); g.stroke();
        if(a.dbl){g.beginPath(); g.arc(ax+w*0.9,ay+w*0.55+2,w*0.45,Math.PI*1.2,Math.PI*1.8); g.stroke();}}
      for(k=0;k<4;k++){d=dots[(k*17+Math.floor(t*0.7))%dots.length]; var sp=Math.max(0,Math.sin(t*3+k));
        if(sp>0.6){g.fillStyle='rgba(255,255,255,'+((sp-0.6)*1.6)+')'; g.beginPath(); g.arc(bx+d.x+6,by+d.y-4,1.4,0,6.283); g.fill();}}
    }
  }
  size(); draw(8);
  if(still) { addEventListener('resize',function(){size();draw(8);}); return; }
  var running=false, visible=true, last=0, t0=performance.now()-8000;
  function loop(ms){
    if(!running) return;
    requestAnimationFrame(loop);
    if(ms-last<33) return;            // ~30 fps is plenty for a slow sea
    last=ms; draw((ms-t0)/1000);
  }
  function update(){var want=visible&&!document.hidden; if(want&&!running){running=true;requestAnimationFrame(loop);} if(!want) running=false;}
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){visible=e[0].isIntersecting;update();}).observe(cv);
  }
  document.addEventListener('visibilitychange',update);
  var rt; addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){size();draw((performance.now()-t0)/1000);},150);});
  update();
})();
