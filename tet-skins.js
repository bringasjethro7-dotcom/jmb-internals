/* ═══ Shared Tetris cosmetics/sound/rank — portal-matched (render+rank extracted verbatim) ═══ */
var TET_COLORS=[null,'#22d3ee','#facc15','#a855f7','#22c55e','#ef4444','#3b82f6','#f97316'];  // I O T S Z J L
var COLORS=TET_COLORS;
var EQUIPPED='classic';           // set by the skin picker
var COS={ sfx:'arcade', bg:'classic' };

/* ---- SOUND (clean, self-contained) ---- */
var TAC=null;
function ac(){ try{ if(!TAC) TAC=new (window.AudioContext||window.webkitAudioContext)(); if(TAC.state==='suspended') TAC.resume(); }catch(e){ TAC=null; } return TAC; }
function beep(freq,dur,type,vol,delay){ var a=ac(); if(!a) return; try{
  var o=a.createOscillator(), g=a.createGain(); var t=a.currentTime+(delay||0);
  o.type=type||'square'; o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.14,t+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001,t+(dur||0.12));
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+(dur||0.12)+0.03);
}catch(e){} }
function sfxMove(){ beep(320,0.03,'square',0.05); }
function sfxRot(){ beep(480,0.045,'square',0.06); }
function sfxLock(){ beep(150,0.08,'triangle',0.12); }
function sfxDrop(){ beep(110,0.11,'sawtooth',0.12); }
function sfxClear(n){ var base=[0,523,659,784,1046][n]||1046; beep(base,0.12,'triangle',0.18); beep(base*1.5,0.14,'triangle',0.16,0.08); if(n>=4){ beep(base*2,0.18,'triangle',0.16,0.16); } }
function sfxAttack(){ beep(700,0.06,'square',0.12); beep(500,0.08,'square',0.1,0.05); }
function sfxGarbage(){ beep(90,0.16,'sawtooth',0.16); }
function sfxTick(){ beep(880,0.08,'square',0.14); }
function sfxGo(){ [523,659,784,1046].forEach(function(f,i){ beep(f,0.14,'triangle',0.18,i*0.09); }); }
function sfxWin(){ [523,659,784,1046,1318,1046,1318].forEach(function(f,i){ beep(f,0.18,'triangle',0.2,i*0.12); }); }
function sfxLose(){ [440,392,349,294].forEach(function(f,i){ beep(f,0.22,'sawtooth',0.16,i*0.14); }); }

