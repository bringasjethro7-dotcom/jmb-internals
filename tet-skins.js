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
    } }
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
