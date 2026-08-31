const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.copyFileSync(path.join(root,'index.html'),path.join(root,'dist/index.html'));
fs.cpSync(path.join(root,'assets'),path.join(root,'dist/assets'),{recursive:true});
console.log('Static site ready in dist/');
