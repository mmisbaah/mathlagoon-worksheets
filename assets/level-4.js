/* ===== Level 4 JS ===== */
(function(){

  /* ---------- Navigation ---------- */
  function showSection(id) {
    document.querySelectorAll('#level-4 .section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  document.querySelectorAll('#level-4 .card').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });
  document.querySelectorAll('#level-4 [data-back]').forEach(btn => {
    btn.addEventListener('click', () => showSection('l4-section-home'));
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
    mathProblems = WorksheetCore.generate(4, op, count);
    mathChecked = false;
    document.getElementById('l4-mathReveal').disabled = true;
    renderMath();
  }

  function renderMath() {
    const grid = document.getElementById('l4-mathGrid');
    grid.innerHTML = '';
    mathProblems.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'problem';
      if (p.text) {
        div.innerHTML = `${i + 1}. ${p.text} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off">`;
      } else if (p.remainder !== null) {
        div.innerHTML = `${i + 1}. ${p.a} ${p.symbol} ${p.b} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="q" autocomplete="off"> r <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="r" autocomplete="off" style="width:30px;">`;
      } else {
        div.innerHTML = `${i + 1}. ${p.a} ${p.symbol} ${p.b} = <input class="ans" type="text" inputmode="decimal" data-index="${i}" autocomplete="off">`;
      }
      grid.appendChild(div);
    });
  }

  document.getElementById('l4-mathRegen').addEventListener('click', () => {
    genMathProblems(document.getElementById('l4-mathOp').value, parseInt(document.getElementById('l4-mathCount').value, 10));
  });
  document.getElementById('l4-mathOp').addEventListener('change', () => {
    genMathProblems(document.getElementById('l4-mathOp').value, parseInt(document.getElementById('l4-mathCount').value, 10));
  });
  document.getElementById('l4-mathCheck').addEventListener('click', () => {
    document.querySelectorAll('#l4-mathGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      const field = input.dataset.field;
      const expected = field === 'r' ? mathProblems[i].remainder : mathProblems[i].answer;
      const parsedVal = WorksheetCore.parseAnswer(val);
      const isCorrect = Math.abs(parsedVal - expected) < 1e-8;
      if (isCorrect) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    mathChecked = true;
    document.getElementById('l4-mathReveal').disabled = false;
  });
  document.getElementById('l4-mathReveal').addEventListener('click', () => {
    if (!mathChecked) return;
    document.querySelectorAll('#l4-mathGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      const expected = field === 'r' ? mathProblems[i].remainder : mathProblems[i].answer;
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${expected})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- VOCABULARY WORDS ---------- */
  const sightWords = ['meticulous','resilient','ambiguous','hypothesis','phenomenon',
    'collaborate','perseverance','articulate','skeptical','innovative',
    'fluctuate','inevitable','profound','tedious','versatile',
    'candid','elaborate','scrutinize','tranquil','plausible'];
  const vocabDefinitions = {
    meticulous: 'Very careful and precise about details',
    resilient: 'Able to recover quickly from difficulty',
    ambiguous: 'Open to more than one interpretation',
    hypothesis: 'An educated guess to be tested',
    phenomenon: 'A remarkable or notable occurrence',
    collaborate: 'To work together with others',
    perseverance: 'Continued effort despite difficulty',
    articulate: 'Able to express ideas clearly',
    skeptical: 'Having doubts about something',
    innovative: 'Introducing new and original ideas',
    fluctuate: 'To rise and fall irregularly',
    inevitable: 'Certain to happen; unavoidable',
    profound: 'Very deep or intense',
    tedious: 'Long, slow, and boring',
    versatile: 'Able to adapt to many uses',
    candid: 'Truthful and straightforward',
    elaborate: 'Detailed and complicated',
    scrutinize: 'To examine closely and carefully',
    tranquil: 'Calm and peaceful',
    plausible: 'Reasonable or believable'
  };
  const vocabSynonyms = {
    meticulous: 'careful',
    resilient: 'tough',
    ambiguous: 'unclear',
    hypothesis: 'guess',
    phenomenon: 'occurrence',
    collaborate: 'cooperate',
    perseverance: 'persistence',
    articulate: 'expressive',
    skeptical: 'doubtful',
    innovative: 'creative',
    fluctuate: 'vary',
    inevitable: 'unavoidable',
    profound: 'deep',
    tedious: 'boring',
    versatile: 'adaptable',
    candid: 'honest',
    elaborate: 'detailed',
    scrutinize: 'examine',
    tranquil: 'calm',
    plausible: 'believable'
  };
  const letterSingleSelect = document.getElementById('l4-letterSingle');
  sightWords.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    letterSingleSelect.appendChild(opt);
  });

  let letterProblems = [];
  let letterChecked = false;

  document.getElementById('l4-letterSet').addEventListener('change', (e) => {
    document.getElementById('l4-letterSingleWrap').style.display = e.target.value === 'single' ? 'flex' : 'none';
  });

  document.getElementById('l4-letterActivity').addEventListener('change', (e) => {
    const activity = e.target.value;
    const isCrossword = activity === 'crossword';
    const isSynonyms = activity === 'synonyms';
    const needsCheck = activity === 'scramble' || activity === 'crossword';
    document.getElementById('l4-letterSetWrap').style.display = (isCrossword || isSynonyms) ? 'none' : 'flex';
    document.getElementById('l4-letterSingleWrap').style.display = (!isCrossword && !isSynonyms && document.getElementById('l4-letterSet').value === 'single') ? 'flex' : 'none';
    document.getElementById('l4-letterRepeatsWrap').style.display = (activity === 'trace') ? 'flex' : 'none';
    document.getElementById('l4-letterCheck').style.display = needsCheck ? 'inline-block' : 'none';
    document.getElementById('l4-letterReveal').style.display = needsCheck ? 'inline-block' : 'none';
    genLetterActivity();
  });

  function genLettersTrace() {
    const setMode = document.getElementById('l4-letterSet').value;
    const repeats = parseInt(document.getElementById('l4-letterRepeats').value, 10);
    const words = setMode === 'single' ? [letterSingleSelect.value] : sightWords;

    const output = document.getElementById('l4-letterOutput');
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
    const setMode = document.getElementById('l4-letterSet').value;
    const words = setMode === 'single' ? [letterSingleSelect.value] : sightWords;
    letterProblems = [];
    const output = document.getElementById('l4-letterOutput');
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
    document.getElementById('l4-letterReveal').disabled = true;
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
    const output = document.getElementById('l4-letterOutput');
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
    document.getElementById('l4-letterReveal').disabled = true;
  }

  function genSynonymMatch() {
    const words = shuffleArray([...sightWords]);
    const output = document.getElementById('l4-letterOutput');
    output.innerHTML = '';
    words.forEach((word, i) => {
      const correct = vocabSynonyms[word];
      const distractors = shuffleArray(Object.values(vocabSynonyms).filter(s => s !== correct)).slice(0, 3);
      const options = shuffleArray([correct, ...distractors]);
      const card = document.createElement('div');
      card.className = 'syn-question';
      card.innerHTML = `<div class="syn-prompt">${i + 1}. Which word means the same as "${word}"?</div>
        <div class="syn-options">${options.map(opt => `<button data-correct="${opt === correct}">${opt}</button>`).join('')}</div>`;
      card.querySelectorAll('.syn-options button').forEach(btn => {
        btn.addEventListener('click', () => {
          const opts = card.querySelectorAll('.syn-options button');
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

  function genLetterActivity() {
    const activity = document.getElementById('l4-letterActivity').value;
    if (activity === 'scramble') genWordScramble();
    else if (activity === 'crossword') genCrossword();
    else if (activity === 'synonyms') genSynonymMatch();
    else genLettersTrace();
  }
  document.getElementById('l4-letterRegen').addEventListener('click', genLetterActivity);

  document.getElementById('l4-letterCheck').addEventListener('click', () => {
    const activity = document.getElementById('l4-letterActivity').value;
    if (activity === 'crossword') {
      document.querySelectorAll('#l4-letterOutput .cw-cell input.ans').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        const val = input.value.trim().toLowerCase();
        if (val === '') return;
        const expected = crosswordCells[`${input.dataset.row},${input.dataset.col}`];
        input.classList.add(val === expected.toLowerCase() ? 'correct' : 'incorrect');
      });
    } else {
      document.querySelectorAll('#l4-letterOutput .ans').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        const i = parseInt(input.dataset.index, 10);
        const val = input.value.trim().toLowerCase();
        if (val === '') return;
        input.classList.add(val === letterProblems[i].answer ? 'correct' : 'incorrect');
      });
    }
    letterChecked = true;
    document.getElementById('l4-letterReveal').disabled = false;
  });

  document.getElementById('l4-letterReveal').addEventListener('click', () => {
    if (!letterChecked) return;
    const activity = document.getElementById('l4-letterActivity').value;
    if (activity === 'crossword') {
      document.querySelectorAll('#l4-letterOutput .cw-cell input.ans').forEach(input => {
        if (input.classList.contains('correct')) return;
        input.value = crosswordCells[`${input.dataset.row},${input.dataset.col}`].toUpperCase();
        input.classList.remove('incorrect');
        input.classList.add('correct');
      });
    } else {
      document.querySelectorAll('#l4-letterOutput .ans').forEach(input => {
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

  function genNumbers() {
    const mode = document.getElementById('l4-numberMode').value;
    const output = document.getElementById('l4-numberOutput');
    output.innerHTML = '';
    numberProblems = [];
    let idx = 0;
    const count = parseInt(document.getElementById('l4-numberCount').value, 10);

    if (mode === 'fraction') {
      const grid = document.createElement('div');
      grid.className = 'shape-grid';
      for (let i = 0; i < count; i++) {
        const denom = randInt(3, 10);
        const numer = randInt(1, denom - 1);
        const segWidth = 200 / denom;
        let rects = '';
        for (let s = 0; s < denom; s++) {
          const fill = s < numer ? '#8a6fbf' : 'white';
          rects += `<rect x="${s * segWidth}" y="20" width="${segWidth}" height="60" fill="${fill}" stroke="#666" stroke-width="1.5"/>`;
        }
        const numIdx = idx++, denIdx = idx++;
        numberProblems.push({ answer: numer });
        numberProblems.push({ answer: denom });
        const card = document.createElement('div');
        card.className = 'shape-card';
        card.innerHTML = `
          <svg viewBox="0 0 200 100"><rect x="0" y="20" width="200" height="60" fill="none" stroke="#333" stroke-width="2"/>${rects}</svg>
          <div class="shape-fields" style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <input class="ans" type="text" inputmode="numeric" data-index="${numIdx}" autocomplete="off" style="width:50px; text-align:center;">
            <div style="border-top:2px solid #333; width:50px;"></div>
            <input class="ans" type="text" inputmode="numeric" data-index="${denIdx}" autocomplete="off" style="width:50px; text-align:center;">
          </div>`;
        grid.appendChild(card);
      }
      output.appendChild(grid);
    } else {
      const targets = [10, 100, 1000];
      for (let i = 0; i < count; i++) {
        const target = targets[randInt(0, 2)];
        const num = randInt(target, target * 99);
        const answer = Math.round(num / target) * target;
        numberProblems.push({ answer });
        const div = document.createElement('div');
        div.className = 'wordproblem';
        div.innerHTML = `${i + 1}. Round <strong>${num.toLocaleString()}</strong> to the nearest ${target.toLocaleString()}.<div class="wp-answer">Answer: <input class="ans" type="text" inputmode="numeric" data-index="${idx}" autocomplete="off"></div>`;
        output.appendChild(div);
        idx++;
      }
    }

    numberChecked = false;
    document.getElementById('l4-numberReveal').disabled = true;
  }
  document.getElementById('l4-numberRegen').addEventListener('click', genNumbers);
  document.getElementById('l4-numberMode').addEventListener('change', genNumbers);
  document.getElementById('l4-numberCheck').addEventListener('click', () => {
    document.querySelectorAll('#l4-numberOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      if (WorksheetCore.parseAnswer(val) === numberProblems[i].answer) input.classList.add('correct');
      else input.classList.add('incorrect');
    });
    numberChecked = true;
    document.getElementById('l4-numberReveal').disabled = false;
  });
  document.getElementById('l4-numberReveal').addEventListener('click', () => {
    if (!numberChecked) return;
    document.querySelectorAll('#l4-numberOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${numberProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- SHAPES (area & perimeter) ---------- */
  let shapes = [];
  let shapeChecked = false;

  function genShapes() {
    shapes = [];
    for (let i = 0; i < 8; i++) {
      const w = randInt(3, 15);
      const h = randInt(3, 15);
      shapes.push({ w, h, area: w * h, perimeter: 2 * (w + h) });
    }
    renderShapes();
  }

  function renderShapes() {
    const grid = document.getElementById('l4-shapeGrid');
    grid.innerHTML = '';
    shapes.forEach((s, i) => {
      const rectW = 60 + s.w * 5;
      const rectH = 40 + s.h * 5;
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.innerHTML = `
        <svg viewBox="0 0 160 120">
          <rect x="${(160 - rectW) / 2}" y="${(100 - rectH) / 2}" width="${rectW}" height="${rectH}" fill="none" stroke="#999" stroke-width="3"/>
          <text x="80" y="${(100 - rectH) / 2 - 6}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555">${s.w} units</text>
          <text x="${(160 + rectW) / 2 + 10}" y="60" text-anchor="start" font-family="sans-serif" font-size="11" fill="#555">${s.h} units</text>
        </svg>
        <div class="shape-fields">
          <div>Area: <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="area" autocomplete="off"> units&sup2;</div>
          <div>Perimeter: <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="perimeter" autocomplete="off"> units</div>
        </div>`;
      grid.appendChild(card);
    });
    shapeChecked = false;
    document.getElementById('l4-shapeReveal').disabled = true;
  }
  genShapes();
  document.getElementById('l4-shapeRegen').addEventListener('click', genShapes);

  document.getElementById('l4-shapeCheck').addEventListener('click', () => {
    document.querySelectorAll('#l4-shapeGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      const val = input.value.trim();
      if (val === '') return;
      const expected = shapes[i][field];
      input.classList.add(WorksheetCore.parseAnswer(val) === expected ? 'correct' : 'incorrect');
    });
    shapeChecked = true;
    document.getElementById('l4-shapeReveal').disabled = false;
  });
  document.getElementById('l4-shapeReveal').addEventListener('click', () => {
    if (!shapeChecked) return;
    document.querySelectorAll('#l4-shapeGrid .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${shapes[i][field]})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- GRAMMAR ---------- */
  const posBank = [
    { sentence: 'The playful puppy chased its tail.', word: 'playful', answer: 'Adjective' },
    { sentence: 'She quickly finished her homework.', word: 'quickly', answer: 'Adverb' },
    { sentence: 'The children laughed at the clown.', word: 'laughed', answer: 'Verb' },
    { sentence: 'A tall building stood on the corner.', word: 'building', answer: 'Noun' },
    { sentence: 'He carefully painted the fence.', word: 'carefully', answer: 'Adverb' },
    { sentence: 'The bright sun warmed the beach.', word: 'bright', answer: 'Adjective' },
    { sentence: 'They will travel to the mountains.', word: 'travel', answer: 'Verb' },
    { sentence: 'Our teacher gave us a difficult quiz.', word: 'difficult', answer: 'Adjective' },
    { sentence: 'The bird sang sweetly in the tree.', word: 'sweetly', answer: 'Adverb' },
    { sentence: 'My sister collects colorful seashells.', word: 'seashells', answer: 'Noun' },
    { sentence: 'The old clock ticked loudly.', word: 'loudly', answer: 'Adverb' },
    { sentence: 'We visited a fascinating museum.', word: 'fascinating', answer: 'Adjective' },
    { sentence: 'The chef prepared a delicious meal.', word: 'prepared', answer: 'Verb' },
    { sentence: 'A gentle breeze cooled the park.', word: 'breeze', answer: 'Noun' },
    { sentence: 'The students worked quietly in class.', word: 'quietly', answer: 'Adverb' },
    { sentence: 'The enormous elephant walked slowly.', word: 'enormous', answer: 'Adjective' }
  ];
  const posOptions = ['Noun', 'Verb', 'Adjective', 'Adverb'];

  const fixBank = [
    { options: ['She don\u2019t like broccoli.', 'She doesn\u2019t likes broccoli.', 'She doesn\u2019t like broccoli.', 'She not like broccoli.'], correct: 2 },
    { options: ['They was late for school.', 'They were late for school.', 'They is late for school.', 'They be late for school.'], correct: 1 },
    { options: ['Its raining outside.', 'It\u2019s raining outside.', 'Its\u2019 raining outside.', 'Its is raining outside.'], correct: 1 },
    { options: ['Me and him went to the store.', 'Him and me went to the store.', 'He and I went to the store.', 'Me and he went to the store.'], correct: 2 },
    { options: ['The dogs bone was buried.', 'The dog\u2019s bone was buried.', 'The dogs\u2019s bone was buried.', 'The dog bone\u2019s was buried.'], correct: 1 },
    { options: ['I seen that movie already.', 'I have saw that movie already.', 'I have seen that movie already.', 'I has seen that movie already.'], correct: 2 },
    { options: ['Each of the players have a jersey.', 'Each of the players has a jersey.', 'Each of the player have a jersey.', 'Each of the players having a jersey.'], correct: 1 },
    { options: ['There going to the park later.', 'They\u2019re going to the park later.', 'Their going to the park later.', 'There\u2019s going to the park later, them.'], correct: 1 },
    { options: ['Who\u2019s backpack is this?', 'Whose backpack is this?', 'Who backpack is this?', 'Whos backpack is this?'], correct: 1 },
    { options: ['The team are practicing hard.', 'The team is practicing hard.', 'The team am practicing hard.', 'The team be practicing hard.'], correct: 1 }
  ];

  function genGrammar() {
    const mode = document.getElementById('l4-grammarMode').value;
    const count = parseInt(document.getElementById('l4-grammarCount').value, 10);
    const output = document.getElementById('l4-grammarOutput');
    output.innerHTML = '';

    if (mode === 'pos') {
      const items = shuffleArray([...posBank]).slice(0, Math.min(count, posBank.length));
      items.forEach((item, i) => {
        const highlighted = item.sentence.replace(item.word, `<u>${item.word}</u>`);
        const distractors = shuffleArray(posOptions.filter(p => p !== item.answer)).slice(0, 3);
        const options = shuffleArray([item.answer, ...distractors]);
        const card = document.createElement('div');
        card.className = 'syn-question';
        card.innerHTML = `<div class="syn-prompt">${i + 1}. What part of speech is the underlined word?<br>${highlighted}</div>
          <div class="syn-options">${options.map(opt => `<button data-correct="${opt === item.answer}">${opt}</button>`).join('')}</div>`;
        card.querySelectorAll('.syn-options button').forEach(btn => {
          btn.addEventListener('click', () => {
            const opts = card.querySelectorAll('.syn-options button');
            opts.forEach(b => b.classList.add('disabled'));
            if (btn.dataset.correct === 'true') btn.classList.add('correct');
            else { btn.classList.add('incorrect'); opts.forEach(b => { if (b.dataset.correct === 'true') b.classList.add('correct'); }); }
          });
        });
        output.appendChild(card);
      });
    } else {
      const items = shuffleArray([...fixBank]).slice(0, Math.min(count, fixBank.length));
      items.forEach((item, i) => {
        const correctText = item.options[item.correct];
        const options = shuffleArray([...item.options]);
        const card = document.createElement('div');
        card.className = 'syn-question';
        card.innerHTML = `<div class="syn-prompt">${i + 1}. Which sentence is written correctly?</div>
          <div class="syn-options">${options.map(opt => `<button data-correct="${opt === correctText}">${opt}</button>`).join('')}</div>`;
        card.querySelectorAll('.syn-options button').forEach(btn => {
          btn.addEventListener('click', () => {
            const opts = card.querySelectorAll('.syn-options button');
            opts.forEach(b => b.classList.add('disabled'));
            if (btn.dataset.correct === 'true') btn.classList.add('correct');
            else { btn.classList.add('incorrect'); opts.forEach(b => { if (b.dataset.correct === 'true') b.classList.add('correct'); }); }
          });
        });
        output.appendChild(card);
      });
    }
  }
  document.getElementById('l4-grammarRegen').addEventListener('click', genGrammar);
  document.getElementById('l4-grammarMode').addEventListener('change', genGrammar);
  document.getElementById('l4-grammarCount').addEventListener('change', genGrammar);

  /* ---------- MEASUREMENT ---------- */
  let measureProblems = [];
  let measureChecked = false;

  function genMeasurement() {
    const mode = document.getElementById('l4-measureMode').value;
    const count = parseInt(document.getElementById('l4-measureCount').value, 10);
    const output = document.getElementById('l4-measureOutput');
    output.innerHTML = '';
    measureProblems = [];

    for (let i = 0; i < count; i++) {
      let text, answer, unit;
      if (mode === 'metric') {
        const templates = [
          () => { const v = randInt(1, 20); return { text: `${v} km = ____ m`, answer: v * 1000 }; },
          () => { const v = randInt(1, 20); return { text: `${v} m = ____ cm`, answer: v * 100 }; },
          () => { const v = randInt(1, 20); return { text: `${v} cm = ____ mm`, answer: v * 10 }; },
          () => { const v = randInt(1, 20); return { text: `${v} kg = ____ g`, answer: v * 1000 }; },
          () => { const v = randInt(1, 20); return { text: `${v * 1000} g = ____ kg`, answer: v }; },
          () => { const v = randInt(1, 20); return { text: `${v} L = ____ mL`, answer: v * 1000 }; },
          () => { const v = randInt(1, 20); return { text: `${v * 1000} mL = ____ L`, answer: v }; }
        ];
        const chosen = templates[randInt(0, templates.length - 1)]();
        text = chosen.text; answer = chosen.answer;
      } else {
        const templates = [
          () => { const v = randInt(1, 10); return { text: `${v} hours = ____ minutes`, answer: v * 60 }; },
          () => { const v = randInt(1, 10); return { text: `${v * 60} minutes = ____ hours`, answer: v }; },
          () => { const v = randInt(1, 5); return { text: `${v} minutes = ____ seconds`, answer: v * 60 }; },
          () => { const v = randInt(1, 5); return { text: `${v * 60} seconds = ____ minutes`, answer: v }; }
        ];
        const chosen = templates[randInt(0, templates.length - 1)]();
        text = chosen.text; answer = chosen.answer;
      }
      measureProblems.push({ answer });
      const div = document.createElement('div');
      div.className = 'wordproblem';
      div.innerHTML = `${i + 1}. ${text.replace('____', `<input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off" style="width:70px;">`)}`;
      output.appendChild(div);
    }
    measureChecked = false;
    document.getElementById('l4-measureReveal').disabled = true;
  }
  document.getElementById('l4-measureRegen').addEventListener('click', genMeasurement);
  document.getElementById('l4-measureMode').addEventListener('change', genMeasurement);
  document.getElementById('l4-measureCheck').addEventListener('click', () => {
    document.querySelectorAll('#l4-measureOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      input.classList.add(WorksheetCore.parseAnswer(val) === measureProblems[i].answer ? 'correct' : 'incorrect');
    });
    measureChecked = true;
    document.getElementById('l4-measureReveal').disabled = false;
  });
  document.getElementById('l4-measureReveal').addEventListener('click', () => {
    if (!measureChecked) return;
    document.querySelectorAll('#l4-measureOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${measureProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- Init ---------- */
  genMathProblems('add', 10);
  genLetterActivity();
  genNumbers();
  genGrammar();
  genMeasurement();

})();

