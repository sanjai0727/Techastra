import { Question, TestCase, TestResult, ExecutionResult } from '../types/competition';

/**
 * Validates Python indentation and basic syntax sanity.
 */
function checkSyntax(code: string): { hasError: boolean; error?: string } {
  const lines = code.split('\n');
  const stack: { char: string; line: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check bracket matching outside quotes
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === "'" && !inDoubleQuote) {
        if (j === 0 || line[j - 1] !== '\\') inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        if (j === 0 || line[j - 1] !== '\\') inDoubleQuote = !inDoubleQuote;
      }

      if (inSingleQuote || inDoubleQuote) continue;

      if (char === '(' || char === '[' || char === '{') {
        stack.push({ char, line: lineNum });
      } else if (char === ')' || char === ']' || char === '}') {
        const expected = pairs[char];
        const last = stack.pop();
        if (!last || last.char !== expected) {
          return {
            hasError: true,
            error: `SyntaxError: unmatched '${char}' on line ${lineNum}`
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
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
    // ROUND 1: BUG HUNT (10 Questions | 2 Bugs Each)
    // -------------------------------------------------------------
    case 'r1-q1': { // calculate_average(marks)
      const hasOffByOne = /range\(\s*len\(\s*marks\s*\)\s*-\s*1\s*\)/.test(normalizedCode);
      const hasFloorDivision = /\/\/\s*len\(\s*marks\s*\)/.test(normalizedCode);

      for (const test of tests) {
        const marks: number[] = JSON.parse(test.input);
        if (hasOffByOne) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Loop excludes final mark. Calculated average is inaccurate.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (hasFloorDivision) {
          const total = marks.reduce((a, b) => a + b, 0);
          const floored = Math.floor(total / marks.length).toFixed(1);
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: floored,
            error: `AssertionError: Expected float decimal ${test.expectedOutput}, received floored integer ${floored}. Use float division '/'.`,
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

    case 'r1-q2': { // is_palindrome(text)
      const hasLower = /\.lower\(\)/.test(normalizedCode);
      const hasInvertedReturn = /return\s+False\s+else\s+True/.test(normalizedCode) || 
        /if\s+.*==.*:\s*\n\s*return\s+False/.test(normalizedCode);

      for (const test of tests) {
        const raw = test.input.replace(/^"|"$/g, '');
        if (hasInvertedReturn) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: test.expectedOutput === 'True' ? 'False' : 'True',
            error: `AssertionError: Inverted return value. Expected ${test.expectedOutput}, received ${test.expectedOutput === 'True' ? 'False' : 'True'}.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (!hasLower && /[A-Z]/.test(raw) && raw.toLowerCase() === raw.toLowerCase().split('').reverse().join('')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: 'True',
            actual: 'False',
            error: `AssertionError: Case-sensitivity failed for '${raw}'. Missing .lower() normalization.`,
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

    case 'r1-q3': { // calculate_final_price(price, discount_percent)
      const dividesTen = /\/\s*10\b(?!\s*0)/.test(normalizedCode) || /discount_percent\s*\/\s*10\b(?!\s*0)/.test(normalizedCode);
      const addsDiscount = /price\s*\+\s*discount/.test(normalizedCode);

      for (const test of tests) {
        if (dividesTen) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Percentage calculation divided by 10 instead of 100.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (addsDiscount) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Surcharged discount added to base price instead of subtracted.`,
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

    case 'r1-q4': { // find_maximum(numbers)
      const initsZero = /maximum\s*=\s*0\b/.test(normalizedCode);
      const checksLess = /num\s*<\s*maximum/.test(normalizedCode);

      for (const test of tests) {
        const isNegativeTest = test.input.includes('-');
        if (initsZero && isNegativeTest) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '0',
            error: `AssertionError: Initialized maximum to 0. Failed on negative numbers list (expected ${test.expectedOutput}, received 0).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (checksLess) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Wrong comparison operator '<'. Discovered minimum instead of maximum.`,
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

    case 'r1-q5': { // count_evens(numbers)
      const countInsideLoop = /for\s+.*\n\s*count\s*=\s*0/.test(normalizedCode);
      const checksOdd = /%\s*2\s*==\s*1/.test(normalizedCode);

      for (const test of tests) {
        if (countInsideLoop) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '1',
            error: `AssertionError: Counter reinitialized inside loop body, resetting count on each iteration.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (checksOdd) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Checked n % 2 == 1, counting odd numbers instead of even.`,
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

    case 'r1-q6': { // celsius_to_fahrenheit(celsius)
      const invertsRatio = /5\s*\/\s*9/.test(normalizedCode);
      const subtracts32 = /-\s*32/.test(normalizedCode);

      for (const test of tests) {
        if (invertsRatio || subtracts32) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Inverted ratio or subtracted 32 in Fahrenheit equation: (C * 9/5) + 32.`,
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

    case 'r1-q7': { // count_words(words)
      const hasLower = /\.lower\(\)/.test(normalizedCode);
      const overwritesOne = /freq\[.*\]\s*=\s*1\b/.test(normalizedCode);

      for (const test of tests) {
        if (overwritesOne) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Overwrote existing key count to 1 instead of incrementing.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (!hasLower && test.input.includes('APPLE')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: "{'apple': 2, 'Banana': 1, 'APPLE': 1, ...}",
            error: `AssertionError: Missing .lower() word normalization. Uppercase treated as distinct keys.`,
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

    case 'r1-q8': { // factorial(n)
      const returnsZeroForZero = /if\s+n\s*==\s*0\s*:\s*\n\s*return\s+0/.test(normalizedCode);
      const excludesN = /range\(\s*1\s*,\s*n\s*\)/.test(normalizedCode);

      for (const test of tests) {
        if (returnsZeroForZero && test.input.trim() === '0') {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: '1',
            actual: '0',
            error: `AssertionError: 0! is mathematically 1, received 0.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (excludesN) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Range loop stopped at n - 1, excluding multiplicand n. Use range(1, n + 1).`,
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

    case 'r1-q9': { // reverse_sublist(lst, start, end)
      const excludesEnd = /lst\[start:end\](?!\s*\+\s*1)/.test(normalizedCode);
      const stepForward = /\[::1\]/.test(normalizedCode);

      for (const test of tests) {
        if (excludesEnd || stepForward) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Sublist slicing must be inclusive lst[start:end + 1] and reversed with [::-1].`,
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

    case 'r1-q10': { // count_vowels(text)
      const countInsideLoop = /for\s+.*\n\s*count\s*=\s*0/.test(normalizedCode);
      const missingUpperVowels = /vowels\s*=\s*["']aeiou["']/.test(normalizedCode);

      for (const test of tests) {
        if (countInsideLoop) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '1',
            error: `AssertionError: Counter variable reinitialized inside loop body.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (missingUpperVowels && /[AEIOU]/.test(test.input)) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Failed to count uppercase vowels. Include 'AEIOU'.`,
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
    // ROUND 2: LOGIC BREAKER (5 Questions | 5 Bugs Each | 4 Marks)
    // -------------------------------------------------------------
    case 'r2-q1': { // calculate_electricity_bill(units, meter_type)
      const hasStrictLessThan = /units\s*<\s*100\b/.test(normalizedCode);
      const hasFullUnitMultiplier = /units\s*\*\s*4\.5/.test(normalizedCode);
      const hasSurchargeOnUnits = /surcharge\s*=\s*units\s*\*\s*0\.05/.test(normalizedCode);
      const checksComm = /['"]comm['"]/.test(normalizedCode);
      const subtractsFixed = /-\s*fixed/.test(normalizedCode);

      for (const test of tests) {
        if (hasStrictLessThan && test.input.startsWith('100,')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: '300.0',
            actual: '500.0',
            error: `AssertionError: Boundary units <= 100 failed. Strict < 100 pushed 100 units into slab 2.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (hasFullUnitMultiplier || hasSurchargeOnUnits || checksComm || subtractsFixed) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Electricity calculation defect detected. Verify marginal units (units - 100), energy surcharge (energy * 0.05), 'commercial' meter type, and fixed charge addition (+ fixed).`,
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

    case 'r2-q2': { // evaluate_student(marks)
      const omitsLastMark = /marks\[:-1\]/.test(normalizedCode);
      const invertedFail = /m\s*>\s*40/.test(normalizedCode) && /failed/.test(normalizedCode);
      const strictDistinction = /m\s*>\s*75/.test(normalizedCode);
      const usesAvgKey = /["']avg["']\s*:/.test(normalizedCode);

      for (const test of tests) {
        if (omitsLastMark) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Slice marks[:-1] omitted last subject mark from calculation.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (invertedFail && !test.input.includes('30')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: "{'grade': 'F', ...}",
            error: `AssertionError: Inverted pass/fail condition: marks > 40 flagged passing student as failed.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (strictDistinction && test.input.includes('75')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Distinction condition must be inclusive >= 75 (not > 75).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (usesAvgKey) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Return dictionary must use contract key 'average' (not 'avg').`,
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

    case 'r2-q3': { // calculate_cart_checkout(items, coupon, is_member)
      const addsPriceQty = /price\s*\+\s*qty/.test(normalizedCode) || /item\[["']price["']\]\s*\+\s*item\[["']qty["']\]/.test(normalizedCode);
      const doesNotFilterQty = !/qty\s*>\s*0/.test(normalizedCode);
      const mutatesSubtotalForMember = /subtotal\s*-=\s*100/.test(normalizedCode);
      const taxOnSubtotal = /subtotal\s*\*\s*0\.05/.test(normalizedCode);
      const invertedShipping = /net\s*>=\s*500.*50/.test(normalizedCode);

      for (const test of tests) {
        if (addsPriceQty) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Subtotal item math used addition (price + qty) instead of multiplication (price * qty).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (doesNotFilterQty && test.input.includes('-1')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Negative or zero quantity item was not skipped.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (mutatesSubtotalForMember || taxOnSubtotal || invertedShipping) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Cart checkout calculation defect. Verify member discount added to discount pool, 5% tax computed on net, and shipping 0.0 when net >= 500.`,
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

    case 'r2-q4': { // matrix_diagonals_and_boundary(matrix)
      const omitsLastRow = /range\(\s*n\s*-\s*1\s*\)/.test(normalizedCode);
      const mainDiagReset = /main_diag\s*=\s*0\b/.test(normalizedCode) && /for\s+i/.test(normalizedCode);
      const indexError = /matrix\[i\]\[n\s*-\s*i\](?!\s*-\s*1)/.test(normalizedCode);
      const doubleCountsCorners = /sum\(matrix\[0\]\)\s*\+\s*sum\(matrix\[n\s*-\s*1\]\)\s*\+/.test(normalizedCode);
      const swappedKeys = /["']main_diag["']\s*:\s*sec_diag/.test(normalizedCode);

      for (const test of tests) {
        if (indexError) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `IndexError: list index out of range\n  File "solution.py", line 9, in matrix_diagonals_and_boundary (secondary diagonal index n - i exceeds row size for i = 0).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (omitsLastRow || mainDiagReset || doubleCountsCorners || swappedKeys) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Matrix calculation error detected. Verify loop runs across range(n), secondary diagonal is n - i - 1, boundary cells counted uniquely, and dictionary keys correctly mapped.`,
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

    case 'r2-q5': { // validate_credentials(password, token)
      const hasLengthBug = /len\(password\)\s*<=\s*8/.test(normalizedCode);
      const missingSpecials = /["']!%\^&\*["']/.test(normalizedCode);
      const requiresSpace = /['"]\s['"]\s+in\s+password/.test(normalizedCode);
      const prefixTkOnly = /token\.startswith\(["']TK["']\)(?!\s*-\s*)/.test(normalizedCode) && !/token\.startswith\(["']TK-["']\)/.test(normalizedCode);
      const usesOr = /pw_valid\s+or\s+tk_valid/.test(normalizedCode);

      for (const test of tests) {
        if (hasLengthBug && test.input.includes('weak')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: "{'password_valid': False, 'token_valid': True, 'is_authorized': False}",
            actual: "{'password_valid': True, 'token_valid': True, 'is_authorized': True}",
            error: `AssertionError: Password length condition len(password) <= 8 erroneously accepted short password 'weak'.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (missingSpecials && test.input.includes('@')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Special character '@' not recognized. Valid special character set must include '@', '#', and '$'.`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (requiresSpace && test.input.includes('Secure@Pass123')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Whitespace check inverted: passwords must NOT contain spaces (' ' not in password).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
        } else if (prefixTkOnly || usesOr) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Credentials validation defect detected. Verify token prefix 'TK-', hex slice [3:], and authorization logic (pw_valid and tk_valid).`,
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
    // ROUND 3: CODE RESCUE FINALE (1 Flagship System | 10 Bugs)
    // -------------------------------------------------------------
    case 'r3-q1': { // Smart Restaurant Billing & Order Dispatch System
      const checksMembership = /name\s+in\s+menu_catalog/.test(normalizedCode) || /item\[["']name["']\]\s+in\s+menu_catalog/.test(normalizedCode);
      const multipliesPrice = /menu_catalog\[name\]\s*\*\s*qty/.test(normalizedCode) || /price\s*\*\s*qty/.test(normalizedCode);
      const normalizesTier = /tier\.upper\(\)/.test(normalizedCode) || /t\.upper\(\)/.test(normalizedCode) || /tier\s*in\s*\[['"]GOLD['"]/.test(normalizedCode);
      const correctsSilver = /0\.05/.test(normalizedCode);
      const subtractsDiscount = /subtotal\s*-\s*discount/.test(normalizedCode);
      const correctsGst = /net\s*\*\s*0\.05/.test(normalizedCode) || /discounted_amount\s*\*\s*0\.05/.test(normalizedCode);
      const correctsDelivery = /30\.0\s*\+\s*\(distance_km\s*-\s*3\.0\)\s*\*\s*10/.test(normalizedCode) || /30\s*\+\s*\(dist\s*-\s*3\)\s*\*\s*10/.test(normalizedCode);
      const addsDelivery = /\+\s*delivery/.test(normalizedCode) || /\+\s*tax_res\[["']delivery_fee["']\]/.test(normalizedCode);
      const correctsStatus = /status\s*=\s*["']CONFIRMED["']\s+if\s+.*>\s*0/.test(normalizedCode) || /grand_total\s*>\s*0\s*\?\s*["']CONFIRMED["']/.test(normalizedCode) || /if\s+grand_total\s*>\s*0:\s*\n\s*status\s*=\s*["']CONFIRMED["']/.test(normalizedCode);
      const includesOrderId = /["']order_id["']\s*:\s*order_id/.test(normalizedCode);

      for (const test of tests) {
        if (!checksMembership && test.input.includes('MysteryItem')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: "{'order_id': 'ORD-1003', 'status': 'REJECTED'}",
            actual: '',
            error: `KeyError: 'MysteryItem'\n  File "solution.py", line 8, in calculate_discounted_bill\n    price = menu_catalog[name] (Missing 'if name not in menu_catalog' membership check).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        if (!multipliesPrice) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Item subtotal evaluated using addition (price + qty) instead of multiplication (price * qty).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        if (!normalizesTier && test.input.includes('GOLD')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Membership tier check tier == 'gold' failed for uppercase 'GOLD'. Apply tier.upper().`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        if (!correctsSilver && test.input.includes('SILVER')) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Silver tier discount applied 50% rate (0.50) instead of 5% rate (0.05).`,
            isHidden: !!test.isHidden,
            description: test.description
          });
          continue;
        }

        if (!subtractsDiscount || !correctsGst || !correctsDelivery || !addsDelivery || !correctsStatus || !includesOrderId) {
          results.push({
            testId: test.id,
            passed: false,
            input: test.input,
            expected: test.expectedOutput,
            actual: '',
            error: `AssertionError: Invoice dispatch calculations incorrect. Verify: discount deducted (subtotal - discount), GST 5% (net * 0.05), overage delivery (30 + (dist - 3) * 10), grand total adds delivery (+ delivery), status CONFIRMED when total > 0, and invoice includes 'order_id'.`,
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
