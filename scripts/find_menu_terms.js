const fs = require('fs');

const code = fs.readFileSync('static/coderescue/assets/index-dYeWjqcp.js', 'utf8');

const terms = ['Standings', 'Coordinator', 'Tools', 'View Live Standings', 'Coordinator Command Desk'];
for (const term of terms) {
  let count = 0;
  let pos = 0;
  while ((pos = code.indexOf(term, pos)) !== -1) {
    count++;
    if (count <= 3) {
      console.log(`Found term "${term}" at pos ${pos}:`);
      console.log(code.slice(Math.max(0, pos - 80), Math.min(code.length, pos + 120)));
      console.log('---');
    }
    pos += term.length;
  }
  console.log(`Total count for "${term}": ${count}`);
  console.log('=============================');
}
