// Builds a single self-contained file: node build.js  ->  streakwise-single.html
const fs=require('fs');
let h=fs.readFileSync('index.html','utf8');
h=h.replace('<link rel="stylesheet" href="css/style.css">','<style>\n'+fs.readFileSync('css/style.css','utf8')+'\n</style>');
h=h.replace(/<script src="(js\/[^"]+)"><\/script>/g,(m,f)=>'<script>\n'+fs.readFileSync(f,'utf8')+'\n</script>');
fs.writeFileSync('streakwise-single.html',h); console.log('built',(h.length/1024).toFixed(0)+' KB');
