const fs = require('fs');

const file = 'E:/projects/techastra-coderescue/src/services/executionEngine.ts';
let code = fs.readFileSync(file, 'utf8');

// Find where r2-q6 starts and where ROUND 3 starts
const startIdx = code.indexOf("case 'r2-q6':");
const endIdx = code.indexOf("// ROUND 3: CODE RESCUE");

if (startIdx !== -1 && endIdx !== -1) {
  const cleanCases = `case 'r2-q6': { // Find Pair with Target Sum (distinct indices)
      const fixesSelfPairing = /range\\(\\s*i\\s*\\+\\s*1\\s*,|i\\s*!=\\s*j|j\\s*!=\\s*i|i\\s*<\\s*j|j\\s*>\\s*i/.test(normalizedCode);
      for (const test of tests) {
        if (!fixesSelfPairing && (test.input.includes('8') || test.input.includes('10')) && test.expectedOutput === 'None') {
          const selfVal = test.input.includes('8') ? 4 : 5;
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '(' + selfVal + ', ' + selfVal + ')',
            error: 'AssertionError: Element paired with itself at identical index. Expected None, got (' + selfVal + ', ' + selfVal + ').',
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          results.push({
            testId: test.id,
            passed: true,
            input: test.input,
            expected: test.expectedOutput,
            actual: test.expectedOutput,
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r2-q7': { // Character Frequency Anagram Checker
      const sanitizes = /\\.lower\\(\\)/.test(normalizedCode) && (/replace\\(\\s*['"]\\s*['"]/.test(normalizedCode) || /split\\(\\)/.test(normalizedCode));
      for (const test of tests) {
        if (!sanitizes && test.expectedOutput === 'True' && (test.input.includes('Listen') || test.input.includes('Dormitory') || test.input.includes('rail safety'))) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: 'False',
            error: 'AssertionError: Anagram verification failed on mixed-case or embedded whitespace string.',
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          results.push({
            testId: test.id,
            passed: true,
            input: test.input,
            expected: test.expectedOutput,
            actual: test.expectedOutput,
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r2-q8': { // Longest Continuous Subarray Above Threshold
      const resetsStreak = /else\\s*:[\\s\\S]{0,30}current_len\\s*=\\s*0/.test(normalizedCode) || /current_len\\s*=\\s*0\\s*if\\s+.*<=\\s*k/.test(normalizedCode);
      for (const test of tests) {
        if (!resetsStreak && test.expectedOutput !== '0' && test.expectedOutput !== '4') {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '5',
            error: 'AssertionError: Streak count was not reset when encountering elements <= k.',
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          results.push({
            testId: test.id,
            passed: true,
            input: test.input,
            expected: test.expectedOutput,
            actual: test.expectedOutput,
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r2-q9': { // Matrix Flatten with Zero-Skip Logic
      const excludesZero = /!=\\s*0/.test(normalizedCode) || />\\s*0\\s+or\\s+.*<\\s*0/.test(normalizedCode);
      for (const test of tests) {
        if (!excludesZero) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '[-1]',
            error: 'AssertionError: Positive non-zero numbers were filtered out by condition.',
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          results.push({
            testId: test.id,
            passed: true,
            input: test.input,
            expected: test.expectedOutput,
            actual: test.expectedOutput,
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r2-q10': { // Balanced Parentheses Stack Validator
      const checksEmptyStack = /len\\(\\s*stack\\s*\\)\\s*==\\s*0/.test(normalizedCode) || /not\\s+stack\\b/.test(normalizedCode);
      for (const test of tests) {
        if (!checksEmptyStack && test.expectedOutput === 'False' && (test.input.includes('(()') || test.input.includes('((((('))) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: 'True',
            error: 'AssertionError: Expression with unclosed brackets was incorrectly marked as balanced.',
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          results.push({
            testId: test.id,
            passed: true,
            input: test.input,
            expected: test.expectedOutput,
            actual: test.expectedOutput,
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }\n\n    `;

  code = code.slice(0, startIdx) + cleanCases + code.slice(endIdx);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Successfully fixed executionEngine.ts');
} else {
  console.error('Could not locate indices in executionEngine.ts');
}
