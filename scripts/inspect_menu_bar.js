const fs = require('fs');
const code = fs.readFileSync('static/coderescue/assets/index-dYeWjqcp.js', 'utf8');

console.log('--- MENU BAR REGION (209700 - 211600) ---');
console.log(code.slice(209700, 211600));
