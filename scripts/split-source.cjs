// One-time mechanical extraction; preserves the original level activities.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!html.includes('/* ===== Level 1 JS ===== */')) throw new Error('Already split');
fs.mkdirSync(path.join(root, 'assets'), {recursive:true});
const style = html.match(/<style>([\s\S]*?)<\/style>/);
fs.writeFileSync(path.join(root, 'assets/activities.css'), style[1]);
html = html.replace(style[0], '<link rel="stylesheet" href="assets/activities.css">\n<link rel="stylesheet" href="assets/interface.css">\n<link rel="stylesheet" href="assets/print.css" media="print">');
const script = html.match(/<script>([\s\S]*?)<\/script>/);
const source = script[1];
const markers = [1,2,3,4,5].map(n=>source.indexOf(`/* ===== Level ${n} JS ===== */`));
const shell = source.indexOf('/* =========================================================');
for (let i=0;i<5;i++) {
  let code = source.slice(markers[i], i===4?shell:markers[i+1]);
  code = code.replaceAll('parseInt(val, 10)', 'WorksheetCore.parseAnswer(val)')
    .replaceAll('parseFloat(val)', 'WorksheetCore.parseAnswer(val)');
  // Short, age-appropriate initial worksheets; selectors are updated below.
  code = code.replace(/genMathProblems\('(add|mul)', 30\)/g, `genMathProblems('$1', ${i===0?5:10})`);
  fs.writeFileSync(path.join(root, `assets/level-${i+1}.js`), code);
}
let shellCode = source.slice(shell);
// The print module owns the public print callback now.
shellCode = shellCode.slice(0, shellCode.indexOf('  /* ---------- Print as image')) + '\n})();\n';
fs.writeFileSync(path.join(root, 'assets/shell.js'), shellCode);
html = html.replace(script[0], ['core','learning-data','level-1','level-2','level-3','level-4','level-5','shell','interface','printing'].map(n=>`<script defer src="assets/${n}.js"></script>`).join('\n'));
html = html.replace(/(<select id="l([1-5])-mathCount">)[\s\S]*?<\/select>/g, (_,tag,level)=>tag+[5,10,20,30,40].map(n=>`<option value="${n}"${n===(level==='1'?5:10)?' selected':''}>${n}</option>`).join('')+'</select>');
html = html.replaceAll('Addition, subtraction, multiplication and division practice','Choose an operation. Try the example, then answer each question.');
fs.writeFileSync(path.join(root, 'index.html'), html);
