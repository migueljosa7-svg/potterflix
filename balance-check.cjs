const fs=require('fs');
const src=fs.readFileSync('src/data/fallbackCatalog.ts','utf8');
const lines=src.split(/\r?\n/);
let d=0;
lines.forEach((line,i)=>{
  const stripped=line.split('`').map((s,k)=> k%2 ? '``' : s).join('');
  for (const ch of stripped){ if(ch==='{')d++; if(ch==='}')d--; }
  if (/^(export )?(function|const|export const)/.test(line)) {
    console.log(String(d).padStart(3)+'  <- line '+(i+1)+': '+line.slice(0,58));
  }
});
console.log('FINAL balance:', d);