const katex=require('./package/dist/katex.js');const fs=require('fs');
const f=JSON.parse(fs.readFileSync('/tmp/f.json'));let bad=[];
for(const [tex,d] of f){try{katex.renderToString(tex,{displayMode:d,throwOnError:true,strict:'error'})}catch(e){bad.push(tex.slice(0,60)+' => '+e.message.slice(0,90))}}
console.log(bad.length?('ERRORES '+bad.length+'\n'+bad.join('\n')):'OK, '+f.length+' fórmulas compilan');
