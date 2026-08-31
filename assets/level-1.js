/* ===== Level 1 JS ===== */
(function(){

  /* ---------- Navigation ---------- */
  function showSection(id) {
    document.querySelectorAll('#level-1 .section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  document.querySelectorAll('#level-1 .card').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });
  document.querySelectorAll('#level-1 [data-back]').forEach(btn => {
    btn.addEventListener('click', () => showSection('l1-section-home'));
  });

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ---------- MATH ---------- */
  let mathProblems = [];
  let mathChecked = false;

  function genMathProblems(op, count) {
    mathProblems = WorksheetCore.generate(1, op, count);
    mathChecked = false;
    document.getElementById('l1-mathReveal').disabled = true;
    renderMath();
  }

  function renderMath() {
    const grid = document.getElementById('l1-mathGrid');
    grid.innerHTML = '';
    mathProblems.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'problem';
      div.innerHTML = `${i + 1}. ${p.a} ${p.symbol} ${p.b} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off">`;
      grid.appendChild(div);
    });
  }

  document.getElementById('l1-mathRegen').addEventListener('click', () => {
    genMathProblems(document.getElementById('l1-mathOp').value, parseInt(document.getElementById('l1-mathCount').value, 10));
  });
  document.getElementById('l1-mathOp').addEventListener('change', () => {
    genMathProblems(document.getElementById('l1-mathOp').value, parseInt(document.getElementById('l1-mathCount').value, 10));
  });
  document.getElementById('l1-mathCheck').addEventListener('click', () => {
    document.querySelectorAll('#l1-mathGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === mathProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    mathChecked = true;
    document.getElementById('l1-mathReveal').disabled = false;
  });
  document.getElementById('l1-mathReveal').addEventListener('click', () => {
    if (!mathChecked) return;
    document.querySelectorAll('#l1-mathGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${mathProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- LETTERS ---------- */
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const letterSingleSelect = document.getElementById('l1-letterSingle');
  alphabet.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    letterSingleSelect.appendChild(opt);
  });

  const simpleWords = ['cat','dog','sun','pig','hat','bed','cup','red','big','hen','box','run','bag','mat','hot','top','jam','wet','van','zip'];
  let letterProblems = [];
  let letterChecked = false;

  document.getElementById('l1-letterSet').addEventListener('change', (e) => {
    document.getElementById('l1-letterSingleWrap').style.display = e.target.value === 'single' ? 'flex' : 'none';
  });

  document.getElementById('l1-letterMode').addEventListener('change', (e) => {
    const isMissing = e.target.value === 'missing';
    document.getElementById('l1-letterTraceControls').style.display = isMissing ? 'none' : 'flex';
    document.getElementById('l1-letterSingleWrap').style.display = (!isMissing && document.getElementById('l1-letterSet').value === 'single') ? 'flex' : 'none';
    document.getElementById('l1-letterCaseWrap').style.display = isMissing ? 'none' : 'flex';
    document.getElementById('l1-letterRepeatsWrap').style.display = isMissing ? 'none' : 'flex';
    document.getElementById('l1-letterCheck').style.display = isMissing ? 'inline-block' : 'none';
    document.getElementById('l1-letterReveal').style.display = isMissing ? 'inline-block' : 'none';
    genLetters();
  });

  function caseVariants(ch, mode) {
    if (mode === 'upper') return [ch.toUpperCase()];
    if (mode === 'lower') return [ch.toLowerCase()];
    return [ch.toUpperCase(), ch.toLowerCase()];
  }

  function genLettersTrace() {
    const setMode = document.getElementById('l1-letterSet').value;
    const caseMode = document.getElementById('l1-letterCase').value;
    const repeats = parseInt(document.getElementById('l1-letterRepeats').value, 10);
    const letters = setMode === 'single' ? [letterSingleSelect.value] : alphabet;

    const output = document.getElementById('l1-letterOutput');
    output.innerHTML = '';
    letters.forEach(letter => {
      const variants = caseVariants(letter, caseMode);
      const row = document.createElement('div');
      row.className = 'trace-row';
      const label = document.createElement('div');
      label.className = 'row-label';
      label.textContent = `Letter ${letter.toUpperCase()}`;
      row.appendChild(label);
      const chars = document.createElement('div');
      chars.className = 'trace-chars';
      for (let i = 0; i < repeats; i++) {
        const v = variants[i % variants.length];
        const span = document.createElement('span');
        span.className = 'trace-char';
        span.textContent = v;
        chars.appendChild(span);
      }
      row.appendChild(chars);
      output.appendChild(row);
    });
  }

  function genLettersMissing() {
    letterProblems = [];
    const output = document.getElementById('l1-letterOutput');
    output.innerHTML = '';
    simpleWords.forEach((word, wIdx) => {
      const blankPos = randInt(0, word.length - 1);
      const row = document.createElement('div');
      row.className = 'missing-word-row';
      const label = document.createElement('div');
      label.className = 'row-label';
      label.textContent = `Word ${wIdx + 1}`;
      row.appendChild(label);
      const wordRow = document.createElement('div');
      wordRow.className = 'missing-word';
      word.split('').forEach((ch, i) => {
        const box = document.createElement('div');
        box.className = 'letter-box';
        if (i === blankPos) {
          const idx = letterProblems.length;
          letterProblems.push({ answer: ch });
          box.innerHTML = `<input class="ans" type="text" maxlength="1" data-index="${idx}" autocomplete="off">`;
        } else {
          box.textContent = ch;
        }
        wordRow.appendChild(box);
      });
      row.appendChild(wordRow);
      output.appendChild(row);
    });
    letterChecked = false;
    document.getElementById('l1-letterReveal').disabled = true;
  }

  function genLetters() {
    if (document.getElementById('l1-letterMode').value === 'missing') genLettersMissing();
    else genLettersTrace();
  }

  document.getElementById('l1-letterRegen').addEventListener('click', genLetters);
  document.getElementById('l1-letterCheck').addEventListener('click', () => {
    document.querySelectorAll('#l1-letterOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim().toLowerCase();
      if (val === '') return;
      if (val === letterProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    letterChecked = true;
    document.getElementById('l1-letterReveal').disabled = false;
  });
  document.getElementById('l1-letterReveal').addEventListener('click', () => {
    if (!letterChecked) return;
    document.querySelectorAll('#l1-letterOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${letterProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- NUMBERS ---------- */
  let numberProblems = [];
  let numberChecked = false;
  const countEmojis = ['🍎','⭐','🐠','🎈','🍓','🐚','🌸','🍊'];

  document.getElementById('l1-numberMode').addEventListener('change', (e) => {
    const needsControls = e.target.value === 'count' || e.target.value === 'missing';
    document.getElementById('l1-numberCountWrap').style.display = needsControls ? 'flex' : 'none';
    document.getElementById('l1-numberCheck').style.display = needsControls ? 'inline-block' : 'none';
    document.getElementById('l1-numberReveal').style.display = needsControls ? 'inline-block' : 'none';
  });

  function genNumbers() {
    const mode = document.getElementById('l1-numberMode').value;
    const output = document.getElementById('l1-numberOutput');
    output.innerHTML = '';

    if (mode === 'trace') {
      for (let n = 0; n <= 20; n++) {
        const row = document.createElement('div');
        row.className = 'trace-row';
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = `Number ${n}`;
        row.appendChild(label);
        const chars = document.createElement('div');
        chars.className = 'trace-chars';
        for (let i = 0; i < 8; i++) {
          const span = document.createElement('span');
          span.className = 'trace-char';
          span.textContent = n;
          chars.appendChild(span);
        }
        row.appendChild(chars);
        output.appendChild(row);
      }
    } else if (mode === 'count') {
      const count = parseInt(document.getElementById('l1-numberCount').value, 10);
      numberProblems = [];
      const grid = document.createElement('div');
      grid.className = 'grid';
      grid.id = 'numberGrid';
      for (let i = 0; i < count; i++) {
        const n = randInt(1, 9);
        const emoji = countEmojis[randInt(0, countEmojis.length - 1)];
        numberProblems.push({ answer: n });
        const div = document.createElement('div');
        div.className = 'problem';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        div.innerHTML = `<div>${emoji.repeat(n)}</div><div>${i + 1}. Count: <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off"></div>`;
        grid.appendChild(div);
      }
      output.appendChild(grid);
      numberChecked = false;
      document.getElementById('l1-numberReveal').disabled = true;
    } else {
      const rows = parseInt(document.getElementById('l1-numberCount').value, 10);
      numberProblems = [];
      const grid = document.createElement('div');
      grid.id = 'numberGrid';
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const start = randInt(0, 10);
        const blankPositions = new Set();
        while (blankPositions.size < 3) blankPositions.add(randInt(0, 9));

        const row = document.createElement('div');
        row.className = 'skip-row';
        for (let i = 0; i < 10; i++) {
          const value = start + i;
          if (blankPositions.has(i)) {
            numberProblems.push({ answer: value });
            const input = document.createElement('input');
            input.className = 'ans';
            input.type = 'text';
            input.inputMode = 'numeric';
            input.dataset.index = idx;
            input.autocomplete = 'off';
            row.appendChild(input);
            idx++;
          } else {
            const span = document.createElement('span');
            span.className = 'skip-num';
            span.textContent = value;
            row.appendChild(span);
          }
          if (i < 9) {
            const comma = document.createElement('span');
            comma.textContent = ',';
            row.appendChild(comma);
          }
        }
        grid.appendChild(row);
      }
      output.appendChild(grid);
      numberChecked = false;
      document.getElementById('l1-numberReveal').disabled = true;
    }
  }
  document.getElementById('l1-numberRegen').addEventListener('click', genNumbers);
  document.getElementById('l1-numberCheck').addEventListener('click', () => {
    document.querySelectorAll('#numberGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === numberProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    numberChecked = true;
    document.getElementById('l1-numberReveal').disabled = false;
  });
  document.getElementById('l1-numberReveal').addEventListener('click', () => {
    if (!numberChecked) return;
    document.querySelectorAll('#numberGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${numberProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- SHAPES ---------- */
  const shapes = [
    { name: 'Circle', svg: '<circle cx="50" cy="50" r="40" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Square', svg: '<rect x="12" y="12" width="76" height="76" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Triangle', svg: '<polygon points="50,10 90,85 10,85" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Rectangle', svg: '<rect x="8" y="25" width="84" height="50" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Star', svg: '<polygon points="50,6 61,38 96,38 68,59 78,92 50,72 22,92 32,59 4,38 39,38" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Heart', svg: '<path d="M50,88 C10,60 5,30 25,18 C38,10 48,20 50,30 C52,20 62,10 75,18 C95,30 90,60 50,88 Z" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Oval', svg: '<ellipse cx="50" cy="50" rx="42" ry="28" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Diamond', svg: '<polygon points="50,8 92,50 50,92 8,50" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Pentagon', svg: '<polygon points="50,6 92,37 76,88 24,88 8,37" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Hexagon', svg: '<polygon points="27,8 73,8 96,50 73,92 27,92 4,50" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' }
  ];

  function renderShapes() {
    const grid = document.getElementById('l1-shapeGrid');
    grid.innerHTML = '';
    shapes.forEach(s => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.innerHTML = `<svg viewBox="0 0 100 100">${s.svg}</svg><div class="shape-label">${s.name}</div>`;
      grid.appendChild(card);
    });
  }
  renderShapes();

  /* ---------- TRACING LINES (complete collection, all difficulty tiers) ---------- */
  function buildWave(baseY, amp, halfPeriod, xStart, xEnd, phaseUp) {
    let path = `M ${xStart} ${baseY}`;
    let x = xStart, up = phaseUp;
    while (x < xEnd) {
      const midX = x + halfPeriod / 2;
      const midY = up ? baseY - amp : baseY + amp;
      const endX = Math.min(x + halfPeriod, xEnd);
      path += ` Q ${midX} ${midY} ${endX} ${baseY}`;
      x = endX;
      up = !up;
    }
    return path;
  }
  function buildStarRow() {
    let d = '';
    for (let cx = 40; cx <= 460; cx += 80) {
      d += `M ${cx-12} 30 L ${cx+12} 30 M ${cx} 18 L ${cx} 42 M ${cx-8} 22 L ${cx+8} 38 M ${cx-8} 38 L ${cx+8} 22 `;
    }
    return d.trim();
  }
  function buildCelticKnot() {
    let d = '';
    for (let x = 5; x <= 455; x += 30) {
      d += `M ${x} 45 C ${x+5} 5, ${x+25} 5, ${x+30} 45 `;
    }
    for (let x = 20; x <= 470; x += 30) {
      d += `M ${x} 15 C ${x+5} 55, ${x+25} 55, ${x+30} 15 `;
    }
    return d.trim();
  }
  function buildMazeConnector() {
    let path = 'M 5 30';
    let x = 5, toggle = true;
    while (x < 485) {
      const nx = x + 40;
      const ny = toggle ? 10 : 50;
      path += ` L ${nx} ${ny} A 6 6 0 1 1 ${nx - 0.1} ${ny}`;
      x = nx;
      toggle = !toggle;
    }
    return path;
  }

  const linePatterns = [
    // Easy
    { tier: 'easy', name: 'Straight Line', path: 'M 5 30 L 495 30' },
    { tier: 'easy', name: 'Zigzag', path: 'M 5 30 L 55 10 L 105 50 L 155 10 L 205 50 L 255 10 L 305 50 L 355 10 L 405 50 L 455 10 L 495 30' },
    { tier: 'easy', name: 'Wavy Line', path: 'M 5 30 Q 30 5 55 30 T 105 30 T 155 30 T 205 30 T 255 30 T 305 30 T 355 30 T 405 30 T 455 30 T 495 30' },
    { tier: 'easy', name: 'Big Loops', path: 'M 5 30 C 25 -10, 65 -10, 85 30 S 145 70, 165 30 S 225 -10, 245 30 S 305 70, 325 30 S 385 -10, 405 30 S 465 70, 495 30' },
    // Medium
    { tier: 'medium', name: 'Cursive Loops', path: 'M 5 45 C 15 15, 35 15, 40 45 C 45 15, 65 15, 70 45 C 75 15, 95 15, 100 45 C 105 15, 125 15, 130 45 C 135 15, 155 15, 160 45 C 165 15, 185 15, 190 45 C 195 15, 215 15, 220 45 C 225 15, 245 15, 250 45 C 255 15, 275 15, 280 45 C 285 15, 305 15, 310 45 C 315 15, 335 15, 340 45 C 345 15, 365 15, 370 45 C 375 15, 395 15, 400 45 C 405 15, 425 15, 430 45 C 435 15, 455 15, 460 45 C 465 15, 485 15, 495 45' },
    { tier: 'medium', name: 'Figure Eight', path: 'M 50 30 C 30 5, 5 5, 5 30 C 5 55, 30 55, 50 30 C 70 5, 95 5, 95 30 C 95 55, 70 55, 50 30 M 150 30 C 130 5, 105 5, 105 30 C 105 55, 130 55, 150 30 C 170 5, 195 5, 195 30 C 195 55, 170 55, 150 30 M 250 30 C 230 5, 205 5, 205 30 C 205 55, 230 55, 250 30 C 270 5, 295 5, 295 30 C 295 55, 270 55, 250 30 M 350 30 C 330 5, 305 5, 305 30 C 305 55, 330 55, 350 30 C 370 5, 395 5, 395 30 C 395 55, 370 55, 350 30 M 450 30 C 430 5, 405 5, 405 30 C 405 55, 430 55, 450 30 C 470 5, 495 5, 495 30 C 495 55, 470 55, 450 30' },
    { tier: 'medium', name: 'Spiral Chain', path: 'M 40 30 A 12 12 0 1 1 40 29.9 M 120 30 A 12 12 0 1 1 120 29.9 M 200 30 A 12 12 0 1 1 200 29.9 M 280 30 A 12 12 0 1 1 280 29.9 M 360 30 A 12 12 0 1 1 360 29.9 M 440 30 A 12 12 0 1 1 440 29.9 M 5 30 L 495 30' },
    { tier: 'medium', name: 'Steep Zigzag', path: 'M 5 55 L 30 5 L 55 55 L 80 5 L 105 55 L 130 5 L 155 55 L 180 5 L 205 55 L 230 5 L 255 55 L 280 5 L 305 55 L 330 5 L 355 55 L 380 5 L 405 55 L 430 5 L 455 55 L 480 5 L 495 30' },
    // Hard
    { tier: 'hard', name: 'Tight Spiral Chain', path: 'M 40 30 A 8 8 0 1 1 40 29.9 M 40 30 A 16 16 0 1 1 40 29.8 M 120 30 A 8 8 0 1 1 120 29.9 M 120 30 A 16 16 0 1 1 120 29.8 M 200 30 A 8 8 0 1 1 200 29.9 M 200 30 A 16 16 0 1 1 200 29.8 M 280 30 A 8 8 0 1 1 280 29.9 M 280 30 A 16 16 0 1 1 280 29.8 M 360 30 A 8 8 0 1 1 360 29.9 M 360 30 A 16 16 0 1 1 360 29.8 M 440 30 A 8 8 0 1 1 440 29.9 M 440 30 A 16 16 0 1 1 440 29.8' },
    { tier: 'hard', name: 'Sharp Angles', path: 'M 5 50 L 25 10 L 45 50 L 65 10 L 85 50 L 105 10 L 125 50 L 145 10 L 165 50 L 185 10 L 205 50 L 225 10 L 245 50 L 265 10 L 285 50 L 305 10 L 325 50 L 345 10 L 365 50 L 385 10 L 405 50 L 425 10 L 445 50 L 465 10 L 485 50' },
    { tier: 'hard', name: 'Interlocking Loops', path: 'M 5 45 C 15 5, 45 5, 45 45 C 45 5, 75 5, 75 45 C 75 5, 105 5, 105 45 C 105 5, 135 5, 135 45 C 135 5, 165 5, 165 45 C 165 5, 195 5, 195 45 C 195 5, 225 5, 225 45 C 225 5, 255 5, 255 45 C 255 5, 285 5, 285 45 C 285 5, 315 5, 315 45 C 315 5, 345 5, 345 45 C 345 5, 375 5, 375 45 C 375 5, 405 5, 405 45 C 405 5, 435 5, 435 45 C 435 5, 465 5, 465 45 C 465 5, 495 5, 495 45' },
    { tier: 'hard', name: 'Combination Path', path: 'M 5 30 L 40 30 A 12 12 0 1 1 40 29.9 L 90 5 L 130 55 L 170 5 L 210 55 Q 235 5 260 30 T 310 30 L 350 30 A 12 12 0 1 1 350 29.9 L 400 5 L 440 55 L 480 5 L 495 30' },
    // Expert
    { tier: 'expert', name: 'Double Helix', path: 'M 5 30 Q 20 10 35 30 Q 50 50 65 30 Q 80 10 95 30 Q 110 50 125 30 Q 140 10 155 30 Q 170 50 185 30 Q 200 10 215 30 Q 230 50 245 30 Q 260 10 275 30 Q 290 50 305 30 Q 320 10 335 30 Q 350 50 365 30 Q 380 10 395 30 Q 410 50 425 30 Q 440 10 455 30 Q 470 50 485 30 M 5 30 Q 20 50 35 30 Q 50 10 65 30 Q 80 50 95 30 Q 110 10 125 30 Q 140 50 155 30 Q 170 10 185 30 Q 200 50 215 30 Q 230 10 245 30 Q 260 50 275 30 Q 290 10 305 30 Q 320 50 335 30 Q 350 10 365 30 Q 380 50 395 30 Q 410 10 425 30 Q 440 50 455 30 Q 470 10 485 30' },
    { tier: 'expert', name: 'Basket Weave', path: 'M 5 30 Q 20 5 35 30 Q 50 55 65 30 Q 80 5 95 30 Q 110 55 125 30 Q 140 5 155 30 Q 170 55 185 30 Q 200 5 215 30 Q 230 55 245 30 Q 260 5 275 30 Q 290 55 305 30 Q 320 5 335 30 Q 350 55 365 30 Q 380 5 395 30 Q 410 55 425 30 Q 440 5 455 30 Q 470 55 485 30' },
    { tier: 'expert', name: 'Layered Spiral', path: 'M 60 30 A 6 6 0 1 1 60 29.9 M 60 30 A 12 12 0 1 1 60 29.8 M 60 30 A 18 18 0 1 1 60 29.7 M 200 30 A 6 6 0 1 1 200 29.9 M 200 30 A 12 12 0 1 1 200 29.8 M 200 30 A 18 18 0 1 1 200 29.7 M 340 30 A 6 6 0 1 1 340 29.9 M 340 30 A 12 12 0 1 1 340 29.8 M 340 30 A 18 18 0 1 1 340 29.7 M 480 30 A 6 6 0 1 1 480 29.9 M 480 30 A 12 12 0 1 1 480 29.8 M 480 30 A 18 18 0 1 1 480 29.7' },
    { tier: 'expert', name: 'Compound Path', path: 'M 5 30 A 10 10 0 1 1 5 29.9 L 35 5 L 65 55 L 95 5 Q 120 55 145 30 T 195 30 C 205 5, 225 5, 235 30 C 245 55, 265 55, 275 30 L 305 5 L 335 55 L 365 5 A 10 10 0 1 1 385 30 L 415 55 L 445 5 L 475 55 L 495 30' },
    // Master
    { tier: 'master', name: 'Celtic Knot', path: buildCelticKnot() },
    { tier: 'master', name: 'Radiating Sunburst', path: buildStarRow() },
    { tier: 'master', name: 'Triple Braid', path: buildWave(30, 18, 30, 5, 485, true) + ' ' + buildWave(30, 18, 30, 5, 485, false) + ' ' + buildWave(30, 8, 15, 5, 485, true) },
    { tier: 'master', name: 'Maze Connector', path: buildMazeConnector() }
  ];

  function genTracingLines() {
    const rows = parseInt(document.getElementById('l1-tracingRows').value, 10);
    const difficulty = document.getElementById('l1-tracingDifficulty').value;
    const patterns = difficulty === 'all' ? linePatterns : linePatterns.filter(p => p.tier === difficulty);
    const output = document.getElementById('l1-tracingOutput');
    output.innerHTML = '';
    patterns.forEach(pattern => {
      const wrap = document.createElement('div');
      wrap.className = 'line-row';
      const label = document.createElement('div');
      label.className = 'row-label';
      label.textContent = pattern.name;
      wrap.appendChild(label);
      for (let r = 0; r < rows; r++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 500 60');
        svg.innerHTML = `<path d="${pattern.path}" fill="none" stroke="#aaa" stroke-width="2.5" stroke-dasharray="6 5"/>`;
        wrap.appendChild(svg);
      }
      output.appendChild(wrap);
    });
  }
  document.getElementById('l1-tracingRegen').addEventListener('click', genTracingLines);
  document.getElementById('l1-tracingDifficulty').addEventListener('change', genTracingLines);

  /* ---------- MATCHING ---------- */
  const matchThemes = {
    animals: ['🐶','🐱','🐰','🐻','🐼','🦁','🐸','🐵'],
    fruits: ['🍎','🍌','🍇','🍓','🍊','🍉','🍍','🥝'],
    vehicles: ['🚗','🚌','🚲','✈️','🚀','🚢','🚂','🚁']
  };
  let matchTiles = [];
  let matchFirstPick = null;
  let matchLock = false;
  let matchFound = 0;

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function genMatching() {
    const theme = document.getElementById('l1-matchTheme').value;
    const emojis = matchThemes[theme];
    matchTiles = shuffleArray([...emojis, ...emojis].map((emoji, i) => ({ id: i, emoji, matched: false })));
    matchFirstPick = null;
    matchLock = false;
    matchFound = 0;
    renderMatching();
    updateMatchStatus();
  }

  function updateMatchStatus() {
    const total = matchTiles.length / 2;
    document.getElementById('l1-matchStatus').textContent =
      matchFound === total ? `All ${total} pairs found! 🎉` : `Pairs found: ${matchFound} / ${total}`;
  }

  function renderMatching() {
    const grid = document.getElementById('l1-matchGrid');
    grid.innerHTML = '';
    matchTiles.forEach(tile => {
      const div = document.createElement('div');
      div.className = 'match-tile' + (tile.matched ? ' matched' : '');
      div.textContent = tile.matched || tile.revealed ? tile.emoji : '❓';
      div.dataset.id = tile.id;
      div.addEventListener('click', () => onMatchTileClick(tile.id));
      grid.appendChild(div);
    });
  }

  function onMatchTileClick(id) {
    if (matchLock) return;
    const tile = matchTiles.find(t => t.id === id);
    if (!tile || tile.matched || tile.revealed) return;
    tile.revealed = true;
    renderMatching();

    if (matchFirstPick === null) {
      matchFirstPick = tile;
      return;
    }
    if (matchFirstPick.emoji === tile.emoji) {
      matchFirstPick.matched = true;
      tile.matched = true;
      matchFirstPick = null;
      matchFound++;
      renderMatching();
      updateMatchStatus();
    } else {
      matchLock = true;
      setTimeout(() => {
        matchFirstPick.revealed = false;
        tile.revealed = false;
        matchFirstPick = null;
        matchLock = false;
        renderMatching();
      }, 700);
    }
  }
  document.getElementById('l1-matchRegen').addEventListener('click', genMatching);
  document.getElementById('l1-matchTheme').addEventListener('change', genMatching);

  /* ---------- PATTERNS ---------- */
  const patternPieces = ['🔴','🔵','🟡','🟢','⭐','🔺','⬛','💜'];

  function genPatterns() {
    const rows = parseInt(document.getElementById('l1-patternRows').value, 10);
    const output = document.getElementById('l1-patternOutput');
    output.innerHTML = '';

    for (let r = 0; r < rows; r++) {
      const unitLen = randInt(2, 3);
      const unit = [];
      const chosen = shuffleArray([...patternPieces]).slice(0, unitLen);
      for (let i = 0; i < unitLen; i++) unit.push(chosen[i]);
      const totalLen = 7;
      const sequence = [];
      for (let i = 0; i < totalLen; i++) sequence.push(unit[i % unitLen]);
      const answer = sequence[totalLen - 1];

      const row = document.createElement('div');
      row.className = 'pattern-row';
      const label = document.createElement('div');
      label.className = 'row-label';
      label.textContent = `Pattern ${r + 1}`;
      row.appendChild(label);

      const seq = document.createElement('div');
      seq.className = 'pattern-seq';
      for (let i = 0; i < totalLen - 1; i++) {
        const span = document.createElement('span');
        span.textContent = sequence[i];
        seq.appendChild(span);
      }
      const blank = document.createElement('div');
      blank.className = 'pattern-blank';
      blank.textContent = '?';
      seq.appendChild(blank);
      row.appendChild(seq);

      const optionsWrap = document.createElement('div');
      optionsWrap.className = 'pattern-options';
      const options = shuffleArray([answer, ...shuffleArray(patternPieces.filter(p => p !== answer)).slice(0, 2)]);
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          if (blank.classList.contains('solved')) return;
          if (opt === answer) {
            blank.textContent = opt;
            blank.classList.add('solved');
            optionsWrap.querySelectorAll('button').forEach(b => b.classList.add('used'));
          } else {
            btn.classList.add('used');
          }
        });
        optionsWrap.appendChild(btn);
      });
      row.appendChild(optionsWrap);
      output.appendChild(row);
    }
  }
  document.getElementById('l1-patternRegen').addEventListener('click', genPatterns);

  /* ---------- FLASH CARDS ---------- */
  const flashDecks = {
    letters: alphabet.map(ch => ({ front: ch, back: `${ch} is for ${ {A:'Apple',B:'Ball',C:'Cat',D:'Dog',E:'Egg',F:'Fish',G:'Goat',H:'Hat',I:'Ice',J:'Jam',K:'Kite',L:'Lion',M:'Moon',N:'Nest',O:'Owl',P:'Pig',Q:'Queen',R:'Rain',S:'Sun',T:'Tree',U:'Umbrella',V:'Van',W:'Whale',X:'Xylophone',Y:'Yak',Z:'Zebra'}[ch] }` })),
    numbers: Array.from({ length: 21 }, (_, n) => ({ front: String(n), back: '🔵'.repeat(n) || '(zero)' })),
    shapes: [
      { front: '⬤', back: 'Circle' }, { front: '⬛', back: 'Square' }, { front: '▲', back: 'Triangle' },
      { front: '▬', back: 'Rectangle' }, { front: '★', back: 'Star' }, { front: '♥', back: 'Heart' },
      { front: '◆', back: 'Diamond' }, { front: '⬠', back: 'Pentagon' }, { front: '⬡', back: 'Hexagon' }
    ]
  };
  let flashCards = [];
  let flashIndex = 0;

  function renderFlashCard() {
    const card = flashCards[flashIndex];
    document.getElementById('l1-flashFront').textContent = card.front;
    document.getElementById('l1-flashBack').textContent = card.back;
    document.getElementById('l1-flashcard').classList.remove('flipped');
    document.getElementById('l1-flashCount').textContent = `Card ${flashIndex + 1} of ${flashCards.length}`;
  }
  function genFlashcards() {
    const deck = document.getElementById('l1-flashDeck').value;
    flashCards = shuffleArray([...flashDecks[deck]]);
    flashIndex = 0;
    renderFlashCard();
  }
  document.getElementById('l1-flashcard').addEventListener('click', () => {
    document.getElementById('l1-flashcard').classList.toggle('flipped');
  });
  document.getElementById('l1-flashNext').addEventListener('click', () => {
    flashIndex = (flashIndex + 1) % flashCards.length;
    renderFlashCard();
  });
  document.getElementById('l1-flashPrev').addEventListener('click', () => {
    flashIndex = (flashIndex - 1 + flashCards.length) % flashCards.length;
    renderFlashCard();
  });
  document.getElementById('l1-flashDeck').addEventListener('change', genFlashcards);
  document.getElementById('l1-flashShuffle').addEventListener('click', genFlashcards);

  /* ---------- Init ---------- */
  genMathProblems('add', 5);
  genLetters();
  genNumbers();
  genTracingLines();
  genMatching();
  genPatterns();
  genFlashcards();

})();

