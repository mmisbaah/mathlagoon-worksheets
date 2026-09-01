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
      section.querySelector('.worksheet-mode').click();
      const select=d.getElementById(`l${level}-mathCount`);select.value='20';select.dispatchEvent(new w.Event('change',{bubbles:true}));
      assert.equal(w.WorksheetCore.worksheets[level].questions.length,20);
    }
  }finally{w.close();}
});
test('no login or learner profile is shown and every challenge and worksheet size is open',()=>{
  const dom=load(),w=dom.window,d=w.document;
  try{
    assert.equal(d.querySelector('.learner-panel'),null);
    assert.equal(d.querySelectorAll('#l1-section-math .challenge-select option').length,20);
    assert.ok([...d.querySelectorAll('.challenge-select option')].every(option=>!option.disabled&&!option.textContent.includes('🔒')));
    for(let level=1;level<=5;level++)assert.equal(d.getElementById(`l${level}-mathCount`).disabled,false);
    assert.ok(d.querySelector('.progress-dashboard').textContent.includes('Your progress'));
  }finally{w.close();}
});
test('curriculum labels, breadcrumbs, pictographs and spoken-instruction controls are present',()=>{
  const dom=load(),d=dom.window.document;
  try{
    assert.ok(d.querySelectorAll('.strand-badge').length>=20);
    assert.ok(d.querySelectorAll('.breadcrumb').length>=20);
    assert.ok(d.querySelectorAll('.read-aloud').length>=20);
    assert.ok(d.querySelector('#l1-section-math .math-pictograph'));
    assert.match(d.querySelector('.level-card[data-level="3"] .level-title').textContent,/Advanced/);
    assert.equal(d.querySelectorAll('.placement-question').length,5);
  }finally{dom.window.close();}
});
test('single-user progress backups validate, merge and reject malformed data',()=>{
  const dom=load(),w=dom.window;
  try{
    w.WorksheetProgression.recordAttempt({level:1,correct:4,total:5},1,'add');
    const backup=w.WorksheetProgression.backupObject();assert.equal(w.WorksheetProgression.validateBackup(backup),true);
    assert.equal(w.WorksheetProgression.importBackup(backup),1);
    assert.equal(w.WorksheetProgression.summary().mastered,1);
    const unsafe=structuredClone(backup);unsafe.record.attempts[0].level=99;
    assert.throws(()=>w.WorksheetProgression.validateBackup(unsafe),/invalid practice result/);
  }finally{w.close();}
});
test('parent progress report creates a printable summary and cleans up after printing',()=>{
  const dom=load(),w=dom.window,d=w.document;
  try{
    d.querySelector('.print-progress').click();assert.ok(d.body.classList.contains('printing-report'));assert.ok(d.getElementById('progress-report').textContent.includes('Worksheet Hub progress report'));
    w.dispatchEvent(new w.Event('afterprint'));assert.equal(d.getElementById('progress-report'),null);assert.equal(d.body.classList.contains('printing-report'),false);
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
