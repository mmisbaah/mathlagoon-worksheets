const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('web app manifest is valid and scoped to Worksheet Hub',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.start_url,'/');assert.equal(manifest.display,'standalone');assert.ok(manifest.icons.some(icon=>icon.src==='/assets/app-icon.svg'));
});
test('service worker caches the complete app shell and cleans older versions',()=>{
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  for(const asset of ['/index.html','/assets/core.js','/assets/progression.js','/assets/pwa.js'])assert.ok(sw.includes(asset),asset);
  assert.match(sw,/worksheet-hub-v4/);assert.match(sw,/caches\.delete/);assert.match(sw,/request\.mode==='navigate'/);assert.match(sw,/\['script','style'\]/);
});
test('build copies offline entrypoints',()=>{
  const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');assert.match(build,/manifest\.webmanifest/);assert.match(build,/sw\.js/);
});
test('versioned critical assets bypass older offline caches',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const asset of ['assets/interface.css?v=5','assets/core.js?v=6','assets/progression.js?v=5','assets/printing.js?v=2'])assert.ok(html.includes(asset),asset);
});