/* ---- RENDER (helpers, DESIGNS incl. chocolate, block/blockAs/ghostCell) — verbatim from portal ---- */
  function hexAdj(hex,amt){ hex=String(hex).replace('#',''); if(hex.length!==6) return hex;
    var r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
    function a(c){ return Math.max(0,Math.min(255,Math.round(c+(amt>0?(255-c)*amt:c*amt)))); }
    return 'rgb('+a(r)+','+a(g)+','+a(b)+')'; }
  function rr(ctx,x,y,w,h,r){ if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(x,y,w,h,r); return; }
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  // Cheap beveled block — no per-cell gradient/shadow (those tanked performance).
  // ── Unlockable BLOCK DESIGNS (render styles). Costs must match backend TETRIS_THEMES. ──
  // Each .cell(ctx, px, py, cs, color) draws one cell — kept lightweight (no per-cell shadow/gradient).
  var DESIGNS={
    classic:{ name:'Classic', cost:0, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.17);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle=col; c.fill();
      c.fillStyle='rgba(255,255,255,.28)'; c.fillRect(px+3,py+3,cs-6,Math.max(2,cs*0.15));
      c.fillStyle='rgba(0,0,0,.22)'; c.fillRect(px+3,py+cs-Math.max(3,cs*0.18),cs-6,Math.max(2,cs*0.13)); } },
    pixel:{ name:'8-Bit', cost:120, hidden:true, cell:function(c,px,py,cs,col){ var s=Math.max(2,cs*0.18);
      c.fillStyle=col; c.fillRect(px+1,py+1,cs-2,cs-2);
      c.fillStyle=hexAdj(col,0.4); c.fillRect(px+1,py+1,cs-2,s); c.fillRect(px+1,py+1,s,cs-2);
      c.fillStyle=hexAdj(col,-0.4); c.fillRect(px+1,py+cs-1-s,cs-2,s); c.fillRect(px+cs-1-s,py+1,s,cs-2); } },
    outline:{ name:'Outline', cost:150, hidden:true, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.2);
      rr(c,px+2,py+2,cs-4,cs-4,r); c.save(); c.globalAlpha=0.16; c.fillStyle=col; c.fill(); c.restore();
      c.lineWidth=Math.max(2,cs*0.11); c.strokeStyle=col; c.stroke(); } },
    glossy:{ name:'Glossy', cost:200, hidden:true, cell:function(c,px,py,cs,col){ var r=Math.max(3,cs*0.24);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle=col; c.fill();
      c.save(); rr(c,px+3,py+3,cs-6,(cs-6)*0.44,Math.max(2,cs*0.18)); c.fillStyle='rgba(255,255,255,.42)'; c.fill(); c.restore();
      c.fillStyle='rgba(0,0,0,.2)'; c.fillRect(px+3,py+cs-Math.max(3,cs*0.16),cs-6,Math.max(2,cs*0.11)); } },
    metallic:{ name:'Metallic', cost:280, hidden:true, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.16); var h=(cs-3)/3;
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      c.fillStyle=hexAdj(col,0.38); c.fillRect(px,py,cs,h+2);
      c.fillStyle=col; c.fillRect(px,py+h,cs,h+2);
      c.fillStyle=hexAdj(col,-0.32); c.fillRect(px,py+2*h,cs,h+3);
      c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(px+2,py+h-Math.max(1,cs*0.05),cs-4,Math.max(1,cs*0.06)); c.restore(); } },
    gem:{ name:'Gem', cost:400, cell:function(c,px,py,cs,col){ var m=2, a=px+m,b=py+m,w=cs-2*m,cx=px+cs/2,cy=py+cs/2;
      c.fillStyle=col; c.fillRect(a,b,w,w);
      c.fillStyle=hexAdj(col,0.45); c.beginPath(); c.moveTo(a,b); c.lineTo(a+w,b); c.lineTo(cx,cy); c.closePath(); c.fill();
      c.fillStyle=hexAdj(col,0.2);  c.beginPath(); c.moveTo(a,b); c.lineTo(a,b+w); c.lineTo(cx,cy); c.closePath(); c.fill();
      c.fillStyle=hexAdj(col,-0.35);c.beginPath(); c.moveTo(a+w,b); c.lineTo(a+w,b+w); c.lineTo(cx,cy); c.closePath(); c.fill();
      c.fillStyle=hexAdj(col,-0.15);c.beginPath(); c.moveTo(a,b+w); c.lineTo(a+w,b+w); c.lineTo(cx,cy); c.closePath(); c.fill();
      c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(cx-cs*0.06,cy-cs*0.06,cs*0.12,cs*0.12); } },
    neon:{ name:'Neon', cost:500, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.2);
      rr(c,px+2,py+2,cs-4,cs-4,r); c.fillStyle=hexAdj(col,-0.62); c.fill();
      c.lineWidth=Math.max(1.5,cs*0.09); c.strokeStyle=col; c.stroke();
      c.save(); c.globalAlpha=0.5; rr(c,px+cs*0.28,py+cs*0.28,cs*0.44,cs*0.44,cs*0.1); c.fillStyle=col; c.fill(); c.restore(); } },
    // ── Premium creative designs (art / cartoons / nature) ──
    bubble:{ name:'Bubble', cost:600, cell:function(c,px,py,cs,col){ var cx=px+cs/2,cy=py+cs/2,rd=cs*0.47;
      c.beginPath(); c.arc(cx,cy,rd,0,6.2832); c.fillStyle=col; c.fill();
      c.save(); c.globalAlpha=.5; c.beginPath(); c.arc(cx-rd*0.32,cy-rd*0.34,rd*0.34,0,6.2832); c.fillStyle='#fff'; c.fill(); c.restore(); } },
    heart:{ name:'Heart', cost:750, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.2);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle=hexAdj(col,-0.4); c.fill();
      var cx=px+cs/2,cy=py+cs*0.42,rr2=cs*0.16; c.fillStyle=hexAdj(col,0.32);
      c.beginPath(); c.arc(cx-rr2*0.95,cy,rr2,0,6.2832); c.fill();
      c.beginPath(); c.arc(cx+rr2*0.95,cy,rr2,0,6.2832); c.fill();
      c.beginPath(); c.moveTo(cx-rr2*1.85,cy+rr2*0.35); c.lineTo(cx+rr2*1.85,cy+rr2*0.35); c.lineTo(cx,py+cs*0.82); c.closePath(); c.fill(); } },
    star:{ name:'Star', cost:800, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.2);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle=hexAdj(col,-0.4); c.fill();
      _starPath(c,px+cs/2,py+cs*0.52,cs*0.4); c.fillStyle=hexAdj(col,0.4); c.fill(); } },
    flower:{ name:'Flower', cost:900, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.2), cx=px+cs/2,cy=py+cs/2;
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle=hexAdj(col,-0.42); c.fill();
      c.fillStyle=hexAdj(col,0.34);
      for(var i=0;i<5;i++){ var a=-Math.PI/2+i*2*Math.PI/5; c.beginPath(); c.arc(cx+Math.cos(a)*cs*0.21,cy+Math.sin(a)*cs*0.21,cs*0.16,0,6.2832); c.fill(); }
      c.fillStyle='#ffe08a'; c.beginPath(); c.arc(cx,cy,cs*0.13,0,6.2832); c.fill(); } },
    candy:{ name:'Candy', cost:950, cell:function(c,px,py,cs,col){ var r=Math.max(3,cs*0.26);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle=col; c.fill();
      c.save(); rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.clip(); c.strokeStyle=hexAdj(col,0.45); c.lineWidth=cs*0.16;
      c.beginPath(); c.moveTo(px-cs,py+cs*0.2); c.lineTo(px+cs*1.2,py-cs*0.9); c.moveTo(px-cs,py+cs*0.9); c.lineTo(px+cs*1.2,py-cs*0.2); c.stroke(); c.restore();
      c.save(); c.globalAlpha=.4; c.beginPath(); c.arc(px+cs*0.34,py+cs*0.3,cs*0.14,0,6.2832); c.fillStyle='#fff'; c.fill(); c.restore(); } },
    kitty:{ name:'Kitty', cost:1100, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.22);
      rr(c,px+2,py+2,cs-4,cs-4,r); c.fillStyle=col; c.fill();
      c.fillStyle=hexAdj(col,-0.28);
      c.beginPath(); c.moveTo(px+cs*0.2,py+cs*0.28); c.lineTo(px+cs*0.16,py+cs*0.06); c.lineTo(px+cs*0.4,py+cs*0.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(px+cs*0.8,py+cs*0.28); c.lineTo(px+cs*0.84,py+cs*0.06); c.lineTo(px+cs*0.6,py+cs*0.2); c.closePath(); c.fill();
      c.fillStyle='#1b1b2b'; c.beginPath(); c.arc(px+cs*0.38,py+cs*0.5,cs*0.07,0,6.2832); c.fill(); c.beginPath(); c.arc(px+cs*0.62,py+cs*0.5,cs*0.07,0,6.2832); c.fill();
      c.fillStyle='#ff8fab'; c.beginPath(); c.moveTo(px+cs*0.46,py+cs*0.62); c.lineTo(px+cs*0.54,py+cs*0.62); c.lineTo(px+cs*0.5,py+cs*0.69); c.closePath(); c.fill(); } },
    galaxy:{ name:'Galaxy', cost:1300, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.2);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.fillStyle='#0e1330'; c.fill();
      c.save(); rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.clip(); c.globalAlpha=.55; c.beginPath(); c.arc(px+cs*0.6,py+cs*0.42,cs*0.4,0,6.2832); c.fillStyle=col; c.fill(); c.restore();
      c.fillStyle='#fff'; c.fillRect(px+cs*0.24,py+cs*0.3,1.5,1.5); c.fillRect(px+cs*0.7,py+cs*0.66,1.5,1.5); c.fillRect(px+cs*0.5,py+cs*0.2,1.2,1.2); c.fillRect(px+cs*0.34,py+cs*0.72,1.2,1.2); } },
    rainbow:{ name:'Rainbow', cost:1600, cell:function(c,px,py,cs,col){ var r=Math.max(2,cs*0.18);
      var rb=['#ff4d4d','#ff9f43','#ffe14d','#5fd35f','#4d9bff','#8a5cff']; var bh=(cs-3)/rb.length;
      c.save(); rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.clip();
      for(var i=0;i<rb.length;i++){ c.fillStyle=rb[i]; c.fillRect(px,py+1.5+i*bh,cs,bh+1); }
      c.globalAlpha=.32; c.fillStyle='#fff'; c.fillRect(px+2,py+3,cs-4,cs*0.16); c.restore(); } },

    // ══════════════ PREMIUM MATERIALS — real textures, themed, out-of-the-box ══════════════
    lava:{ name:'Molten Lava', cost:1800, cell:function(c,px,py,cs,col,glow){ var r=Math.max(2,cs*0.18);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      var g=c.createLinearGradient(px,py,px,py+cs); g.addColorStop(0,'#2b2320'); g.addColorStop(1,'#130e0c'); c.fillStyle=g; c.fillRect(px,py,cs,cs);
      c.lineCap='round'; c.save(); c.shadowColor=col; c.shadowBlur=cs*0.5; c.strokeStyle=_cs2(col,0.45); c.lineWidth=Math.max(1.4,cs*0.10);
      c.beginPath(); c.moveTo(px+cs*0.16,py+cs*0.1); c.lineTo(px+cs*0.42,py+cs*0.5); c.lineTo(px+cs*0.3,py+cs*0.92);
      c.moveTo(px+cs*0.42,py+cs*0.5); c.lineTo(px+cs*0.82,py+cs*0.6); c.lineTo(px+cs*0.92,py+cs*0.94); c.stroke(); c.restore();
      if(cs>=14){ c.fillStyle=_cs2(col,0.1); for(var i=0;i<4;i++){ c.beginPath(); c.arc(px+cs*(0.22+0.19*i),py+cs*((0.2+i*0.27)%1),Math.max(1,cs*0.045),0,6.283); c.fill(); } }
      c.restore(); c.fillStyle='rgba(255,180,120,.10)'; c.fillRect(px+3,py+3,cs-6,Math.max(1,cs*0.10)); } },

    ice:{ name:'Glacier', cost:2000, cell:function(c,px,py,cs,col,glow){ var r=Math.max(3,cs*0.22);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      var g=c.createLinearGradient(px,py,px+cs,py+cs); g.addColorStop(0,_cx(col,'#ffffff',0.72)); g.addColorStop(0.5,_cx(col,'#ffffff',0.4)); g.addColorStop(1,_cx(col,'#8fd7ff',0.28));
      c.fillStyle=g; c.fillRect(px,py,cs,cs);
      c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=Math.max(.8,cs*0.04); c.lineCap='round';
      c.beginPath(); c.moveTo(px+cs*0.5,py+cs*0.14); c.lineTo(px+cs*0.44,py+cs*0.5); c.lineTo(px+cs*0.62,py+cs*0.86);
      c.moveTo(px+cs*0.44,py+cs*0.5); c.lineTo(px+cs*0.16,py+cs*0.58); c.moveTo(px+cs*0.44,py+cs*0.5); c.lineTo(px+cs*0.8,py+cs*0.4); c.stroke();
      c.restore();
      c.save(); rr(c,px+3,py+3,(cs-6)*0.5,(cs-6)*0.34,Math.max(2,cs*0.12)); c.fillStyle='rgba(255,255,255,.5)'; c.fill(); c.restore(); } },

    wood:{ name:'Oak Timber', cost:2200, cell:function(c,px,py,cs,col,glow){ var r=Math.max(2,cs*0.14);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      var base=_cx(col,'#7a4a24',0.55); c.fillStyle=base; c.fillRect(px,py,cs,cs);
      c.strokeStyle=_cs2(base,-0.28); c.lineWidth=Math.max(.8,cs*0.035);
      for(var i=1;i<=4;i++){ var yy=py+cs*i/5; c.beginPath(); for(var q=0;q<=6;q++){ var xx=px+cs*q/6, wy=yy+Math.sin(q*1.3+i)*cs*0.03; q?c.lineTo(xx,wy):c.moveTo(xx,wy); } c.stroke(); }
      if(cs>=14){ c.strokeStyle=_cs2(base,-0.42); c.lineWidth=1; c.beginPath(); c.ellipse(px+cs*0.7,py+cs*0.4,cs*0.09,cs*0.06,0.5,0,6.283); c.stroke(); }
      c.restore(); c.fillStyle='rgba(255,240,220,.10)'; c.fillRect(px+3,py+3,cs-6,Math.max(1,cs*0.08)); } },

    marble:{ name:'Marble', cost:2600, cell:function(c,px,py,cs,col,glow){ var r=Math.max(3,cs*0.2);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      c.fillStyle=_cx(col,'#ffffff',0.68); c.fillRect(px,py,cs,cs);
      c.globalAlpha=0.5; c.strokeStyle=_cx(col,'#2b2b3a',0.5); c.lineWidth=Math.max(.8,cs*0.03); c.lineCap='round';
      c.beginPath(); c.moveTo(px+cs*0.1,py+cs*0.2); c.bezierCurveTo(px+cs*0.4,py+cs*0.1,px+cs*0.5,py+cs*0.7,px+cs*0.9,py+cs*0.55); c.stroke();
      c.lineWidth=Math.max(.6,cs*0.02); c.beginPath(); c.moveTo(px+cs*0.2,py+cs*0.9); c.bezierCurveTo(px+cs*0.45,py+cs*0.6,px+cs*0.55,py+cs*0.45,px+cs*0.75,py+cs*0.15); c.stroke();
      c.globalAlpha=1; c.restore();
      c.save(); rr(c,px+3,py+3,cs-6,(cs-6)*0.4,Math.max(2,cs*0.14)); c.fillStyle='rgba(255,255,255,.3)'; c.fill(); c.restore(); } },

    circuit:{ name:'Circuit', cost:3000, cell:function(c,px,py,cs,col,glow){ var r=Math.max(2,cs*0.16);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      c.fillStyle=_cs2(_cx(col,'#0a3b2e',0.62),-0.08); c.fillRect(px,py,cs,cs);
      var tr=_cs2(col,0.4); c.strokeStyle=tr; c.lineWidth=Math.max(1,cs*0.05); c.lineJoin='round';
      c.beginPath(); c.moveTo(px+cs*0.14,py+cs*0.3); c.lineTo(px+cs*0.5,py+cs*0.3); c.lineTo(px+cs*0.5,py+cs*0.72); c.lineTo(px+cs*0.86,py+cs*0.72);
      c.moveTo(px+cs*0.3,py+cs*0.9); c.lineTo(px+cs*0.3,py+cs*0.55); c.lineTo(px+cs*0.68,py+cs*0.55); c.lineTo(px+cs*0.68,py+cs*0.16); c.stroke();
      if(cs>=14){ c.fillStyle=tr; [[0.86,0.72],[0.68,0.16],[0.3,0.9]].forEach(function(p){ c.beginPath(); c.arc(px+cs*p[0],py+cs*p[1],Math.max(1.4,cs*0.055),0,6.283); c.fill(); }); }
      c.save(); c.shadowColor=col; c.shadowBlur=cs*0.4; c.fillStyle=_cs2(col,0.55); c.beginPath(); c.arc(px+cs*0.5,py+cs*0.3,Math.max(1.6,cs*0.07),0,6.283); c.fill(); c.restore();
      c.restore(); } },

    gold:{ name:'Bullion', cost:3500, cell:function(c,px,py,cs,col,glow){ var r=Math.max(2,cs*0.14); var m=1.5,a=px+m,b=py+m,w=cs-2*m;
      var top=_cs2(col,0.5), lit=_cs2(col,0.22), dk=_cs2(col,-0.42);
      c.fillStyle=dk; rr(c,a,b,w,w,r); c.fill();
      var bev=Math.max(2,w*0.14), ix=a+bev,iy=b+bev,iw=w-2*bev;
      function q4(p,f){ c.beginPath(); c.moveTo(p[0][0],p[0][1]); c.lineTo(p[1][0],p[1][1]); c.lineTo(p[2][0],p[2][1]); c.lineTo(p[3][0],p[3][1]); c.closePath(); c.fillStyle=f; c.fill(); }
      q4([[a,b],[a+w,b],[ix+iw,iy],[ix,iy]], top);
      q4([[a,b],[ix,iy],[ix,iy+iw],[a,b+w]], lit);
      q4([[a+w,b],[a+w,b+w],[ix+iw,iy+iw],[ix+iw,iy]], _cs2(col,-0.26));
      q4([[a,b+w],[a+w,b+w],[ix+iw,iy+iw],[ix,iy+iw]], dk);
      c.save(); rr(c,ix,iy,iw,iw,Math.max(1,w*0.06)); var fg=c.createLinearGradient(ix,iy,ix+iw,iy+iw); fg.addColorStop(0,_cs2(col,0.35)); fg.addColorStop(1,lit); c.fillStyle=fg; c.fill(); c.clip();
      c.globalAlpha=0.5; c.fillStyle='#fff'; c.beginPath(); c.moveTo(ix,iy+iw*0.3); c.lineTo(ix+iw*0.5,iy); c.lineTo(ix+iw*0.72,iy); c.lineTo(ix,iy+iw*0.62); c.closePath(); c.fill(); c.globalAlpha=1; c.restore(); } },

    // Earned, not bought — unlocks at rating 130. See RATING_UNLOCKS.
    aurora:{ name:'Aurora', cost:0, req:130, cell:function(c,px,py,cs,col,glow){ var r=Math.max(3,cs*0.2);
      rr(c,px+1.5,py+1.5,cs-3,cs-3,r); c.save(); c.clip();
      c.fillStyle='#0b1020'; c.fillRect(px,py,cs,cs);
      var bands=[_cs2(col,0.3), _cx(col,'#00e5ff',0.62), _cx(col,'#ff4dd2',0.55), _cx(col,'#7cff6b',0.5)];
      c.globalAlpha=0.55; c.save(); c.translate(px+cs*0.5,py+cs*0.5); c.rotate(-0.6);
      for(var i=0;i<bands.length;i++){ c.fillStyle=bands[i]; c.fillRect(-cs, -cs*0.6+i*cs*0.34, cs*2, cs*0.26); }
      c.restore(); c.globalAlpha=1;
      c.globalAlpha=0.22; c.fillStyle='#fff'; c.fillRect(px+2,py+3,cs-4,Math.max(1,cs*0.12)); c.globalAlpha=1;
      c.restore(); } },

    // ══════════════════ CHOCOLATE ══════════════════
    // A moulded chocolate square. Each cell is a slab: bevelled edges that catch the
    // light from the top-left, a pressed inner panel like a real bar, three embossed
    // pips, and a glossy sheen across the corner.
    //
    // The piece's colour isn't thrown away — it's *folded into* the cocoa, so an I-piece
    // is cool milk chocolate and a Z-piece is a rich ruby-dark. You can still read the
    // board at a glance (which matters, it's a game) but the whole thing looks edible.
    // Not for sale at any price — unlocks at a rating of 100. See RATING_UNLOCKS in the Apps Script.
    //
    // A moulded chocolate-bar square, built the way a real one is: a deep GROOVE around the
    // outside, then four CHAMFERED WALLS rising inward like a truncated pyramid, then a flat
    // glossy PLATEAU on top. The four walls are lit from the top-left — bright top, mid left,
    // dark right, darkest bottom — and that four-way bevel is the whole trick: it's what makes
    // a flat canvas square read as a solid piece of chocolate you could snap off.
    choco:{ name:'Chocolate', cost:0, req:100, cell:function(c,px,py,cs,col,glow){
      var b   = _choc(col);                    // a real chocolate, not a tinted piece colour
      var gap = Math.max(1, cs*0.055);         // the groove between squares
      var x0  = px+gap, y0 = py+gap, w = cs-2*gap;
      var bev = Math.max(1.6, w*0.20);         // how far the chamfer walls slope inward
      var rr2 = Math.max(1, w*0.10);

      // shades: the four walls + the plateau
      var wTop = _cs2(b,  0.30), wLeft = _cs2(b, 0.12),
          wRight = _cs2(b,-0.30), wBot = _cs2(b,-0.46),
          face = b, faceLo = _cs2(b,-0.10);

      // ── the groove (the dark gap you'd snap along)
      c.fillStyle = _cs2(b,-0.62);
      rr(c, px, py, cs, cs, Math.max(1, cs*0.12)); c.fill();

      // ── the four chamfered walls
      var ix = x0+bev, iy = y0+bev, iw = w-2*bev;
      function quad(p1,p2,p3,p4,fill){
        c.beginPath(); c.moveTo(p1[0],p1[1]); c.lineTo(p2[0],p2[1]);
        c.lineTo(p3[0],p3[1]); c.lineTo(p4[0],p4[1]); c.closePath();
        c.fillStyle = fill; c.fill();
      }
      quad([x0,y0],[x0+w,y0],[ix+iw,iy],[ix,iy], wTop);                       // top wall  — catches the light
      quad([x0,y0],[ix,iy],[ix,iy+iw],[x0,y0+w], wLeft);                      // left wall
      quad([x0+w,y0],[x0+w,y0+w],[ix+iw,iy+iw],[ix+iw,iy], wRight);           // right wall — in shadow
      quad([x0,y0+w],[x0+w,y0+w],[ix+iw,iy+iw],[ix,iy+iw], wBot);             // bottom wall — darkest

      // ── the plateau, then whatever confection sits on top of it
      c.save();
      rr(c, ix, iy, iw, iw, rr2);
      var pg = c.createLinearGradient(ix, iy, ix+iw*0.4, iy+iw);
      pg.addColorStop(0, _cs2(face, 0.10));
      pg.addColorStop(1, faceLo);
      c.fillStyle = pg; c.fill();
      c.clip();

      _chocSurface(c, ix, iy, iw, b, _chocTex(col), cs);   // ← the texture

      // the sheen — a soft diagonal band across the top-left
      c.globalAlpha = 0.14; c.fillStyle = '#fff6e8';
      c.beginPath();
      c.moveTo(ix, iy);
      c.lineTo(ix+iw*0.58, iy);
      c.lineTo(ix, iy+iw*0.58);
      c.closePath(); c.fill();
      c.globalAlpha = 1;
      c.restore();

      // crisp lit edge along the top of the plateau — the "snap" line
      c.strokeStyle = 'rgba(255,240,220,.30)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(ix+rr2, iy+0.5); c.lineTo(ix+iw-rr2, iy+0.5); c.stroke();

      // ── freshly tempered: the active piece glows
      if(glow){
        c.save();
        c.shadowColor = 'rgba(255,190,120,.8)'; c.shadowBlur = cs*0.55;
        rr(c, x0, y0, w, w, rr2);
        c.strokeStyle = 'rgba(255,218,175,.6)'; c.lineWidth = 1.4; c.stroke();
        c.restore();
      }
    } },
    jewels:{ name:'Jewels', cost:6500, cell:function(c,px,py,cs,col,glow){
      function P(pts,f){ c.beginPath(); for(var i=0;i<pts.length;i++){ i?c.lineTo(pts[i][0],pts[i][1]):c.moveTo(pts[i][0],pts[i][1]); } c.closePath(); c.fillStyle=f; c.fill(); }
      var lc=String(col).toLowerCase(), m=cs*0.07, a=px+m, b=py+m, w=cs-2*m, cx=px+cs/2, cy=py+cs/2;
      var cut=({'#ef4444':'bril','#facc15':'bril','#3b82f6':'cush','#22c55e':'step','#22d3ee':'step','#a855f7':'pyr','#f97316':'cab'})[lc]||'rough';
      if(cut==='bril'){ rr(c,a,b,w,w,cs*0.12); c.save(); c.clip(); c.fillStyle=hexAdj(col,-0.22); c.fillRect(px,py,cs,cs);
        var o=[[a,b],[a+w/2,b],[a+w,b],[a+w,b+w/2],[a+w,b+w],[a+w/2,b+w],[a,b+w],[a,b+w/2]];
        var ir=o.map(function(p){return [cx+(p[0]-cx)*0.44,cy+(p[1]-cy)*0.44];});
        for(var i=0;i<8;i++){ var j=(i+1)%8; P([o[i],o[j],ir[j],ir[i]],hexAdj(col,(i%2)?-0.28:0.32)); }
        P(ir,hexAdj(col,0.5)); c.restore(); c.fillStyle='rgba(255,255,255,.9)'; c.fillRect(cx-cs*0.045,cy-cs*0.045,cs*0.09,cs*0.09);
      } else if(cut==='cush'){ rr(c,a,b,w,w,cs*0.14); c.save(); c.clip(); c.fillStyle=hexAdj(col,-0.16); c.fillRect(px,py,cs,cs);
        var e=[[cx,b],[a+w,cy],[cx,b+w],[a,cy]], k=[[a,b],[a+w,b],[a+w,b+w],[a,b+w]];
        for(var q=0;q<4;q++){ P([k[q],e[q],[cx,cy]],hexAdj(col,0.30)); P([e[q],k[(q+1)%4],[cx,cy]],hexAdj(col,-0.24)); }
        P([[cx,cy-w*0.22],[cx+w*0.22,cy],[cx,cy+w*0.22],[cx-w*0.22,cy]],hexAdj(col,0.5)); c.restore(); c.fillStyle='rgba(255,255,255,.85)'; c.fillRect(cx-cs*0.04,cy-cs*0.04,cs*0.08,cs*0.08);
      } else if(cut==='step'){ rr(c,a,b,w,w,cs*0.1); c.fillStyle=hexAdj(col,-0.16); c.fill();
        rr(c,a+w*0.14,b+w*0.14,w*0.72,w*0.72,cs*0.07); c.fillStyle=hexAdj(col,0.12); c.fill();
        rr(c,a+w*0.28,b+w*0.28,w*0.44,w*0.44,cs*0.05); c.fillStyle=hexAdj(col,0.42); c.fill();
        c.strokeStyle='rgba(255,255,255,.4)'; c.lineWidth=1; c.beginPath(); c.moveTo(a+w*0.2,b+w*0.14); c.lineTo(a+w*0.8,b+w*0.14); c.stroke();
      } else if(cut==='pyr'){ rr(c,a,b,w,w,cs*0.12); c.save(); c.clip();
        P([[a,b],[a+w,b],[cx,cy]],hexAdj(col,0.42)); P([[a,b],[a,b+w],[cx,cy]],hexAdj(col,0.12));
        P([[a+w,b],[a+w,b+w],[cx,cy]],hexAdj(col,-0.34)); P([[a,b+w],[a+w,b+w],[cx,cy]],hexAdj(col,-0.14)); c.restore();
        c.fillStyle='rgba(255,255,255,.6)'; c.fillRect(cx-cs*0.04,cy-cs*0.04,cs*0.08,cs*0.08);
      } else if(cut==='cab'){ rr(c,a,b,w,w,cs*0.18); c.save(); c.clip();
        var g=c.createRadialGradient(cx-w*0.28,cy-w*0.28,w*0.08,cx,cy,w*0.62); g.addColorStop(0,hexAdj(col,0.55)); g.addColorStop(0.55,col); g.addColorStop(1,hexAdj(col,-0.4));
        c.fillStyle=g; c.fillRect(px,py,cs,cs); c.fillStyle=hexAdj(col,-0.3); c.beginPath(); c.arc(cx+w*0.16,cy+w*0.12,w*0.08,0,6.283); c.fill();
        c.globalAlpha=0.7; c.beginPath(); c.arc(cx-w*0.24,cy-w*0.26,w*0.14,0,6.283); c.fillStyle='#fff'; c.fill(); c.globalAlpha=1; c.restore();
      } else { rr(c,a,b,w,w,cs*0.12); c.fillStyle=hexAdj(col,-0.1); c.fill();
        P([[a,b],[a+w*0.6,b],[a,b+w*0.6]],hexAdj(col,0.16)); P([[a+w,b+w],[a+w*0.4,b+w],[a+w,b+w*0.4]],hexAdj(col,-0.26)); }
    } },
    emoji:{ name:'Emoji', cost:5000, cell:function(c,px,py,cs,col,glow){
      var lc=String(col).toLowerCase(), m=cs*0.06, a=px+m, b=py+m, w=cs-2*m, cx=px+cs/2, cy=py+cs/2, D='#20140a';
      var _t=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
      var _ph=Math.abs((Math.round(px)*7+Math.round(py)*13))%2600;
      var blink=(((_t+_ph)%2600)<150);
      rr(c,a,b,w,w,cs*0.16); c.fillStyle=col; c.fill();
      c.fillStyle='rgba(255,255,255,.22)'; c.fillRect(a+3,b+3,w-6,Math.max(2,cs*0.1));
      c.save(); rr(c,a,b,w,w,cs*0.16); c.clip();
      var ex=w*0.16, ey=cy-w*0.08;
      if(lc==='#3b82f6'){ c.fillStyle=D; c.fillRect(cx-w*0.26,ey-w*0.05,w*0.2,w*0.12); c.fillRect(cx+w*0.06,ey-w*0.05,w*0.2,w*0.12); c.fillRect(cx-w*0.08,ey-w*0.01,w*0.16,3); }
      else if(blink){ c.strokeStyle=D; c.lineWidth=Math.max(2,w*0.05); c.lineCap='round'; c.beginPath(); c.moveTo(cx-ex-w*0.05,ey); c.lineTo(cx-ex+w*0.05,ey); c.moveTo(cx+ex-w*0.05,ey); c.lineTo(cx+ex+w*0.05,ey); c.stroke(); }
      else { c.fillStyle=D; c.beginPath(); c.arc(cx-ex,ey,w*0.06,0,6.283); c.fill(); c.beginPath(); c.arc(cx+ex,ey,w*0.06,0,6.283); c.fill(); if(lc==='#a855f7'){ c.fillRect(cx+ex-w*0.06,ey-1,w*0.12,2.4); } }
      c.strokeStyle=D; c.lineWidth=Math.max(2,w*0.06); c.lineCap='round'; c.beginPath();
      if(lc==='#ef4444'){ c.arc(cx,cy+w*0.22,w*0.18,Math.PI*1.15,Math.PI*1.85); }
      else if(lc==='#22d3ee'){ c.arc(cx,cy+w*0.14,w*0.1,0,6.283); }
      else if(lc==='#22c55e'){ c.moveTo(cx-w*0.16,cy+w*0.14); c.quadraticCurveTo(cx,cy+w*0.26,cx+w*0.16,cy+w*0.14); }
      else { c.arc(cx,cy+w*0.08,w*0.17,0.15*Math.PI,0.85*Math.PI); }
      c.stroke(); c.restore();
    } },
    cosmos:{ name:'Cosmos', cost:8000, cell:function(c,px,py,cs,col,glow){
      function el(ex,ey,rx,ry,rot,f){ c.save(); c.translate(ex,ey); c.rotate(rot||0); c.beginPath(); c.ellipse(0,0,rx,ry,0,0,6.283); c.fillStyle=f; c.fill(); c.restore(); }
      var m=cs*0.06,a=px+m,b=py+m,w=cs-2*m,cx=px+cs/2,cy=py+cs/2,lc=String(col).toLowerCase();
      function finish(){ c.globalAlpha=0.45; c.strokeStyle=hexAdj(col,0.65); c.lineWidth=w*0.05; c.beginPath(); c.arc(cx,cy,w*0.4,Math.PI*0.98,Math.PI*1.62); c.stroke(); c.globalAlpha=1;
        var sp=c.createRadialGradient(cx-w*0.24,cy-w*0.24,0,cx-w*0.24,cy-w*0.24,w*0.22); sp.addColorStop(0,'rgba(255,255,255,.5)'); sp.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=sp; c.fillRect(a,b,w,w);
        c.globalAlpha=0.32; var td=c.createRadialGradient(cx+w*0.5,cy+w*0.5,w*0.05,cx+w*0.5,cy+w*0.5,w*0.95); td.addColorStop(0,'rgba(4,5,13,0)'); td.addColorStop(1,'#04050d'); c.fillStyle=td; c.fillRect(a-2,b-2,w+4,w+4); c.globalAlpha=1; }
      rr(c,a,b,w,w,cs*0.16); c.save(); c.clip();
      if(lc==='#a855f7'){
        var bgg=c.createRadialGradient(cx,cy,1,cx,cy,w*0.8); bgg.addColorStop(0,'#241653'); bgg.addColorStop(1,'#08061a'); c.fillStyle=bgg; c.fillRect(px,py,cs,cs);
        var sc=['#fff','#ffd9f3','#bcd8ff','#fff','#ffe9b0'];
        [[0.18,0.22],[0.8,0.76],[0.72,0.16],[0.3,0.84],[0.88,0.42],[0.5,0.66],[0.62,0.4]].forEach(function(s,k){ c.globalAlpha=0.85; c.fillStyle=sc[k%5]; c.fillRect(a+w*s[0],b+w*s[1],1.2,1.2); }); c.globalAlpha=1;
        c.save(); c.shadowColor=col; c.shadowBlur=w*0.22; c.globalAlpha=0.6;
        for(var arm=0;arm<3;arm++){ c.save(); c.translate(cx,cy); c.rotate(arm*2.094); c.strokeStyle=hexAdj(col,arm===0?0.5:0.3); c.lineWidth=w*0.05; c.beginPath(); for(var t=0.2;t<3.4;t+=0.22){ var rd=w*0.052*t,xx=Math.cos(t)*rd,yy=Math.sin(t)*rd*0.55; t<0.3?c.moveTo(xx,yy):c.lineTo(xx,yy);} c.stroke(); c.restore(); }
        c.globalAlpha=1; c.save(); c.translate(cx,cy); c.rotate(0.4); c.globalAlpha=0.4; c.strokeStyle='#1a0f30'; c.lineWidth=w*0.03; c.beginPath(); c.ellipse(0,0,w*0.3,w*0.09,0,0,6.283); c.stroke(); c.restore(); c.globalAlpha=1;
        var cg=c.createRadialGradient(cx,cy,1,cx,cy,w*0.26); cg.addColorStop(0,'#fff'); cg.addColorStop(0.35,hexAdj(col,0.6)); cg.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=cg; c.beginPath(); c.arc(cx,cy,w*0.28,0,6.283); c.fill(); c.restore(); c.restore(); return;
      }
      var g=c.createRadialGradient(cx-w*0.28,cy-w*0.28,w*0.06,cx,cy,w*0.88); g.addColorStop(0,hexAdj(col,0.5)); g.addColorStop(0.55,hexAdj(col,0.1)); g.addColorStop(0.8,col); g.addColorStop(1,hexAdj(col,-0.45));
      c.fillStyle=g; c.fillRect(px,py,cs,cs);
      if(lc==='#f97316'){ c.globalAlpha=0.55; for(var i=0;i<6;i++){ c.fillStyle=hexAdj(col,(i%2)?-0.34:0.18); c.fillRect(a,b+w*(i*0.17),w,w*0.09); } c.globalAlpha=0.5; for(var k=0;k<5;k++) el(a+w*(0.15+k*0.18),cy-w*0.02,w*0.05,w*0.02,0,hexAdj(col,0.3)); c.globalAlpha=1; el(cx+w*0.14,cy+w*0.12,w*0.15,w*0.1,0.3,hexAdj(col,-0.2)); el(cx+w*0.14,cy+w*0.12,w*0.07,w*0.045,0.3,hexAdj(col,-0.05)); }
      else if(lc==='#ef4444'){ c.globalAlpha=0.5; el(cx-w*0.18,cy+w*0.12,w*0.2,w*0.16,0,hexAdj(col,-0.36)); el(cx+w*0.24,cy-w*0.16,w*0.12,w*0.1,0,hexAdj(col,-0.3)); c.globalAlpha=0.85; c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.arc(cx,b+w*0.06,w*0.26,0.15,Math.PI-0.15); c.fill(); c.globalAlpha=1; }
      else if(lc==='#22c55e'){ c.globalAlpha=0.6; el(cx-w*0.16,cy-w*0.06,w*0.2,w*0.16,0.3,hexAdj(col,-0.34)); el(cx+w*0.26,cy+w*0.22,w*0.16,w*0.12,-0.2,hexAdj(col,-0.34)); c.globalAlpha=0.4; el(cx+w*0.05,cy-w*0.2,w*0.16,w*0.05,-0.3,'#fff'); el(cx-w*0.2,cy+w*0.24,w*0.13,w*0.04,0.2,'#fff'); c.globalAlpha=1; }
      else if(lc==='#3b82f6'){ c.globalAlpha=0.45; for(var j=0;j<4;j++){ c.fillStyle=hexAdj(col,(j%2)?-0.3:0.15); c.fillRect(a,b+w*(0.12+j*0.22),w,w*0.1); } c.globalAlpha=0.9; el(cx+w*0.12,cy+w*0.06,w*0.12,w*0.08,0.4,hexAdj(col,-0.35)); c.globalAlpha=1; }
      else if(lc==='#22d3ee'){ c.globalAlpha=0.35; for(var q=0;q<3;q++){ c.fillStyle=hexAdj(col,0.35); c.fillRect(a,cy-w*0.24+q*w*0.24,w,w*0.05); } c.globalAlpha=1; }
      else if(lc==='#facc15'){ c.globalAlpha=0.5; for(var s2=0;s2<4;s2++){ c.fillStyle=hexAdj(col,(s2%2)?-0.28:0.18); c.fillRect(a,b+w*(0.16+s2*0.2),w,w*0.08);} c.globalAlpha=1; }
      finish();
      if(lc==='#facc15'){ c.save(); c.translate(cx,cy); c.rotate(-0.4);
        c.globalAlpha=0.95; c.strokeStyle=hexAdj(col,0.5); c.lineWidth=w*0.11; c.beginPath(); c.ellipse(0,0,w*0.66,w*0.22,0,0,6.283); c.stroke();
        c.strokeStyle='#0b0d18'; c.lineWidth=w*0.022; c.beginPath(); c.ellipse(0,0,w*0.6,w*0.2,0,0,6.283); c.stroke();
        c.globalAlpha=0.5; c.strokeStyle='#05060f'; c.lineWidth=w*0.05; c.beginPath(); c.ellipse(0,w*0.05,w*0.5,w*0.14,0,0.2,Math.PI-0.2); c.stroke();
        c.restore(); c.globalAlpha=1; }
      c.restore();
      c.fillStyle='rgba(255,255,255,.26)'; c.fillRect(a+3,b+3,w-6,Math.max(2,cs*0.07));
      if(lc==='#22d3ee'){ c.save(); c.shadowColor='#dff6ff'; c.shadowBlur=4; c.fillStyle='#eaffff'; c.beginPath(); c.arc(px+cs*0.83,py+cs*0.19,cs*0.07,0,6.283); c.fill(); c.fillStyle=hexAdj('#22d3ee',0.1); c.beginPath(); c.arc(px+cs*0.85,py+cs*0.21,cs*0.03,0,6.283); c.fill(); c.restore(); }
    } },
    // JMB INFERNO — glowing cracked lava "brix": charred stone plates split by bright molten veins.
    // Orange->RED only. The ONLY animated skin: the molten glow BREATHES (pulse). 8 pre-baked frames
    // per (colour x size x glow) then a plain blit (lag-free). The O piece is the JMB logo, filling the box.
    azero:{ name:'JMB Absolute Zero', cost:0, req:100, cell:(function(){
      // Seven pieces, seven ICE FORMATIONS — you tell them apart by structure, not by shade.
      //   I clear column · J frost fern · Z fracture · L rime needles
      //   T crystal core · S glacier strata · O the JMB tile, frozen
      var FR=8, JMBCOL='#facc15', cache={};
      var FORM={ '#22d3ee':'column','#3b82f6':'fern','#ef4444':'crack','#f97316':'rime','#a855f7':'flake','#22c55e':'strata','#facc15':'jmb' };
      var ICE ={ '#22d3ee':'#a5f3fc','#3b82f6':'#93c5fd','#ef4444':'#bae6fd','#f97316':'#cffafe','#a855f7':'#c7d2fe','#22c55e':'#99f6e4','#facc15':'#e0f2fe' };
      var LOGO=new Image(); try{ LOGO.onload=function(){ cache={}; }; LOGO.src=(typeof JMB_LOGO_SRC!=='undefined'?JMB_LOGO_SRC:''); }catch(e){}
      function render(col,cs,glow,fi){
        var cv=document.createElement('canvas'); cv.width=cs; cv.height=cs; var C=cv.getContext('2d');
        var lc=String(col).toLowerCase(), t=FORM[lc]||'column', IC=ICE[lc]||'#bae6fd';
        var m=cs*0.045,a=m,b=m,w=cs-2*m,cx=cs/2,cy=cs/2;
        var bloom=0.5+0.5*Math.sin(fi/FR*6.283);
        rr(C,a,b,w,w,cs*0.13); C.save(); C.clip();
        var g=C.createLinearGradient(a,b,a+w*0.4,b+w); g.addColorStop(0,'#12304a'); g.addColorStop(1,'#061524');
        C.fillStyle=g; C.fillRect(0,0,cs,cs);
        C.fillStyle='rgba(224,242,254,.07)';
        for(var s=0;s<5;s++){ C.fillRect(a+((s*37)%100)/100*w, b+((s*61)%100)/100*w, Math.max(1,w*0.05), Math.max(1,w*0.05)); }
        C.strokeStyle=IC; C.lineCap='round'; C.lineJoin='round';
        C.save(); C.shadowColor=IC; C.shadowBlur=w*(0.20+0.28*bloom)*(glow?1.5:1);
        var L=C.lineWidth=Math.max(1.2,w*0.075);
        if(t==='column'){
          for(var i=0;i<3;i++){ var x=a+w*(0.28+i*0.22); C.beginPath(); C.moveTo(x,b+w*0.06); C.lineTo(x+w*0.05,b+w*0.5); C.lineTo(x,b+w*0.94); C.stroke(); }
        } else if(t==='fern'){
          C.beginPath(); C.moveTo(a+w*0.12,b+w*0.12); C.lineTo(a+w*0.88,b+w*0.88); C.stroke();
          for(var k=1;k<=4;k++){ var tt=k/5, bx=a+w*(0.12+0.76*tt), by=b+w*(0.12+0.76*tt), ln=w*0.20*(1-Math.abs(tt-0.5));
            C.lineWidth=L*0.6; C.beginPath(); C.moveTo(bx,by); C.lineTo(bx+ln,by-ln); C.moveTo(bx,by); C.lineTo(bx-ln,by+ln); C.stroke(); }
        } else if(t==='crack'){
          C.beginPath(); C.moveTo(a+w*0.5,b+w*0.02); C.lineTo(a+w*0.42,b+w*0.42); C.lineTo(a+w*0.6,b+w*0.6); C.lineTo(a+w*0.5,b+w*0.98);
          C.moveTo(a+w*0.42,b+w*0.42); C.lineTo(a+w*0.04,b+w*0.5); C.moveTo(a+w*0.6,b+w*0.6); C.lineTo(a+w*0.96,b+w*0.7); C.stroke();
        } else if(t==='rime'){
          for(var r=0;r<6;r++){ var xx=a+w*(0.1+r*0.16); C.lineWidth=L*0.7; C.beginPath(); C.moveTo(xx,b+w*0.98); C.lineTo(xx+w*0.03,b+w*(0.30+0.18*((r*13)%5)/5)); C.stroke(); }
        } else if(t==='flake'){
          for(var h=0;h<6;h++){ var ang=h*Math.PI/3, ex=cx+Math.cos(ang)*w*0.40, ey=cy+Math.sin(ang)*w*0.40;
            C.beginPath(); C.moveTo(cx,cy); C.lineTo(ex,ey); C.stroke();
            C.lineWidth=L*0.55; var mx=cx+Math.cos(ang)*w*0.24, my=cy+Math.sin(ang)*w*0.24, pa=ang+Math.PI/2.6;
            C.beginPath(); C.moveTo(mx,my); C.lineTo(mx+Math.cos(pa)*w*0.13,my+Math.sin(pa)*w*0.13);
            C.moveTo(mx,my); C.lineTo(mx-Math.cos(pa)*w*0.13,my-Math.sin(pa)*w*0.13); C.stroke(); C.lineWidth=L; }
        } else if(t==='strata'){
          for(var y2=0;y2<4;y2++){ var yy=b+w*(0.22+y2*0.20); C.lineWidth=L*(1-y2*0.15);
            C.beginPath(); C.moveTo(a+w*0.05,yy); C.bezierCurveTo(a+w*0.35,yy-w*0.05,a+w*0.65,yy+w*0.05,a+w*0.95,yy); C.stroke(); }
        } else {
          C.globalCompositeOperation='lighter';
          var hg=C.createRadialGradient(cx,cy,1,cx,cy,w*0.6);
          hg.addColorStop(0,'rgba(186,230,253,'+(0.42*bloom+0.2)+')'); hg.addColorStop(1,'rgba(56,189,248,0)');
          C.fillStyle=hg; C.fillRect(0,0,cs,cs); C.globalCompositeOperation='source-over';
          if(LOGO.complete && LOGO.naturalWidth){ C.globalAlpha=0.9; C.drawImage(LOGO,17,15,62,66,a,b,w,w); C.globalAlpha=1; }
          else { C.fillStyle='#e0f2fe'; C.font='800 '+(w*0.42)+'px Sora,Inter,system-ui,sans-serif';
                 C.textAlign='center'; C.textBaseline='middle'; C.fillText('JMB',cx,cy); }
        }
        C.restore();
        // frost bloom creeping diagonally across the face
        C.globalCompositeOperation='lighter';
        var fg=C.createLinearGradient(a,b+w,a+w,b);
        var stop=Math.max(0.001,Math.min(0.999,bloom));
        fg.addColorStop(0,'rgba(255,255,255,.16)'); fg.addColorStop(stop,'rgba(224,242,254,.05)'); fg.addColorStop(1,'rgba(255,255,255,0)');
        C.fillStyle=fg; C.fillRect(0,0,cs,cs); C.globalCompositeOperation='source-over';
        C.fillStyle='rgba(255,255,255,.10)'; C.fillRect(a,b,w,Math.max(1.5,w*0.08));
        C.fillStyle='rgba(0,0,0,.30)'; C.fillRect(a,b+w-Math.max(2,w*0.1),w,Math.max(2,w*0.1));
        C.restore();
        C.strokeStyle='rgba(165,243,252,.45)'; C.lineWidth=1; rr(C,a+0.5,b+0.5,w-1,w-1,cs*0.13); C.stroke();
        return cv;
      }
      return function(c,px,py,cs,col,glow){ var s=Math.max(2,Math.round(cs)); var fi=Math.floor(Date.now()/120)%FR; var k=col+'|'+s+'|'+(glow?1:0); var arr=cache[k]||(cache[k]=[]); var t=arr[fi]||(arr[fi]=render(String(col),s,!!glow,fi)); c.drawImage(t,px,py); };
    })() },
    inferno:{ name:'JMB Inferno', cost:0, req:104, cell:(function(){
      var FR=8, JMBCOL='#facc15', cache={};
      var FIRE={ '#ef4444':'#ee2f14','#f97316':'#ff7b0e','#facc15':'#ff9612','#22c55e':'#ff5f10','#22d3ee':'#ffab17','#3b82f6':'#ff4a12','#a855f7':'#d8280f' };
      var LOGO=new Image(); try{ LOGO.onload=function(){ cache={}; }; LOGO.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAdNElEQVR42u2deXhcVd3HP79z7r2zZWmaNk1LSfeWQtkKCrUoomz6srSgsqllU0ARBAVE4RUURAVcEBFQFgWEsmhRKotsoiDLy06hLKW0pQ1J26wzyczce895/7h3kil0CZK0qfQ8T54nmcxy5/s957d9f+dcoe9DAA0EpQcSCcZpoz4uVvZA2e3FyjgrDBFI8N85itbSjtglGHnJin1Ui3mks8hrZc9xgBCwfQW1L0MBJv49lXHVbOBIRPZQUE1fP+2/aEj8nS1kxdrHgVuyvrkDaIufomMiPjABpTdyKxz1FYRvisikMtBN/KuU/fw3D1v2I4AqfWFreduI/VVX0VwOdPWFBNnA/wQwFY6zB8r8TJCPxKCHZStD+HAPW2YdtADG2petyLe7iuHdZfjYdc3u9RFj0546S4QbBBlte+2/3gL+Glip+McCoRIZIXCUq0j5hgfix9XaSJD1gK8ynr5GwRzby7LegnefhomBVMbaO3O+OQrIvcuXrpWAHjuecdWtSuQQC37s2bfM9vc/fAHXWvtw1jcHxH5hDXOk1hJmmoynrykD390C/n88XAu+iHwy46pby8yVrM0HaCBMe+osjXy7DPwt44MNDfhKZBtHUeUb7okfs2vYe8CkHHbTSj9WZu+3zPz+i5RCAScMOaArDOeXJnx57K4rPPWkIDvZKMzc4nD73zELlmWeH27fAlnAqpLdr3DUcTH4wRbwB2QoIBShoeDK6SUrU5r9qYyrXhaRhrKYdcsYGFOEtbSJH07OwmoF2IyrDlYiY2JWtoA/sElbqIQa66gvlkwQwJf58NXTNiUJFsVRgJIkNGhPvyRQWVZg2my+CZvvzAmMDXdTylV7xeCbzQV8JZH3Cm30o6SsJLl5jFDAQdS+jljZQwTsZjCRdHSdZAMw1lLrCUpgVTG6+gon+jvcTJaEWGY6KLuDjSa+DGbgjYWOwKKAj9RojhjtsOsQhRJ4vt1wy9sBj7WE+AYqBz8RKr60aZJ29TtKGDEY7b+KZafOwOIo+HitZk6DyydqFSkt5I3FAkklFI3l8VbDH5YGPLAyJB/azYEIXzKezg82Dbdkz7OBRSHsNVxx3BiXmbUaLREhBkGrKIgzxiDWUuEICDzVGnLtkoB7m0IKxlLlRm9oBiERUuHpQXNZJX2vK4TAWPYYpjlxrMsnhikU0BkAImitsYVuTL4QvS7hoZJpQmPAGDIOaBEebwm5cnG0IgAqnIgEu4WAtdv5ooHuwDKtWnHyeJfPjHBw4hlfAt7ku7D5Iu6oBqr/5zgkkaT9r7+luPQNxHNQqQyhsWAMFU5E64MrQ371ps9TrSFJJST04DFLm5yAkrnp8C11CeGEcS5f3NqhyhE6fIstAV+IgPfGTmbIgSdQte9R6JoRUUzX2Ur2oVtp/fMVFF5/ISaigjAMwUYmKB9abl0e8us3iyzrslS6gsimN0ublABHIBdGIeUhoxxOm+gyIaPo8C2BBcdxsH4Bk+vGGzORIYecTPX+c1AVQ9aIGEq/m+4cnQ/cTOvtv6Tw+kuodALxUoRBgBKodoW3uy2Xv+lz07IAE/uNwH7ICFAC1kKnb5lSpTh7ssd+dZq8seRD0Foj1hB2duIMG0HNId+getaJ6KraXuBffJgVc39JkM/TcMQpMH0/rKiIiK5O2v92La23/hx/+RJUZQUoTRiGJBRktPDI6pALXy3yXJuhwo2ipU2xGjY6AU7sZI2Fo8dEs36oK7T5FiWC0hqT6wDtUP2ZOQw96ru4I8f2Av/cAzTe8jPmzb+b3y2yFC0c0wCf2/+TNBx5Oux2YM9zg5Z3aL35Ytr+chUmn0NXDMGEISY2S12B5deLfa5cHBCYyElv7NWw0QgoRTjtvmVcRvGDqR771mk6A4tvwNEaa0JMZ5bUDjMYdsJFpHfas9fEvPYkzX+4iNv/PI/fLYZnfQdHKYTo9ds6PsdsDUccuA9bHX02bL9XDxH5hU+x6urvknvyflQ6hbgeQRDixGbpX6tDzn2lyIJ2Q7UnGzVS2igElJZ3NrAcPNLh/KkeIxKlWQ9KO4S5dlSygtovnk3NYacjbiKqja9aSucNP+JPN17HFQuLPFmMgM9I2AOSAF1W4RvY3vE5aaLisMOPYOjR52C32iZaOdbQNu83rLr2PML2VejKIdgwJLQ2cviB5cJXi9y4LCStwVUbJ1IacAJKJkcLfGeyy/FjXQqhpWDAiROpsKOD1E4zGXHqZSQmT4+ANwHmriv5++UXcOnjTTzYpUFpKlQE/LvttZISEZrAGGYmAk6fPoQDTjoD93OnYdwUCigue5XmX55K7t/3oiorESUEocFVUKGFm98OOG9hkVywcUzSgBLgxCZn67Ti0mkeew7TtBSjypNyHGwhjw2K1BxxJsOOPQ/cKCGXRU/z2s++xcW3/4ObV0OX8qhUYZ+y2RIRnVbjhj6HVFvOOmhXdvzWJTBtz8gsGUPLzT9l1XXngTWoZAYTBBhgqCc80xZy2otFFnYahrgDGyVpT6vzBiqxai9adq/VXDc9wbQqTYtv0QLKdQmz7eghwxl57o3UzP46RjsoG1Kc+1OuPvVoTrz7DR7KeyS0kBLTZ7tc6ppNikUpxdMFh3nPLyN84AZ2SnaT2GEmofbI7LAHqe33oPu5fxCsbESn0og15EJoSCkOGOnwRs7wcoch5cjmQ4CUgX/oVg5X7Jig2hWyAbgCoh3CtjZS02Yw+sd/IbXdjEiEbl7EC2cfyQkXXM0v3jbkHZdKCf9jh1h6TVpZcsrhnpXw7/sfYcqbD9Iw/SNQPQJ35Fiq9vo8hcULKLzxEiqdQgP50JLWMGukQ0cAj68OSWgZkEplvxJQKmp3FC1fm+By0bYJAhuVGJzI2xK2t1P92S8x6vy5yND6qCfm3/P4zbGHcPyfXuBZ61HtgLZmw831fRhRg5MlpYXXjMsdT7+FPPRHdp8wCjVhJ0hXUv3pwzFd7XQ98wiSSKBFCEz02s/WO7g6Kme4KsoX7GAkoLRhIRdavjfF46xJHh2hxVrQSiLHme2g9ujvUffNX2EcDw28c+15fPUrJ/GTV3OYpEdGQsIBCAMtkBKD77rcvbybZ/4yj90TrQydsTehcqnc7TPoiiqyj81HtIPSGmujxPBTwzV1CcV9zWEUtQ3WFZAPLT+Y6vH18S6tvkUElFJYa7HdXYz45mUMPeo7UdeXn+WfZ3+Jz599BQ91O1QnNGLMmq3DfSBd3icJylpSruLFgsOddz/GpBVPMuVT+2G8DOntZpAYPZHOf84DC0prBEsuhBlDNQ0p4d7mMGp7HkwEaIli/G9N8jhtosuqYuxsRbBhiC0Wqf/u9VQfcHwUqbQt56o5BzHnd/fS7CaocmxUwXwfnwdQjDVhR3rlyj4RYSPf0Op6zH3yVbwn/8bH9/40VA4jMWEHkpN3pvOh2yEMQDsoLNkAdh+qqXDg3ubIJ/THKv3AYagAvoW6hDB/RpK0jmLnHpEzMIw462qq9j4KAwTLFnLOEQdx8aOvk0klcEzQ54SnJMRnA4unhFHJyCavyFvyoSXjCI70veavAKMdst0Fjt9+JL+Y+2fSU3dDgNwT99B4/uHYMADp3VuhBQ5+PM+rWUtK8b5W7Lqu4YMxKFAwMDYtVMaJiwJQGpPLkvnoPlTtfVT05EXP8o0DPs3Fj77O0EwCFfYN/NLsbvcjCXL/OofLpiW4fscE1+2Q5IppCWbVOz15R2ij12zIPBlAwoDajMfvXmzky5/dj+LzDwOQ2W1/Kj/1BUwuh2jdk4MklTAxo/BNZGI/cK7UXzF/q9+bNdo49VdegsKiF8i/9BhhroNVPzmGQ5OreHp4kqdXFTdYd9ESvWe7HxXPDh3pcOhIh20rFFjIm+i1O1cpdq32eC1n+HNTyD3NAauLlrSWDZYUtMDq7oBtahJ8qS5P49mzqD3jt3ijxtG94HEk4WGN6QkyQiyr48LhoDBBJUuTN5ZrpifZv06zsmDxFFgRrF9ERLAmxIqiIpWksxjynQVF7lwRrFUY6SlXB5Gwvn+d5rCRLpMzgm+hO4w+VKl4ZhqDtYZUrHYt7rLc3hhwV3NASzGq+et3ifOqLGT+VJ3m0mkeI1KajryPhD7iuNgwQLwkYi2+hRpX+L+2kMOfLPTL7O83AlRshuo84fpdEkytVLT5FlciEsqJCo3FVZBQwq/f9Ln0DR+AlI5IEOm18fsO1xw1ymFqhYrkSmNRoqKStV8g7OoGCzqdRHnJuNRsSCohqWFRl+Xm5T7zm0NyMZnEpqlgoGgsJ45zOXOSiwXyYZyvIFhrEIlmgm+hyoHlecucpwssytme6x00tSAl0B3A8ITwu+kJplcrWnzLu7N4iW0vFmo84f6VId9dUOStLkNCCb61fKxGc1yDyy5VCt9CV1gGfDFPmMvj1tZSt/8RKC9J899upND0DjqVQCVTaxKh4MWs4bplAQ+tiuJ431pGJIQfTPU4eKRDu28x9r2RVCnAGOIKi3KGY58psChnqHSk3yql/VqM0xKZh0oHrtgpwV7DNKvjkHRtI7RRPb6pYDn35QILOiwnjnHZZ5hGgGxoERG0djDFAmGum8TIUdT9z5epn3UcydETASg0LaP5r9fT9Jfr6F66GJ1OoBIpTBjJjmkdmaB/toRcvthnZFq4aFuPselopa7r+gILQ13hmXbDV58t0Ji3VDj9W6bu92qolsg5OgI/2c7jC1s5UQVU3rtRVuIvmdLRqmjNgwe0FSNTpLXGhgFBNkeirp4Rs46n/tATSNSNBsBvfAvrF/EaJkd/t66k6c5raLz9N+TfXopTkUZclzAIsdZS7QqBQFUCvFiPXhv4pXJ3rRclXqe+UKAzgPQAdFMMSDm61I2WD+GMSS6nTHDoCqLl7KxlmZdsvxYohNAVKAohhNkOnEwFIw46jlFHnEpyq3HRjF/6Gtk7r+KFeTfg+z47H3gEVbNOIDFpxyhBW9VI462X03jHlfitLejKKhIaUtqQjGfwukxOqdm32hGuXRpw3itFRCAxQALNgOkBpUSss2j5/GiHC7b1SGvIBevOWi2gHQfTnaM77+N9bDZbH3cOmW2mR8AuX0T7bb9iwbwbmLewhXmdgm+FAysMsydWsNNBRzDkC6eQGD8NgO63XmHZtT8i/+DNpDxQ6UpMEKzzekPbGwxc8JrPNW/5PQ2/AyXYD6gg06MDFy3TaxSXTEswISPkQ94TxomKYvuwowNv3DYM/8oPqdjzcxHwLStpmnsZi2+/inkvr+SODsVS3yGJQcTSbTX1TsisypDPTa5iwuxjqT/ydJL1WwPQ9cTdrPztOXS/8gy6sgJRkf787vKEp+GdvOU7C4r8Y2W4UfThjaIJJxSsLliGJITbdk0yqVIomN5MVXQ06wGGzP4atXPORVfVRpup5l9D+00/5sUFizjtTcUbXQ5Jx5DWkRgPkX6bN9DlK0YmDT8fG7Lb1K2oPOzbDJ19UqQvd2dp+eNPab3lEmxQQKWrojJDvPI8gXfy8IWn8izLGWqT0TUO9BgwRazcKXfE4emZEzwmpCLxPKFB6V6NwGuYwsjv/Z6aQ05GJdLkFz7FOxcdQ+vcX2CKOYYPrWR6jcI3hjdyhs44V5C4RCEI+9crvjMlwc6jMtiuTrL/mk/3sw/gjZqAt/Vk0tP3Ir3zJym88Tz+sjeRVBIVx/odRQhDGJcWFmQNTXEmPdAcDOgK0HFtZlqV4vzJCaZkhI54c4XraCp0iC7kqP7sHIZ/7RJ09TBsMU/LTT+m5ZZLenp5rDFgDWkd2eOnWkOuXxp1P4cW9hquOWaMw8yhUfjaFUYtjaJ6e4xqDjmZ2jnnoiqGYLqzrPrtObTe8UtCJ0XOehT9ABGhUsPyguW814o80RpS7Q6sGRoQAiQu0nX4lv3qHM6ZGDvgEBws4rgEXVm0l2Lyty6mdtYJkdN89WmafnkKhecfQ63FVpccYcYBV4THW0OKBvaojcSTzqA3Cuv1LRprDaajE2/yDtSdehmZuN+o/f5bWPjjb1Bsb8GtqMKGPoGVnirnxW8WuX1FEGXQDAwJA6IJQ1THOWZrl+9N9LBEsqQWIvA72khtPZGpl9zBkD1nAZCbdwWtP/4ytvFNgorqyCta857Kq8Rd1HkDY9JCQ0roDKLHlLzXuWMj2EwqjduyHP/BPyLKIbHDTJLjt2fozM+SffEJupctRqczKGt6ior7DNN4Sni0NUQr6T3gYbASUDoMJ2/g2+M9Thzjkg1iJSoW5P3WNmpm7M22P5tHety20NXO0otO5Nxzf8RNTSFTazM0JEMCG5e2Ze0l8BIR6wS+LNt2FNQ4hqWBx7mv+tx3531sv/J5aj/ySdxR4xm2z+cpLF9E50vPoFMpBIu1loIRZg5VjEwK/1gdYhAcNYg14TA+ZOK8yR6HjXJo83vNkSiN39ZO/eyjmXLhTTiVNbDsFR4+eTYn/fZu5uU9Xs8a5q3waQtgu0pNXVLwzYaJWBfwWmCIJ3T6cOVbPme9WODpNssLoccjTyxg9At3MXmXj6JGTaR2789j8h20PfkwKplARBBr6TLCzlWKiRnFw6vDtSaTm5yAUoFNBH44xePAOk2LH11oBJLC7+hg6+POYvyZl6O0g3n671x59MGcfN/rvK4TVElIUkVgP7oq5O7mqCVlaqWixhWKpjdLXd8oPWdI/Jq5y0POWFDkLyui5CPtQFIMy8Vl/sJm5OFb+ei2k3DGbUfNjP3Q6TSt/5yPcj1QCoUlFwhTKxXbVuoeEvprW2y/EBBtK7KcMcHjcyMdVhaj2LwHlGwnY0+5kDEnnB8V2e75A2d++Uh+sKAdP+mRprcTQgFpR2jz4f7mkAdWhSgRplQoarxID4g3zKyxP6BUWqh2o+fc+U6kOdywLCAbQIUrPRPFAgksvutyT2M3S+++lY831JDebneqdpyJN3wkqx+aF+kNolESZfBTK4T6pOLvq0KcwUKAxA62Ia04Y7xH0fSCIyKYYpGxX7+ArY85G4AlN/2crx5/En9oslQkHfRaOiEM0epJOcLKAtzTFPDgqmhFTMwoahNROTiISXNVVLvpNjCvMeScl32uXeKz2o+2rDryXu221CGRcDVPdiqemv83PlodMvyjn6Ji6q54w0fR+tjdSDzVddzjOjGt+HebYUVJdNrUBKi4+rlNheLAEQ5BTAAimGKe5Fbj2OaiuQCs+v2POOWUs/hzm0NtSgjjbabr7F6IwU1qoakA9zWF/H1lSDaAhrRQ60mUZRdh7vKAc18pcsPSgJUFqHQjOXJDMbyN9wq8nNe8/NDD7F2ZpWq3famYugst/7qLQuNbKC8BNrrWlIan2g2v5iK94YMS8IE1YRs7pZVF2zP7S/9QrkexeTlvXX42QVeW5rmX85VtK2lbVOSBlX60fXQDAJVi/5SGtBaWdFkuXFjkuiWK7asFLcJLHYalOYOrhWo3AqUvlctSrWpVwbDbUIfTJlex5LpLybasIjV6At1vLUQlklEiWNIIDDQVLM5g0oRLNvKHUzxm12uaC2U+wFqCbC7SAyqr8MQgFn61xOcPb/uklLyvXvwSaEUTa8NYkjpaCWtrW99QyTwXWGaPdDhzvIenIG8VJteBDcCpSEPcQu8bqPXgkZaQ014u4vVTJNRvonxgIangJ1MTzKhRtMZRUCkbjRolIjuuiFSzO5tDLllU7BHf308bePmZwe+3VFDaHOgKnDLO5YhRDl1hbwQlSoOADcMeZazagZezhtMXFGkNYr17MJUiFFGnmidw4TYee9VqWv31K05DHHglZ7nw9SLPd4RUOgO7dbSnE8K3TMoovjfJY9dqtUa+8h5Z0kCNC093GM54pUC7D0ndf9fYr7UgJcQlYsu5kxIcNEKv/8tZyOjInFy11Oem5T4gZHT/70wpSaW+sRxS7/KNcS5VGrIbkCVrXHhodcg5rxbJm2iV96cy1q+lCEuU9kPU7eAqYfchUWdDSXZcG2FK4JO1mu0qNQtzhuX5qNTcH63gPRvBA8tWScU5kzyO3drBxo1dawU//tAhLtzWGPD913yMBU/1/+ocsGpoqSB32CiHb4/3gPV/YRP7hY4Arl3mM3dFQMFEvuE/KQeXfEQujM6KnFXvcEKDS50ntAfx8bWy9kzaU5EpvWKJzzXLfFI6KsQNhDYwoJpwaVvqx2o035/sUZ+I9ID1tam4EpWbn203XLHE5/HWkETcaNUXIkqfWzBRu/yO1ZqvjXGYUaPpDnursmsbgYVKHa2WC9/wuW9lQJUjPdueNktJMlLELKOTiv+d5DKjRtPu91ZI17UaMnGryvzmgOuXBSzuMqS09JgBuw7gfROVRbZKKr402mHWCIekgs5w3bPexu83xIXnOwznv17ktayh2pUB36q6UTThUsOWEjihwWXOaCdqW1nPbDRxi3ulAy2+5bbGgNsaA5oLvU23JXus4ibeXGCp8YTZ9Q6Hj3QYmYy0ArOe4lnJ5CQV3NoYcNlin7wZmB6gTUZACaTSZu09azVnjPcYk4rsMawfoJJZWtZtubUx4K9Nvd3PIhHw1a7wmboI+AkZoWsD5qa00qodaCpafr7Y52/NAZm4i25jnRuxUc+KKJmJjsAy3BO+MdbjwBEa36x/NZTASqioJPFWl+VPTQF3NUVnPOxf53BovcOUjJCP32td5qZEaiKe9fevDvn5mz7Lus2A67+bnIBykxTJipZ9hjmcPNZlfLok2K97NZSISKrIRLzRFR1rMyXuNereAPAls1blwIqC5TdLfP7aFOKo/o/vBzUBa0RJgWWYKxzb4HJovUNCIocp9I0IYcPAlzt2C9zVFHLV0iIr8ranIGjYNGOTn5ilyyKXnas1J45xo+TN9A1Y+gB8UkV9SM+2G65a6vNY6egytemPLhsUZ8aVJ00K2He45pjRDpMzim4TxfTrI2JdwHsqmvWLuy03vB2Zmw+S3A0UAUUGya1KyrcmVbvCrHqHL4x0aEgJ3eGGiSgBX4qa3ilY7mgMuL0xYFW8VUnJ4Dq+UjKubhZhOIPo4FZdFtfXJaK4fna9w1bJyNnmzZo+onzGpzU0Fyx/bQ65vdHn7e6+bdbbRCOQjKf+T5BdGGT3DlhTeLHUJ4UD6hwOHuEwNiUULT3Ns55ENn553jK/OWDeOyHLuk2PUGMG38HYFhBreVsynr4+vlnboLxvzLuJGJYQ9hmmOWiEw7hUFAa93R0Bf/fKkHfygxr4nlREQBtr75MKV31FRK62g/zuGe+u9VQ6wti0oER4q8vQ7tv11ooGIwEW+32pSjAxtPp5gTSbwSgREcYmyMYZ8vs5omCQDBMamak6Crwh1j4hpY3gg3yUdzykYqer4sc2E/BN3AuyoDsInlZE3vdGNsObthk2u1lfumwxcAvRvSaRoVBZdPWr9N5HYMudlAZuAVugKyyGU7phhQJ0C3QYay+Vso3sW8aAOV9lLFd3wwrKbuQmQDLj6ueUMMluuZ/YgJkeLCvxw+2ysJqyk4gE6MLwtbInb7mvWP87X7HY07KwitJ5UWW2SfvWLnIVKSXyCbbcU7I/hy/gGsP1ucBcEOMa8q7Ip3SzYZNx1Z1K5MAt9xTuR/CtfSznm08TYdpjYdS7PLQBJOebw621D0sEvr8Fww8GvsU+J745GMiXRUKwFkdb+kdXxjcHGGvvikkIt0RH79vhBvHM/xdFs2+53S9/ol5HrKpyUPSNnesoKkVkZmyiAt7/cZ0ftjg/jMNLZQzX5gJzeBE61gY+63GyPdqAb7jX0+o5a+1HlMiwMiLYQsQaM74HeCzLDfbkrsD8MMZKrcuCbCjKEUAXQ/uKb+zvXUUBZDslVJbtkQvf9fwPU0Zr6N2mrCy0G8sV+OGcLmMfKzPxdn0A92X0hE0ZGIGjjkQ4XER2jn3Ehy5pKNuhacE+D9wWKHNjPs/Sd2PWl/fp62fqMvND2mUXRO0tlj2AaSKy1YcgbA2spRHsyyI8Ghj1QD4InigDW7+fRPb/AQlKuL9Voe0VAAAAAElFTkSuQmCC'; }catch(e){}
      var PAT={ '#ef4444':[[[0.5,0.02],[0.44,0.4],[0.58,0.62],[0.5,0.98]],[[0.44,0.4],[0.04,0.5]],[[0.58,0.62],[0.98,0.7]]],
        '#f97316':[[[0.02,0.32],[0.4,0.42],[0.66,0.3],[0.98,0.4]],[[0.4,0.42],[0.46,0.98]],[[0.66,0.3],[0.7,0.02]]],
        '#22c55e':[[[0.02,0.6],[0.35,0.5],[0.6,0.66],[0.98,0.55]],[[0.35,0.5],[0.4,0.02]],[[0.6,0.66],[0.55,0.98]]],
        '#22d3ee':[[[0.2,0.02],[0.34,0.45],[0.2,0.98]],[[0.34,0.45],[0.82,0.4]],[[0.82,0.4],[0.98,0.75]],[[0.82,0.4],[0.9,0.02]]],
        '#3b82f6':[[[0.02,0.45],[0.5,0.55],[0.98,0.42]],[[0.5,0.55],[0.4,0.02]],[[0.5,0.55],[0.62,0.98]]],
        '#a855f7':[[[0.5,0.02],[0.4,0.35],[0.6,0.55],[0.42,0.8],[0.55,0.98]],[[0.6,0.55],[0.98,0.5]],[[0.4,0.35],[0.02,0.42]]] };
      var NODES={ '#ef4444':[[0.44,0.4],[0.58,0.62]],'#f97316':[[0.4,0.42],[0.66,0.3]],'#22c55e':[[0.35,0.5],[0.6,0.66]],'#22d3ee':[[0.34,0.45],[0.82,0.4]],'#3b82f6':[[0.5,0.55]],'#a855f7':[[0.4,0.35],[0.6,0.55],[0.42,0.8]] };
      function render(col,cs,glow,fi){
        var cv=document.createElement('canvas'); cv.width=cs; cv.height=cs; var C=cv.getContext('2d');
        var m=cs*0.045,a=m,b=m,w=cs-2*m,cx=cs/2,cy=cs/2,lc=String(col).toLowerCase();
        var FC=FIRE[lc]||'#ff6a1a', isJMB=(lc===JMBCOL);
        var pulse=0.6+0.4*(0.5+0.5*Math.sin(fi/FR*6.283));
        rr(C,a,b,w,w,cs*0.13); C.save(); C.clip();
        var sg=C.createLinearGradient(a,b,a+w,b+w); sg.addColorStop(0,'#3a281f'); sg.addColorStop(1,'#130b07'); C.fillStyle=sg; C.fillRect(0,0,cs,cs);
        C.fillStyle='rgba(255,255,255,.05)'; var spk=[[0.2,0.3],[0.72,0.22],[0.5,0.62],[0.82,0.72],[0.3,0.82]]; for(var d=0;d<spk.length;d++){ C.fillRect(a+spk[d][0]*w,b+spk[d][1]*w,Math.max(1,w*0.04),Math.max(1,w*0.04)); }
        C.fillStyle='rgba(255,190,130,.08)'; C.fillRect(a,b,w,Math.max(1.5,w*0.08));
        C.fillStyle='rgba(0,0,0,.32)'; C.fillRect(a,b+w-Math.max(2,w*0.1),w,Math.max(2,w*0.1));
        if(isJMB){
          C.save(); C.globalCompositeOperation='lighter'; var hg=C.createRadialGradient(cx,cy,1,cx,cy,w*0.55); hg.addColorStop(0,'rgba(255,150,50,'+(0.34*pulse)+')'); hg.addColorStop(1,'rgba(255,90,20,0)'); C.fillStyle=hg; C.fillRect(0,0,cs,cs);
          if(LOGO.complete && LOGO.naturalWidth){ C.globalAlpha=0.85+0.15*pulse; C.drawImage(LOGO,17,15,62,66,a,b,w,w); C.globalAlpha=1; } C.restore();
        } else {
          var pat=PAT[lc]||PAT['#ef4444'];
          function sp(pw,st){ C.lineWidth=pw; C.strokeStyle=st; for(var i=0;i<pat.length;i++){ var po=pat[i]; C.beginPath(); for(var j=0;j<po.length;j++){ var x=a+po[j][0]*w,y=b+po[j][1]*w; j?C.lineTo(x,y):C.moveTo(x,y); } C.stroke(); } }
          C.lineCap='round'; C.lineJoin='round';
          sp(Math.max(2,w*0.15),'#090402');
          C.save(); C.shadowColor=FC; C.shadowBlur=w*(0.28+0.32*pulse)*(glow?1.15:1);
          sp(Math.max(1.5,w*0.09),FC);
          sp(Math.max(1,w*0.035),_cx(FC,'#fff2c8',0.62));
          C.restore();
          C.save(); C.shadowColor=FC; C.shadowBlur=w*0.3*pulse; C.fillStyle=_cx(FC,'#fff0c0',0.55); var nd=NODES[lc]||[]; for(var n=0;n<nd.length;n++){ C.beginPath(); C.arc(a+nd[n][0]*w,b+nd[n][1]*w,w*0.05*(0.7+0.5*pulse),0,6.283); C.fill(); } C.restore();
        }
        C.restore(); C.strokeStyle='rgba(0,0,0,.55)'; C.lineWidth=1; rr(C,a+0.5,b+0.5,w-1,w-1,cs*0.13); C.stroke();
        return cv;
      }
      return function(c,px,py,cs,col,glow){ var s=Math.max(2,Math.round(cs)); var fi=Math.floor(Date.now()/110)%FR; var k=col+'|'+s+'|'+(glow?1:0); var arr=cache[k]||(cache[k]=[]); var t=arr[fi]||(arr[fi]=render(String(col),s,!!glow,fi)); c.drawImage(t,px,py); };
    })() }
  };
  // ── THE CHOCOLATE COUNTER ──
  // Seven pieces, seven DIFFERENT confections — not seven shades of brown. Each has its own
  // base colour AND its own surface, so you tell them apart by texture as much as by tone:
  //
  //   I  Dark chocolate   smooth moulded bar        J  Rocky road      craggy chunks
  //   Z  Milk + hazelnut  studded with whole nuts   L  Praline         piped wavy ridges
  //   T  Ruby chocolate   marbled swirl             S  Cookie          biscuit + choc chips
  //   O  White chocolate  pearl-dotted
  //
  // Garbage rows are unsweetened baking chocolate: flat, grey and joyless.
  var CHOCO = {
    '#22d3ee': { b:'#3a2214', t:'bar'    },   // I → Dark chocolate
    '#3b82f6': { b:'#5a4636', t:'rocky'  },   // J → Rocky road
    '#ef4444': { b:'#8a5a2e', t:'nuts'   },   // Z → Milk + hazelnuts
    '#f97316': { b:'#b06a2c', t:'waves'  },   // L → Praline ridges
    '#a855f7': { b:'#b1545e', t:'swirl'  },   // T → Ruby, marbled
    '#22c55e': { b:'#c2a06a', t:'chips'  },   // S → Cookie with chips
    '#facc15': { b:'#efe0c0', t:'pearls' },   // O → White chocolate + pearls
    '#5b6b82': { b:'#4a3f38', t:'bar'    }    // garbage → baking chocolate
  };
  function _choc(col){ var e=CHOCO[String(col).toLowerCase()]; return e ? e.b : '#6b4a2f'; }
  function _chocTex(col){ var e=CHOCO[String(col).toLowerCase()]; return e ? e.t : 'bar'; }

  // ── THE SURFACES ────────────────────────────────────────────────────────────
  // Painted onto the plateau (already clipped by the caller). Every pattern is
  // POSITION-INDEPENDENT — derived from the cell's own box, never from where it sits
  // on the board — so a piece doesn't shimmer or crawl as it falls. Fine detail is
  // skipped below ~14px, where it would only turn to mud on the mini boards.
  function _chocSurface(c, x, y, w, base, tex, cs){
    var fine = cs >= 14;

    if(tex === 'nuts'){                                   // whole hazelnuts pressed in
      var nut = ['#7a4a22','#8f5a2c','#6b3f1d'];
      var pos = [[0.30,0.32,0.19],[0.70,0.40,0.16],[0.46,0.72,0.17]];
      for(var i=0;i<pos.length;i++){
        var nx=x+w*pos[i][0], ny=y+w*pos[i][1], nr=w*pos[i][2];
        c.beginPath(); c.arc(nx, ny+nr*0.18, nr, 0, 6.283);       // the shadow it sits in
        c.fillStyle='rgba(0,0,0,.35)'; c.fill();
        var ng=c.createRadialGradient(nx-nr*0.3, ny-nr*0.35, nr*0.1, nx, ny, nr);
        ng.addColorStop(0, _cs2(nut[i%3], 0.42));
        ng.addColorStop(1, _cs2(nut[i%3], -0.22));
        c.beginPath(); c.arc(nx, ny, nr, 0, 6.283); c.fillStyle=ng; c.fill();
        if(fine){                                                  // the nut's little seam
          c.strokeStyle='rgba(0,0,0,.28)'; c.lineWidth=Math.max(.6, w*0.02);
          c.beginPath(); c.moveTo(nx-nr*0.55, ny); c.lineTo(nx+nr*0.55, ny); c.stroke();
        }
      }
      return;
    }

    if(tex === 'waves'){                                  // piped praline ridges
      var n = 4, bw = w/n;
      for(var k=0;k<n;k++){
        var g=c.createLinearGradient(x+k*bw, y, x+(k+1)*bw, y);
        g.addColorStop(0,   _cs2(base, -0.30));
        g.addColorStop(0.42,_cs2(base,  0.30));           // the crest catches the light
        g.addColorStop(1,   _cs2(base, -0.34));
        c.fillStyle=g; c.fillRect(x+k*bw, y, bw+0.6, w);
      }
      if(fine){                                           // scalloped tops, like piped icing
        c.strokeStyle='rgba(255,240,220,.22)'; c.lineWidth=1;
        c.beginPath();
        for(var q=0;q<=n*4;q++){
          var wx = x + (q/(n*4))*w;
          var wy = y + w*0.14 + Math.sin(q*1.6)*w*0.05;
          q ? c.lineTo(wx,wy) : c.moveTo(wx,wy);
        }
        c.stroke();
      }
      return;
    }

    if(tex === 'chips'){                                  // biscuit + chocolate chips
      c.globalAlpha=.20; c.fillStyle='#8a6a3e';           // crumb
      for(var t=0;t<9;t++){
        var bx=x+((t*29)%100)/100*w, by=y+((t*53)%100)/100*w;
        c.fillRect(bx, by, Math.max(1,w*0.05), Math.max(1,w*0.05));
      }
      c.globalAlpha=1;
      var chip=[[0.28,0.30,0.15],[0.68,0.34,0.12],[0.42,0.68,0.13],[0.76,0.72,0.10]];
      for(var j=0;j<chip.length;j++){
        var chx=x+w*chip[j][0], chy=y+w*chip[j][1], chr=w*chip[j][2];
        c.beginPath(); c.arc(chx, chy, chr, 0, 6.283);
        c.fillStyle='#3d2412'; c.fill();                  // dark chip
        if(fine){
          c.beginPath(); c.arc(chx-chr*0.3, chy-chr*0.3, chr*0.34, 0, 6.283);
          c.fillStyle='rgba(255,255,255,.20)'; c.fill();  // its highlight
        }
      }
      return;
    }

    if(tex === 'pearls'){                                 // white chocolate + sugar pearls
      var g2=c.createLinearGradient(x,y,x,y+w);
      g2.addColorStop(0,'#fbf1dc'); g2.addColorStop(1,'#e2cea6');
      c.fillStyle=g2; c.fillRect(x,y,w,w);
      var r3=Math.max(1, w*0.09);
      for(var a=0;a<2;a++) for(var bq=0;bq<2;bq++){
        var pxx=x+w*(0.30+a*0.40), pyy=y+w*(0.30+bq*0.40);
        c.beginPath(); c.arc(pxx, pyy+r3*0.2, r3, 0, 6.283);
        c.fillStyle='rgba(140,110,70,.30)'; c.fill();     // the pearl's shadow
        var pg2=c.createRadialGradient(pxx-r3*0.35, pyy-r3*0.35, r3*0.1, pxx, pyy, r3);
        pg2.addColorStop(0,'#ffffff'); pg2.addColorStop(1,'#d8c39a');
        c.beginPath(); c.arc(pxx, pyy, r3, 0, 6.283); c.fillStyle=pg2; c.fill();
      }
      return;
    }

    if(tex === 'rocky'){                                  // rocky road — craggy chunks
      var chunk=[[0.10,0.12,0.42,0.34],[0.56,0.08,0.36,0.30],[0.06,0.54,0.34,0.38],[0.48,0.50,0.46,0.42]];
      for(var m2=0;m2<chunk.length;m2++){
        var kx=x+w*chunk[m2][0], ky=y+w*chunk[m2][1], kw=w*chunk[m2][2], kh=w*chunk[m2][3];
        c.beginPath();
        c.moveTo(kx, ky+kh*0.3);
        c.lineTo(kx+kw*0.35, ky);
        c.lineTo(kx+kw, ky+kh*0.22);
        c.lineTo(kx+kw*0.78, ky+kh);
        c.lineTo(kx+kw*0.15, ky+kh*0.85);
        c.closePath();
        c.fillStyle = _cs2(base, (m2%2 ? 0.26 : -0.28));  // alternating light/dark rubble
        c.fill();
        if(fine){
          c.strokeStyle='rgba(0,0,0,.30)'; c.lineWidth=0.8; c.stroke();
        }
      }
      return;
    }

    if(tex === 'swirl'){                                  // ruby chocolate, marbled
      c.save();
      c.lineWidth = w*0.16; c.lineCap='round';
      c.strokeStyle = _cs2(base, 0.34);
      c.beginPath();
      c.moveTo(x+w*0.10, y+w*0.72);
      c.bezierCurveTo(x+w*0.34, y+w*0.18, x+w*0.66, y+w*0.86, x+w*0.92, y+w*0.30);
      c.stroke();
      c.strokeStyle = _cs2(base, -0.30); c.lineWidth = w*0.10;
      c.beginPath();
      c.moveTo(x+w*0.06, y+w*0.36);
      c.bezierCurveTo(x+w*0.38, y+w*0.66, x+w*0.60, y+w*0.16, x+w*0.96, y+w*0.60);
      c.stroke();
      c.restore();
      return;
    }

    // 'bar' — a plain moulded slab. Just cocoa speckle so it isn't flat plastic.
    if(fine){
      c.globalAlpha=0.10; c.fillStyle='#000';
      for(var z=0;z<5;z++){
        c.fillRect(x+((z*37)%100)/100*w, y+((z*61)%100)/100*w, 1, 1);
      }
      c.globalAlpha=1;
    }
  }

  // ── tiny colour helpers used by the chocolate design ──
  function _rgb(h){ h=String(h).replace('#',''); if(h.length===3){ h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  function _cx(a, b, t){                       // mix a→b by t (0..1)
    var A=_rgb(a), B=_rgb(b);
    return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')';
  }
  function _cs2(col, amt){                     // lighten (+) / darken (−) an rgb() or hex
    var m = String(col).match(/-?\d+/g);
    var A = m && m.length>=3 ? [ +m[0], +m[1], +m[2] ] : _rgb(col);
    function f(v){ return Math.max(0, Math.min(255, Math.round(amt>0 ? v+(255-v)*amt : v*(1+amt)))); }
    return 'rgb('+f(A[0])+','+f(A[1])+','+f(A[2])+')';
  }
  function _starPath(c,cx,cy,R){ var r=R*0.46; c.beginPath(); for(var i=0;i<10;i++){ var ang=-Math.PI/2+i*Math.PI/5; var rad=(i%2)?r:R; var xx=cx+rad*Math.cos(ang), yy=cy+rad*Math.sin(ang); if(i===0) c.moveTo(xx,yy); else c.lineTo(xx,yy); } c.closePath(); }
  // Retired block designs — removed from the game. Anyone equipped falls back to Classic below.
  ['pixel','glossy','gem','bubble','star','candy','galaxy','ice','marble','gold','aurora'].forEach(function(_k){ try{ delete DESIGNS[_k]; }catch(_e){} });
  function block(ctx,x,y,cs,color,glow){ (DESIGNS[EQUIPPED]||DESIGNS.classic).cell(ctx,x*cs,y*cs,cs,color,glow); }
  // Same, but drawn in SOMEONE ELSE'S design — used for the opponent board and for
  // spectating, so a player's unlocked skin is visible to everyone watching them.
  function blockAs(ctx,x,y,cs,color,skin,glow){
    (DESIGNS[skin] || DESIGNS.classic).cell(ctx,x*cs,y*cs,cs,color,glow);
  }
  function ghostCell(ctx,x,y,cs,color){ var px=x*cs,py=y*cs,r=Math.max(2,cs*0.17);
    ctx.save(); rr(ctx,px+1.5,py+1.5,cs-3,cs-3,r); ctx.globalAlpha=0.14; ctx.fillStyle=color; ctx.fill();
    ctx.globalAlpha=0.55; ctx.lineWidth=1.5; ctx.strokeStyle=color; ctx.stroke(); ctx.restore(); }

/* ---- RANK tiers/rings — verbatim from portal ---- */
  var RANK_TIERS=[[1,'Tenderfoot'],[10,'Rookie'],[20,'Amateur'],[30,'Contender'],[40,'Challenger'],
                  [50,'Veteran'],[60,'Expert'],[70,'Master'],[80,'Grandmaster'],[90,'Elite'],
                  [100,'Legend'],[106,'Demi-god']];
  function tierName(rank,god){ if(god) return 'God of Tetris';
    var n='Tenderfoot'; for(var i=0;i<RANK_TIERS.length;i++){ if(rank>=RANK_TIERS[i][0]) n=RANK_TIERS[i][1]; } return n; }
  function tierCls(tier){ return 'tr-'+String(tier).toLowerCase().replace(/[^a-z]+/g,''); }
  // Your rank IS your ring. The border round every avatar is coloured by tier — one glance
  // at the board tells you who's dangerous, no medals required.
  var TIER_COLOR={ 'Tenderfoot':'#8a97b5','Rookie':'#94a3b8','Amateur':'#cbd5e1',
                   'Contender':'#22c55e','Challenger':'#4ade80','Veteran':'#38bdf8','Expert':'#22d3ee',
                   'Master':'#a855f7','Grandmaster':'#c084fc','Elite':'#fbbf24','Legend':'#fcd34d',
                   'Demi-god':'#f43f5e','God of Tetris':'#fde047' };
  function tierColor(t){ return TIER_COLOR[t]||'#8a97b5'; }
  // Must match the server: Rank 1 → 1 ★ · Rank 82 → 6 ★ · Rank 110 → 8 ★
  function poolStars(rank){ rank=parseInt(rank,10)||0; return rank<=0 ? 1 : (1+Math.floor(rank/15)); }
  function ringStyle(tier,w){
    var c=tierColor(tier), god=(tier==='God of Tetris');
    return 'border:'+(w||3)+'px solid '+c+';box-shadow:0 0 '+(god?22:14)+'px '+c+(god?'':'aa')+';';
  }
  var RANK_STEP=15, RANK_STEP_HI=150, RANK_HI_AT=1500;   // must match the server
  function rankFromStars(stars){
    stars=Math.max(0,parseInt(stars,10)||0);
    var rank,inRank,need,god=false;
    if(stars<RANK_HI_AT){ rank=1+Math.floor(stars/RANK_STEP); inRank=stars%RANK_STEP; need=RANK_STEP; }
    else { var rem=stars-RANK_HI_AT; rank=101+Math.floor(rem/RANK_STEP_HI); inRank=rem%RANK_STEP_HI; need=RANK_STEP_HI;
      var godAt=RANK_HI_AT+9*RANK_STEP_HI;
      if(rank>110){ rank=110; inRank=RANK_STEP_HI; }
      if(rank===110 && (stars-godAt)>=RANK_STEP_HI){ inRank=RANK_STEP_HI; god=true; } }
    return { stars:stars, rank:rank, in_rank:inRank, need:need, god:god,
             tier:tierName(rank,god), to_next: god?0:(need-inRank) };
  }
