const fs = require('fs');

const file = 'E:/projects/techastra-coderescue/src/data/round2Questions.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace points: 20 with points: 2 in questions 1-5
code = code.replace(/points:\s*20,/g, 'points: 2,');

if (!code.includes('r2-q6')) {
  const additionalQuestions = `,
  {
    id: 'r2-q6',
    round: 2,
    number: 6,
    title: 'Find Pair with Target Sum',
    description: 'The function should find two distinct indices in a list of integers that add up to a target sum and return their values as a sorted tuple (a, b) or None if no distinct pair exists. However, due to starting the inner loop from 0 without checking distinct indices, an element can pair with itself (e.g. 4 + 4 == 8 with only one 4 in the list), returning an invalid pair.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: \`def find_target_pair(numbers, target):
    # Bug: Self-pairing bug when inner loop checks entire array without i != j
    for i in range(len(numbers)):
        for j in range(len(numbers)):
            if numbers[i] + numbers[j] == target:
                return tuple(sorted([numbers[i], numbers[j]]))
    return None

print(find_target_pair([3, 5, 2, 7], 9))\`,
    solutionCode: \`def find_target_pair(numbers, target):
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return tuple(sorted([numbers[i], numbers[j]]))
    return None

print(find_target_pair([3, 5, 2, 7], 9))\`,
    expectedBehavior: 'Start the inner loop from i + 1 or ensure i != j so an element is not paired with itself.',
    inputFormat: 'numbers list and target integer',
    outputFormat: 'Sorted 2-tuple or None',
    points: 2,
    visibleTests: [
      { id: 'r2-q6-t1', input: '[3, 5, 2, 7], 9', expectedOutput: '(2, 7)', description: 'Pair 2 + 7 = 9' },
      { id: 'r2-q6-t2', input: '[4, 1, 6], 8', expectedOutput: 'None', description: 'Self-pairing 4+4 must return None' }
    ],
    hiddenTests: [
      { id: 'r2-q6-h1', input: '[10, 20, 35, 50], 55', expectedOutput: '(20, 35)', description: 'Sum 20 + 35 = 55' },
      { id: 'r2-q6-h2', input: '[5, 3, 8], 10', expectedOutput: 'None', description: 'Cannot pair 5 with itself' },
      { id: 'r2-q6-h3', input: '[1, 2, 3, 4], 7', expectedOutput: '(3, 4)', description: 'Pair 3 + 4 = 7' }
    ]
  },
  {
    id: 'r2-q7',
    round: 2,
    number: 7,
    title: 'Character Frequency Anagram Checker',
    description: 'The function should determine if two strings are valid anagrams (case-insensitive and ignoring whitespace). However, the broken code does not sanitize casing or strip spaces, causing valid anagram phrases to be incorrectly rejected.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Edge Case',
    brokenCode: \`def are_anagrams(str1, str2):
    # Bug: Fails on case-sensitivity and embedded whitespace
    count1 = {}
    count2 = {}
    for ch in str1:
        count1[ch] = count1.get(ch, 0) + 1
    for ch in str2:
        count2[ch] = count2.get(ch, 0) + 1
    return count1 == count2

print(are_anagrams("Listen", "Silent"))\`,
    solutionCode: \`def are_anagrams(str1, str2):
    s1 = str1.replace(" ", "").lower()
    s2 = str2.replace(" ", "").lower()
    count1 = {}
    count2 = {}
    for ch in s1:
        count1[ch] = count1.get(ch, 0) + 1
    for ch in s2:
        count2[ch] = count2.get(ch, 0) + 1
    return count1 == count2

print(are_anagrams("Listen", "Silent"))\`,
    expectedBehavior: 'Strip whitespace with .replace(" ", "") and convert to lowercase with .lower() before counting character frequencies.',
    inputFormat: 'Two strings str1 and str2',
    outputFormat: 'Boolean (True or False)',
    points: 2,
    visibleTests: [
      { id: 'r2-q7-t1', input: '"Listen", "Silent"', expectedOutput: 'True', description: 'Case-insensitive match' },
      { id: 'r2-q7-t2', input: '"hello", "world"', expectedOutput: 'False', description: 'Different characters' }
    ],
    hiddenTests: [
      { id: 'r2-q7-h1', input: '"Dormitory", "Dirty Room"', expectedOutput: 'True', description: 'Case and spaces ignored' },
      { id: 'r2-q7-h2', input: '"rail safety", "fairy tales"', expectedOutput: 'True', description: 'Multi-word anagram' },
      { id: 'r2-q7-h3', input: '"rat", "car"', expectedOutput: 'False', description: 'Unequal frequencies' }
    ]
  },
  {
    id: 'r2-q8',
    round: 2,
    number: 8,
    title: 'Longest Continuous Subarray Above Threshold',
    description: 'The function should return the length of the longest contiguous subsegment where all elements strictly exceed a threshold k. However, the current streak count is not reset properly when an element <= k is encountered, leading to an inflated total count.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: \`def longest_streak_above(arr, k):
    max_len = 0
    current_len = 0
    for x in arr:
        if x > k:
            current_len += 1
            if current_len > max_len:
                max_len = current_len
        # Bug: Missing reset of current_len to 0 when x <= k
    return max_len

print(longest_streak_above([5, 6, 2, 7, 8, 9, 1], 4))\`,
    solutionCode: \`def longest_streak_above(arr, k):
    max_len = 0
    current_len = 0
    for x in arr:
        if x > k:
            current_len += 1
            if current_len > max_len:
                max_len = current_len
        else:
            current_len = 0
    return max_len

print(longest_streak_above([5, 6, 2, 7, 8, 9, 1], 4))\`,
    expectedBehavior: 'Reset current_len = 0 inside an else branch whenever x <= k.',
    inputFormat: 'Integer list arr and threshold integer k',
    outputFormat: 'Integer representing maximum streak length',
    points: 2,
    visibleTests: [
      { id: 'r2-q8-t1', input: '[5, 6, 2, 7, 8, 9, 1], 4', expectedOutput: '3', description: 'Streak [7, 8, 9] length 3' },
      { id: 'r2-q8-t2', input: '[1, 2, 3], 5', expectedOutput: '0', description: 'No elements exceed 5' }
    ],
    hiddenTests: [
      { id: 'r2-q8-h1', input: '[10, 20, 5, 30, 40, 50, 60, 2], 8', expectedOutput: '4', description: 'Streak [30, 40, 50, 60] length 4' },
      { id: 'r2-q8-h2', input: '[7, 8, 9, 10], 5', expectedOutput: '4', description: 'All elements qualify' },
      { id: 'r2-q8-h3', input: '[1, 9, 2, 8, 3, 7], 5', expectedOutput: '1', description: 'Alternating single streaks' }
    ]
  },
  {
    id: 'r2-q9',
    round: 2,
    number: 9,
    title: 'Matrix Flatten with Zero-Skip Logic',
    description: 'The function takes a 2D matrix of integers and should return a flattened 1D list containing only non-zero values. The developer accidentally used an incorrect filter condition val < 0 instead of val != 0, causing positive non-zero values to be erroneously discarded.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: \`def flatten_nonzero(matrix):
    result = []
    for row in matrix:
        for val in row:
            # Bug: Discards positive values due to wrong condition val < 0
            if val < 0:
                result.append(val)
    return result

print(flatten_nonzero([[1, 0, 2], [0, 3, -1]]))\`,
    solutionCode: \`def flatten_nonzero(matrix):
    result = []
    for row in matrix:
        for val in row:
            if val != 0:
                result.append(val)
    return result

print(flatten_nonzero([[1, 0, 2], [0, 3, -1]]))\`,
    expectedBehavior: 'Change condition to if val != 0: so all non-zero numbers (both positive and negative) are included.',
    inputFormat: '2D list of integers',
    outputFormat: '1D list of non-zero integers',
    points: 2,
    visibleTests: [
      { id: 'r2-q9-t1', input: '[[1, 0, 2], [0, 3, -1]]', expectedOutput: '[1, 2, 3, -1]', description: 'Filter zeros from mixed matrix' },
      { id: 'r2-q9-t2', input: '[[0, 0], [0, 0]]', expectedOutput: '[]', description: 'All zeros matrix' }
    ],
    hiddenTests: [
      { id: 'r2-q9-h1', input: '[[5, -2], [0, 8]]', expectedOutput: '[5, -2, 8]', description: 'Non-zero positives and negative preserved' },
      { id: 'r2-q9-h2', input: '[[0, 10, 0], [20, 0, 30]]', expectedOutput: '[10, 20, 30]', description: 'Preserve multiple positive elements' },
      { id: 'r2-q9-h3', input: '[[-5, 0], [0, -10]]', expectedOutput: '[-5, -10]', description: 'Negative values retained' }
    ]
  },
  {
    id: 'r2-q10',
    round: 2,
    number: 10,
    title: 'Balanced Parentheses Stack Validator',
    description: 'The function should check if all brackets (), [], {} in an expression string are properly balanced and nested. However, it returns True without verifying that the stack is completely empty at the end, incorrectly marking expressions with unclosed opening brackets as balanced.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Edge Case',
    brokenCode: \`def is_balanced(expression):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in expression:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack.pop() != pairs[ch]:
                return False
    # Bug: Returns True without checking if stack is empty (unclosed brackets)
    return True

print(is_balanced("([{}])"))\`,
    solutionCode: \`def is_balanced(expression):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in expression:
        if ch in '([{':
            stack.append(ch)
        elif ch in ')]}':
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0

print(is_balanced("([{}])"))\`,
    expectedBehavior: 'Return len(stack) == 0 so that any remaining unclosed brackets on the stack cause the function to return False.',
    inputFormat: 'String containing brackets and characters',
    outputFormat: 'Boolean (True or False)',
    points: 2,
    visibleTests: [
      { id: 'r2-q10-t1', input: '"([{}])"', expectedOutput: 'True', description: 'Properly balanced brackets' },
      { id: 'r2-q10-t2', input: '"(()"', expectedOutput: 'False', description: 'Unclosed open parenthesis' }
    ],
    hiddenTests: [
      { id: 'r2-q10-h1', input: '"{[()]}"', expectedOutput: 'True', description: 'Nested mixed brackets' },
      { id: 'r2-q10-h2', input: '"[{]"', expectedOutput: 'False', description: 'Mismatched order' },
      { id: 'r2-q10-h3', input: '"((((("', expectedOutput: 'False', description: 'Multiple unclosed opening brackets' }
    ]
  }`;

  const lastBracketIdx = code.lastIndexOf(']');
  code = code.slice(0, lastBracketIdx) + additionalQuestions + '\n];\n';
}

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated round2Questions.ts with 10 questions and 2 points each!');
