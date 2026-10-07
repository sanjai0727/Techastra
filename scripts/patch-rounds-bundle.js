const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`[Skip] File not found: ${filePath}`);
        return;
    }

    let s = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const replacements = [
        // Round 1
        ['"20 Minutes \\u2022 10 Questions"', '"15 Minutes \\u2022 10 Questions"'],
        ['"Max Score: 100 Points (10 pts/question)"', '"Max Score: 10 Marks (1 mark/question)"'],
        ['(standard: 50% cutoff) advance to Round 2.', '(standard: 50% cutoff, 5 marks) advance to Round 2.'],

        // Round 2
        ['"25 Minutes \\u2022 5 Questions"', '"20 Minutes \\u2022 5 Questions"'],
        ['"20 Minutes \\u2022 10 Questions"', '"20 Minutes \\u2022 5 Questions"'],
        ['"Max Score: 100 Points (20 pts/question)"', '"Max Score: 20 Marks (4 marks/question)"'],
        ['"Max Score: 20 Marks (2 marks/question)"', '"Max Score: 20 Marks (4 marks/question)"'],
        ['Top performers qualify for the high-stakes Grand Finale: Round 3.', 'Top performers achieving the cutoff (10 marks) qualify for the high-stakes Grand Finale: Round 3.'],

        // Round 3
        ['"40 Minutes \\u2022 1 Major Broken System"', '"25 Minutes \\u2022 1 Question"'],
        ['"Max Score: 100 Points"', '"Max Score: 5 Marks (5 marks/question)"'],

        // Cumulative Scoring
        ['"300 Cumulative Maximum"', '"35 Marks Cumulative Maximum"'],
        ['Cumulative points earned across Rounds 1, 2, and 3 (Max 300 pts).', 'Cumulative marks earned across Rounds 1, 2, and 3 (Max 35 Marks: R1=10, R2=20, R3=5).'],

        // Challenges / Tracks
        ['10 Questions \\u2022 20 Minutes \\u2022 100 Max Points (10 pts/question) \\u2022 Basic Difficulty', '10 Questions \\u2022 15 Minutes \\u2022 10 Max Marks (1 mark/question) \\u2022 Basic Difficulty'],
        ['5 Questions \\u2022 25 Minutes \\u2022 100 Max Points (20 pts/question) \\u2022 Intermediate Difficulty', '5 Questions \\u2022 20 Minutes \\u2022 20 Max Marks (4 marks/question) \\u2022 Intermediate Difficulty'],
        ['1 Comprehensive Broken System \\u2022 40 Minutes \\u2022 100 Max Points \\u2022 Advanced Difficulty', '1 Comprehensive Broken System (1 Question) \\u2022 25 Minutes \\u2022 5 Max Marks (5 marks/question) \\u2022 Advanced Difficulty'],

        // Directive Rules
        ['20 Minutes \\u2022 10 Faults \\u2022 100 Points (Rapid syntax, typo, and runtime panic remediation).', '15 Minutes \\u2022 10 Faults (10 Questions) \\u2022 10 Marks (1 Mark each) (Rapid syntax, typo, and runtime panic remediation).'],
        ['25 Minutes \\u2022 5 Traps \\u2022 100 Points (Deep logical hazard resolution: mutable state, infinite loops, boundary faults).', '20 Minutes \\u2022 5 Traps (5 Questions) \\u2022 20 Marks (4 Marks each) (Deep logical hazard resolution: mutable state, infinite loops, boundary faults).'],
        ['40 Minutes \\u2022 1 Legacy System \\u2022 100 Points (Multi-module legacy system resuscitation under production clock pressure).', '25 Minutes \\u2022 1 System (1 Question) \\u2022 5 Marks (5 Marks) (Multi-module legacy system resuscitation under production clock pressure).'],
        ['Max Total Score: 300 Points across all three completed incident rounds.', 'Max Total Score: 35 Marks across all three completed incident rounds.']
    ];

    for (const [target, repl] of replacements) {
        if (s.includes(target)) {
            s = s.split(target).join(repl);
            modified = true;
            console.log(`[Patched] ${target.slice(0, 45)}...`);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, s, 'utf8');
        console.log(`[Success] Updated ${filePath}`);
    } else {
        console.log(`[Info] No changes needed in ${filePath}`);
    }
}

// Patch all active static bundle files
const jsDirs = [
    path.resolve(__dirname, '../static/os/static/js'),
    path.resolve(__dirname, '../public/os/static/js')
];

jsDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            if (file.startsWith('main.') && file.endsWith('.js')) {
                patchFile(path.join(dir, file));
            }
        });
    }
});
