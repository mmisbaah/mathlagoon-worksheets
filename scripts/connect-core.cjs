// Mechanical migration to the shared generator and strict answer parser.
const fs=require('node:fs');
const path=require('node:path');
for(let level=1;level<=5;level++) {
  const file=path.join(__dirname,'..','assets',`level-${level}.js`);
  let code=fs.readFileSync(file,'utf8');
  const start=code.indexOf('    mathProblems = [];',code.indexOf('  function genMathProblems'));
  const end=code.indexOf('    mathChecked = false;',start);
  if(start<0||end<0) throw new Error('Generator boundary missing');
  code=code.slice(0,start)+`    mathProblems = WorksheetCore.generate(${level}, op, count);\n`+code.slice(end);
  code=code.replace(/Math\.abs\((parsedVal|WorksheetCore\.parseAnswer\(val\)) - ([^\n;]+?)\) < (0\.01|0\.2)/g,'Math.abs($1 - $2) < 1e-8');
  fs.writeFileSync(file,code);
}
