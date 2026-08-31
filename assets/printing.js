(function(){
  'use strict';
  document.querySelectorAll('.section .controls').forEach(controls=>{
    if(!controls.querySelector('[onclick*="printSection"]'))return;
    const label=document.createElement('label');label.textContent='Print: ';
    const select=document.createElement('select');select.className='print-mode';
    const modes=[['blank','Blank worksheet'],['completed','My completed worksheet']];
    if(controls.closest('.section').id.endsWith('-math'))modes.push(['key','Arithmetic answer key']);
    for(const [value,text] of modes){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
    label.append(select);controls.append(label);
    const inkLabel=document.createElement('label');const ink=document.createElement('input');ink.type='checkbox';ink.className='ink-saving';ink.checked=true;inkLabel.append(ink,' Save ink');controls.append(inkLabel);
  });
  function cleanup(){document.getElementById('print-host')?.remove();document.body.classList.remove('printing-worksheet');}
  window.addEventListener('afterprint',cleanup);
  window.printSectionAsImage=function(button){
    cleanup();
    const section=button.closest('.section'); if(!section)return;
    const mode=section.querySelector('.print-mode')?.value||'blank';
    const host=document.createElement('div');host.id='print-host';
    if(section.querySelector('.ink-saving')?.checked)host.className='ink-saving';
    const header=document.createElement('header');
    header.textContent=`Math Lagoon · Worksheet Hub · Skill Level ${section.id[1]} · ${section.querySelector('h2').textContent}${mode==='key'?' · Answer key':''}`;
    host.append(header);
    const wrapper=document.createElement('div');wrapper.id=`level-${section.id[1]}`;wrapper.className='level-page active-level';
    const clone=section.cloneNode(true);clone.removeAttribute('id');
    const live=[...section.querySelectorAll('input')];
    clone.querySelectorAll('input').forEach((input,i)=>{
      const span=document.createElement('span');span.className='printed-answer';
      span.textContent=mode==='key'?(live[i].dataset.answer??'—'):mode==='completed'?(live[i].value||'________'):'________';
      input.replaceWith(span);
    });
    clone.querySelectorAll('.controls,.back-btn,.worksheet-feedback,.pool-note,.retry-button,.answer-status,.solution-steps').forEach(el=>el.remove());
    if(mode!=='completed')clone.querySelectorAll('.reveal-note').forEach(el=>el.remove());
    clone.querySelectorAll('.correct,.incorrect').forEach(el=>el.classList.remove('correct','incorrect'));
    clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    clone.classList.add('active');wrapper.append(clone);host.append(wrapper);
    const footer=document.createElement('footer');footer.textContent='worksheets.mathlagoon.com · Print or choose Save as PDF in your print dialog.';host.append(footer);
    document.body.append(host);document.body.classList.add('printing-worksheet');
    window.print();
  };
})();
