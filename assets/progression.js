(function(root){
  'use strict';
  const core=root.WorksheetCore;
  const PROFILE_KEY='wh_profiles_v1',ACTIVE_KEY='wh_active_profile',PROGRESS_KEY='wh_progression_v1';
  const levelNames=['Start','Explore','Grow','Stretch','Challenge'];
  const strandMap={math:['Mathematics','Operations and reasoning'],numbers:['Mathematics','Number and place value'],shapes:['Mathematics','Geometry'],measurement:['Mathematics','Measurement'],patterns:['Mathematics','Patterns'],letters:['English','Reading and vocabulary'],tracing:['English','Handwriting'],grammar:['English','Grammar'],matching:['Learning skills','Visual matching'],flashcards:['Learning skills','Recall practice'],dottodot:['Enrichment','Number order'],mazes:['Enrichment','Spatial reasoning'],gk:['Enrichment','General knowledge'],bodyparts:['Enrichment','Health vocabulary'],logic:['Enrichment','Logic and reasoning']};
  const awards=[
    ['first-step','First Step',s=>s.attempts>=1],['five-sheets','Practice Pal',s=>s.attempts>=5],
    ['first-master','Challenge Climber',s=>s.mastered>=1],['perfect-one','Perfect Pearl',s=>s.perfect>=1],
    ['ten-sheets','Ten Tides',s=>s.attempts>=10],['three-mastered','Coral Collector',s=>s.mastered>=3],
    ['twenty-sheets','Island Explorer',s=>s.attempts>=20],['five-perfect','Five-Star Fish',s=>s.perfect>=5],
    ['ten-mastered','Lagoon Learner',s=>s.mastered>=10],['fifty-sheets','Steady Sailor',s=>s.attempts>=50],
    ['addition-ace','Addition Ace',s=>s.byTopic.add>=5],['subtraction-star','Subtraction Star',s=>s.byTopic.sub>=5],
    ['multiply-manta','Multiply Manta',s=>s.byTopic.mul>=5],['division-diver','Division Diver',s=>s.byTopic.div>=5],
    ['reasoning-ray','Reasoning Ray',s=>s.byTopic.order>=5],['percent-pilot','Percent Pilot',s=>s.byTopic.percent>=5],
    ['number-navigator','Number Navigator',s=>s.byTopic.negative>=5],['twenty-mastered','Reef Champion',s=>s.mastered>=20],
    ['twenty-perfect','Brilliant Boatbuilder',s=>s.perfect>=20],['hundred-sheets','Worksheet Hero',s=>s.attempts>=100]
  ];
  const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  const cleanName=value=>String(value||'').normalize('NFKC').replace(/[^\p{L}\p{M}\p{N} .'-]/gu,'').replace(/\s+/g,' ').trim().slice(0,24);
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  let profiles=read(PROFILE_KEY,[{id:'learner-1',name:'My learner'}]);
  if(!Array.isArray(profiles)||!profiles.length)profiles=[{id:'learner-1',name:'My learner'}];
  profiles=profiles.map((profile,index)=>({id:typeof profile.id==='string'?profile.id:`learner-${index+1}`,name:cleanName(profile.name)||`Learner ${index+1}`})).slice(0,20);
  let activeId=localStorage.getItem(ACTIVE_KEY)||profiles[0].id;
  if(!profiles.some(profile=>profile.id===activeId))activeId=profiles[0].id;
  let records=read(PROGRESS_KEY,{});
  const profileRecord=()=>records[activeId]||(records[activeId]={attempts:[],mastered:{},unlocked:{},awards:[]});
  const sectionKey=(level,op)=>`${level}:${op}`;
  function summary(){
    const record=profileRecord(),byTopic={};
    record.attempts.forEach(item=>{byTopic[item.op]=(byTopic[item.op]||0)+1;});
    return {attempts:record.attempts.length,mastered:Object.keys(record.mastered).length,perfect:record.attempts.filter(item=>item.correct===item.total&&item.total>0).length,byTopic};
  }
  function save(){write(PROFILE_KEY,profiles);write(PROGRESS_KEY,records);localStorage.setItem(ACTIVE_KEY,activeId);}
  function backupObject(){
    const stars={};profiles.forEach(profile=>{stars[profile.id]=Number(localStorage.getItem('wh_stars_'+profile.id)||0);});
    return {schemaVersion:1,exportedAt:new Date().toISOString(),profiles:profiles.map(profile=>({...profile})),records:JSON.parse(JSON.stringify(records)),stars};
  }
  function validateBackup(data){
    if(!data||data.schemaVersion!==1||!Array.isArray(data.profiles)||!data.records||typeof data.records!=='object')throw new Error('This is not a Worksheet Hub progress backup.');
    if(!data.profiles.length||data.profiles.length>20)throw new Error('The backup has an invalid number of learner profiles.');
    data.profiles.forEach(profile=>{if(typeof profile.id!=='string'||typeof profile.name!=='string'||cleanName(profile.name).length<2||cleanName(profile.name)!==profile.name.trim())throw new Error('The backup contains an invalid learner profile.');});
    const awardIds=new Set(awards.map(([id])=>id));
    Object.values(data.records).forEach(record=>{if(!record||!Array.isArray(record.attempts)||record.attempts.length>500||!record.mastered||!record.unlocked||!Array.isArray(record.awards)||record.awards.some(id=>!awardIds.has(id)))throw new Error('The backup contains invalid progress data.');record.attempts.forEach(item=>{if(!Number.isFinite(item.level)||item.level<1||item.level>5||typeof item.op!=='string'||!/^[a-z-]{2,20}$/.test(item.op)||!Number.isFinite(item.challenge)||item.challenge<1||item.challenge>20||!Number.isFinite(item.correct)||!Number.isFinite(item.total)||item.correct<0||item.total<0||item.correct>item.total)throw new Error('The backup contains an invalid practice result.');});});
    return true;
  }
  function importBackup(data){
    validateBackup(data);const imported=[];
    data.profiles.forEach(profile=>{
      const sourceId=profile.id,newId=`learner-${Date.now().toString(36)}-${imported.length}`;
      let name=cleanName(profile.name);if(profiles.some(item=>item.name.toLowerCase()===name.toLowerCase()))name=cleanName(`${name} restored`);
      profiles.push({id:newId,name});records[newId]=JSON.parse(JSON.stringify(data.records[sourceId]||{attempts:[],mastered:{},unlocked:{},awards:[]}));
      localStorage.setItem('wh_stars_'+newId,String(Math.max(0,Number(data.stars?.[sourceId])||0)));imported.push(newId);
    });
    activeId=imported[0];save();root.dispatchEvent(new CustomEvent('worksheet:profile-changed',{detail:{id:activeId}}));renderAll();return imported.length;
  }
  function evaluateAwards(){
    const record=profileRecord(),stats=summary(),newAwards=[];
    awards.forEach(([id,title,test])=>{if(test(stats)&&!record.awards.includes(id)){record.awards.push(id);newAwards.push(title);}});
    save();return newAwards;
  }
  function recordAttempt(detail,challenge,op){
    const record=profileRecord(),key=sectionKey(detail.level,op),mastered=detail.correct>=3&&detail.total>=5;
    record.attempts.push({level:detail.level,op,challenge,correct:detail.correct,total:detail.total,date:new Date().toISOString()});
    record.attempts=record.attempts.slice(-500);
    if(mastered){record.mastered[`${key}:${challenge}`]=true;record.unlocked[key]=Math.max(record.unlocked[key]||1,Math.min(20,challenge+1));}
    save();return {mastered,newAwards:evaluateAwards()};
  }
  function setActive(id){
    if(!profiles.some(profile=>profile.id===id))return;
    activeId=id;save();root.dispatchEvent(new CustomEvent('worksheet:profile-changed',{detail:{id}}));
    renderAll();
  }
  function addProfile(name){
    const clean=cleanName(name);
    if(clean.length<2)return {ok:false,message:'Enter a learner name with at least 2 letters.'};
    if(profiles.some(profile=>profile.name.toLowerCase()===clean.toLowerCase()))return {ok:false,message:'That learner already exists.'};
    const id=`learner-${Date.now().toString(36)}`;profiles.push({id,name:clean});save();setActive(id);return {ok:true,id};
  }
  function installProfiles(){
    const home=document.getElementById('app-home'),subtitle=document.getElementById('app-subtitle');
    const panel=make('section','learner-panel');panel.setAttribute('aria-label','Learner profile');
    const label=make('label','','Learner: '),select=make('select','learner-select'),input=make('input','learner-name'),button=make('button','add-learner','Add learner'),reset=make('button','reset-learner','Reset progress'),remove=make('button','remove-learner','Remove learner'),status=make('p','learner-status');
    input.placeholder='First name or nickname';input.maxLength=24;button.type='button';reset.type='button';remove.type='button';label.append(select);panel.append(label,input,button,reset,remove,status);subtitle.after(panel);
    function options(){select.replaceChildren(...profiles.map(profile=>{const option=make('option','',profile.name);option.value=profile.id;option.selected=profile.id===activeId;return option;}));}
    select.addEventListener('change',()=>setActive(select.value));
    button.addEventListener('click',()=>{const result=addProfile(input.value);status.textContent=result.ok?'Learner added. Progress will be saved separately.':result.message;if(result.ok){input.value='';options();}});
    reset.addEventListener('click',()=>{if(!confirm(`Reset all Worksheet Hub challenge progress and awards for ${profiles.find(item=>item.id===activeId).name}? Stars are kept.`))return;records[activeId]={attempts:[],mastered:{},unlocked:{},awards:[]};save();status.textContent='Progress and awards reset. Stars were kept.';renderAll();});
    remove.addEventListener('click',()=>{if(profiles.length===1){status.textContent='Keep at least one learner profile.';return;}const profile=profiles.find(item=>item.id===activeId);if(!confirm(`Remove ${profile.name} and this learner's saved Worksheet Hub progress?`))return;delete records[activeId];profiles=profiles.filter(item=>item.id!==activeId);activeId=profiles[0].id;save();root.dispatchEvent(new CustomEvent('worksheet:profile-changed',{detail:{id:activeId}}));status.textContent='Learner removed.';renderAll();});
    input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();button.click();}});
    panel._refresh=options;options();
    document.querySelectorAll('.level-card').forEach((card,index)=>{
      const heading=card.querySelector('h2,h3,.level-title,strong');
      if(heading)heading.textContent=levelNames[index];
    });
  }
  function installPlacementCheck(){
    const home=document.getElementById('app-home'),button=make('button','placement-toggle','🧭 Help me choose a level');button.type='button';
    const panel=make('section','placement-check');panel.hidden=true;panel.innerHTML='<h2>Find a comfortable starting point</h2><p>Try these five questions with a grown-up. This is a guide, not a test.</p>';
    const questions=[
      ['Count the shells: 🐚🐚🐚🐚🐚🐚','6',['5','6','7']],
      ['What is 8 + 5?','13',['12','13','14']],
      ['What is 6 × 4?','24',['18','24','28']],
      ['What is 3.5 + 1.2?','4.7',['4.5','4.7','5.7']],
      ['What is 25% of 80?','20',['15','20','25']]
    ];
    questions.forEach(([prompt,answer,choices],index)=>{const field=make('fieldset','placement-question');field.dataset.answer=answer;field.append(make('legend','',`${index+1}. ${prompt}`));choices.forEach(choice=>{const label=make('label','');const input=document.createElement('input');input.type='radio';input.name=`placement-${index}`;input.value=choice;label.append(input,document.createTextNode(` ${choice}`));field.append(label);});panel.append(field);});
    const check=make('button','placement-check-button','Show recommendation'),result=make('p','placement-result');check.type='button';panel.append(check,result);
    check.addEventListener('click',()=>{let consecutive=0;for(const field of panel.querySelectorAll('fieldset')){const chosen=field.querySelector('input:checked');if(chosen?.value===field.dataset.answer)consecutive++;else break;}const level=Math.min(5,Math.max(1,consecutive+1));result.textContent=`Recommended starting point: ${levelNames[level-1]} (Skill Level ${level}). You can change levels at any time.`;const record=profileRecord();record.placement={level,date:new Date().toISOString()};save();});
    button.addEventListener('click',()=>{panel.hidden=!panel.hidden;button.textContent=panel.hidden?'🧭 Help me choose a level':'Close level helper';});
    home.querySelector('.path-wrap')?.before(button,panel);
  }
  function installCurriculumGuidance(){
    document.querySelectorAll('.card[data-target]').forEach(card=>{
      const topic=card.dataset.target.split('-section-')[1],details=strandMap[topic]||['Practice','Skill practice'];
      const activityName=card.textContent.trim();
      const badge=make('small',`strand-badge ${details[0]==='Enrichment'?'enrichment':''}`,details[0]);card.append(badge);
      card.setAttribute('aria-label',`${activityName}. ${details[1]}.`);
    });
    document.querySelectorAll('.section:not([id$="-home"])').forEach(section=>{
      const level=Number(section.id[1]),topic=section.id.split('-section-')[1],details=strandMap[topic]||['Practice','Skill practice'];
      const title=section.querySelector('h2')?.textContent||'Practice';
      const crumb=make('nav','breadcrumb');crumb.setAttribute('aria-label','You are here');crumb.textContent=`${levelNames[level-1]} › ${details[0]} › ${title}`;
      section.querySelector('.back-btn')?.after(crumb);
      const note=make('p','curriculum-note',`${details[1]}. Start with the worked example, then practise independently.`);section.querySelector('.section-sub')?.after(note);
      const controls=section.querySelector('.controls');if(!controls)return;
      const speak=make('button','read-aloud','🔊 Read instructions');speak.type='button';
      speak.addEventListener('click',()=>{
        if(!('speechSynthesis' in root)){section.querySelector('.worksheet-feedback').textContent='Spoken instructions are not available in this browser.';return;}
        root.speechSynthesis.cancel();
        const question=[...section.querySelectorAll('.problem,.shape-card,.wp-answer')].slice(0,1).map(item=>item.textContent.trim()).join(' ');
        const words=[title,section.querySelector('.section-sub')?.textContent,section.querySelector('.worked-example')?.textContent,question].filter(Boolean).join('. ');
        root.speechSynthesis.speak(new SpeechSynthesisUtterance(words));
      });controls.append(speak);
    });
  }
  function operation(section){const level=Number(section.id[1]);return document.getElementById(`l${level}-mathOp`)?.value||'add';}
  function installChallengePath(section){
    const level=Number(section.id[1]),panel=make('section','challenge-path');
    const heading=make('div','challenge-heading'),title=make('strong','','Practice path'),meta=make('span','challenge-meta'),select=make('select','challenge-select'),mode=make('button','worksheet-mode','Custom printable');
    select.setAttribute('aria-label','Choose challenge');mode.type='button';
    for(let n=1;n<=20;n++){const option=make('option','',`Challenge ${n}`);option.value=String(n);select.append(option);}
    heading.append(title,meta);panel.append(heading,select,mode);section.querySelector('.section-sub')?.after(panel);
    let custom=false;
    function refresh(){
      const op=operation(section),key=sectionKey(level,op),record=profileRecord(),unlocked=record.unlocked[key]||1,current=Number(section.dataset.challenge||1);
      [...select.options].forEach(option=>{const n=Number(option.value),done=record.mastered[`${key}:${n}`];option.disabled=n>unlocked;option.textContent=`${done?'✓ ':''}Challenge ${n}${n>unlocked?' 🔒':''}`;});
      select.value=String(Math.min(current,unlocked));
      const done=Object.keys(record.mastered).filter(item=>item.startsWith(key+':')).length;
      const band=Number(select.value)<=7?'Guided':Number(select.value)<=14?'Independent':'Reasoning';
      meta.textContent=custom?'Choose any worksheet size':`${done}/20 mastered · ${band} · pass with 3 of 5`;
      const count=document.getElementById(`l${level}-mathCount`);if(count)count.disabled=!custom;
      panel.classList.toggle('custom-mode',custom);mode.textContent=custom?'Return to challenges':'Custom printable';
    }
    function loadChallenge(n){
      custom=false;section.dataset.challenge=String(n);const op=operation(section);core.getChallenge(level,op,n);
      document.getElementById(`l${level}-mathRegen`).click();refresh();
    }
    select.addEventListener('change',()=>loadChallenge(Number(select.value)));
    mode.addEventListener('click',()=>{custom=!custom;if(custom)delete section.dataset.challenge;else loadChallenge(Number(select.value));refresh();document.getElementById(`l${level}-mathRegen`).click();});
    document.getElementById(`l${level}-mathOp`)?.addEventListener('change',()=>{section.dataset.challenge='1';setTimeout(()=>loadChallenge(1),0);});
    section.dataset.challenge='1';panel._refresh=refresh;panel._load=loadChallenge;loadChallenge(1);
  }
  function renderDashboard(){
    const box=document.querySelector('.parent-progress');if(!box)return;
    let dashboard=box.querySelector('.progress-dashboard');if(!dashboard){dashboard=make('div','progress-dashboard');box.append(dashboard);}
    const stats=summary(),record=profileRecord(),profile=profiles.find(item=>item.id===activeId);
    const recent=record.attempts.slice(-5),weak=recent.filter(item=>item.correct<3).at(-1),next=weak?`Repeat Level ${weak.level} ${weak.op}, Challenge ${weak.challenge}.`:'Continue the next unlocked challenge.';
    dashboard.innerHTML=`<h3>${profile.name}'s progress</h3><div class="progress-stats"><span><b>${stats.attempts}</b> attempts</span><span><b>${stats.mastered}</b> mastered</span><span><b>${record.awards.length}/20</b> awards</span></div><p><strong>Recommended next step:</strong> ${next}</p><div class="parent-actions"><button type="button" class="open-recommendation">Open recommended practice</button><button type="button" class="print-progress">Print progress report</button><button type="button" class="download-progress">Download backup</button><label class="restore-progress">Restore backup<input type="file" accept="application/json,.json"></label></div><p class="backup-note">Backups contain learner names and practice history. Keep the downloaded file private. Restoring adds profiles without deleting current progress.</p><p class="backup-status" role="status" aria-live="polite"></p><div class="award-grid" aria-label="Awards">${awards.map(([id,title])=>`<span class="${record.awards.includes(id)?'earned':''}" title="${title}">${record.awards.includes(id)?'🏅':'○'} ${title}</span>`).join('')}</div>`;
    dashboard.querySelector('.open-recommendation').addEventListener('click',()=>{
      const target=weak||{level:1,op:'add',challenge:1};
      document.querySelector(`.level-card[data-level="${target.level}"]`)?.click();
      document.querySelector(`#level-${target.level} .card[data-target$="-section-math"]`)?.click();
      const operationSelect=document.getElementById(`l${target.level}-mathOp`);if(operationSelect&&[...operationSelect.options].some(option=>option.value===target.op)){operationSelect.value=target.op;operationSelect.dispatchEvent(new Event('change',{bubbles:true}));}
      setTimeout(()=>{const challengeSelect=document.querySelector(`#l${target.level}-section-math .challenge-select`);if(challengeSelect){challengeSelect.value=String(target.challenge);challengeSelect.dispatchEvent(new Event('change',{bubbles:true}));}},0);
    });
    dashboard.querySelector('.download-progress').addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify(backupObject(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`worksheet-hub-progress-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
    });
    dashboard.querySelector('.restore-progress input').addEventListener('change',event=>{
      const file=event.target.files?.[0],status=dashboard.querySelector('.backup-status');if(!file)return;if(file.size>2_000_000){status.textContent='That backup file is too large.';event.target.value='';return;}
      const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(String(reader.result));validateBackup(data);if(!confirm('Restore these learner profiles? Current profiles will be kept.'))return;const count=importBackup(data);status.textContent=`Restored ${count} learner ${count===1?'profile':'profiles'}.`;}catch(error){status.textContent=error.message;}finally{event.target.value='';}};reader.onerror=()=>{status.textContent='The backup file could not be read.';};reader.readAsText(file);
    });
    dashboard.querySelector('.print-progress').addEventListener('click',()=>{
      const host=make('main','progress-report');host.id='progress-report';const earned=awards.filter(([id])=>record.awards.includes(id)).map(([,title])=>title);
      host.innerHTML=`<header><h1>Worksheet Hub progress report</h1><p>${profile.name} · ${new Date().toLocaleDateString()}</p></header><section><h2>Summary</h2><p>${stats.attempts} attempts · ${stats.mastered} challenges mastered · ${record.awards.length}/20 awards</p><h2>Recommended next step</h2><p>${next}</p><h2>Recent practice</h2><table><thead><tr><th>Level</th><th>Skill</th><th>Challenge</th><th>Score</th></tr></thead><tbody>${record.attempts.slice(-10).reverse().map(item=>`<tr><td>${item.level}</td><td>${item.op}</td><td>${item.challenge}</td><td>${item.correct}/${item.total}</td></tr>`).join('')||'<tr><td colspan="4">No checked challenges yet.</td></tr>'}</tbody></table><h2>Awards earned</h2><p>${earned.join(' · ')||'No awards earned yet.'}</p></section><footer>Practice history is stored on this device and is not a school-grade assessment.</footer>`;
      document.body.append(host);document.body.classList.add('printing-report');const clean=()=>{host.remove();document.body.classList.remove('printing-report');};root.addEventListener('afterprint',clean,{once:true});root.print();
    });
  }
  function renderAll(){
    document.querySelector('.learner-panel')?._refresh?.();document.querySelectorAll('.challenge-path').forEach(panel=>panel._refresh?.());renderDashboard();
    const profile=profiles.find(item=>item.id===activeId),date=new Date().toLocaleDateString();
    document.querySelectorAll('.name-date').forEach(row=>{const parts=row.querySelectorAll('div');if(parts[0]?.querySelector('span'))parts[0].querySelector('span').textContent=profile.name;if(parts[1]?.querySelector('span'))parts[1].querySelector('span').textContent=date;});
  }
  installProfiles();
  installPlacementCheck();
  installCurriculumGuidance();
  document.querySelectorAll('.section[id$="-math"]').forEach(installChallengePath);
  root.addEventListener('worksheet:checked',event=>{
    const section=document.getElementById(event.detail.sectionId);if(!section?.id.endsWith('-math')||!section.dataset.challenge)return;
    const result=recordAttempt(event.detail,Number(section.dataset.challenge),operation(section));
    const feedback=section.querySelector('.worksheet-feedback');
    if(result.mastered)feedback.textContent+=` Challenge mastered! Challenge ${Math.min(20,Number(section.dataset.challenge)+1)} is ready.`;
    else feedback.textContent+=' Score at least 3 of 5 to unlock the next challenge.';
    if(result.newAwards.length)feedback.textContent+=` New award: ${result.newAwards.join(', ')}.`;
    renderAll();
  });
  renderAll();
  root.WorksheetProgression={addProfile,setActive,recordAttempt,summary,backupObject,validateBackup,importBackup,awards,levelNames};
})(window);
