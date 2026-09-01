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
test('learner profiles separate progress and challenges unlock only after 3 of 5',()=>{
  const dom=load(),w=dom.window,d=w.document;
  try{
    assert.equal(d.querySelectorAll('#l1-section-math .challenge-select option').length,20);
    assert.equal(d.querySelector('#l1-section-math .challenge-select option[value="2"]').disabled,true);
    const added=w.WorksheetProgression.addProfile('Aisha');assert.equal(added.ok,true);
    const section=d.getElementById('l1-section-math');
    const inputs=[...section.querySelectorAll('input.ans')];
    inputs.forEach((input,index)=>{input.value=index<3?input.dataset.answer:'999';});
    d.getElementById('l1-mathCheck').click();
    assert.equal(d.querySelector('#l1-section-math .challenge-select option[value="2"]').disabled,false);
    assert.equal(w.WorksheetProgression.summary().mastered,1);
    assert.ok(d.querySelector('.progress-dashboard').textContent.includes("Aisha's progress"));
  }finally{w.close();}
});
test('curriculum labels, breadcrumbs, pictographs and spoken-instruction controls are present',()=>{
  const dom=load(),d=dom.window.document;
  try{
    assert.ok(d.querySelectorAll('.strand-badge').length>=20);
    assert.ok(d.querySelectorAll('.breadcrumb').length>=20);
    assert.ok(d.querySelectorAll('.read-aloud').length>=20);
    assert.ok(d.querySelector('#l1-section-math .math-pictograph'));
    assert.match(d.querySelector('.level-card[data-level="3"] .level-title').textContent,/Grow/);
    assert.equal(d.querySelectorAll('.placement-question').length,5);
  }finally{dom.window.close();}
});
test('progress backups validate, restore without deleting profiles, and reject unsafe data',()=>{
  const dom=load(),w=dom.window;
  try{
    assert.equal(w.WorksheetProgression.addProfile('Aisha').ok,true);
    w.WorksheetProgression.recordAttempt({level:1,correct:4,total:5},1,'add');
    const backup=w.WorksheetProgression.backupObject();assert.equal(w.WorksheetProgression.validateBackup(backup),true);
    assert.equal(w.WorksheetProgression.importBackup(backup),2);
    assert.equal(w.WorksheetProgression.summary().mastered,0);
    const unsafe=structuredClone(backup);unsafe.profiles[0].name='<img src=x>';
    assert.throws(()=>w.WorksheetProgression.validateBackup(unsafe),/invalid learner profile/);
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
