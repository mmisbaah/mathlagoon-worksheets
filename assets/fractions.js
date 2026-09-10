(function(){
  'use strict';
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  const frac=(n,d)=>{const f=gcd(n,d);return `${n/f}/${d/f}`;};
  const numberOf=value=>{const text=String(value).trim().replace(/\s+/g,'');if(/^[-+]?\d+\/\d+$/.test(text)){const [n,d]=text.split('/').map(Number);return d?n/d:NaN;}return Number(text.replace('%',''))/(text.endsWith('%')?100:1);};
  const equivalent=(value,answer,strict=false)=>{const clean=String(value).trim().replace(/\s+/g,'').toLowerCase(),expected=String(answer).toLowerCase();if(strict)return clean===expected;if(expected.endsWith('%')&&!clean.endsWith('%')&&Number(clean)===Number(expected.slice(0,-1)))return true;return Number.isFinite(numberOf(value))&&Math.abs(numberOf(value)-numberOf(answer))<1e-9;};
  const bar=(n,d,blank=false,interactive=false)=>{
    const label=blank?`${d} equal unshaded parts`:`${n} of ${d} equal parts shaded`;
    const parts=Array.from({length:d},(_,i)=>`<span class="${!blank&&i<n?'shaded':''}"${interactive?' role="button" tabindex="0" aria-label="Part '+(i+1)+'"':''}></span>`).join('');
    return `<div class="fraction-model${interactive?' interactive-shade':''}" aria-label="${label}">${parts}</div>`;
  };
  const compareBars=(a,d,b,e)=>`<div class="fraction-pair" aria-label="Two fraction models">${bar(a,d)}${bar(b,e)}</div>`;
  const numberLine=(n,d)=>`<div class="fraction-line" aria-label="Number line divided into ${d} equal intervals with a point marked"><span class="line-zero">0</span>${Array.from({length:d+1},(_,i)=>`<i style="left:${i/d*100}%"></i>`).join('')}<b style="left:${n/d*100}%"></b><span class="line-one">1</span></div>`;
  const configs={
    1:{intro:'Explore halves and quarters with pictures',modes:[['count','Count shaded parts'],['name','Name halves and quarters'],['shade','Shade a fraction']]},
    2:{intro:'Read, compare and locate simple fractions',modes:[['write','Write the pictured fraction'],['compare','Compare pictured fractions'],['line','Fractions on a number line'],['shade','Shade a fraction']]},
    3:{intro:'Practise fraction models and same-denominator calculations',modes:[['addSame','Add — same denominator'],['subSame','Subtract — same denominator'],['equiv','Equivalent fractions'],['missing','Fill the missing number'],['compare','Compare fractions'],['line','Number line fractions'],['write','Read a shaded model'],['shade','Shade a fraction']]},
    4:{intro:'Simplify and calculate with fractions',modes:[['simplify','Simplify fractions'],['addDiff','Add — different denominators'],['subDiff','Subtract — different denominators'],['quantity','Fraction of a quantity'],['compareDiff','Compare — different denominators']]},
    5:{intro:'Extend fraction calculations and conversions',modes:[['mul','Multiply fractions'],['div','Divide fractions'],['addDiff','Add — different denominators'],['subDiff','Subtract — different denominators'],['decimal','Fraction to decimal'],['percent','Fraction to percent'],['quantity','Fraction of a quantity']]}
  };
  function question(level,mode,i){
    const simpleD=[2,3,4,5,6,8,10],d=simpleD[i%simpleD.length],n=1+(i%(d-1));
    if(mode==='count'){const parts=i%2?4:2,shaded=1+(i%parts);return {prompt:`How many of the ${parts} equal parts are shaded?`,answer:String(shaded),visual:bar(shaded,parts)};}
    if(mode==='name'){const quarter=i%2===1;return {prompt:'What is the shaded part called?',answer:quarter?'quarter':'half',visual:bar(1,quarter?4:2),strict:true};}
    if(mode==='shade'){const sd=level===1?(i%2?4:2):simpleD[i%5],sn=1+(i%(sd-1));return {prompt:`Shade ${sn}/${sd} of the bar.`,answer:String(sn),visual:bar(0,sd,true,true),action:true};}
    if(mode==='write')return {prompt:'Write the fraction shown.',answer:`${n}/${d}`,visual:bar(n,d),strict:true};
    if(mode==='compare'||mode==='compareDiff'){const e=mode==='compare'?d:simpleD[(i+2)%simpleD.length],b=1+((i*2+1)%(e-1)),symbol=n/d>b/e?'>':n/d<b/e?'<':'=';return {prompt:'How does the top model compare with the bottom model?',answer:symbol,visual:compareBars(n,d,b,e),strict:true};}
    if(mode==='line')return {prompt:'What fraction is marked on the number line?',answer:`${n}/${d}`,visual:numberLine(n,d),strict:true};
    if(mode==='equiv'){const scale=2+(i%3);return {prompt:`Complete: ${n}/${d} = □/${d*scale}`,answer:String(n*scale),visual:bar(n,d)};}
    if(mode==='missing'){const scale=2+(i%3);return i%2?{prompt:`Complete: ${n}/${d} = ${n*scale}/□`,answer:String(d*scale),visual:bar(n,d)}:{prompt:`Complete: ${n}/${d} = □/${d*scale}`,answer:String(n*scale),visual:bar(n,d)};}
    if(mode==='addSame'){const a=1+(i%(d-1)),b=1+((i+1)%(d-a));return {prompt:`${a}/${d} + ${b}/${d} = □`,answer:frac(a+b,d),visual:compareBars(a,d,b,d)};}
    if(mode==='subSame'){const a=2+(i%(d-1)),den=Math.max(d,a+1),b=1+(i%(a-1));return {prompt:`${a}/${den} − ${b}/${den} = □`,answer:frac(a-b,den),visual:compareBars(a,den,b,den)};}
    if(mode==='simplify'){const baseD=[2,3,4,5][i%4],baseN=1+(i%(baseD-1)),scale=2+(i%4);return {prompt:`Simplify ${baseN*scale}/${baseD*scale}.`,answer:frac(baseN,baseD),strict:true};}
    if(mode==='quantity'){const qd=[2,3,4,5,8,10][i%6],qn=1+(i%(qd-1)),amount=qd*(2+(i%8));return {prompt:`${qn}/${qd} of ${amount} = □`,answer:String(qn*amount/qd),visual:bar(qn,qd)};}
    if(mode==='decimal'){const pairs=[[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[1,8],[3,8],[5,8],[7,8]],pair=pairs[i%pairs.length];return {prompt:`Write ${pair[0]}/${pair[1]} as a decimal.`,answer:String(pair[0]/pair[1]),visual:bar(pair[0],pair[1])};}
    if(mode==='percent'){const pairs=[[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,10],[3,10],[7,10]],pair=pairs[i%pairs.length];return {prompt:`Write ${pair[0]}/${pair[1]} as a percentage.`,answer:`${pair[0]/pair[1]*100}%`,visual:bar(pair[0],pair[1])};}
    const e=[3,4,5,6,8,10][(i+2)%6],b=1+((i+1)%(e-1));
    if(mode==='mul')return {prompt:`${n}/${d} × ${b}/${e} = □`,answer:frac(n*b,d*e)};
    if(mode==='div')return {prompt:`${n}/${d} ÷ ${b}/${e} = □`,answer:frac(n*e,d*b)};
    const add=mode==='addDiff',left=n/d>=b/e?[n,d,b,e]:[b,e,n,d],result=add?frac(n*e+b*d,d*e):frac(left[0]*left[3]-left[2]*left[1],left[1]*left[3]);
    return {prompt:add?`${n}/${d} + ${b}/${e} = □`:`${left[0]}/${left[1]} − ${left[2]}/${left[3]} = □`,answer:result,visual:compareBars(n,d,b,e)};
  }
  function install(level){
    const home=document.getElementById(`l${level}-section-home`),page=document.getElementById(`level-${level}`),config=configs[level];
    const card=document.createElement('button');card.className='card fractions';card.dataset.target=`l${level}-section-fractions`;card.innerHTML='<span class="icon">🍕</span>Fractions';home.querySelector('.home-grid').append(card);
    const options=config.modes.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
    const section=document.createElement('div');section.className='section';section.id=`l${level}-section-fractions`;
    section.innerHTML=`<button class="back-btn" data-back>&larr; Back</button><h2 class="section-title">Fractions</h2><div class="section-sub">${config.intro}</div><div class="controls"><label>Activity: <select id="l${level}-fractionMode">${options}</select></label><label>Problems: <select id="l${level}-fractionCount"><option>5</option><option>10</option><option>20</option></select></label><button id="l${level}-fractionRegen">New Worksheet</button><button id="l${level}-fractionCheck">Check Answers</button><button id="l${level}-fractionReveal">Show Answers</button><button onclick="printSectionAsImage(this)">Print</button></div><div class="name-date"><div>Name: <span>&nbsp;</span></div><div>Date: <span>&nbsp;</span></div></div><div class="fraction-grid"></div>`;page.append(section);
    let offset=0;
    const render=()=>{
      const mode=section.querySelector(`#l${level}-fractionMode`).value,count=Number(section.querySelector(`#l${level}-fractionCount`).value),grid=section.querySelector('.fraction-grid');grid.innerHTML='';
      for(let i=0;i<count;i++){
        const q=question(level,mode,(offset+i)%20),row=document.createElement('div');row.className=`problem fraction-problem${q.action?' shade-problem':''}`;
        row.innerHTML=`${q.visual||''}<span class="fraction-prompt">${i+1}. ${q.prompt}</span><input class="ans${q.action?' shade-answer':''}" inputmode="${level===1||['equiv','missing','quantity'].includes(mode)?'numeric':'text'}" autocomplete="off" aria-label="Answer to fraction question ${i+1}" data-answer="${q.answer}" data-strict="${q.strict?'true':'false'}">${q.action?'<span class="shade-count" aria-live="polite">0 parts shaded</span>':''}`;
        if(q.action){
          const input=row.querySelector('.ans'),status=row.querySelector('.shade-count');
          const update=()=>{input.value=String(row.querySelectorAll('.fraction-model .shaded').length);status.textContent=`${input.value} ${input.value==='1'?'part':'parts'} shaded`;input.dispatchEvent(new Event('input',{bubbles:true}));};
          row.querySelectorAll('.fraction-model span').forEach(part=>{const toggle=()=>{part.classList.toggle('shaded');part.setAttribute('aria-pressed',String(part.classList.contains('shaded')));update();};part.addEventListener('click',toggle);part.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();}});});
        }
        grid.append(row);
      }
    };
    section.querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{offset=0;render();}));
    section.querySelector(`#l${level}-fractionRegen`).addEventListener('click',()=>{offset=(offset+5)%20;render();});
    section.querySelector(`#l${level}-fractionCheck`).addEventListener('click',()=>section.querySelectorAll('input.ans').forEach(input=>{const ok=equivalent(input.value,input.dataset.answer,input.dataset.strict==='true');input.classList.toggle('correct',ok);input.classList.toggle('incorrect',!ok&&input.value.trim()!=='');}));
    section.querySelector(`#l${level}-fractionReveal`).addEventListener('click',()=>section.querySelectorAll('input.ans').forEach(input=>{input.value=input.dataset.answer;input.classList.add('correct');input.classList.remove('incorrect');}));render();
  }
  window.WorksheetFractions={configs,question};
  for(let level=1;level<=5;level++)install(level);
})();
