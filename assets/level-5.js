/* ===== Level 5 JS ===== */
(function(){

  /* ---------- Navigation ---------- */
  function showSection(id) {
    document.querySelectorAll('#level-5 .section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  document.querySelectorAll('#level-5 .card').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.target));
  });
  document.querySelectorAll('#level-5 [data-back]').forEach(btn => {
    btn.addEventListener('click', () => showSection('l5-section-home'));
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
    const challenge = Number(document.getElementById('l5-section-math').dataset.challenge);
    mathProblems = challenge ? WorksheetCore.getChallenge(5, op, challenge) : WorksheetCore.generate(5, op, count);
    mathChecked = false;
    document.getElementById('l5-mathReveal').disabled = true;
    renderMath();
  }

  function renderMath() {
    const grid = document.getElementById('l5-mathGrid');
    grid.innerHTML = '';
    mathProblems.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'problem';
      if (p.text) {
        div.innerHTML = `${i + 1}. ${p.text} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off">`;
      } else if (p.remainder !== null) {
        div.innerHTML = `${i + 1}. ${p.a} ${p.symbol} ${p.b} = <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="q" autocomplete="off"> r <input class="ans" type="text" inputmode="numeric" data-index="${i}" data-field="r" autocomplete="off" style="width:30px;">`;
      } else {
        div.innerHTML = `${i + 1}. ${p.text || `${p.a} ${p.symbol} ${p.b} =`} <input class="ans" type="text" inputmode="numeric" data-index="${i}" autocomplete="off">`;
      }
      grid.appendChild(div);
    });
  }

  document.getElementById('l5-mathRegen').addEventListener('click', () => {
    genMathProblems(document.getElementById('l5-mathOp').value, parseInt(document.getElementById('l5-mathCount').value, 10));
  });
  document.getElementById('l5-mathOp').addEventListener('change', () => {
    genMathProblems(document.getElementById('l5-mathOp').value, parseInt(document.getElementById('l5-mathCount').value, 10));
  });
  document.getElementById('l5-mathCheck').addEventListener('click', () => {
    document.querySelectorAll('#l5-mathGrid .ans').forEach(input => {
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
    document.getElementById('l5-mathReveal').disabled = false;
  });
  document.getElementById('l5-mathReveal').addEventListener('click', () => {
    if (!mathChecked) return;
    document.querySelectorAll('#l5-mathGrid .ans').forEach(input => {
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
  const sightWords = ['ubiquitous','pragmatic','eloquent','tenacious','ambivalent',
    'conspicuous','indifferent','arbitrary','benevolent','cryptic',
    'diligent','exuberant','frivolous','gregarious','impeccable',
    'lucid','obsolete','resolute','superfluous','vindicate'];
  const vocabDefinitions = {
    ubiquitous: 'Present or found everywhere',
    pragmatic: 'Dealing with things sensibly and practically',
    eloquent: 'Fluent and persuasive in speaking or writing',
    tenacious: 'Holding firmly; persistent',
    ambivalent: 'Having mixed feelings about something',
    conspicuous: 'Easily seen or noticed',
    indifferent: 'Having no particular interest or concern',
    arbitrary: 'Based on random choice, not reason',
    benevolent: 'Kind and generous',
    cryptic: 'Mysterious or puzzling in meaning',
    diligent: 'Showing care and effort in work',
    exuberant: 'Full of energy and enthusiasm',
    frivolous: 'Not serious or sensible; silly',
    gregarious: 'Fond of company; sociable',
    impeccable: 'Without flaws; perfect',
    lucid: 'Clear and easy to understand',
    obsolete: 'No longer in use; outdated',
    resolute: 'Determined and unwavering',
    superfluous: 'More than necessary; excess',
    vindicate: 'To clear from blame or suspicion'
  };
  const vocabSynonyms = {
    ubiquitous: 'everywhere',
    pragmatic: 'practical',
    eloquent: 'articulate',
    tenacious: 'persistent',
    ambivalent: 'undecided',
    conspicuous: 'noticeable',
    indifferent: 'unconcerned',
    arbitrary: 'random',
    benevolent: 'kind',
    cryptic: 'mysterious',
    diligent: 'hardworking',
    exuberant: 'enthusiastic',
    frivolous: 'silly',
    gregarious: 'sociable',
    impeccable: 'flawless',
    lucid: 'clear',
    obsolete: 'outdated',
    resolute: 'determined',
    superfluous: 'excessive',
    vindicate: 'exonerate'
  };
  const vocabSentences = {
    ubiquitous: 'Smartphones have become ___ in modern society, appearing everywhere you look.',
    pragmatic: 'Instead of chasing an unrealistic dream, she took a ___ approach to solving the problem.',
    eloquent: 'The speaker was so ___ that the audience was captivated by every word.',
    tenacious: 'Despite countless setbacks, the ___ inventor refused to give up on his idea.',
    ambivalent: 'He felt ___ about the job offer, unsure whether to accept or decline.',
    conspicuous: 'The bright red car was ___ among the sea of gray vehicles.',
    indifferent: 'She seemed completely ___ to the outcome of the game.',
    arbitrary: 'The decision felt ___, with no clear reasoning behind it.',
    benevolent: 'The ___ donor gave millions to charity without asking for recognition.',
    cryptic: 'His ___ message left everyone guessing what he really meant.',
    diligent: 'The ___ student studied every night to prepare for the exam.',
    exuberant: 'The children were ___ after winning the championship game.',
    frivolous: "Spending all your savings on ___ purchases isn't a wise idea.",
    gregarious: 'Being naturally ___, she made friends wherever she went.',
    impeccable: "The chef's ___ technique made every dish look like a work of art.",
    lucid: 'Her explanation was so ___ that even beginners understood it easily.',
    obsolete: 'Many older technologies have become ___ since smartphones took over.',
    resolute: 'He remained ___ in his decision, despite pressure from his friends.',
    superfluous: 'The extra details in the report were ___ and could be removed.',
    vindicate: 'New evidence helped to ___ the man who had been wrongly accused.'
  };
  const letterSingleSelect = document.getElementById('l5-letterSingle');
  sightWords.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    letterSingleSelect.appendChild(opt);
  });

  let letterProblems = [];
  let letterChecked = false;

  document.getElementById('l5-letterSet').addEventListener('change', (e) => {
    document.getElementById('l5-letterSingleWrap').style.display = e.target.value === 'single' ? 'flex' : 'none';
  });

  document.getElementById('l5-letterActivity').addEventListener('change', (e) => {
    const activity = e.target.value;
    const isCrossword = activity === 'crossword';
    const isMcq = activity === 'synonyms' || activity === 'context';
    const needsCheck = activity === 'scramble' || activity === 'crossword';
    document.getElementById('l5-letterSetWrap').style.display = (isCrossword || isMcq) ? 'none' : 'flex';
    document.getElementById('l5-letterSingleWrap').style.display = (!isCrossword && !isMcq && document.getElementById('l5-letterSet').value === 'single') ? 'flex' : 'none';
    document.getElementById('l5-letterRepeatsWrap').style.display = (activity === 'trace') ? 'flex' : 'none';
    document.getElementById('l5-letterCheck').style.display = needsCheck ? 'inline-block' : 'none';
    document.getElementById('l5-letterReveal').style.display = needsCheck ? 'inline-block' : 'none';
    genLetterActivity();
  });

  function genLettersTrace() {
    const setMode = document.getElementById('l5-letterSet').value;
    const repeats = parseInt(document.getElementById('l5-letterRepeats').value, 10);
    const words = setMode === 'single' ? [letterSingleSelect.value] : sightWords;

    const output = document.getElementById('l5-letterOutput');
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
    const setMode = document.getElementById('l5-letterSet').value;
    const words = setMode === 'single' ? [letterSingleSelect.value] : sightWords;
    letterProblems = [];
    const output = document.getElementById('l5-letterOutput');
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
    document.getElementById('l5-letterReveal').disabled = true;
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
    const output = document.getElementById('l5-letterOutput');
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
    document.getElementById('l5-letterReveal').disabled = true;
  }

  function genSynonymMatch() {
    const words = shuffleArray([...sightWords]);
    const output = document.getElementById('l5-letterOutput');
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

  function genContextClues() {
    const words = shuffleArray([...sightWords]);
    const output = document.getElementById('l5-letterOutput');
    output.innerHTML = '';
    words.forEach((word, i) => {
      const distractors = shuffleArray(sightWords.filter(w => w !== word)).slice(0, 3);
      const options = shuffleArray([word, ...distractors]);
      const card = document.createElement('div');
      card.className = 'syn-question';
      card.innerHTML = `<div class="syn-prompt">${i + 1}. ${vocabSentences[word]}</div>
        <div class="syn-options">${options.map(opt => `<button data-correct="${opt === word}">${opt}</button>`).join('')}</div>`;
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
    const activity = document.getElementById('l5-letterActivity').value;
    if (activity === 'scramble') genWordScramble();
    else if (activity === 'crossword') genCrossword();
    else if (activity === 'synonyms') genSynonymMatch();
    else if (activity === 'context') genContextClues();
    else genLettersTrace();
  }
  document.getElementById('l5-letterRegen').addEventListener('click', genLetterActivity);

  document.getElementById('l5-letterCheck').addEventListener('click', () => {
    const activity = document.getElementById('l5-letterActivity').value;
    if (activity === 'crossword') {
      document.querySelectorAll('#l5-letterOutput .cw-cell input.ans').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        const val = input.value.trim().toLowerCase();
        if (val === '') return;
        const expected = crosswordCells[`${input.dataset.row},${input.dataset.col}`];
        input.classList.add(val === expected.toLowerCase() ? 'correct' : 'incorrect');
      });
    } else {
      document.querySelectorAll('#l5-letterOutput .ans').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        const i = parseInt(input.dataset.index, 10);
        const val = input.value.trim().toLowerCase();
        if (val === '') return;
        input.classList.add(val === letterProblems[i].answer ? 'correct' : 'incorrect');
      });
    }
    letterChecked = true;
    document.getElementById('l5-letterReveal').disabled = false;
  });

  document.getElementById('l5-letterReveal').addEventListener('click', () => {
    if (!letterChecked) return;
    const activity = document.getElementById('l5-letterActivity').value;
    if (activity === 'crossword') {
      document.querySelectorAll('#l5-letterOutput .cw-cell input.ans').forEach(input => {
        if (input.classList.contains('correct')) return;
        input.value = crosswordCells[`${input.dataset.row},${input.dataset.col}`].toUpperCase();
        input.classList.remove('incorrect');
        input.classList.add('correct');
      });
    } else {
      document.querySelectorAll('#l5-letterOutput .ans').forEach(input => {
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

  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  function genNumbers() {
    const mode = document.getElementById('l5-numberMode').value;
    const output = document.getElementById('l5-numberOutput');
    output.innerHTML = '';
    numberProblems = [];
    let idx = 0;
    const count = parseInt(document.getElementById('l5-numberCount').value, 10);

    if (mode === 'simplify') {
      for (let i = 0; i < count; i++) {
        let denomSimple = randInt(2, 12);
        let numSimple = randInt(1, denomSimple - 1);
        while (gcd(numSimple, denomSimple) !== 1) numSimple = randInt(1, denomSimple - 1);
        const k = randInt(2, 6);
        const num = numSimple * k;
        const denom = denomSimple * k;
        const numIdx = idx++, denIdx = idx++;
        numberProblems.push({ answer: numSimple });
        numberProblems.push({ answer: denomSimple });
        const div = document.createElement('div');
        div.className = 'wordproblem';
        div.innerHTML = `${i + 1}. Simplify <strong>${num}/${denom}</strong> to lowest terms.
          <div class="wp-answer">
            <input class="ans" type="text" inputmode="numeric" data-index="${numIdx}" autocomplete="off" style="width:44px;"> /
            <input class="ans" type="text" inputmode="numeric" data-index="${denIdx}" autocomplete="off" style="width:44px;">
          </div>`;
        output.appendChild(div);
      }
    } else {
      const denoms = [2, 4, 5, 10, 20, 25, 50];
      for (let i = 0; i < count; i++) {
        const denom = denoms[randInt(0, denoms.length - 1)];
        const numer = randInt(1, denom - 1);
        const decimal = Math.round((numer / denom) * 100) / 100;
        const percent = Math.round(decimal * 100);
        const decIdx = idx++, pctIdx = idx++;
        numberProblems.push({ answer: decimal });
        numberProblems.push({ answer: percent });
        const div = document.createElement('div');
        div.className = 'wordproblem';
        div.innerHTML = `${i + 1}. Convert <strong>${numer}/${denom}</strong> to a decimal and a percent.
          <div class="wp-answer">
            Decimal: <input class="ans" type="text" inputmode="decimal" data-index="${decIdx}" autocomplete="off" style="width:60px;">
            &nbsp; Percent: <input class="ans" type="text" inputmode="numeric" data-index="${pctIdx}" autocomplete="off" style="width:60px;">%
          </div>`;
        output.appendChild(div);
      }
    }

    numberChecked = false;
    document.getElementById('l5-numberReveal').disabled = true;
  }
  document.getElementById('l5-numberRegen').addEventListener('click', genNumbers);
  document.getElementById('l5-numberMode').addEventListener('change', genNumbers);
  document.getElementById('l5-numberCheck').addEventListener('click', () => {
    document.querySelectorAll('#l5-numberOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const val = input.value.trim();
      if (val === '') return;
      const isCorrect = Math.abs(WorksheetCore.parseAnswer(val) - numberProblems[i].answer) < 1e-8;
      input.classList.add(isCorrect ? 'correct' : 'incorrect');
    });
    numberChecked = true;
    document.getElementById('l5-numberReveal').disabled = false;
  });
  document.getElementById('l5-numberReveal').addEventListener('click', () => {
    if (!numberChecked) return;
    document.querySelectorAll('#l5-numberOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const i = parseInt(input.dataset.index, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.textContent = `(${numberProblems[i].answer})`;
      input.insertAdjacentElement('afterend', note);
    });
  });

  /* ---------- SHAPES (mixed geometry) ---------- */
  let shapes = [];
  let shapeChecked = false;
  const triples = [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[7,24,25],[12,16,20],[10,24,26]];

  function genShapes() {
    shapes = [];
    for (let i = 0; i < 8; i++) {
      const type = ['rectangle','triangle','circle'][randInt(0, 2)];
      if (type === 'rectangle') {
        const w = randInt(3, 15), h = randInt(3, 15);
        shapes.push({ type, w, h, area: w * h, second: 2 * (w + h), secondLabel: 'Perimeter', unit: 'units' });
      } else if (type === 'triangle') {
        const [base, height, hyp] = triples[randInt(0, triples.length - 1)];
        shapes.push({ type, base, height, hyp, area: (base * height) / 2, second: base + height + hyp, secondLabel: 'Perimeter', unit: 'units' });
      } else {
        const r = randInt(2, 10);
        shapes.push({ type, r, area: Math.round(3.14 * r * r * 10) / 10, second: Math.round(2 * 3.14 * r * 10) / 10, secondLabel: 'Circumference', unit: 'units' });
      }
    }
    renderShapes();
  }

  function renderShapes() {
    const grid = document.getElementById('l5-shapeGrid');
    grid.innerHTML = '';
    shapes.forEach((s, i) => {
      let svg, dims;
      if (s.type === 'rectangle') {
        const rectW = 60 + s.w * 5, rectH = 40 + s.h * 5;
        svg = `<svg viewBox="0 0 160 120">
          <rect x="${(160 - rectW) / 2}" y="${(100 - rectH) / 2}" width="${rectW}" height="${rectH}" fill="none" stroke="#999" stroke-width="3"/>
          <text x="80" y="${(100 - rectH) / 2 - 6}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555">${s.w}u</text>
          <text x="${(160 + rectW) / 2 + 10}" y="60" text-anchor="start" font-family="sans-serif" font-size="11" fill="#555">${s.h}u</text>
        </svg>`;
      } else if (s.type === 'triangle') {
        const bw = 40 + s.base * 4, bh = 40 + s.height * 4;
        svg = `<svg viewBox="0 0 160 120">
          <polygon points="${(160-bw)/2},${(120+bh)/2 - bh} ${(160-bw)/2},${(120+bh)/2} ${(160+bw)/2},${(120+bh)/2}" fill="none" stroke="#999" stroke-width="3"/>
          <text x="80" y="${(120+bh)/2 + 14}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555">base ${s.base}u</text>
          <text x="${(160-bw)/2 - 8}" y="${(120+bh)/2 - bh/2}" text-anchor="end" font-family="sans-serif" font-size="11" fill="#555">h ${s.height}u</text>
        </svg>`;
      } else {
        const rad = 15 + s.r * 4;
        svg = `<svg viewBox="0 0 160 120">
          <circle cx="80" cy="60" r="${rad}" fill="none" stroke="#999" stroke-width="3"/>
          <line x1="80" y1="60" x2="${80 + rad}" y2="60" stroke="#bbb" stroke-width="1.5" stroke-dasharray="3 2"/>
          <text x="${80 + rad/2}" y="54" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555">r=${s.r}u</text>
        </svg>`;
      }
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.innerHTML = `${svg}${s.type==='triangle'?`<p>Right triangle: base ${s.base} units, height ${s.height} units, sloping side ${s.hyp} units.</p>`:''}
        <div class="shape-fields">
          <div>Area: <input class="ans" type="text" inputmode="decimal" data-index="${i}" data-field="area" autocomplete="off"> units&sup2;</div>
          <div>${s.secondLabel}: <input class="ans" type="text" inputmode="decimal" data-index="${i}" data-field="second" autocomplete="off"> units</div>
        </div>`;
      grid.appendChild(card);
    });
    shapeChecked = false;
    document.getElementById('l5-shapeReveal').disabled = true;
  }
  genShapes();
  document.getElementById('l5-shapeRegen').addEventListener('click', genShapes);

  document.getElementById('l5-shapeCheck').addEventListener('click', () => {
    document.querySelectorAll('#l5-shapeGrid .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const i = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      const val = input.value.trim();
      if (val === '') return;
      const expected = shapes[i][field];
      const isCorrect = Math.abs(WorksheetCore.parseAnswer(val) - expected) < 1e-8;
      input.classList.add(isCorrect ? 'correct' : 'incorrect');
    });
    shapeChecked = true;
    document.getElementById('l5-shapeReveal').disabled = false;
  });
  document.getElementById('l5-shapeReveal').addEventListener('click', () => {
    if (!shapeChecked) return;
    document.querySelectorAll('#l5-shapeGrid .ans').forEach(input => {
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
    { q: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'], answer: 'Mitochondria' },
    { q: 'Which empire built the Colosseum?', options: ['Greek', 'Egyptian', 'Roman', 'Persian'], answer: 'Roman' },
    { q: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 'Au' },
    { q: 'Which country has the largest population in the world?', options: ['USA', 'India', 'Indonesia', 'Brazil'], answer: 'India' },
    { q: 'What force keeps planets in orbit around the sun?', options: ['Magnetism', 'Gravity', 'Friction', 'Inertia'], answer: 'Gravity' },
    { q: 'Who wrote the play "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], answer: 'William Shakespeare' },
    { q: 'What is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 'Nile' },
    { q: 'How many bones are in the adult human body?', options: ['186', '206', '226', '246'], answer: '206' },
    { q: 'Which gas makes up most of Earth\u2019s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], answer: 'Nitrogen' },
    { q: 'What year did World War II end?', options: ['1943', '1945', '1947', '1950'], answer: '1945' },
    { q: 'Which planet has the most moons?', options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'], answer: 'Saturn' },
    { q: 'What is the smallest prime number?', options: ['0', '1', '2', '3'], answer: '2' },
    { q: 'Which continent is the Sahara Desert located on?', options: ['Asia', 'Africa', 'Australia', 'South America'], answer: 'Africa' },
    { q: 'What is the study of earthquakes called?', options: ['Geology', 'Seismology', 'Meteorology', 'Astronomy'], answer: 'Seismology' },
    { q: 'Which artist painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'], answer: 'Leonardo da Vinci' },
    { q: 'What is the currency of Japan?', options: ['Won', 'Yuan', 'Yen', 'Ringgit'], answer: 'Yen' },
    { q: 'Which organ produces insulin?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], answer: 'Pancreas' },
    { q: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], answer: 'Diamond' }
  ];

  function genGkQuiz() {
    const count = parseInt(document.getElementById('l5-gkCount').value, 10);
    const chosen = shuffleArray([...gkBank]).slice(0, Math.min(count, gkBank.length));
    const output = document.getElementById('l5-gkOutput');
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
  document.getElementById('l5-gkRegen').addEventListener('click', genGkQuiz);
  document.getElementById('l5-gkCount').addEventListener('change', genGkQuiz);

  /* ---------- LOGIC PUZZLES (4x4 mini sudoku) ---------- */
  let sudokuSolution = [];
  let sudokuGiven = [];

  function transpose(g) { return g[0].map((_, c) => g.map(row => row[c])); }

  function generateSudoku() {
    let grid = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
    const perm = shuffleArray([1,2,3,4]);
    grid = grid.map(row => row.map(v => perm[v - 1]));
    if (Math.random() < 0.5) [grid[0], grid[1]] = [grid[1], grid[0]];
    if (Math.random() < 0.5) [grid[2], grid[3]] = [grid[3], grid[2]];
    if (Math.random() < 0.5) { [grid[0], grid[2]] = [grid[2], grid[0]]; [grid[1], grid[3]] = [grid[3], grid[1]]; }
    let t = transpose(grid);
    if (Math.random() < 0.5) [t[0], t[1]] = [t[1], t[0]];
    if (Math.random() < 0.5) [t[2], t[3]] = [t[3], t[2]];
    if (Math.random() < 0.5) { [t[0], t[2]] = [t[2], t[0]]; [t[1], t[3]] = [t[3], t[1]]; }
    grid = transpose(t);

    sudokuSolution = grid;
    sudokuGiven = WorksheetCore.uniqueSudokuGivens(grid);
    renderSudoku();
  }

  function renderSudoku() {
    const output = document.getElementById('l5-logicOutput');
    output.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'sudoku-grid';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        const cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        cell.style.position = 'relative';
        if (sudokuGiven.has(idx)) {
          cell.classList.add('given');
          cell.textContent = sudokuSolution[r][c];
        } else {
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
    output.appendChild(grid);
    document.getElementById('l5-logicReveal').disabled = true;
  }
  document.getElementById('l5-logicNew').addEventListener('click', generateSudoku);
  document.getElementById('l5-logicCheck').addEventListener('click', () => {
    document.querySelectorAll('#l5-logicOutput .ans').forEach(input => {
      input.classList.remove('correct', 'incorrect');
      const r = parseInt(input.dataset.row, 10), c = parseInt(input.dataset.col, 10);
      const val = input.value.trim();
      if (val === '') return;
      input.classList.add(WorksheetCore.parseAnswer(val) === sudokuSolution[r][c] ? 'correct' : 'incorrect');
    });
    document.getElementById('l5-logicReveal').disabled = false;
  });
  document.getElementById('l5-logicReveal').addEventListener('click', () => {
    document.querySelectorAll('#l5-logicOutput .ans').forEach(input => {
      if (input.classList.contains('correct')) return;
      const r = parseInt(input.dataset.row, 10), c = parseInt(input.dataset.col, 10);
      const note = document.createElement('span');
      note.className = 'reveal-note';
      note.style.position = 'absolute';
      note.style.bottom = '1px';
      note.style.right = '3px';
      note.style.fontSize = '10px';
      note.textContent = sudokuSolution[r][c];
      input.parentElement.appendChild(note);
    });
  });

  /* ---------- Init ---------- */
  genMathProblems('mul', 10);
  genLetterActivity();
  genNumbers();
  genGkQuiz();
  generateSudoku();

})();


