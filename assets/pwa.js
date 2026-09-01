(function(){
  'use strict';
  const chrome=document.getElementById('app-chrome');
  const status=document.createElement('span');status.className='connection-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  function update(){const online=navigator.onLine;status.textContent=online?'Online':'Offline — saved activities available';status.classList.toggle('offline',!online);}
  chrome?.querySelector(':scope > div:last-child')?.prepend(status);update();
  window.addEventListener('online',update);window.addEventListener('offline',update);
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{status.textContent='Online · offline setup unavailable';}));
})();
