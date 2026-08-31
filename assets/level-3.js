/* ===== Level 3 JS ===== */
(function(){

  /* ---------- Navigation ---------- */
  function showSection(id) {
    document.querySelectorAll('#level-3 .section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  document.querySelectorAll('#level-3 .card').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });
  document.querySelectorAll('#level-3 [data-back]').forEach(btn => {
    btn.addEventListener('click', () => showSection('l3-section-home'));
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
    mathProblems = WorksheetCore.generate(3, op, count);
    mathChecked = false;
    document.getElementById('l3-mathReveal').disabled = true;
    renderMath();
  }

  function renderMath() {
    const grid = document.getElementById('l3-mathGrid');
    grid.innerHTML = '';
    mathProblems.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'problem';
      div.innerHTML = `${i + 1}. ${p.a} ${p.symbol} ${p.b} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off">`;
      grid.appendChild(div);
    });
  }

  document.getElementById('l3-mathRegen').addEventListener('click', () => {
    genMathProblems(document.getElementById('l3-mathOp').value, parseInt(document.getElementById('l3-mathCount').value, 10));
  });
  document.getElementById('l3-mathOp').addEventListener('change', () => {
    genMathProblems(document.getElementById('l3-mathOp').value, parseInt(document.getElementById('l3-mathCount').value, 10));
  });
  document.getElementById('l3-mathCheck').addEventListener('click', () => {
    document.querySelectorAll('#l3-mathGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === mathProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    mathChecked = true;
    document.getElementById('l3-mathReveal').disabled = false;
  });
  document.getElementById('l3-mathReveal').addEventListener('click', () => {
    if (!mathChecked) return;
    document.querySelectorAll('#l3-mathGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${mathProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- VOCABULARY WORDS ---------- */
  const sightWords = ['adventure','curious','enormous','fantastic','journey','mysterious',
    'peculiar','remarkable','treasure','vanish','whisper','ancient','brilliant','delicate',
    'furious','glisten','harvest','imagine','knowledge','wander'];
  const vocabDefinitions = {
    adventure: 'An exciting or unusual experience',
    curious: 'Eager to learn or know something',
    enormous: 'Very large in size',
    fantastic: 'Extremely good or amazing',
    journey: 'A trip from one place to another',
    mysterious: 'Difficult to explain or understand',
    peculiar: 'Strange or unusual',
    remarkable: 'Worthy of attention; extraordinary',
    treasure: 'A collection of valuable things',
    vanish: 'To disappear suddenly',
    whisper: 'To speak very softly',
    ancient: 'Very old, from long ago',
    brilliant: 'Extremely bright or intelligent',
    delicate: 'Easily broken; fragile',
    furious: 'Extremely angry',
    glisten: 'To shine with a sparkling light',
    harvest: 'To gather crops when ripe',
    imagine: 'To form a picture in your mind',
    knowledge: 'Information gained through learning',
    wander: 'To walk around without a fixed direction'
  };
  const letterSingleSelect = document.getElementById('l3-letterSingle');
  sightWords.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    letterSingleSelect.appendChild(opt);
  });

  let letterProblems = [];
  let letterChecked = false;

  document.getElementById('l3-letterSet').addEventListener('change', (e) => {
    document.getElementById('l3-letterSingleWrap').style.display = e.target.value === 'single' ? 'flex' : 'none';
  });

  document.getElementById('l3-letterActivity').addEventListener('change', (e) => {
    const activity = e.target.value;
    const isCrossword = activity === 'crossword';
    const needsCheck = activity === 'scramble' || activity === 'crossword';
    document.getElementById('l3-letterSetWrap').style.display = isCrossword ? 'none' : 'flex';
    document.getElementById('l3-letterSingleWrap').style.display = (!isCrossword && document.getElementById('l3-letterSet').value === 'single') ? 'flex' : 'none';
    document.getElementById('l3-letterRepeatsWrap').style.display = (activity === 'trace') ? 'flex' : 'none';
    document.getElementById('l3-letterCheck').style.display = needsCheck ? 'inline-block' : 'none';
    document.getElementById('l3-letterReveal').style.display = needsCheck ? 'inline-block' : 'none';
    genLetterActivity();
  });

  function genLettersTrace() {
    const setMode = document.getElementById('l3-letterSet').value;
    const repeats = parseInt(document.getElementById('l3-letterRepeats').value, 10);
    const words = setMode === 'single' ? [letterSingleSelect.value] : sightWords;

    const output = document.getElementById('l3-letterOutput');
    output.innerHTML = '';
    words.forEach(word => {
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

  function scrambleWord(word) {
    let letters;
    do {
      letters = shuffleArray(word.split('')).join('');
    } while (letters === word && word.length > 1);
    return letters;
  }

  function genWordScramble() {
    const setMode = document.getElementById('l3-letterSet').value;
    const words = setMode === 'single' ? [letterSingleSelect.value] : sightWords;
    letterProblems = [];
    const output = document.getElementById('l3-letterOutput');
    output.innerHTML = '';
    words.forEach((word, i) => {
      letterProblems.push({ answer: word });
      const row = document.createElement('div');
      row.className = 'scramble-row';
      row.innerHTML = `
        <span class="scramble-letters">${scrambleWord(word).toUpperCase()}</span>
        <input class="ans" type="text" data-index="${i}" autocomplete="off" placeholder="Unscramble it">
        <div class="scramble-clue">Clue: ${vocabDefinitions[word]}</div>`;
      output.appendChild(row);
    });
    letterChecked = false;
    document.getElementById('l3-letterReveal').disabled = true;
  }

  function generateCrosswordData(wordList) {
    const words = shuffleArray([...wordList]).sort((a, b) => b.length - a.length);
    const cells = {};
    const placements = [];
    cells['0,0'] = words[0][0];
    for (let i = 0; i < words[0].length; i++) cells[`0,${i}`] = words[0][i];
    placements.push({ word: words[0], row: 0, col: 0, dir: 'H' });

    for (let w = 1; w < words.length; w++) {
      const word = words[w];
      let placed = false;
      for (let li = 0; li < word.length && !placed; li++) {
        const letter = word[li];
        for (const p of placements) {
          if (placed) break;
          for (let pi = 0; pi < p.word.length; pi++) {
            if (p.word[pi] !== letter) continue;
            let row, col, dir;
            if (p.dir === 'H') { dir = 'V'; row = p.row - li; col = p.col + pi; }
            else { dir = 'H'; row = p.row + pi; col = p.col - li; }
            let ok = true;
            for (let k = 0; k < word.length && ok; k++) {
              const r = dir === 'V' ? row + k : row;
              const c = dir === 'H' ? col + k : col;
              const existing = cells[`${r},${c}`];
              if (existing !== undefined && existing !== word[k]) ok = false;
            }
            if (ok) {
              const beforeR = dir === 'V' ? row - 1 : row, beforeC = dir === 'H' ? col - 1 : col;
              const afterR = dir === 'V' ? row + word.length : row, afterC = dir === 'H' ? col + word.length : col;
              if (cells[`${beforeR},${beforeC}`] !== undefined) ok = false;
              if (cells[`${afterR},${afterC}`] !== undefined) ok = false;
            }
            if (ok) {
              for (let k = 0; k < word.length; k++) {
                const r = dir === 'V' ? row + k : row;
                const c = dir === 'H' ? col + k : col;
                cells[`${r},${c}`] = word[k];
              }
              placements.push({ word, row, col, dir });
              placed = true;
              break;
            }
          }
        }
      }
    }

    const rows = Object.keys(cells).map(k => parseInt(k.split(',')[0], 10));
    const cols = Object.keys(cells).map(k => parseInt(k.split(',')[1], 10));
    const minR = Math.min(...rows), minC = Math.min(...cols);
    const maxR = Math.max(...rows) - minR, maxC = Math.max(...cols) - minC;
    const normCells = {};
    Object.entries(cells).forEach(([k, v]) => {
      const [r, c] = k.split(',').map(Number);
      normCells[`${r - minR},${c - minC}`] = v;
    });
    placements.forEach(p => { p.row -= minR; p.col -= minC; });
    placements.sort((a, b) => a.row - b.row || a.col - b.col);
    let num = 0;
    const numberMap = {};
    placements.forEach(p => {
      const key = `${p.row},${p.col}`;
      if (!(key in numberMap)) { num++; numberMap[key] = num; }
      p.number = numberMap[key];
    });

    return { cells: normCells, placements, maxR, maxC };
  }

  let crosswordCells = {};

  function genCrossword() {
    const data = generateCrosswordData(sightWords);
    crosswordCells = data.cells;
    const output = document.getElementById('l3-letterOutput');
    output.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'crossword-wrap';

    const grid = document.createElement('div');
    grid.className = 'crossword-grid';
    grid.style.gridTemplateColumns = `repeat(${data.maxC + 1}, 30px)`;
    for (let r = 0; r <= data.maxR; r++) {
      for (let c = 0; c <= data.maxC; c++) {
        const key = `${r},${c}`;
        const cell = document.createElement('div');
        if (data.cells[key] === undefined) {
          cell.className = 'cw-cell blocked';
        } else {
          cell.className = 'cw-cell';
          const numbered = data.placements.find(p => p.row === r && p.col === c);
          if (numbered) {
            const numSpan = document.createElement('span');
            numSpan.className = 'cw-number';
            numSpan.textContent = numbered.number;
            cell.appendChild(numSpan);
          }
          const input = document.createElement('input');
          input.className = 'ans';
          input.type = 'text';
          input.maxLength = 1;
          input.dataset.row = r;
          input.dataset.col = c;
          input.autocomplete = 'off';
          cell.appendChild(input);
        }
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);

    const across = data.placements.filter(p => p.dir === 'H').sort((a, b) => a.number - b.number);
    const down = data.placements.filter(p => p.dir === 'V').sort((a, b) => a.number - b.number);
    const clues = document.createElement('div');
    clues.className = 'cw-clues';
    clues.innerHTML = `
      <h4>Across</h4>
      <ol>${across.map(p => `<li value="${p.number}">${vocabDefinitions[p.word]} (${p.word.length} letters)</li>`).join('')}</ol>
      <h4>Down</h4>
      <ol>${down.map(p => `<li value="${p.number}">${vocabDefinitions[p.word]} (${p.word.length} letters)</li>`).join('')}</ol>`;
    wrap.appendChild(clues);

    output.appendChild(wrap);
    letterChecked = false;
    document.getElementById('l3-letterReveal').disabled = true;
  }

  function genLetterActivity() {
    const activity = document.getElementById('l3-letterActivity').value;
    if (activity === 'scramble') genWordScramble();
    else if (activity === 'crossword') genCrossword();
    else genLettersTrace();
  }
  document.getElementById('l3-letterRegen').addEventListener('click', genLetterActivity);

  document.getElementById('l3-letterCheck').addEventListener('click', () => {
    const activity = document.getElementById('l3-letterActivity').value;
    if (activity === 'crossword') {
      document.querySelectorAll('#l3-letterOutput .cw-cell input.ans').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        const val = input.value.trim().toLowerCase();
        if (val === '') return;
        const expected = crosswordCells[`${input.dataset.row},${input.dataset.col}`];
        input.classList.add(val === expected.toLowerCase() ? 'correct' : 'incorrect');
      });
    } else {
      document.querySelectorAll('#l3-letterOutput .ans').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        const i = parseInt(input.dataset.index, 10);
        const val = input.value.trim().toLowerCase();
        if (val === '') return;
        input.classList.add(val === letterProblems[i].answer ? 'correct' : 'incorrect');
      });
    }
    letterChecked = true;
    document.getElementById('l3-letterReveal').disabled = false;
  });

  document.getElementById('l3-letterReveal').addEventListener('click', () => {
    if (!letterChecked) return;
    const activity = document.getElementById('l3-letterActivity').value;
    if (activity === 'crossword') {
      document.querySelectorAll('#l3-letterOutput .cw-cell input.ans').forEach(input => {
        if (input.classList.contains('correct')) return;
        input.value = crosswordCells[`${input.dataset.row},${input.dataset.col}`].toUpperCase();
        input.classList.remove('incorrect');
        input.classList.add('correct');
      });
    } else {
      document.querySelectorAll('#l3-letterOutput .ans').forEach(input => {
        if (input.classList.contains('correct')) return;
        const i = parseInt(input.dataset.index, 10);
        const note = document.createElement('span');
        note.className = 'reveal-note';
        note.textContent = `(${letterProblems[i].answer})`;
        input.insertAdjacentElement('afterend', note);
      });
    }
  });

  /* ---------- NUMBERS ---------- */
  let numberProblems = [];
  let numberChecked = false;

  document.getElementById('l3-numberMode').addEventListener('change', (e) => {
    document.getElementById('l3-numberCountWrap').style.display =
      (e.target.value === 'pattern' || e.target.value === 'wordproblems') ? 'flex' : 'none';
  });

  function genNumbers() {
    const mode = document.getElementById('l3-numberMode').value;
    const output = document.getElementById('l3-numberOutput');
    output.innerHTML = '';
    numberProblems = [];
    let idx = 0;

    if (mode === 'grid') {
      const grid = document.createElement('div');
      grid.className = 'chart-grid';
      grid.style.gridTemplateColumns = 'repeat(13, 1fr)';
      grid.style.maxWidth = '640px';

      const blankPositions = new Set();
      while (blankPositions.size < 30) {
        const r = randInt(1, 12), c = randInt(1, 12);
        blankPositions.add(r + '-' + c);
      }

      const corner = document.createElement('div');
      corner.className = 'chart-cell header';
      corner.innerHTML = '&times;';
      grid.appendChild(corner);
      for (let c = 1; c <= 12; c++) {
        const h = document.createElement('div');
        h.className = 'chart-cell header';
        h.textContent = c;
        grid.appendChild(h);
      }
      for (let r = 1; r <= 12; r++) {
        const rh = document.createElement('div');
        rh.className = 'chart-cell header';
        rh.textContent = r;
        grid.appendChild(rh);
        for (let c = 1; c <= 12; c++) {
          const cell = document.createElement('div');
          cell.className = 'chart-cell';
          const product = r * c;
          if (blankPositions.has(r + '-' + c)) {
            numberProblems.push({ answer: product });
            const input = document.createElement('input');
            input.className = 'ans';
            input.type = 'text';
            input.inputMode = 'numeric';
            input.dataset.index = idx;
            input.autocomplete = 'off';
            cell.appendChild(input);
            idx++;
          } else {
            cell.textContent = product;
          }
          grid.appendChild(cell);
        }
      }
      output.appendChild(grid);
    } else if (mode === 'pattern') {
      const rows = parseInt(document.getElementById('l3-numberCount').value, 10);
      for (let r = 0; r < rows; r++) {
        const useDouble = Math.random() < 0.25;
        let start, step, terms = 6;
        const sequence = [];
        if (useDouble) {
          start = randInt(1, 4);
          sequence.push(start);
          for (let t = 1; t < terms; t++) sequence.push(sequence[t - 1] * 2);
        } else {
          const goingUp = Math.random() < 0.7;
          step = randInt(3, 12);
          start = randInt(1, 50);
          sequence.push(start);
          for (let t = 1; t < terms; t++) {
            const next = goingUp ? sequence[t - 1] + step : sequence[t - 1] - step;
            sequence.push(next);
          }
        }
        const blankPositions = new Set();
        while (blankPositions.size < 2) blankPositions.add(randInt(1, terms - 1));

        const row = document.createElement('div');
        row.className = 'skip-row';
        sequence.forEach((value, i) => {
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
          if (i < terms - 1) {
            const comma = document.createElement('span');
            comma.textContent = ',';
            row.appendChild(comma);
          }
        });
        output.appendChild(row);
      }
    } else {
      const names = ['Maya','Liam','Zoe','Ethan','Ava','Noah','Priya','Omar','Lucy','Sam'];
      const count = parseInt(document.getElementById('l3-numberCount').value, 10);
      for (let i = 0; i < count; i++) {
        const type = randInt(0, 3);
        const name1 = names[randInt(0, names.length - 1)];
        let name2 = names[randInt(0, names.length - 1)];
        while (name2 === name1) name2 = names[randInt(0, names.length - 1)];
        let text, answer;
        if (type === 0) {
          const a = randInt(10, 80), b = randInt(5, 40);
          text = `${name1} has ${a} marbles. ${name2} gives ${name1} ${b} more marbles. How many marbles does ${name1} have now?`;
          answer = a + b;
        } else if (type === 1) {
          const a = randInt(50, 120), b = randInt(10, a - 5);
          text = `There were ${a} birds sitting in a tree. ${b} of them flew away. How many birds are left in the tree?`;
          answer = a - b;
        } else if (type === 2) {
          const a = randInt(3, 12), b = randInt(2, 9);
          text = `${name1} is setting up chairs in ${a} rows with ${b} chairs in each row. How many chairs are there in total?`;
          answer = a * b;
        } else {
          const b = randInt(2, 9), q = randInt(2, 12);
          const a = b * q;
          text = `${name1} has ${a} stickers to share equally among ${b} friends. How many stickers does each friend get?`;
          answer = q;
        }
        numberProblems.push({ answer });
        const div = document.createElement('div');
        div.className = 'wordproblem';
        div.innerHTML = `${i + 1}. ${text}<div class="wp-answer">Answer: <input class="ans" type="text" inputmode="numeric" data-index="${idx}" autocomplete="off"></div>`;
        output.appendChild(div);
        idx++;
      }
    }

    numberChecked = false;
    document.getElementById('l3-numberReveal').disabled = true;
  }
  document.getElementById('l3-numberRegen').addEventListener('click', genNumbers);
  document.getElementById('l3-numberCheck').addEventListener('click', () => {
    document.querySelectorAll('#l3-numberOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === numberProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    numberChecked = true;
    document.getElementById('l3-numberReveal').disabled = false;
  });
  document.getElementById('l3-numberReveal').addEventListener('click', () => {
    if (!numberChecked) return;
    document.querySelectorAll('#l3-numberOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${numberProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- SHAPES (properties) ---------- */
  const shapes = [
    { name: 'Triangle', sides: 3, vertices: 3, svg: '<polygon points="50,10 90,85 10,85" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Square', sides: 4, vertices: 4, svg: '<rect x="12" y="12" width="76" height="76" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Rectangle', sides: 4, vertices: 4, svg: '<rect x="8" y="25" width="84" height="50" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Pentagon', sides: 5, vertices: 5, svg: '<polygon points="50,6 92,37 76,88 24,88 8,37" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Hexagon', sides: 6, vertices: 6, svg: '<polygon points="27,8 73,8 96,50 73,92 27,92 4,50" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Heptagon', sides: 7, vertices: 7, svg: '<polygon points="50,4 82,15 95,47 76,80 24,80 5,47 18,15" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Octagon', sides: 8, vertices: 8, svg: '<polygon points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Rhombus', sides: 4, vertices: 4, svg: '<polygon points="50,8 85,50 50,92 15,50" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Trapezoid', sides: 4, vertices: 4, svg: '<polygon points="25,15 75,15 95,85 5,85" fill="none" stroke="#999" stroke-width="3"/>' },
    { name: 'Circle', sides: 0, vertices: 0, svg: '<circle cx="50" cy="50" r="40" fill="none" stroke="#999" stroke-width="3"/>' }
  ];

  let shapeChecked = false;

  function renderShapes() {
    const grid = document.getElementById('l3-shapeGrid');
    grid.innerHTML = '';
    shapes.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.innerHTML = `
        <svg viewBox="0 0 100 100">${s.svg}</svg>
        <div class="shape-fields">
          <div>Name: <input class="ans" type="text" data-index="${i}" data-field="name" autocomplete="off"></div>
          <div>Sides: <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="sides" autocomplete="off"></div>
          <div>Vertices: <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="vertices" autocomplete="off"></div>
        </div>`;
      grid.appendChild(card);
    });
  }
  renderShapes();

  document.getElementById('l3-shapeCheck').addEventListener('click', () => {
    document.querySelectorAll('#l3-shapeGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      const val = input.value.trim();
      if (val === '') return;
      const expected = shapes[i][field];
      const isCorrect = field === 'name'
        ? val.toLowerCase() === String(expected).toLowerCase()
        : WorksheetCore.parseAnswer(val) === expected;
      input.classList.add(isCorrect ? 'correct' : 'incorrect');
    });
    shapeChecked = true;
    document.getElementById('l3-shapeReveal').disabled = false;
  });
  document.getElementById('l3-shapeReveal').addEventListener('click', () => {
    if (!shapeChecked) return;
    document.querySelectorAll('#l3-shapeGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${shapes[i][field]})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- GENERAL KNOWLEDGE ---------- */
  const gkBank = [
    { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 'Mars' },
    { q: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], answer: '7' },
    { q: 'What gas do plants absorb from the air to make food?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 'Carbon Dioxide' },
    { q: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 'Pacific' },
    { q: 'Which organ pumps blood through the body?', options: ['Lungs', 'Heart', 'Liver', 'Brain'], answer: 'Heart' },
    { q: 'What is the freezing point of water in Celsius?', options: ['0°C', '10°C', '32°C', '100°C'], answer: '0°C' },
    { q: 'Which country is home to the Great Barrier Reef?', options: ['Brazil', 'Australia', 'Egypt', 'Canada'], answer: 'Australia' },
    { q: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], answer: '8' },
    { q: 'What is the closest star to Earth?', options: ['Polaris', 'Sirius', 'The Sun', 'Betelgeuse'], answer: 'The Sun' },
    { q: 'Which shape has three sides?', options: ['Square', 'Triangle', 'Pentagon', 'Circle'], answer: 'Triangle' },
    { q: 'What do bees make?', options: ['Milk', 'Honey', 'Silk', 'Wool'], answer: 'Honey' },
    { q: 'Which is the tallest mountain in the world?', options: ['K2', 'Denali', 'Mount Everest', 'Kilimanjaro'], answer: 'Mount Everest' },
    { q: 'What do you call an animal that eats only plants?', options: ['Carnivore', 'Omnivore', 'Herbivore', 'Predator'], answer: 'Herbivore' },
    { q: 'How many days are in a leap year?', options: ['364', '365', '366', '367'], answer: '366' },
    { q: 'Which sense organ helps you smell?', options: ['Eyes', 'Ears', 'Nose', 'Tongue'], answer: 'Nose' },
    { q: 'What is the capital of France?', options: ['Rome', 'Paris', 'Berlin', 'Madrid'], answer: 'Paris' },
    { q: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: '6' },
    { q: 'Which planet has the famous rings?', options: ['Mars', 'Saturn', 'Mercury', 'Neptune'], answer: 'Saturn' }
  ];

  function genGkQuiz() {
    const count = parseInt(document.getElementById('l3-gkCount').value, 10);
    const chosen = shuffleArray([...gkBank]).slice(0, Math.min(count, gkBank.length));
    const output = document.getElementById('l3-gkOutput');
    output.innerHTML = '';
    chosen.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'gk-question';
      const optionsHtml = shuffleArray([...item.options]).map(opt =>
        `<button data-correct="${opt === item.answer}">${opt}</button>`
      ).join('');
      card.innerHTML = `<div class="gk-prompt">${i + 1}. ${item.q}</div><div class="gk-options">${optionsHtml}</div>`;
      card.querySelectorAll('.gk-options button').forEach(btn => {
        btn.addEventListener('click', () => {
          const opts = card.querySelectorAll('.gk-options button');
          opts.forEach(b => b.classList.add('disabled'));
          if (btn.dataset.correct === 'true') {
            btn.classList.add('correct');
          } else {
            btn.classList.add('incorrect');
            opts.forEach(b => { if (b.dataset.correct === 'true') b.classList.add('correct'); });
          }
        });
      });
      output.appendChild(card);
    });
  }
  document.getElementById('l3-gkRegen').addEventListener('click', genGkQuiz);
  document.getElementById('l3-gkCount').addEventListener('change', genGkQuiz);

  /* ---------- BODY PARTS ---------- */
  const bodyParts = [
    { name: 'Head', x: 100, y: 30 },
    { name: 'Shoulder', x: 60, y: 85 },
    { name: 'Elbow', x: 35, y: 145 },
    { name: 'Hand', x: 20, y: 200 },
    { name: 'Knee', x: 85, y: 280 },
    { name: 'Foot', x: 85, y: 355 }
  ];

  function renderBodyParts() {
    const output = document.getElementById('l3-bodyOutput');
    const svgLabels = bodyParts.map((p, i) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#c2555a"/>
      <line x1="${p.x}" y1="${p.y}" x2="${p.x - 40}" y2="${p.y}" stroke="#c2555a" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="${p.x - 55}" y="${p.y + 4}" font-family="sans-serif" font-size="10" fill="#c2555a" text-anchor="end" font-weight="bold">${i + 1}</text>
    `).join('');
    output.innerHTML = `
      <div class="body-wrap">
        <svg viewBox="-20 0 240 380">
          <circle cx="100" cy="35" r="25" fill="none" stroke="#333" stroke-width="2"/>
          <line x1="100" y1="60" x2="100" y2="220" stroke="#333" stroke-width="2"/>
          <line x1="100" y1="80" x2="55" y2="90" stroke="#333" stroke-width="2"/>
          <line x1="55" y1="90" x2="30" y2="150" stroke="#333" stroke-width="2"/>
          <line x1="30" y1="150" x2="15" y2="205" stroke="#333" stroke-width="2"/>
          <line x1="100" y1="80" x2="145" y2="90" stroke="#333" stroke-width="2"/>
          <line x1="145" y1="90" x2="170" y2="150" stroke="#333" stroke-width="2"/>
          <line x1="170" y1="150" x2="185" y2="205" stroke="#333" stroke-width="2"/>
          <line x1="100" y1="220" x2="85" y2="285" stroke="#333" stroke-width="2"/>
          <line x1="85" y1="285" x2="85" y2="360" stroke="#333" stroke-width="2"/>
          <line x1="100" y1="220" x2="115" y2="285" stroke="#333" stroke-width="2"/>
          <line x1="115" y1="285" x2="115" y2="360" stroke="#333" stroke-width="2"/>
          ${svgLabels}
        </svg>
        <div class="body-fields">
          ${bodyParts.map((p, i) => `<div><span class="body-num">${i + 1}</span><input class="ans" type="text" data-index="${i}" autocomplete="off" placeholder="Body part name"></div>`).join('')}
        </div>
      </div>`;
  }
  renderBodyParts();

  document.getElementById('l3-bodyCheck').addEventListener('click', () => {
    document.querySelectorAll('#l3-bodyOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim().toLowerCase();
      if (val === '') return;
      input.classList.add(val === bodyParts[i].name.toLowerCase() ? 'correct' : 'incorrect');
    });
    document.getElementById('l3-bodyReveal').disabled = false;
  });
  document.getElementById('l3-bodyReveal').addEventListener('click', () => {
    document.querySelectorAll('#l3-bodyOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = ` (${bodyParts[i].name})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- Init ---------- */
  genMathProblems('add', 10);
  genLetterActivity();
  genNumbers();
  genGkQuiz();

})();

