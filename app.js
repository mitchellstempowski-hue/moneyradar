// Money Radar shared JS — confetti, counters, deadline math. No external dependencies.
(function(){
  "use strict";

  // ---------- Confetti (canvas, brand colors) ----------
  window.fireConfetti = function(opts){
    // Reduced-motion safe: celebration is delight, never a barrier or a trick.
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    opts = opts || {};
    var count = opts.count || 160;
    var canvas = document.getElementById('confetti-canvas');
    if(!canvas){
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    var colors = ['#2ee6a8','#ffd166','#64b6ff','#ffffff','#17b978'];
    var parts = [];
    for(var i=0;i<count;i++){
      parts.push({
        x: Math.random()*canvas.width,
        y: -20 - Math.random()*canvas.height*0.35,
        w: 6+Math.random()*7, h: 8+Math.random()*9,
        vy: 2.2+Math.random()*3.4, vx: -1.4+Math.random()*2.8,
        rot: Math.random()*Math.PI, vr: -0.12+Math.random()*0.24,
        color: colors[i % colors.length]
      });
    }
    var start = null;
    function frame(ts){
      if(!start) start = ts;
      var t = ts - start;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      var alive = false;
      parts.forEach(function(p){
        p.y += p.vy; p.x += p.vx + Math.sin((t/300)+p.rot)*0.6; p.rot += p.vr;
        if(p.y < canvas.height + 30) alive = true;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        ctx.restore();
      });
      if(alive && t < 6000){ requestAnimationFrame(frame); }
      else { ctx.clearRect(0,0,canvas.width,canvas.height); }
    }
    requestAnimationFrame(frame);
  };

  // ---------- Animated counters ----------
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = prefix + Math.round(target*eased).toLocaleString('en-US') + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('[data-count]').forEach(function(el){
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ animateCount(el); io.disconnect(); } });
      },{threshold:.4});
      io.observe(el);
    } else { animateCount(el); }
  });

  // ---------- Deadline day math (factual dates only) ----------
  window.daysUntil = function(iso){
    var now = new Date(); now.setHours(0,0,0,0);
    var d = new Date(iso + 'T23:59:59');
    return Math.ceil((d - now) / 86400000);
  };
  document.querySelectorAll('[data-deadline]').forEach(function(el){
    var days = window.daysUntil(el.getAttribute('data-deadline'));
    el.textContent = days <= 0 ? 'Closing now' : (days === 1 ? '1 day left' : days + ' days left');
  });

  // ---------- Plan preselect from ?plan= ----------
  var params = new URLSearchParams(window.location.search);
  var plan = params.get('plan');
  if(plan){
    var sel = document.getElementById('plan-select');
    if(sel){ for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value === plan) sel.selectedIndex = i; } }
  }

  // ---------- Signup form: celebrate on submit ----------
  var form = document.getElementById('signup-form');
  if(form){
    form.addEventListener('submit', function(){
      try{ window.fireConfetti({count: 120}); }catch(e){}
    });
  }
})();
