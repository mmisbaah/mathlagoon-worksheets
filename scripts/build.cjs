const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'index.html'),path.join(root,'dist/index.html'));
fs.copyFileSync(path.join(root,'manifest.webmanifest'),path.join(root,'dist/manifest.webmanifest'));
fs.copyFileSync(path.join(root,'sw.js'),path.join(root,'dist/sw.js'));
fs.cpSync(path.join(root,'assets'),path.join(root,'dist/assets'),{recursive:true});
console.log('Static site ready in dist/');
