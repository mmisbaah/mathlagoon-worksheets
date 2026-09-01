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
  function setupKey(p){return `${p.symbol||p.operation||'text'}:${p.variant||p.grouped||'direct'}:${p.a??p.quantity??''}:${p.b??p.percent??''}:${p.c??''}`;}
  const worksheets = {};
  const challengeBanks = {};
  const CONTEXTS = ['shells','coconuts','fish','beach balls','island flags'];
  const CONTEXT_EMOJI = ['🐚','🥥','🐟','🏐','🚩'];
  const SINGULAR = {shells:'shell',coconuts:'coconut',fish:'fish','beach balls':'beach ball','island flags':'island flag'};
  const things=(name,count)=>`${count} ${count===1?SINGULAR[name]:name}`;
  function seededRandom(seed) {
    let state=(Number(seed)>>>0)||1;
    return function(){state=(state*1664525+1013904223)>>>0;return state/4294967296;};
  }
  function buildPool(level, op) {
    if (![1,2,3,4,5].includes(level)) throw new Error('Unknown skill level');
    const allowed = level < 3 ? ['add','sub'] : level===3 ? ['add','sub','mul','div'] : level===4 ? ['add','sub','mul','div','order'] : ['mul','div','percent','negative','order'];
    if (!allowed.includes(op)) throw new Error('Operation is not available at this skill level');
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
        const problem={a:a/divisor,b:b/divisor,symbol:op==='add'?'+':'&minus;',answer:(op==='add'?a+b:a-b)/divisor};
        if(level===1){
          CONTEXTS.forEach((thing,index)=>{
            if(op==='add'){
              const total=a+b;
              const variants=[
                {...problem,text:`Kandu has ${things(thing,a)}. ${things(thing,b)} arrive. How many ${thing} now?`,variant:'total'},
                {...problem,text:`Start at ${a} on a number line. Count on ${b}. Where do you land?`,variant:'countOn'},
                {...problem,text:`Some ${thing} joined ${things(thing,b)} to make ${total}. How many ${thing} were there first?`,answer:a,variant:'missingStart'},
                {...problem,text:`Kandu had ${things(thing,a)}. More arrived, making ${total}. How many more arrived?`,answer:b,variant:'missingChange'},
                {...problem,text:`One basket has ${things(thing,a)} and another has ${things(thing,b)}. How many altogether?`,variant:'twoGroups'}
              ];
              add({...variants[index],context:index,visualEmoji:CONTEXT_EMOJI[index]});
            } else {
              const difference=a-b;
              const variants=[
                {...problem,text:`Kandu has ${things(thing,a)}. ${things(thing,b)} are taken away. How many ${thing} remain?`,variant:'remain'},
                {...problem,text:`Some ${thing} were here. After ${things(thing,b)} left, ${difference} remained. How many were here first?`,answer:a,variant:'missingStart'},
                {...problem,text:`Kandu had ${things(thing,a)}. Some left and ${difference} remained. How many left?`,answer:b,variant:'missingChange'},
                {...problem,text:`One basket has ${things(thing,a)} and another has ${things(thing,b)}. How many more are in the first basket?`,variant:'difference'},
                {...problem,text:`Start at ${a} on a number line. Count back ${b}. Where do you land?`,variant:'countBack'}
              ];
              add({...variants[index],context:index,visualEmoji:CONTEXT_EMOJI[index]});
            }
          });
        } else add(problem);
      }
    } else if(op==='mul') {
      const lo=level===3?0:level===4?10:100, hi=level===3?10:level===4?99:999;
      for(let a=lo;a<=hi;a+=(level===5?7:1)) for(let b=level===3?0:10;b<=(level===3?10:99);b++){
        const problem={a,b,symbol:'&times;',answer:a*b};
        if(level===3)CONTEXTS.forEach((thing,index)=>{
          const variants=[
            [`There are ${a} baskets with ${b} ${thing} in each. How many ${thing} altogether?`,'equalGroups'],
            [`Draw ${a} rows of ${b} ${thing}. How many are in the array?`,'array'],
            [`Add ${b}, ${a} times. What total do you get?`,'repeatedAddition'],
            [`A small boat carries ${b} boxes. How many boxes do ${a} identical boats carry?`,'scale'],
            [`There are ${a} groups and ${b} ${thing} in every group. Use multiplication to find the total.`,'model']
          ];
          add({...problem,text:variants[index][0],variant:variants[index][1],context:index});
        });
        else add(problem);
      }
    } else if(op==='div') {
      for(let b=2;b<=(level===3?10:level===4?9:40);b++) for(let q=level===3?0:12;q<=(level===3?10:60);q++) {
        const remainder=level===3?null:(q+b) % b;
        const a=b*q+(remainder||0);
        if(level===4 && (a<100 || a>999)) continue;
        const problem={a,b,symbol:'&divide;',answer:q,remainder};
        if(level===3)CONTEXTS.forEach((thing,index)=>{
          const variants=[
            [`Share ${a} ${thing} equally among ${b} children. How many does each child get?`,'sharing'],
            [`Make groups of ${b} from ${a} ${thing}. How many groups can you make?`,'grouping'],
            [`${b} equal groups contain ${a} ${thing}. How many are in each group?`,'inverse'],
            [`What number multiplied by ${b} equals ${a}?`,'missingFactor'],
            [`A crew shares ${a} supplies across ${b} boats equally. How many supplies go on each boat?`,'rate']
          ];
          add({...problem,text:variants[index][0],variant:variants[index][1],context:index});
        });
        else add(problem);
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
    return [...pool.values()];
  }
  function createChallengeBank(level,op,challengeCount=20,questionsPerChallenge=5) {
    if(!Number.isInteger(challengeCount)||challengeCount<1)throw new Error('Challenge count must be positive');
    if(!Number.isInteger(questionsPerChallenge)||questionsPerChallenge<1)throw new Error('Questions per challenge must be positive');
    const needed=challengeCount*questionsPerChallenge;
    const random=seededRandom(level*1009+op.split('').reduce((n,c)=>n+c.charCodeAt(0),0));
    const complexity=p=>Math.max(Math.abs(p.answer||0),Math.abs(p.a||0),Math.abs(p.b||0))+(Math.abs(p.a||0)+Math.abs(p.b||0))/100+(p.c||0)/1000;
    const ordered=buildPool(level,op).map(question=>({question,tie:random()})).sort((a,b)=>complexity(a.question)-complexity(b.question)||a.tie-b.tie).map(item=>item.question);
    if(ordered.length<needed)throw new Error(`Not enough unique ${op} questions for Level ${level}`);
    const selected=Array.from({length:needed},(_,index)=>ordered[Math.min(ordered.length-1,Math.floor(index*ordered.length/needed))]);
    const decorate=(problem,challenge,index)=>{
      const p={...problem},thing=CONTEXTS[(challenge+index)%CONTEXTS.length],band=challenge<=7?'Guided':challenge<=14?'Independent':'Reasoning';p.difficultyBand=band;
      if(level>1&&challenge>=8){
        if(p.text){p.text=challenge>=15?`${p.text} Check your answer with the inverse operation.`:p.text;return p;}
        if(op==='add')p.text=challenge>=15?`A supply boat carried ${p.a} boxes and collected ${p.b} more. What total should the crew record?`:`Add ${p.a} shells to ${p.b} shells. How many shells altogether?`;
        if(op==='sub')p.text=challenge>=15?`Kandu counted ${p.a} ${thing}, then used ${p.b}. How many remain, and what addition could check it?`:`Take ${p.b} away from ${p.a}. What remains?`;
        if(op==='mul')p.text=challenge>=15?`A reef survey has ${p.a} equal groups of ${p.b} fish. Use repeated groups to find the total.`:`Find the total in ${p.a} groups of ${p.b}.`;
        if(op==='div')p.text=challenge>=15?`Share ${p.a} ${thing} into groups of ${p.b}. How many full groups are made${p.remainder?' before '+p.remainder+' remain':''}?`:`How many groups of ${p.b} can be made from ${p.a}?`;
      }
      return p;
    };
    const challenges=Array.from({length:challengeCount},(_,index)=>selected.slice(index*questionsPerChallenge,(index+1)*questionsPerChallenge).map((p,q)=>decorate(p,index+1,q)));
    const keys=challenges.flat().map(key);
    if(new Set(keys).size!==keys.length)throw new Error(`Duplicate question in Level ${level} ${op} challenge bank`);
    const setups=challenges.flat().map(setupKey);
    if(new Set(setups).size!==setups.length)throw new Error(`Duplicate mathematical setup in Level ${level} ${op} challenge bank`);
    return challenges;
  }
  function getChallenge(level,op,challengeNumber) {
    const bankKey=`${level}:${op}`;
    if(!challengeBanks[bankKey])challengeBanks[bankKey]=createChallengeBank(level,op);
    if(!Number.isInteger(challengeNumber)||challengeNumber<1||challengeNumber>20)throw new Error('Choose Challenge 1–20');
    const selected=challengeBanks[bankKey][challengeNumber-1].map(p=>({...p}));
    worksheets[level]={op,requested:5,questions:selected,challenge:challengeNumber};
    return selected;
  }
  function expectedAnswer(p){
    if(p.variant==='missingStart')return p.a;
    if(p.variant==='missingChange')return p.b;
    if(p.percent!==undefined)return p.quantity*p.percent/100;
    if(p.c!==undefined)return p.grouped?(p.a+p.b)*p.c:p.a+p.b*p.c;
    if(p.operation)return p.operation==='+'?p.a+p.b:p.a-p.b;
    if(p.symbol==='+')return p.a+p.b;
    if(p.symbol==='&minus;')return p.a-p.b;
    if(p.symbol==='&times;')return p.a*p.b;
    if(p.symbol==='&divide;')return Math.floor(p.a/p.b);
    return NaN;
  }
  function generate(level, op, count, random = Math.random) {
    if (!Number.isInteger(count) || count < 1 || count > 40) throw new Error('Choose 1–40 questions');
    const selected=shuffle(buildPool(level,op),random).slice(0,count);
    selected.forEach(p=>{if(!Number.isFinite(p.answer)) throw new Error('Invalid answer');});
    worksheets[level]={op,requested:count,questions:selected};
    return selected;
  }
  function verifyQuestionBank() {
    const errors=[];
    for(let level=1;level<=5;level++){
      const operations=level<3?['add','sub']:level===3?['add','sub','mul','div']:level===4?['add','sub','mul','div','order']:['mul','div','percent','negative','order'];
      operations.forEach(op=>{
        let questions=[];
        try{questions=createChallengeBank(level,op).flat();}catch(error){errors.push(error.message);return;}
        const keys=questions.map(key);
        if(questions.length!==100)errors.push(`Level ${level} ${op} has ${questions.length}, expected 100`);
        if(new Set(keys).size!==keys.length)errors.push(`Level ${level} ${op} contains duplicate prompts`);
        questions.forEach((p,index)=>{
          if(!Number.isFinite(p.answer))errors.push(`Level ${level} ${op} question ${index+1} has an invalid answer`);
          if(Math.abs(p.answer-expectedAnswer(p))>1e-8)errors.push(`Level ${level} ${op} question ${index+1} failed arithmetic verification`);
          if(!explanation(p).length)errors.push(`Level ${level} ${op} question ${index+1} has no explanation`);
        });
      });
    }
    if(errors.length)throw new Error(`Question-bank audit failed:\n${errors.join('\n')}`);
    return {levels:5,challengesPerOperation:20,questionsPerChallenge:5,errors:0};
  }
  function explanation(p) {
    if(p.variant==='missingStart')return [`The final amount and the change are known. Use the inverse operation.`,`Check that ${p.answer} and ${p.b} make the amount stated in the question.`];
    if(p.variant==='missingChange')return [`Compare the starting and final amounts.`,`The missing change is ${p.answer}. Put it back into the story to check.`];
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
  root.WorksheetCore={parseAnswer,generate,getChallenge,createChallengeBank,verifyQuestionBank,expectedAnswer,key,setupKey,shuffle,worksheets,explanation,sudokuSolutionCount,uniqueSudokuGivens};
  if(typeof module!=='undefined') module.exports=root.WorksheetCore;
})(typeof window!=='undefined'?window:globalThis);
