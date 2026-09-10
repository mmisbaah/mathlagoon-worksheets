const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function load(){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://worksheets.mathlagoon.com/',runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.print=()=>{};
  for(const script of dom.window.document.querySelectorAll('script[src]'))dom.window.eval(fs.readFileSync(path.join(root,script.getAttribute('src').split('?')[0]),'utf8'));
  return dom;
}
test('fraction activity types are curriculum-progressive and do not reveal responses',()=>{
  const dom=load(),w=dom.window,api=w.WorksheetFractions;
  try{
    assert.deepEqual(Array.from(api.configs[3].modes,mode=>mode[0]),['addSame','subSame','equiv','missing','compare','line','write','shade']);
    assert.equal(api.configs[3].modes.some(mode=>['mul','div','addDiff','subDiff'].includes(mode[0])),false);
    assert.equal(api.configs[5].modes.some(mode=>mode[0]==='mul'),true);
    for(let level=1;level<=5;level++)for(const [mode] of api.configs[level].modes)for(let i=0;i<20;i++){
      const item=api.question(level,mode,i);
      assert.ok(item.prompt&&item.answer!==undefined,`Level ${level} ${mode} item ${i+1}`);
      if(mode==='line'||mode==='write'||mode==='name'||mode==='compare'||mode==='compareDiff')assert.equal(item.prompt.toLowerCase().includes(String(item.answer).toLowerCase()),false,`Response leaked in Level ${level} ${mode}`);
      if(mode==='shade'){assert.equal(item.action,true);assert.equal(/how many|write|answer/i.test(item.prompt),false);}
    }
  }finally{dom.window.close();}
});
test('shade activities require learners to select the requested number of parts',()=>{
  const dom=load(),w=dom.window,d=w.document;
  try{
    for(let level=1;level<=3;level++){
      const mode=d.getElementById(`l${level}-fractionMode`);mode.value='shade';mode.dispatchEvent(new w.Event('change',{bubbles:true}));
      const row=d.querySelector(`#l${level}-section-fractions .shade-problem`),answer=row.querySelector('.shade-answer'),parts=[...row.querySelectorAll('.interactive-shade span')],target=Number(answer.dataset.answer);
      assert.equal(answer.value,'');for(let i=0;i<target;i++)parts[i].click();assert.equal(Number(answer.value),target);
      d.getElementById(`l${level}-fractionCheck`).click();assert.equal(answer.classList.contains('correct'),true);
    }
  }finally{dom.window.close();}
});
