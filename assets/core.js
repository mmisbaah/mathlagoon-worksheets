(function (root) {
  'use strict';
  function parseAnswer(value) {
    const text = String(value).trim().replace(/−/g, '-');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return NaN;
    const number = Number(text);
    return Number.isFinite(number) ? number : NaN;
  }
  function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let i=copy.length-1;i>0;i--) {
      const j = Math.floor(random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  }
  function key(p) {
    if (p.text) return p.text;
    const pair = ['+','&times;'].includes(p.symbol) ? [p.a,p.b].sort((a,b)=>a-b) : [p.a,p.b];
    return `${p.symbol}:${pair.join(':')}`;
  }
  const worksheets = {};
  function generate(level, op, count, random = Math.random) {
    if (![1,2,3,4,5].includes(level)) throw new Error('Unknown skill level');
    const allowed = level < 3 ? ['add','sub'] : level===3 ? ['add','sub','mul','div'] : level===4 ? ['add','sub','mul','div','order'] : ['mul','div','percent','negative','order'];
    if (!allowed.includes(op)) throw new Error('Operation is not available at this skill level');
    if (!Number.isInteger(count) || count < 1 || count > 40) throw new Error('Choose 1–40 questions');
    const pool = new Map();
    const add = p => pool.set(key(p), {...p, remainder:p.remainder ?? null, text:p.text ?? null});
    if (op==='add' || op==='sub') {
      const max = [0,10,99,999,999][level];
      const min = level===1 ? 0 : level===2 ? 10 : level===3 ? 100 : 10;
      // Exhaustive small pools prevent retry loops when requesting many questions.
      const step = level>=3 ? 7 : 1;
      for(let a=min;a<=max;a+=step) for(let b=min;b<=max;b+=step) {
        if(op==='sub' && b>a) continue;
        if(level===1 && op==='add' && a+b>10) continue;
        const divisor = level===4?10:1;
        add({a:a/divisor,b:b/divisor,symbol:op==='add'?'+':'&minus;',answer:(op==='add'?a+b:a-b)/divisor});
      }
    } else if(op==='mul') {
      const lo=level===3?0:level===4?10:100, hi=level===3?10:level===4?99:999;
      for(let a=lo;a<=hi;a+=(level===5?7:1)) for(let b=level===3?0:10;b<=(level===3?10:99);b++)
        add({a,b,symbol:'&times;',answer:a*b});
    } else if(op==='div') {
      for(let b=2;b<=(level===3?10:level===4?9:40);b++) for(let q=level===3?0:12;q<=(level===3?10:60);q++) {
        const remainder=level===3?null:(q+b) % b;
        const a=b*q+(remainder||0);
        if(level===4 && (a<100 || a>999)) continue;
        add({a,b,symbol:'&divide;',answer:q,remainder});
      }
    } else if(op==='percent') {
      for(const p of [5,10,15,20,25,50,75]) for(let n=20;n<=500;n+=20)
        add({text:`What is ${p}% of ${n}?`,answer:p*n/100,percent:p,quantity:n});
    } else if(op==='negative') {
      for(let a=-15;a<=15;a++) for(let b=-15;b<=15;b++) for(const sign of ['+','−'])
        add({text:`(${a}) ${sign} (${b})`,answer:sign==='+'?a+b:a-b,a,b,operation:sign});
    } else {
      for(let a=2;a<=12;a++) for(let b=2;b<=10;b++) for(let c=2;c<=10;c++)
        add({text:level===4?`${a} + ${b} &times; ${c}`:`(${a} + ${b}) &times; ${c}`,answer:level===4?a+b*c:(a+b)*c,a,b,c,grouped:level===5});
    }
    const selected=shuffle([...pool.values()],random).slice(0,count);
    selected.forEach(p=>{if(!Number.isFinite(p.answer)) throw new Error('Invalid answer');});
    worksheets[level]={op,requested:count,questions:selected};
    return selected;
  }
  function explanation(p) {
    if(p.percent) return [`Find 1%: ${p.quantity} ÷ 100 = ${p.quantity/100}.`, `Find ${p.percent}%: ${p.quantity/100} × ${p.percent} = ${p.answer}.`];
    if(p.c!==undefined) return p.grouped
      ? [`Do the brackets first: ${p.a} + ${p.b} = ${p.a+p.b}.`, `Multiply: ${p.a+p.b} × ${p.c} = ${p.answer}.`]
      : [`Multiply first: ${p.b} × ${p.c} = ${p.b*p.c}.`, `Then add: ${p.a} + ${p.b*p.c} = ${p.answer}.`];
    if(p.operation) return [`Start at ${p.a} on a number line.`, `${p.operation==='+'?'Add':'Subtract'} ${p.b}; you reach ${p.answer}. Subtracting a negative moves right.`];
    if(p.symbol==='+') return [`Start with ${p.a}. Add ${p.b} more.`, `${p.a} + ${p.b} = ${p.answer}. Check: ${p.answer} − ${p.b} = ${p.a}.`];
    if(p.symbol==='&minus;') return [`Start with ${p.a}. Take away ${p.b}.`, `${p.a} − ${p.b} = ${p.answer}. Check: ${p.answer} + ${p.b} = ${p.a}.`];
    if(p.symbol==='&times;') return [`There are ${p.a} equal groups of ${p.b}.`, `${p.a} × ${p.b} = ${p.answer}.`];
    return [`Share ${p.a} into groups of ${p.b}. There are ${p.answer} complete groups.`, `Check: ${p.answer} × ${p.b}${p.remainder?' + '+p.remainder:''} = ${p.a}.${p.remainder?' The remainder is '+p.remainder+'.':''}`];
  }
  function sudokuSolutionCount(board) {
    const grid=board.map(row=>[...row]);let found=0;
    function solve(){
      if(found>=2)return;
      let r=-1,c=-1;
      outer:for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(!grid[i][j]){r=i;c=j;break outer;}
      if(r<0){found++;return;}
      for(let n=1;n<=4;n++){
        if(grid[r].includes(n)||grid.some(row=>row[c]===n))continue;
        let occupied=false;
        for(let i=Math.floor(r/2)*2;i<Math.floor(r/2)*2+2;i++)for(let j=Math.floor(c/2)*2;j<Math.floor(c/2)*2+2;j++)if(grid[i][j]===n)occupied=true;
        if(!occupied){grid[r][c]=n;solve();grid[r][c]=0;}
      }
    }
    solve();return found;
  }
  function uniqueSudokuGivens(solution) {
    const grid=solution.map(row=>[...row]);const given=new Set(Array.from({length:16},(_,i)=>i));
    for(const i of shuffle([...given])){
      if(given.size<=8)break;
      const r=Math.floor(i/4),c=i%4;grid[r][c]=0;
      if(sudokuSolutionCount(grid)===1)given.delete(i);else grid[r][c]=solution[r][c];
    }
    return given;
  }
  root.WorksheetCore={parseAnswer,generate,key,shuffle,worksheets,explanation,sudokuSolutionCount,uniqueSudokuGivens};
  if(typeof module!=='undefined') module.exports=root.WorksheetCore;
})(typeof window!=='undefined'?window:globalThis);
