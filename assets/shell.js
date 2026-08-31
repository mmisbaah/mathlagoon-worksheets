/* =========================================================
   WORKSHEET HUB — APP SHELL & GAME FEEL
   Navigation between levels, Sparky the mascot, star rewards,
   synthesized sound effects, confetti, and a generic scanner
   that detects correct/incorrect feedback in ANY level's
   markup (each level's own JS already sets .correct/.incorrect
   classes — this layer just reacts to them) without needing
   to modify any of the five levels' internal code.
   ========================================================= */
(function () {

  const MASCOT_HAPPY = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,6 61,38 96,38 68,59 78,92 50,72 22,92 32,59 4,38 39,38" fill="#FFB627" stroke="#E89C0C" stroke-width="4"/>
    <circle cx="40" cy="46" r="4.5" fill="#2B2250"/>
    <circle cx="60" cy="46" r="4.5" fill="#2B2250"/>
    <circle cx="34" cy="55" r="4" fill="#FF9E9E" opacity="0.7"/>
    <circle cx="66" cy="55" r="4" fill="#FF9E9E" opacity="0.7"/>
    <path d="M42 57 Q50 64 58 57" stroke="#2B2250" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;

  const MASCOT_CELEBRATE = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,6 61,38 96,38 68,59 78,92 50,72 22,92 32,59 4,38 39,38" fill="#FFB627" stroke="#E89C0C" stroke-width="4"/>
    <path d="M35 44 Q40 40 45 44" stroke="#2B2250" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M55 44 Q60 40 65 44" stroke="#2B2250" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="55" r="4.5" fill="#FF9E9E" opacity="0.8"/>
    <circle cx="66" cy="55" r="4.5" fill="#FF9E9E" opacity="0.8"/>
    <path d="M40 56 Q50 70 60 56" stroke="#2B2250" stroke-width="3.5" fill="#fff" stroke-linecap="round"/>
    <g stroke="#FFD873" stroke-width="3" stroke-linecap="round">
      <line x1="10" y1="20" x2="18" y2="26"/>
      <line x1="90" y1="20" x2="82" y2="26"/>
      <line x1="12" y1="70" x2="20" y2="66"/>
      <line x1="88" y1="70" x2="80" y2="66"/>
    </g>
  </svg>`;

  const CHEER_MESSAGES = [
    "Awesome job!", "You're on fire!", "Super star!", "Nailed it!",
    "Brilliant work!", "You're a genius!", "Fantastic!", "Way to go!",
    "Incredible!", "You rock!"
  ];

  /* ---------- Persistent state (localStorage) ---------- */
  function safeGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }

  let stars = parseInt(safeGet('wh_stars', '0'), 10) || 0;
  let soundOn = safeGet('wh_sound', 'on') === 'on';
  let progress = parseInt(safeGet('wh_progress', '1'), 10) || 1;

  function renderStars() {
    const el = document.getElementById('star-count');
    if (el) el.textContent = stars;
  }
  function addStars(n) {
    stars += n;
    safeSet('wh_stars', String(stars));
    renderStars();
    const counter = document.getElementById('star-counter');
    if (counter) {
      counter.classList.remove('star-pop');
      void counter.offsetWidth; // restart animation
      counter.classList.add('star-pop');
    }
  }

  /* ---------- Sound (Web Audio, synthesized — no audio files needed) ---------- */
  let audioCtx = null;
  function getCtx() {
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      return audioCtx;
    } catch (e) { return null; }
  }
  function tone(freq, start, dur, type, gainPeak) {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(gainPeak || 0.15, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    } catch (e) { /* sound is optional — never let it break the app */ }
  }
  function playDing() {
    if (!soundOn) return;
    tone(880, 0, 0.18, 'triangle', 0.12);
    tone(1318, 0.06, 0.18, 'triangle', 0.1);
  }
  function playBuzz() {
    if (!soundOn) return;
    tone(180, 0, 0.22, 'sawtooth', 0.08);
  }
  function playFanfare() {
    if (!soundOn) return;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle', 0.13));
  }

  function updateSoundIcon() {
    const btn = document.getElementById('sound-toggle');
    if (btn) btn.textContent = soundOn ? '🔊' : '🔇';
  }
  document.addEventListener('DOMContentLoaded', () => {
    renderStars();
    updateSoundIcon();
    repositionMascot();
  });

  /* ---------- Confetti (lightweight canvas burst) ---------- */
  function launchConfetti() {
    try {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9998';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) { canvas.remove(); return; }
      const colors = ['#FFB627', '#4CC9F0', '#6BCB77', '#FF6B6B', '#B78FE0'];
      const pieces = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 3,
        vx: -1.5 + Math.random() * 3,
        rot: Math.random() * 360,
        vr: -8 + Math.random() * 16
      }));
      let frame = 0;
      const maxFrames = 130;
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.rot += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        frame++;
        if (frame < maxFrames) requestAnimationFrame(draw);
        else canvas.remove();
      }
      requestAnimationFrame(draw);
    } catch (e) { /* confetti is decorative only — never let it break the app */ }
  }

  /* ---------- Celebration toast ---------- */
  let toastEl = null;
  function showCelebration() {
    if (toastEl) toastEl.remove();
    const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
    toastEl = document.createElement('div');
    toastEl.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.7);
      background: white; border-radius: 24px; padding: 18px 28px;
      box-shadow: 0 10px 40px rgba(43,34,80,0.25); z-index: 9999;
      display: flex; align-items: center; gap: 14px; font-family: var(--k-font, sans-serif);
      opacity: 0; transition: opacity 0.25s ease, transform 0.25s ease; text-align: left;
    `;
    toastEl.innerHTML = `<div style="width:56px;height:56px;flex-shrink:0;">${MASCOT_CELEBRATE}</div>
      <div style="font-weight:800; font-size:1.3em; color:#2B2250;">${msg}</div>`;
    document.body.appendChild(toastEl);
    requestAnimationFrame(() => {
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    setTimeout(() => {
      if (!toastEl) return;
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translate(-50%, -50%) scale(0.7)';
      setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, 250);
    }, 1600);
  }

  /* ---------- Generic feedback scanner ----------
     Runs after every click (with a short delay so each level's
     own handler has already applied .correct/.incorrect classes),
     scoped to whichever level+section is currently visible. */
  function scanForFeedback() {
    const activeLevel = document.querySelector('.level-page.active-level');
    if (!activeLevel) return;
    const activeSection = activeLevel.querySelector('.section.active');
    if (!activeSection) return;

    const newlyCorrect = activeSection.querySelectorAll('.correct:not([data-fx-seen])');
    const newlyIncorrect = activeSection.querySelectorAll('.incorrect:not([data-fx-seen])');
    if (newlyCorrect.length) {
      newlyCorrect.forEach(el => el.setAttribute('data-fx-seen', '1'));
      addStars(newlyCorrect.length);
      playDing();
    }
    if (newlyIncorrect.length) {
      newlyIncorrect.forEach(el => el.setAttribute('data-fx-seen', '1'));
      playBuzz();
    }

    // Whole-worksheet celebration: every filled .ans in the section is correct
    const answers = activeSection.querySelectorAll('.ans');
    if (answers.length) {
      const anyMarked = activeSection.querySelector('.ans.correct, .ans.incorrect');
      if (!anyMarked) activeSection.removeAttribute('data-celebrated');
      const filled = [...answers].filter(a => a.value && a.value.trim() !== '');
      if (
        filled.length > 1 &&
        filled.length === answers.length &&
        filled.every(a => a.classList.contains('correct')) &&
        !activeSection.dataset.celebrated
      ) {
        activeSection.dataset.celebrated = '1';
        addStars(5);
        launchConfetti();
        showCelebration();
        playFanfare();
      }
    }
  }
  document.addEventListener('click', () => { setTimeout(scanForFeedback, 40); });

  /* ---------- App navigation ---------- */
  function showLevel(n) {
    document.getElementById('app-home').style.display = 'none';
    document.querySelectorAll('.level-page').forEach(p => p.classList.remove('active-level'));
    document.getElementById('level-' + n).classList.add('active-level');
    if (n > progress) { progress = n; safeSet('wh_progress', String(progress)); }
    window.scrollTo(0, 0);
  }
  function showAppHome() {
    document.querySelectorAll('.level-page').forEach(p => p.classList.remove('active-level'));
    document.getElementById('app-home').style.display = 'block';
    window.scrollTo(0, 0);
    repositionMascot();
  }
  document.querySelectorAll('.level-card').forEach(btn => {
    btn.addEventListener('click', () => showLevel(btn.dataset.level));
  });
  document.querySelectorAll('[data-alllevels]').forEach(btn => {
    btn.addEventListener('click', showAppHome);
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#sound-toggle')) {
      soundOn = !soundOn;
      safeSet('wh_sound', soundOn ? 'on' : 'off');
      updateSoundIcon();
      if (soundOn) playDing();
    }
  });

  /* ---------- Mascot follows progress along the path ---------- */
  function repositionMascot() {
    const mascot = document.getElementById('path-mascot');
    const wrap = document.querySelector('.path-wrap');
    const card = document.querySelector('.level-card[data-level="' + progress + '"]');
    if (!mascot || !wrap || !card) return;
    const wrapRect = wrap.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const top = cardRect.top - wrapRect.top - 44;
    const left = cardRect.left - wrapRect.left + cardRect.width / 2 - 28;
    mascot.style.top = top + 'px';
    mascot.style.left = left + 'px';
  }
  window.addEventListener('resize', repositionMascot);


})();
