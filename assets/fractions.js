(function(){
  'use strict';
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  const fraction=(n,d)=>{const f=gcd(n,d);return `${n/f}/${d/f}`;};
  const normalise=value=>{
    const text=String(value).trim().replace(/\s+/g,'');
    if(/^[-+]?\d+\/\d+$/.test(text)){const [n,d]=text.split('/').map(Number);return d?fraction(n,d):text;}
    const number=Number(text);return Number.isFinite(number)?String(number):text.toLowerCase();
  };
  const model=(n,d)=>`<div class="fraction-model" aria-label="${n} of ${d} equal parts shaded">${Array.from({length:d},(_,i)=>`<span class="${i<n?'shaded':''}"></span>`).join('')}</div>`;
  const questions=level=>Array.from({length:20},(_,i)=>{
    if(level===1){const d=i%2?4:2,n=(i%3)+1>d?1:(i%3)+1;return {prompt:`How many of the ${d} equal parts are shaded?`,answer:String(n),visual:model(n,d)};}
    if(level===2){const d=[2,3,4,5,6][i%5],n=1+(i*2%(d-1));return {prompt:'Write the fraction shown.',answer:fraction(n,d),visual:model(n,d)};}
    if(level===3){const d=[2,3,4,5,6][i%5],n=1+(i%(d-1)),scale=2+(i%2);return {prompt:`Complete the equivalent fraction: ${n}/${d} = □/${d*scale}`,answer:String(n*scale),visual:model(n,d)};}
    if(level===4){const d=[4,6,8,10,12][i%5],n=2*(1+(i%Math.max(1,d/2-1)));if(i%2===0)return {prompt:`Simplify ${n}/${d}.`,answer:fraction(n,d)};const a=1+(i%Math.max(1,d/2-1)),b=1+((i+2)%Math.max(1,d/2-1));return {prompt:`Calculate ${a}/${d} + ${b}/${d}. Simplify your answer.`,answer:fraction(a+b,d)};}
    if(i%2===0){const d=[2,3,4,5,8][i%5],a=1+(i%(d-1)),e=[3,4,5,6,10][i%5],b=1+((i+1)%(e-1));return {prompt:`Calculate ${a}/${d} + ${b}/${e}. Simplify your answer.`,answer:fraction(a*e+b*d,d*e)};}
    const d=[4,5,8,10][i%4],n=1+(i%(d-1)),quantity=d*(3+(i%6));return {prompt:`Find ${n}/${d} of ${quantity}.`,answer:String(quantity*n/d)};
  });
  function install(level){
    const home=document.getElementById(`l${level}-section-home`),page=document.getElementById(`level-${level}`);
    const card=document.createElement('button');card.className='card fractions';card.dataset.target=`l${level}-section-fractions`;card.innerHTML='<span class="icon">🍕</span>Fractions';home.querySelector('.home-grid').append(card);
    const section=document.createElement('div');section.className='section';section.id=`l${level}-section-fractions`;
    section.innerHTML=`<button class="back-btn" data-back>&larr; Back</button><h2 class="section-title">Fractions</h2><div class="section-sub">${['Explore halves and quarters with pictures','Read and write fractions from pictures','Find equivalent fractions','Simplify and add fractions','Calculate with fractions'][level-1]}</div><div class="controls"><label>Problems: <select id="l${level}-fractionCount"><option>5</option><option>10</option><option>20</option></select></label><button id="l${level}-fractionRegen">New Worksheet</button><button id="l${level}-fractionCheck">Check Answers</button><button id="l${level}-fractionReveal">Show Answers</button><button onclick="printSectionAsImage(this)">Print</button></div><div class="name-date"><div>Name: <span>&nbsp;</span></div><div>Date: <span>&nbsp;</span></div></div><div class="fraction-grid"></div>`;
    page.append(section);
    let offset=0;
    const render=()=>{
      const count=Number(section.querySelector('select').value),bank=questions(level),grid=section.querySelector('.fraction-grid');grid.innerHTML='';
      for(let i=0;i<count;i++){const q=bank[(offset+i)%bank.length],row=document.createElement('div');row.className='problem fraction-problem';row.innerHTML=`${q.visual||''}<span class="fraction-prompt">${i+1}. ${q.prompt}</span><input class="ans" inputmode="decimal" autocomplete="off" aria-label="Answer to fraction question ${i+1}" data-answer="${q.answer}">`;grid.append(row);}
    };
    section.querySelector('select').addEventListener('change',()=>{offset=0;render();});
    section.querySelector(`#l${level}-fractionRegen`).addEventListener('click',()=>{offset=(offset+5)%20;render();});
    section.querySelector(`#l${level}-fractionCheck`).addEventListener('click',()=>section.querySelectorAll('input.ans').forEach(input=>{const ok=normalise(input.value)===normalise(input.dataset.answer);input.classList.toggle('correct',ok);input.classList.toggle('incorrect',!ok&&input.value.trim()!=='');}));
    section.querySelector(`#l${level}-fractionReveal`).addEventListener('click',()=>section.querySelectorAll('input.ans').forEach(input=>{input.value=input.dataset.answer;input.classList.add('correct');input.classList.remove('incorrect');}));
    render();
  }
  for(let level=1;level<=5;level++)install(level);
})();
