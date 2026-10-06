import { Question, TestCase, TestResult, ExecutionResult } from '../types/competition';

/**
 * Validates basic Python syntax before executing code.
 * Detects missing colons, unmatched brackets, and invalid keywords.
 */
function checkSyntax(code: string): { hasError: boolean; error?: string } {
  const lines = code.split('\n');

  // Check brackets matching
  const stack: { char: string; line: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comment lines
    if (trimmed.startsWith('#')) continue;

    // Check missing colons on def/for/while/if/elif/else/try/except/class
    const colonKeywords = /^(def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)|for\s+.*in\s+.*|while\s+.*|if\s+.*|elif\s+.*|else|try|except.*|class\s+.*)/;
    if (colonKeywords.test(trimmed) && !trimmed.endsWith(':')) {
      return {
        hasError: true,
        error: `SyntaxError: expected ':'\n  File "solution.py", line ${i + 1}\n    ${line.trim()}\n    ${' '.repeat(line.trim().length)}^`
      };
    }

    // Bracket balance check
    for (const ch of line) {
      if (ch === '(' || ch === '[' || ch === '{') {
        stack.push({ char: ch, line: i + 1 });
      } else if (ch === ')' || ch === ']' || ch === '}') {
        const top = stack.pop();
        if (!top || top.char !== pairs[ch]) {
          return {
            hasError: true,
            error: `SyntaxError: closing parenthesis '${ch}' does not match opening parenthesis '${top?.char || 'none'}'\n  File "solution.py", line ${i + 1}`
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack.pop()!;
    return {
      hasError: true,
      error: `SyntaxError: unexpected EOF while parsing (unclosed '${unclosed.char}' on line ${unclosed.line})`
    };
  }

  return { hasError: false };
}

/**
 * Simulates Python evaluation for a specific question given user code and test cases.
 */
function evaluateQuestion(question: Question, code: string, tests: TestCase[]): TestResult[] {
  const results: TestResult[] = [];
  const normalizedCode = code.replace(/\r\n/g, '\n');

  switch (question.id) {
    // -------------------------------------------------------------
    // ROUND 1: BUG HUNT
    // -------------------------------------------------------------
    case 'r1-q1': { // Fix Function Header & Return
      const hasHeaderColon = /def\s+calculate_sum\s*\([^)]*\)\s*:/.test(normalizedCode);
      const hasReturn = /return\s+/.test(normalizedCode);

      for (const test of tests) {
        const [a, b] = test.input.split(',').map(s => parseInt(s.trim(), 10));
        if (!hasHeaderColon) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: 'None',
            error: `SyntaxError: expected ':' on function header`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (!hasReturn) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: 'None',
            error: `AssertionError: Function returned None (missing return statement)`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          const sum = a + b;
          results.push({
            testId: test.id,
            passed: sum.toString() === test.expectedOutput.trim(),
            input: test.input,
            expected: test.expectedOutput,
            actual: sum.toString(),
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r1-q2': { // Variable Scope & Typo (heigth -> height)
      const hasTypo = /\bheigth\b/.test(normalizedCode);
      for (const test of tests) {
        if (hasTypo) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `NameError: name 'heigth' is not defined. Did you mean: 'height'?\n  File "solution.py", line 2, in calculate_area`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          const [w, h] = test.input.split(',').map(s => parseFloat(s.trim()));
          const area = w * h;
          results.push({
            testId: test.id,
            passed: area.toString() === test.expectedOutput.trim(),
            input: test.input,
            expected: test.expectedOutput,
            actual: area.toString(),
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r1-q3': { // Even number condition
      const checksEven = /%\s*2\s*==\s*0/.test(normalizedCode) || /not\s*\(\s*.*%\s*2\s*\)/.test(normalizedCode);
      for (const test of tests) {
        const num = parseInt(test.input.trim(), 10);
        const actual = checksEven ? (num % 2 === 0 ? 'True' : 'False') : (num % 2 === 1 ? 'True' : 'False');
        results.push({
          testId: test.id,
          passed: actual === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual,
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r1-q4': { // List Index Out of Range
      const hasIndexError = /items\s*\[\s*len\s*\(\s*items\s*\)\s*\]/.test(normalizedCode);
      for (const test of tests) {
        if (hasIndexError) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `IndexError: list index out of range\n  File "solution.py", line 3, in print_first_element`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          const parsed = JSON.parse(test.input);
          const first = parsed[0]?.toString() ?? '';
          results.push({
            testId: test.id,
            passed: first === test.expectedOutput.trim(),
            input: test.input,
            expected: test.expectedOutput,
            actual: first,
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r1-q5': { // String Immutability / Reassignment
      const hasReassignment = /text\s*=\s*text\.replace\(/.test(normalizedCode) || /return\s+text\.replace\(/.test(normalizedCode);
      for (const test of tests) {
        const parts = test.input.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        const [orig, bad] = parts;
        const actual = hasReassignment ? orig.split(bad).join('***') : orig;
        results.push({
          testId: test.id,
          passed: actual === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual,
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r1-q6': { // Loop Accumulator Initialization
      const totalInsideLoop = /for\s+.*\n\s*total\s*=\s*0/.test(normalizedCode);
      for (const test of tests) {
        const nums: number[] = JSON.parse(test.input);
        let actual = '0';
        if (totalInsideLoop) {
          actual = nums.length > 0 ? (nums[nums.length - 1]).toString() : '0';
        } else {
          actual = nums.reduce((a, b) => a + b, 0).toString();
        }
        results.push({
          testId: test.id,
          passed: actual === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual,
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r1-q7': { // Dictionary Safe Lookup
      const usesGetOrDefault = /\.get\(.*,\s*0\)/.test(normalizedCode) || /if\s+.*in\s+/.test(normalizedCode) || /try:[\s\S]*except\s+KeyError:/.test(normalizedCode);
      for (const test of tests) {
        if (!usesGetOrDefault && test.expectedOutput === '0') {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `KeyError: 'Charlie'\n  File "solution.py", line 2, in get_student_score`,
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

    case 'r1-q8': { // Grade Classifier (if vs elif)
      const usesElifOrEarlyReturn = /elif\s+/.test(normalizedCode) || /return\s+['"]A['"][\s\S]*return\s+['"]B['"]/.test(normalizedCode);
      for (const test of tests) {
        const score = parseInt(test.input.trim(), 10);
        let actual = 'F';
        if (usesElifOrEarlyReturn) {
          if (score >= 90) actual = 'A';
          else if (score >= 75) actual = 'B';
          else if (score >= 50) actual = 'C';
          else actual = 'F';
        } else {
          // Faulty logic overwrites grade
          let grade = 'F';
          if (score >= 90) grade = 'A';
          if (score >= 75) grade = 'B';
          if (score >= 50) grade = 'C';
          actual = grade;
        }
        results.push({
          testId: test.id,
          passed: actual === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual,
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r1-q9': { // Factorial Base Case
      const hasBaseCase = /if\s+n\s*(<=|==)\s*1\s*:/.test(normalizedCode);
      for (const test of tests) {
        if (!hasBaseCase) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `RecursionError: maximum recursion depth exceeded while calling a Python object\n  File "solution.py", line 3, in factorial`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else {
          const n = parseInt(test.input.trim(), 10);
          let fact = 1;
          for (let i = 2; i <= n; i++) fact *= i;
          results.push({
            testId: test.id,
            passed: fact.toString() === test.expectedOutput.trim(),
            input: test.input,
            expected: test.expectedOutput,
            actual: fact.toString(),
            isHidden: !!test.isHidden,
            description: test.description
          });
        }
      }
      break;
    }

    case 'r1-q10': { // Discount Calculator Type Bug
      const convertsFloat = /float\(.*discount_percent.*\)/.test(normalizedCode) || /int\(.*discount_percent.*\)/.test(normalizedCode);
      for (const test of tests) {
        const isStringInput = test.input.includes('"');
        if (isStringInput && !convertsFloat) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `TypeError: unsupported operand type(s) for /: 'str' and 'int'\n  File "solution.py", line 3, in calculate_final_price`,
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

    // -------------------------------------------------------------
    // ROUND 2: LOGIC BREAKER
    // -------------------------------------------------------------
    case 'r2-q1': { // Missing element off-by-one
      const hasOffByOne = /range\(\s*len\(\s*numbers\s*\)\s*-\s*1\s*\)/.test(normalizedCode);
      for (const test of tests) {
        const nums: number[] = JSON.parse(test.input);
        let actual = 0;
        if (hasOffByOne) {
          for (let i = 0; i < nums.length - 1; i++) actual += nums[i];
        } else {
          for (let i = 0; i < nums.length; i++) actual += nums[i];
        }
        results.push({
          testId: test.id,
          passed: actual.toString() === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual: actual.toString(),
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r2-q2': { // Palindrome phrase with spaces & casing
      const handlesSanitization = /\.lower\(\)/.test(normalizedCode) && (/isalnum\(\)/.test(normalizedCode) || /replace\(\s*['"]\s*['"]/.test(normalizedCode));
      for (const test of tests) {
        const raw = test.input.replace(/^"|"$/g, '');
        let actual = 'False';
        if (handlesSanitization) {
          const cleaned = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
          const reversed = cleaned.split('').reverse().join('');
          actual = cleaned === reversed ? 'True' : 'False';
        } else {
          actual = raw === raw.split('').reverse().join('') ? 'True' : 'False';
        }
        results.push({
          testId: test.id,
          passed: actual === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual,
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r2-q3': { // Matrix Diagonal Sum double counting
      const dedupesCenter = /% 2 == 1/.test(normalizedCode) || /n % 2 != 0/.test(normalizedCode) || /total\s*-=\s*matrix\[.*\]\[.*\]/.test(normalizedCode);
      for (const test of tests) {
        const mat: number[][] = JSON.parse(test.input);
        const n = mat.length;
        let total = 0;
        for (let i = 0; i < n; i++) {
          total += mat[i][i];
          total += mat[i][n - 1 - i];
        }
        if (dedupesCenter && n % 2 === 1) {
          const mid = Math.floor(n / 2);
          total -= mat[mid][mid];
        }
        results.push({
          testId: test.id,
          passed: total.toString() === test.expectedOutput.trim(),
          input: test.input,
          expected: test.expectedOutput,
          actual: total.toString(),
          isHidden: !!test.isHidden,
          description: test.description
        });
      }
      break;
    }

    case 'r2-q4': { // Binary Search infinite loop
      const hasInfiniteLoop = /left\s*=\s*mid\b(?!\s*\+\s*1)/.test(normalizedCode);
      for (const test of tests) {
        if (hasInfiniteLoop) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `TimeLimitExceeded: Process timed out after 2000ms.\nInfinite loop detected: search range was not decremented (left = mid instead of mid + 1).`,
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

    case 'r2-q5': { // Mutable Default Argument
      const avoidsMutableDefault = /attendee_list\s*=\s*None/.test(normalizedCode);
      for (const test of tests) {
        if (!avoidsMutableDefault && test.input.includes('"Alice"') === false && !test.input.includes('["Admin"]')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: "['Alice', " + test.expectedOutput.slice(1),
            error: `AssertionError: State leak detected. Default mutable list retained entries from previous test invocations.`,
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

    // -------------------------------------------------------------
    // ROUND 3: CODE RESCUE (Flagship Broken Program)
    // -------------------------------------------------------------
    case 'r3-q1': {
      // Check for each of the 5 bugs:
      // 1. Syntax check for "for item in records" without colon
      const hasLoopColon = /for\s+item\s+in\s+records\s*:/.test(normalizedCode);
      // 2. Division by zero guard on average calculation
      const hasZeroDivisionGuard = /count\s*>\s*0/.test(normalizedCode) || /if\s+count\b/.test(normalizedCode) || /if\s+len\(valid_expenses\)/.test(normalizedCode);
      // 3. Category sorting
      const sortsCategories = /sorted\(categories\.items\(\)/.test(normalizedCode) || /categories\.items\(\)\.sort\(/.test(normalizedCode) || /key=lambda\s+x:\s*x\[0\]/.test(normalizedCode);
      // 4. Budget check comparison
      const hasCorrectBudgetCheck = /total\s*<=\s*budget_limit/.test(normalizedCode);
      // 5. Negative expense filter
      const filtersNegatives = /amt\s*>\s*0/.test(normalizedCode) || /item\[1\]\s*>\s*0/.test(normalizedCode);

      for (const test of tests) {
        if (!hasLoopColon) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `SyntaxError: expected ':'\n  File "rescue_module.py", line 8\n    for item in records\n                       ^`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        // Check empty records case
        if (test.input.startsWith('[],') && !hasZeroDivisionGuard) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `ZeroDivisionError: float division by zero\n  File "rescue_module.py", line 18, in analyze_expenses\n    average = total / count`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        // Check negative filter case
        if (test.input.includes('-50') && !filtersNegatives) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: "{'total': 50, ...}",
            error: `AssertionError: Negative expense was not filtered out. Expected total 100, received 50.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        // Check category sorting case
        if (test.input.includes('Zebra Supplies') && !sortsCategories) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: "{'categories': [('Zebra Supplies', 40), ('Apple Store', 60), ...]}",
            error: `AssertionError: Category summary list is not sorted alphabetically by category name.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        // Check budget boundary / comparison
        if (!hasCorrectBudgetCheck) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: `{'within_budget': ${test.expectedOutput.includes('True') ? 'False' : 'True'}}`,
            error: `AssertionError: within_budget logic inverted. Expected ${test.expectedOutput.includes('True') ? 'True' : 'False'}, received ${test.expectedOutput.includes('True') ? 'False' : 'True'}.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        // If all checks pass
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
      break;
    }

    default: {
      for (const test of tests) {
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
  }

  return results;
}

/**
 * Executes user code against visible tests (for "Run Code") or both visible and hidden tests (for "Submit Solution").
 */
export async function runCodeSimulation(
  question: Question,
  code: string,
  mode: 'run' | 'submit'
): Promise<ExecutionResult> {
  // Simulate realistic network / compilation latency
  const latency = Math.floor(Math.random() * 80) + 120;
  await new Promise(resolve => setTimeout(resolve, latency));

  // 1. Syntax check
  const syntaxCheck = checkSyntax(code);
  if (syntaxCheck.hasError) {
    const errorMsg = syntaxCheck.error || 'SyntaxError: invalid syntax';
    const failedTests: TestResult[] = (mode === 'run' ? question.visibleTests : [...question.visibleTests, ...question.hiddenTests]).map(t => ({
      testId: t.id,
      passed: false,
      input: t.input,
      expected: t.expectedOutput,
      actual: '',
      error: errorMsg,
      isHidden: !!t.isHidden,
      description: t.description
    }));

    return {
      status: 'COMPILATION_ERROR',
      visiblePassed: 0,
      visibleTotal: question.visibleTests.length,
      hiddenPassed: 0,
      hiddenTotal: mode === 'submit' ? question.hiddenTests.length : 0,
      output: errorMsg,
      error: errorMsg,
      executionTimeMs: Math.floor(Math.random() * 20) + 15,
      testResults: failedTests
    };
  }

  // 2. Evaluate tests
  const testsToRun = mode === 'run' 
    ? question.visibleTests 
    : [...question.visibleTests, ...question.hiddenTests];

  const testResults = evaluateQuestion(question, code, testsToRun);

  const visibleResults = testResults.filter(t => !t.isHidden);
  const hiddenResults = testResults.filter(t => t.isHidden);

  const visiblePassed = visibleResults.filter(t => t.passed).length;
  const hiddenPassed = hiddenResults.filter(t => t.passed).length;

  // Determine overall status
  let status: ExecutionResult['status'] = 'ACCEPTED';
  let overallError: string | undefined = undefined;

  const failedTest = testResults.find(t => !t.passed);
  if (failedTest) {
    if (failedTest.error?.includes('SyntaxError')) {
      status = 'COMPILATION_ERROR';
      overallError = failedTest.error;
    } else if (failedTest.error?.includes('TimeLimitExceeded')) {
      status = 'TIME_LIMIT_EXCEEDED';
      overallError = failedTest.error;
    } else if (failedTest.error?.includes('Error')) {
      status = 'RUNTIME_ERROR';
      overallError = failedTest.error;
    } else {
      status = 'WRONG_ANSWER';
      overallError = `Test Failed: Expected ${failedTest.expected}, but received ${failedTest.actual || 'None'}`;
    }
  }

  // Format terminal output log
  let terminalOutput = `>>> python3 solution.py\n[Compiling AST and loading Python 3.11 runtime...]\n`;
  if (status === 'ACCEPTED') {
    terminalOutput += `✓ Execution finished successfully.\n`;
    if (mode === 'run') {
      terminalOutput += `✓ All ${visiblePassed}/${question.visibleTests.length} visible test cases passed!\n`;
      terminalOutput += `Ready for submission. Click 'Submit Solution' to test against hidden judge evaluation suites.\n`;
    } else {
      terminalOutput += `✓ All ${visiblePassed}/${question.visibleTests.length} visible test cases passed.\n`;
      terminalOutput += `✓ All ${hiddenPassed}/${question.hiddenTests.length} hidden judge test cases passed.\n`;
      terminalOutput += `★ STATUS: ACCEPTED (+${question.points} Points)\n`;
    }
  } else {
    terminalOutput += `✗ Traceback (most recent call last):\n`;
    terminalOutput += `${overallError || 'Execution failed.'}\n`;
    terminalOutput += `\n[Result: ${status.replace('_', ' ')}]\n`;
  }

  return {
    status,
    visiblePassed,
    visibleTotal: question.visibleTests.length,
    hiddenPassed,
    hiddenTotal: mode === 'submit' ? question.hiddenTests.length : 0,
    output: terminalOutput,
    error: overallError,
    executionTimeMs: Math.floor(Math.random() * 45) + 35,
    testResults
  };
}
