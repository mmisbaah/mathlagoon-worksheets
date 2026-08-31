(function(){
  'use strict';
  const core=window.WorksheetCore, learning=window.WorksheetLearning;
  const make=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text)el.textContent=text;return el;};
  const homeLink=make('a','hub-home','← Math Lagoon'); homeLink.href='https://mathlagoon.com/';
  document.querySelector('#app-home').before(homeLink);
  const note=make('p','skill-note','Five skill levels — not school grades. Maths, reading and optional enrichment are separate activities. Choose familiar skills first; Level 5 includes extension work.');
  document.querySelector('#app-subtitle').after(note);
  document.querySelectorAll('.chrome-mascot,.path-mascot').forEach(el=>{
    el.replaceChildren(make('span','turtle-mascot','🐢'),make('span','turtle-pencil','✏️'));
    el.setAttribute('aria-hidden','true');
  });
  document.querySelectorAll('.level-card').forEach((card,i)=>card.setAttribute('aria-label',`Skill level ${i+1}. ${learning.levels[i]}`));
  document.querySelector('#sound-toggle').setAttribute('aria-label','Toggle sound effects');
  const progressBox=make('details','parent-progress');
  progressBox.append(make('summary','','For grown-ups: practice summary'),make('p','','Saved only in this browser. This is practice history, not a grade assessment.'));
  const progressText=make('p','progress-text'); progressBox.append(progressText);
  document.querySelector('#app-home').append(progressBox);
  let history=[];
  try {const saved=JSON.parse(localStorage.getItem('wh_practice_v2')||'[]');if(Array.isArray(saved))history=saved.filter(x=>Number.isFinite(x.correct)&&Number.isFinite(x.total)).slice(-100);}catch{}
  function drawHistory(){progressText.textContent=history.length?history.slice(-5).map(x=>`Level ${x.level} ${x.topic}: ${x.correct}/${x.total} (${x.date})`).join(' · '):'Complete and check a worksheet to see a summary here.';}
  drawHistory();
  const checked=new WeakMap();
  function describeInput(input,index){
    const item=input.closest('.problem,.shape-card,.wp-answer,.sudoku-cell,.cw-cell');
    if(!input.hasAttribute('aria-label'))input.setAttribute('aria-label',`Answer ${index+1}. ${item?.textContent.trim().slice(0,100)||'Worksheet activity'}`);
    if(input.inputMode==='numeric' && input.closest('#level-4,#level-5'))input.inputMode='decimal';
  }
  function exampleFor(section){
    const level=Number(section.id[1]),topic=section.id.split('-section-')[1];
    if(topic==='math'){
      const op=document.getElementById(`l${level}-mathOp`).value;
      return learning.levelArithmetic[`${level}-${op}`]||learning.arithmetic[op];
    }
    return learning.examples[`${level}-${topic}`];
  }
  function refresh(section){
    const example=exampleFor(section), box=section.querySelector('.worked-example');
    if(example && box){
      box.replaceChildren(make('h3','',example.title));
      const list=make('ol',''); example.steps.forEach(step=>list.append(make('li','',step))); box.append(list);
    }
    section.querySelectorAll('input.ans').forEach(describeInput);
    if(section.id.endsWith('-math')) {
      const level=Number(section.id[1]); const bank=core.worksheets[level];
      section.querySelectorAll('input.ans').forEach(input=>{
        const p=bank?.questions[Number(input.dataset.index)];
        if(p)input.dataset.answer=String(input.dataset.field==='r'?p.remainder:p.answer);
      });
      const count=bank?.questions.length||0;
      section.querySelector('.pool-note').textContent=bank && count<bank.requested?`This skill has ${count} different questions available. We used each once instead of repeating questions.`:`${count} different questions. Take your time!`;
    }
  }
  document.querySelectorAll('.section:not([id$="-home"])').forEach(section=>{
    const example=make('aside','worked-example');
    section.querySelector('.section-sub')?.after(example);
    const feedback=make('p','worksheet-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
    const controls=section.querySelector('.controls');
    if(controls) {
      const hint=make('button','hint-button','💡 Hint'); hint.type='button';
      hint.addEventListener('click',()=>{feedback.textContent=exampleFor(section)?.hint||'Look at the worked example above. Try one part at a time.';});
      controls.append(hint);
      const retry=make('button','retry-button','Practise my mistakes'); retry.type='button';retry.hidden=true;
      retry.addEventListener('click',()=>{
        section.querySelectorAll('.reveal-note,.answer-status,.solution-steps').forEach(el=>el.remove());
        const inputs=[...section.querySelectorAll('input.ans')];
        const incorrect=inputs.filter(el=>!el.classList.contains('correct'));
        inputs.forEach(el=>{el.readOnly=el.classList.contains('correct');if(!el.readOnly){el.value='';el.classList.remove('incorrect');el.removeAttribute('aria-invalid');}});
        feedback.textContent=`Try the ${incorrect.length} unanswered or incorrect ${incorrect.length===1?'answer':'answers'} again. Your correct answers are kept.`;
        incorrect[0]?.focus();retry.hidden=true;
      });
      controls.append(retry);
      controls.after(feedback);
      if(section.id.endsWith('-math')) controls.after(make('p','pool-note'));
    } else section.append(feedback);
    refresh(section);
  });
  document.addEventListener('input',event=>{
    const input=event.target;
    if(!input.matches('input.ans'))return;
    input.classList.remove('correct','incorrect');input.removeAttribute('aria-invalid');
    const section=input.closest('.section');
    section.querySelectorAll('.answer-status,.solution-steps,.reveal-note').forEach(el=>el.remove());
    section.querySelector('.worksheet-feedback').textContent='Answer changed. Check again when you are ready.';
  });
  function afterCheck(section){
    const inputs=[...section.querySelectorAll('input.ans')];
    section.querySelectorAll('.answer-status').forEach(el=>el.remove());
    let correct=0,blank=0;
    inputs.forEach(input=>{
      const empty=input.value.trim()==='';
      if(empty){blank++; input.classList.remove('correct','incorrect');}
      const ok=!empty && input.classList.contains('correct');
      if(ok)correct++;
      input.setAttribute('aria-invalid',String(!empty&&!ok));
      const status=make('span',`answer-status ${ok?'is-correct':''}`,empty?'Not answered yet':ok?'✓ Correct!':'↻ Try again');
      const id=input.id||`answer-${section.id}-${inputs.indexOf(input)}`;
      input.id=id; status.id=id+'-feedback'; input.setAttribute('aria-describedby',status.id);input.after(status);
    });
    const feedback=section.querySelector('.worksheet-feedback');
    feedback.textContent=inputs.length?`${correct} of ${inputs.length} correct. ${blank?blank+' not answered yet. ':''}${correct===inputs.length?'Well done!':'Use a hint, then try again.'}`:'Choose an answer or complete the activity above.';
    const retry=section.querySelector('.retry-button');if(retry)retry.hidden=!inputs.length||correct===inputs.length;
    const signature=inputs.map(el=>el.value.trim()).join('|');
    if(inputs.length && checked.get(section)!==signature){
      checked.set(section,signature);
      history.push({level:Number(section.id[1]),topic:section.querySelector('h2')?.textContent||'Practice',correct,total:inputs.length,date:new Date().toLocaleDateString()});
      history=history.slice(-100);try{localStorage.setItem('wh_practice_v2',JSON.stringify(history));}catch{}drawHistory();
    }
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const section=button.closest('.section');
    if(!section){document.querySelectorAll('.section:not([id$="-home"])').forEach(refresh);return;}
    if(/Check$/.test(button.id)) afterCheck(section);
    if(/Reveal$/.test(button.id)) {
      const seen=new Set();section.querySelectorAll('.reveal-note').forEach(el=>{const input=el.previousElementSibling;if(!input?.matches('input.ans')||seen.has(input))el.remove();else seen.add(input);});
      if(section.id.endsWith('-math')){
        section.querySelectorAll('.solution-steps').forEach(el=>el.remove());
        const bank=core.worksheets[Number(section.id[1])];
        section.querySelectorAll('.problem').forEach((row,i)=>{
          const steps=make('ol','solution-steps');core.explanation(bank.questions[i]).forEach(s=>steps.append(make('li','',s)));row.append(steps);
        });
      }
    }
    if(/Regen$|New$/.test(button.id)) resetFeedback(section);
    refresh(section);
  });
  function resetFeedback(section){
    section.querySelectorAll('.answer-status,.solution-steps,.reveal-note').forEach(el=>el.remove());
    section.querySelectorAll('input.ans').forEach(el=>{el.readOnly=false;});
    section.querySelector('.worksheet-feedback').textContent='A fresh activity is ready.';
    const retry=section.querySelector('.retry-button');if(retry)retry.hidden=true;
    delete section.dataset.celebrated;
  }
  document.addEventListener('change',event=>{
    const section=event.target.closest('.section');if(!section)return;
    if(/-mathCount$/.test(event.target.id))document.getElementById(`l${section.id[1]}-mathRegen`).click();
    resetFeedback(section);refresh(section);
  });
})();
