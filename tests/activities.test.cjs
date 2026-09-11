const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom');
test('all activity modes and check/reveal controls run without script errors',()=>{
 const errors=[];const console=new VirtualConsole();console.on('jsdomError',e=>{if(!e.message.includes('Not implemented'))errors.push(e.message);});
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://worksheets.mathlagoon.com/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window,d=w.document;w.print=()=>{};w.scrollTo=()=>{};
 try{
  for(const script of d.querySelectorAll('script[src]'))w.eval(fs.readFileSync(script.getAttribute('src').split('?')[0],'utf8'));
  for(const select of d.querySelectorAll('.section select')){
   if(!/Mode$|Op$/.test(select.id))continue;
   for(const option of select.options){select.value=option.value;select.dispatchEvent(new w.Event('change',{bubbles:true}));}
  }
  for(const button of d.querySelectorAll('button[id$="Check"],button[id$="Reveal"]'))button.click();
  assert.deepEqual(errors,[]);
  for(const section of d.querySelectorAll('.section:not([id$="-home"])'))assert.ok(section.querySelector('.worked-example')?.textContent.length>20,section.id+' needs a worked example');
 }finally{w.close();}
});

test('opening every level subsection returns the page to the top',()=>{
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://worksheets.mathlagoon.com/',runScripts:'outside-only'});
 const w=dom.window,d=w.document;const scrolls=[];w.scrollTo=(x,y)=>scrolls.push([x,y]);
 try{
  w.eval(fs.readFileSync('assets/core.js','utf8'));
  w.eval(fs.readFileSync('assets/fractions.js','utf8'));
  for(let level=1;level<=5;level++)w.eval(fs.readFileSync(`assets/level-${level}.js`,'utf8'));
  for(let level=1;level<=5;level++){
   scrolls.length=0;
   d.querySelector(`#level-${level} .card[data-target]`).click();
   assert.deepEqual(scrolls.at(-1),[0,0],`Level ${level} subsection did not open at the top`);
  }
 }finally{w.close();}
});
