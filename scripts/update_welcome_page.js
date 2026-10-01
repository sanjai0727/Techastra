const fs = require('fs');

const file = 'E:/projects/techastra-coderescue/src/pages/WelcomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove leaderboard button
content = content.replace(
  /<button\s+onClick=\{\(\)\s*=>\s*setView\('leaderboard'\)\}[\s\S]*?<\/button>/,
  ''
);

// 2. Update Round 1
content = content.replace('10 Questions (10 pts each)', '10 Questions (1 Mark each)');
content = content.replace(/<span className="font-mono text-cyan-400">20 Minutes<\/span>/, '<span className="font-mono text-cyan-400">15 Minutes</span>');
content = content.replace(/<span className="font-mono font-bold text-slate-200">100 Points<\/span>/, '<span className="font-mono font-bold text-slate-200">10 Marks</span>');

// 3. Update Round 2
content = content.replace('5 Questions (20 pts each)', '10 Questions (2 Marks each)');
content = content.replace(/<span className="font-mono text-amber-400">25 Minutes<\/span>/, '<span className="font-mono text-amber-400">20 Minutes</span>');
content = content.replace(/<span className="font-mono font-bold text-slate-200">100 Points<\/span>/, '<span className="font-mono font-bold text-slate-200">20 Marks</span>');

// 4. Update Round 3
content = content.replace('1 Master Broken System', '1 Question (5 Marks)');
content = content.replace(/<span className="font-mono text-rose-400">40 Minutes<\/span>/, '<span className="font-mono text-rose-400">25 Minutes</span>');
content = content.replace(/<span className="font-mono font-bold text-slate-200">100 Points<\/span>/, '<span className="font-mono font-bold text-slate-200">5 Marks</span>');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated WelcomePage.tsx');
