/* ===== Level 2 JS ===== */
(function(){

  /* ---------- Navigation ---------- */
  function showSection(id) {
    document.querySelectorAll('#level-2 .section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  document.querySelectorAll('#level-2 .card').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });
  document.querySelectorAll('#level-2 [data-back]').forEach(btn => {
    btn.addEventListener('click', () => showSection('l2-section-home'));
  });

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- MATH ---------- */
  let mathProblems = [];
  let mathChecked = false;

  function genMathProblems(op, count) {
    mathProblems = WorksheetCore.generate(2, op, count);
    mathChecked = false;
    document.getElementById('l2-mathReveal').disabled = true;
    renderMath();
  }

  function renderMath() {
    const grid = document.getElementById('l2-mathGrid');
    grid.className = 'grid';
    grid.innerHTML = '';
    mathProblems.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'problem';
      div.innerHTML = `${i + 1}. ${p.a} ${p.symbol} ${p.b} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off">`;
      grid.appendChild(div);
    });
  }

  document.getElementById('l2-mathRegen').addEventListener('click', () => {
    genMathProblems(document.getElementById('l2-mathOp').value, parseInt(document.getElementById('l2-mathCount').value, 10));
  });
  document.getElementById('l2-mathOp').addEventListener('change', () => {
    genMathProblems(document.getElementById('l2-mathOp').value, parseInt(document.getElementById('l2-mathCount').value, 10));
  });
  document.getElementById('l2-mathCheck').addEventListener('click', () => {
    document.querySelectorAll('#l2-mathGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === mathProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    mathChecked = true;
    document.getElementById('l2-mathReveal').disabled = false;
  });
  document.getElementById('l2-mathReveal').addEventListener('click', () => {
    if (!mathChecked) return;
    document.querySelectorAll('#l2-mathGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${mathProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- SIGHT WORDS / WORD SEARCH ---------- */
  const sightWords = ['the','and','said','was','you','they','have','are','with','this',
    'that','from','what','were','when','your','which','their','about','would',
    'there','could','other','after','first','because','little','people','water'];
  const digraphWords = ['ship','chip','that','when','shop','chat','thin','whale','fish','much',
    'this','wish','chin','than','whip','shed','chop','thud','wham','sham'];
  const wordLists = { sight: sightWords, digraph: digraphWords };

  const letterSingleSelect = document.getElementById('l2-letterSingle');
  function populateSingleSelect() {
    letterSingleSelect.innerHTML = '';
    wordLists[document.getElementById('l2-letterList').value].forEach(w => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w;
      letterSingleSelect.appendChild(opt);
    });
  }
  populateSingleSelect();

  document.getElementById('l2-letterSet').addEventListener('change', (e) => {
    document.getElementById('l2-letterSingleWrap').style.display = e.target.value === 'single' ? 'flex' : 'none';
  });
  document.getElementById('l2-letterList').addEventListener('change', () => {
    populateSingleSelect();
    genLetterActivity();
  });
  document.getElementById('l2-letterActivity').addEventListener('change', updateLetterUI);

  function updateLetterUI() {
    const isSearch = document.getElementById('l2-letterActivity').value === 'wordsearch';
    document.getElementById('l2-letterSetWrap').style.display = isSearch ? 'none' : 'flex';
    document.getElementById('l2-letterRepeatsWrap').style.display = isSearch ? 'none' : 'flex';
    document.getElementById('l2-letterSingleWrap').style.display = (!isSearch && document.getElementById('l2-letterSet').value === 'single') ? 'flex' : 'none';
    genLetterActivity();
  }

  function genLettersTrace() {
    const words = wordLists[document.getElementById('l2-letterList').value];
    const setMode = document.getElementById('l2-letterSet').value;
    const repeats = parseInt(document.getElementById('l2-letterRepeats').value, 10);
    const list = setMode === 'single' ? [letterSingleSelect.value] : words;

    const output = document.getElementById('l2-letterOutput');
    output.innerHTML = '';
    list.forEach(word => {
      const row = document.createElement('div');
      row.className = 'trace-row';
      const label = document.createElement('div');
      label.className = 'row-label';
      label.textContent = `Word: ${word}`;
      row.appendChild(label);
      const chars = document.createElement('div');
      chars.className = 'trace-chars';
      for (let i = 0; i < repeats; i++) {
        const span = document.createElement('span');
        span.className = 'trace-char word';
        span.textContent = word;
        chars.appendChild(span);
      }
      row.appendChild(chars);
      output.appendChild(row);
    });
  }

  /* Word search */
  const WS_SIZE = 10;
  let wsGrid = [];
  let wsWords = [];
  let wsStart = null;
  let wsFoundCount = 0;

  function genWordSearch() {
    const words = shuffleArray([...wordLists[document.getElementById('l2-letterList').value]])
      .filter(w => w.length <= WS_SIZE).slice(0, 6);
    wsWords = words.map(w => ({ word: w.toUpperCase(), found: false }));
    wsGrid = Array.from({ length: WS_SIZE }, () => Array(WS_SIZE).fill(null));

    wsWords.forEach(entry => {
      const word = entry.word;
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 200) {
        attempts++;
        const horizontal = Math.random() < 0.5;
        const row = randInt(0, WS_SIZE - (horizontal ? 1 : word.length));
        const col = randInt(0, WS_SIZE - (horizontal ? word.length : 1));
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const r = horizontal ? row : row + i;
          const c = horizontal ? col + i : col;
          if (wsGrid[r][c] !== null && wsGrid[r][c] !== word[i]) { fits = false; break; }
        }
        if (fits) {
          for (let i = 0; i < word.length; i++) {
            const r = horizontal ? row : row + i;
            const c = horizontal ? col + i : col;
            wsGrid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < WS_SIZE; r++) {
      for (let c = 0; c < WS_SIZE; c++) {
        if (wsGrid[r][c] === null) wsGrid[r][c] = letters[randInt(0, 25)];
      }
    }
    wsStart = null;
    wsFoundCount = 0;
    renderWordSearch();
  }

  function renderWordSearch() {
    const output = document.getElementById('l2-letterOutput');
    output.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'wordsearch-wrap';

    const grid = document.createElement('div');
    grid.className = 'ws-grid';
    grid.style.gridTemplateColumns = `repeat(${WS_SIZE}, 1fr)`;
    for (let r = 0; r < WS_SIZE; r++) {
      for (let c = 0; c < WS_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'ws-cell';
        cell.textContent = wsGrid[r][c];
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', () => onWsCellClick(r, c));
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);

    const listWrap = document.createElement('div');
    listWrap.className = 'ws-wordlist';
    listWrap.innerHTML = `<strong>Find:</strong><ul>${wsWords.map(w => `<li${w.found ? ' class="found"' : ''}>${w.word}</li>`).join('')}</ul>`;
    wrap.appendChild(listWrap);

    output.appendChild(wrap);
  }

  function onWsCellClick(r, c) {
    if (!wsStart) {
      wsStart = { r, c };
      renderWordSearch();
      document.querySelector(`.ws-cell[data-row="${r}"][data-col="${c}"]`).classList.add('selected');
      return;
    }
    const dr = r - wsStart.r, dc = c - wsStart.c;
    const straight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!straight) { wsStart = null; renderWordSearch(); return; }
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = steps === 0 ? 0 : dr / steps;
    const stepC = steps === 0 ? 0 : dc / steps;
    let letters = '';
    const cells = [];
    for (let i = 0; i <= steps; i++) {
      const rr = wsStart.r + stepR * i, cc = wsStart.c + stepC * i;
      letters += wsGrid[rr][cc];
      cells.push([rr, cc]);
    }
    const reversed = letters.split('').reverse().join('');
    const match = wsWords.find(w => !w.found && (w.word === letters || w.word === reversed));
    if (match) {
      match.found = true;
      wsFoundCount++;
      wsStart = null;
      renderWordSearch();
      cells.forEach(([rr, cc]) => {
        document.querySelector(`.ws-cell[data-row="${rr}"][data-col="${cc}"]`).classList.add('found');
      });
    } else {
      wsStart = null;
      renderWordSearch();
    }
  }

  function genLetterActivity() {
    if (document.getElementById('l2-letterActivity').value === 'wordsearch') genWordSearch();
    else genLettersTrace();
  }
  document.getElementById('l2-letterRegen').addEventListener('click', genLetterActivity);

  /* ---------- NUMBERS ---------- */
  let numberProblems = [];
  let numberChecked = false;

  document.getElementById('l2-numberMode').addEventListener('change', (e) => {
    const isSkip = e.target.value === 'skip';
    const isChart = e.target.value === 'chart';
    document.getElementById('l2-skipByWrap').style.display = isSkip ? 'flex' : 'none';
    document.getElementById('l2-numberCountWrap').style.display = isChart ? 'none' : 'flex';
    document.getElementById('l2-numberCheck').style.display = isChart ? 'none' : 'inline-block';
    document.getElementById('l2-numberReveal').style.display = isChart ? 'none' : 'inline-block';
  });

  function genNumbers() {
    const mode = document.getElementById('l2-numberMode').value;
    const output = document.getElementById('l2-numberOutput');
    output.innerHTML = '';
    numberProblems = [];
    let idx = 0;

    if (mode === 'skip') {
      const skipBy = parseInt(document.getElementById('l2-skipBy').value, 10);
      const rows = parseInt(document.getElementById('l2-numberCount').value, 10);
      for (let r = 0; r < rows; r++) {
        const start = randInt(0, 3) * skipBy;
        const blankPositions = new Set();
        while (blankPositions.size < 4) blankPositions.add(randInt(1, 9));

        const row = document.createElement('div');
        row.className = 'skip-row';
        for (let i = 0; i < 10; i++) {
          const value = start + i * skipBy;
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
        output.appendChild(row);
      }
    } else if (mode === 'chart') {
      const grid = document.createElement('div');
      grid.className = 'chart-grid';
      const blankPositions = new Set();
      while (blankPositions.size < 20) blankPositions.add(randInt(1, 100));
      for (let n = 1; n <= 100; n++) {
        const cell = document.createElement('div');
        cell.className = 'chart-cell';
        if (blankPositions.has(n)) {
          numberProblems.push({ answer: n });
          const input = document.createElement('input');
          input.className = 'ans';
          input.type = 'text';
          input.inputMode = 'numeric';
          input.dataset.index = idx;
          input.autocomplete = 'off';
          cell.appendChild(input);
          idx++;
        } else {
          cell.textContent = n;
        }
        grid.appendChild(cell);
      }
      output.appendChild(grid);
    } else {
      const count = parseInt(document.getElementById('l2-numberCount').value, 10);
      const grid = document.createElement('div');
      grid.className = 'clock-grid';
      for (let i = 0; i < count; i++) {
        const hour = randInt(1, 12);
        const minute = [0, 15, 30, 45][randInt(0, 3)];
        const minuteAngle = (minute / 60) * 360;
        const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

        const card = document.createElement('div');
        card.className = 'clock-card';
        const hourIdx = idx++;
        const minIdx = idx++;
        numberProblems.push({ answer: hour });
        numberProblems.push({ answer: minute });
        card.innerHTML = `
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="white" stroke="#999" stroke-width="2"/>
            ${[0,1,2,3,4,5,6,7,8,9,10,11].map(n => {
              const a = (n / 12) * 360;
              const x1 = 50 + 40 * Math.sin(a * Math.PI / 180), y1 = 50 - 40 * Math.cos(a * Math.PI / 180);
              const x2 = 50 + 44 * Math.sin(a * Math.PI / 180), y2 = 50 - 44 * Math.cos(a * Math.PI / 180);
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#999" stroke-width="1.5"/>`;
            }).join('')}
            <line x1="50" y1="50" x2="${50 + 22 * Math.sin(hourAngle * Math.PI / 180)}" y2="${50 - 22 * Math.cos(hourAngle * Math.PI / 180)}" stroke="#333" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="50" y1="50" x2="${50 + 34 * Math.sin(minuteAngle * Math.PI / 180)}" y2="${50 - 34 * Math.cos(minuteAngle * Math.PI / 180)}" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="50" cy="50" r="2.5" fill="#333"/>
          </svg>
          <div class="clock-time-input">
            <input class="ans" type="text" inputmode="numeric" data-index="${hourIdx}" autocomplete="off"> :
            <input class="ans" type="text" inputmode="numeric" data-index="${minIdx}" autocomplete="off">
          </div>`;
        grid.appendChild(card);
      }
      output.appendChild(grid);
    }

    numberChecked = false;
    document.getElementById('l2-numberReveal').disabled = true;
  }
  document.getElementById('l2-numberRegen').addEventListener('click', genNumbers);
  document.getElementById('l2-numberCheck').addEventListener('click', () => {
    document.querySelectorAll('#l2-numberOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === numberProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    numberChecked = true;
    document.getElementById('l2-numberReveal').disabled = false;
  });
  document.getElementById('l2-numberReveal').addEventListener('click', () => {
    if (!numberChecked) return;
    document.querySelectorAll('#l2-numberOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${numberProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- SHAPES (3D) ---------- */
  const shapes = [
    { name: 'Cube', svg: '<polygon points="20,35 60,35 60,75 20,75" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><polygon points="20,35 35,20 75,20 60,35" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><polygon points="60,35 75,20 75,60 60,75" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Sphere', svg: '<circle cx="50" cy="50" r="38" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><ellipse cx="50" cy="50" rx="38" ry="12" fill="none" stroke="#bbb" stroke-width="2" stroke-dasharray="4 4"/>' },
    { name: 'Cylinder', svg: '<ellipse cx="50" cy="22" rx="30" ry="10" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="20" y1="22" x2="20" y2="78" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="80" y1="22" x2="80" y2="78" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><path d="M20,78 A30,10 0 0 0 80,78" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Cone', svg: '<ellipse cx="50" cy="80" rx="32" ry="10" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="18" y1="80" x2="50" y2="12" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="82" y1="80" x2="50" y2="12" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Square Pyramid', svg: '<polygon points="15,80 85,80 65,60 35,60" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="50" y1="10" x2="15" y2="80" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="50" y1="10" x2="85" y2="80" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="50" y1="10" x2="65" y2="60" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Rectangular Prism', svg: '<polygon points="15,35 60,35 60,80 15,80" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><polygon points="15,35 28,20 73,20 60,35" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><polygon points="60,35 73,20 73,65 60,80" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Triangular Prism', svg: '<polygon points="10,80 50,80 35,50 5,50" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><polygon points="50,80 90,80 65,20 35,50" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><line x1="5" y1="50" x2="65" y2="20" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' },
    { name: 'Hemisphere', svg: '<path d="M15,55 A35,35 0 0 1 85,55" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/><ellipse cx="50" cy="55" rx="35" ry="10" fill="none" stroke="#999" stroke-width="3" stroke-dasharray="6 5"/>' }
  ];

  function renderShapes() {
    const grid = document.getElementById('l2-shapeGrid');
    grid.innerHTML = '';
    shapes.forEach(s => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.innerHTML = `<svg viewBox="0 0 100 100">${s.svg}</svg><div class="shape-label">${s.name}</div>`;
      grid.appendChild(card);
    });
  }
  renderShapes();

  /* ---------- DOT TO DOT ---------- */
  const dotShapes = {
    star: [[100,10],[120,70],[185,70],[132,108],[152,170],[100,132],[48,170],[68,108],[15,70],[80,70]],
    house: [[100,20],[170,80],[170,180],[120,180],[120,130],[80,130],[80,180],[30,180],[30,80]],
    fish: [[20,90],[70,60],[140,60],[180,30],[170,90],[180,150],[140,120],[70,120]],
    heart: [[100,170],[40,110],[20,70],[35,30],[70,25],[100,55],[130,25],[165,30],[180,70],[160,110]]
  };
  let currentDotShape = 'star';

  function genDotShape() {
    const keys = Object.keys(dotShapes);
    currentDotShape = keys[randInt(0, keys.length - 1)];
    renderDots();
  }

  function renderDots(showLines) {
    const step = parseInt(document.getElementById('l2-dotStep').value, 10);
    const points = dotShapes[currentDotShape];
    const output = document.getElementById('l2-dotOutput');
    let svg = `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">`;
    if (showLines) {
      const path = points.map(p => p.join(',')).join(' ');
      svg += `<polyline points="${path} ${points[0].join(',')}" fill="none" stroke="#8a6fbf" stroke-width="2"/>`;
    }
    points.forEach((p, i) => {
      svg += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#333"/>`;
      svg += `<text class="dot-label" x="${p[0] + 7}" y="${p[1] - 5}">${(i + 1) * step}</text>`;
    });
    svg += `</svg>`;
    output.innerHTML = svg;
  }
  document.getElementById('l2-dotNewShape').addEventListener('click', genDotShape);
  document.getElementById('l2-dotStep').addEventListener('change', () => renderDots());
  document.getElementById('l2-dotReveal').addEventListener('click', () => renderDots(true));

  /* ---------- MAZES ---------- */
  function generateMazeGrid(size) {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const wallsH = Array.from({ length: size + 1 }, () => Array(size).fill(true)); // horizontal walls (above cell)
    const wallsV = Array.from({ length: size }, () => Array(size + 1).fill(true)); // vertical walls (left of cell)

    function carve(r, c) {
      visited[r][c] = true;
      const dirs = shuffleArray([[0,1],[0,-1],[1,0],[-1,0]]);
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
          if (dr === 0 && dc === 1) wallsV[r][c + 1] = false;
          if (dr === 0 && dc === -1) wallsV[r][c] = false;
          if (dr === 1 && dc === 0) wallsH[r + 1][c] = false;
          if (dr === -1 && dc === 0) wallsH[r][c] = false;
          carve(nr, nc);
        }
      });
    }
    carve(0, 0);
    return { wallsH, wallsV };
  }

  function renderMaze() {
    const size = parseInt(document.getElementById('l2-mazeSize').value, 10);
    const { wallsH, wallsV } = generateMazeGrid(size);
    const cellSize = 40;
    const total = size * cellSize;
    let svg = `<svg viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect x="0" y="0" width="${total}" height="${total}" fill="white" stroke="#333" stroke-width="3"/>`;
    for (let r = 0; r <= size; r++) {
      for (let c = 0; c < size; c++) {
        if (wallsH[r][c] && !(r === 0 && c === 0) && !(r === size && c === size - 1)) {
          svg += `<line x1="${c * cellSize}" y1="${r * cellSize}" x2="${(c + 1) * cellSize}" y2="${r * cellSize}" stroke="#333" stroke-width="2"/>`;
        }
      }
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size; c++) {
        if (wallsV[r][c]) {
          svg += `<line x1="${c * cellSize}" y1="${r * cellSize}" x2="${c * cellSize}" y2="${(r + 1) * cellSize}" stroke="#333" stroke-width="2"/>`;
        }
      }
    }
    svg += `<text x="4" y="${cellSize * 0.6}" font-family="sans-serif" font-size="14" fill="#1e7a3d" font-weight="bold">S</text>`;
    svg += `<text x="${total - cellSize + 6}" y="${total - 8}" font-family="sans-serif" font-size="14" fill="#b02a2a" font-weight="bold">F</text>`;
    svg += `</svg>`;
    document.getElementById('l2-mazeOutput').innerHTML = svg;
  }
  document.getElementById('l2-mazeNew').addEventListener('click', renderMaze);
  document.getElementById('l2-mazeSize').addEventListener('change', renderMaze);

  /* ---------- Init ---------- */
  genMathProblems('add', 10);
  genLetterActivity();
  genNumbers();
  genDotShape();
  renderMaze();

})();

