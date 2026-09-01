const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../assets/core.js');
test('numeric answers reject trailing junk, fractions and blank input',()=>{
  for(const value of ['', ' ', '5abc','5 6','1/2','NaN','Infinity','0x10'])assert.ok(Number.isNaN(core.parseAnswer(value)),value);
  for(const [value,expected] of [['0',0],['1',1],['−3',-3],['.25',.25],['5.9',5.9],[' 25 ',25]])assert.equal(core.parseAnswer(value),expected);
  assert.notEqual(core.parseAnswer('5.9'),5);
});
const operations=[['add','sub'],['add','sub'],['add','sub','mul','div'],['add','sub','mul','div','order'],['mul','div','percent','negative','order']];
for(let level=1;level<=5;level++)for(const op of operations[level-1])test(`Level ${level} ${op}: unique questions and independently checked answers`,()=>{
  for(const count of [5,10,20,30,40]){
    const questions=core.generate(level,op,count);
    assert.ok(questions.length>0&&questions.length<=count);
    assert.equal(new Set(questions.map(core.key)).size,questions.length);
    for(const p of questions){
      let expected;
      if(op==='add')expected=p.variant==='missingStart'?p.a:p.variant==='missingChange'?p.b:p.a+p.b;
      if(op==='sub')expected=p.variant==='missingStart'?p.a:p.variant==='missingChange'?p.b:p.a-p.b;
      if(op==='mul')expected=p.a*p.b;
      if(op==='div'){expected=Math.floor(p.a/p.b);assert.equal(p.a%p.b,p.remainder??0);}
      if(op==='order')expected=p.grouped?(p.a+p.b)*p.c:p.a+p.b*p.c;
      if(op==='negative')expected=p.operation==='+'?p.a+p.b:p.a-p.b;
      if(op==='percent')expected=p.quantity*p.percent/100;
      assert.ok(Math.abs(p.answer-expected)<1e-8);
      assert.ok(core.explanation(p).length>=2);
      if(level===1){assert.ok(p.a<=10&&p.b<=10);assert.ok(p.answer>=0&&p.answer<=10);}
      if(level===3&&op==='mul')assert.ok(p.a<=10&&p.b<=10);
      if(level===4&&op==='div')assert.ok(p.a>=100&&p.a<=999&&p.b>=2&&p.b<=9);
    }
  }
});
test('invalid generator requests fail explicitly',()=>{
  assert.throws(()=>core.generate(1,'div',5));assert.throws(()=>core.generate(6,'add',5));assert.throws(()=>core.generate(1,'add',0));
});
test('every arithmetic operation has 20 challenges of 5 globally unique questions',()=>{
  const audit=core.verifyQuestionBank();
  assert.deepEqual(audit,{levels:5,challengesPerOperation:20,questionsPerChallenge:5,errors:0});
  const operations=[['add','sub'],['add','sub'],['add','sub','mul','div'],['add','sub','mul','div','order'],['mul','div','percent','negative','order']];
  for(let level=1;level<=5;level++)for(const op of operations[level-1]){
    const bank=core.createChallengeBank(level,op);assert.equal(bank.length,20);assert.ok(bank.every(challenge=>challenge.length===5));
    const keys=bank.flat().map(core.key);assert.equal(new Set(keys).size,100);
    const setups=bank.flat().map(core.setupKey);assert.equal(new Set(setups).size,100);
  }
});
test('mini Sudoku keeps enough clues for exactly one solution',()=>{
 const solution=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
 for(let i=0;i<50;i++){
  const given=core.uniqueSudokuGivens(solution);
  const puzzle=solution.map((row,r)=>row.map((n,c)=>given.has(r*4+c)?n:0));
  assert.equal(core.sudokuSolutionCount(puzzle),1);
 }
});
