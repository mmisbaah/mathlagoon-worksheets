const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function load(){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://worksheets.mathlagoon.com/',runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.print=()=>{};
  for(const script of dom.window.document.querySelectorAll('script[src]'))dom.window.eval(fs.readFileSync(path.join(root,script.getAttribute('src')),'utf8'));
  return dom;
}
test('all five skill levels initialise, reject invalid answers and support retry',()=>{
  const dom=load(),w=dom.window,d=w.document;
  try{
    for(let level=1;level<=5;level++){
      const section=d.getElementById(`l${level}-section-math`);
      assert.ok(section,'Math section '+level);
      const input=section.querySelector('input.ans');assert.ok(input);
      const expected=input.dataset.answer;assert.notEqual(expected,undefined);
      input.value=expected+'abc';d.getElementById(`l${level}-mathCheck`).click();
      assert.equal(input.classList.contains('correct'),false);
      input.value=expected;d.getElementById(`l${level}-mathCheck`).click();
      assert.equal(input.classList.contains('correct'),true);
      const other=section.querySelectorAll('input.ans')[1];other.value='999999';
      d.getElementById(`l${level}-mathCheck`).click();section.querySelector('.retry-button').click();
      assert.equal(input.readOnly,true);assert.equal(other.value,'');
      d.getElementById(`l${level}-mathRegen`).click();
      assert.equal(section.querySelector('input.ans').readOnly,false);
      assert.ok(section.querySelector('.worked-example').textContent.length>30);
      const select=d.getElementById(`l${level}-mathCount`);select.value='20';select.dispatchEvent(new w.Event('change',{bubbles:true}));
      assert.equal(w.WorksheetCore.worksheets[level].questions.length,20);
    }
  }finally{w.close();}
});
test('print builds blank, completed and answer-key copies without changing learner answers',()=>{
  const dom=load(),w=dom.window,d=w.document;
  try{
    const section=d.getElementById('l1-section-math'),input=section.querySelector('input.ans');input.value='123';
    const button=section.querySelector('[onclick*="printSection"]');
    for(const [mode,expected] of [['blank','________'],['completed','123'],['key',input.dataset.answer]]){
      section.querySelector('.print-mode').value=mode;w.printSectionAsImage(button);
      assert.equal(d.querySelector('#print-host .printed-answer').textContent,expected);
      assert.equal(input.value,'123');assert.equal(d.querySelector('#print-host .controls'),null);
      w.dispatchEvent(new w.Event('afterprint'));assert.equal(d.getElementById('print-host'),null);
    }
  }finally{w.close();}
});
