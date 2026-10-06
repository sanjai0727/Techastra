import { Question } from '../types/competition';

export const round2Questions: Question[] = [
  {
    id: 'r2-q1',
    round: 2,
    number: 1,
    title: 'Find the Missing Element Sum',
    description: 'The function should compute the total sum of all elements in the input list. However, due to an off-by-one loop indexing bug, it omits the final item, returning an incomplete total.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Off-by-one Error',
    brokenCode: `def total_inventory_cost(numbers):
    total = 0
    # Bug: len(numbers) - 1 misses the last element in range()
    for i in range(len(numbers) - 1):
        total += numbers[i]
    return total

print(total_inventory_cost([10, 20, 30, 40]))`,
    solutionCode: `def total_inventory_cost(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total

print(total_inventory_cost([10, 20, 30, 40]))`,
    expectedBehavior: 'Loop through range(len(numbers)) or iterate directly with `for num in numbers:` to include every item.',
    inputFormat: 'List of numbers',
    outputFormat: 'Total integer or float sum',
    constraints: ['List can contain 1 to 1000 items'],
    hints: 'range(stop) excludes the stop value. If you pass len(numbers) - 1, the index len(numbers) - 1 is never visited.',
    points: 20,
    visibleTests: [
      { id: 'r2-q1-t1', input: '[10, 20, 30, 40]', expectedOutput: '100', description: 'Sum of [10, 20, 30, 40] must equal 100' },
      { id: 'r2-q1-t2', input: '[5, 15]', expectedOutput: '20', description: 'Two element sum: 5 + 15 = 20' }
    ],
    hiddenTests: [
      { id: 'r2-q1-h1', input: '[100]', expectedOutput: '100', description: 'Single element list must not return 0' },
      { id: 'r2-q1-h2', input: '[1, 2, 3, 4, 5, 6, 7]', expectedOutput: '28', description: 'Sequence 1 to 7' },
      { id: 'r2-q1-h3', input: '[-10, 20, -30, 40]', expectedOutput: '20', description: 'Negative and positive numbers' },
      { id: 'r2-q1-h4', input: '[0, 0, 0, 50]', expectedOutput: '50', description: 'Last element carry' }
    ]
  },
  {
    id: 'r2-q2',
    round: 2,
    number: 2,
    title: 'Robust Palindrome Evaluator',
    description: 'A student wrote a palindrome checker that fails on real sentences with mixed letter casing and spaces. The function should ignore spaces and casing differences.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Edge Case',
    brokenCode: `def is_palindrome_phrase(text):
    # Bug: Does not sanitize spaces or standardize letter casing
    return text == text[::-1]

print(is_palindrome_phrase("Race Car"))`,
    solutionCode: `def is_palindrome_phrase(text):
    cleaned = ''.join(ch.lower() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]

print(is_palindrome_phrase("Race Car"))`,
    expectedBehavior: 'Strip non-alphanumeric characters or convert all letters to lowercase before comparing.',
    inputFormat: 'String text',
    outputFormat: 'Boolean (True or False)',
    points: 20,
    visibleTests: [
      { id: 'r2-q2-t1', input: '"Race Car"', expectedOutput: 'True', description: '"Race Car" is a palindrome when ignoring casing & spaces' },
      { id: 'r2-q2-t2', input: '"hello"', expectedOutput: 'False', description: '"hello" is not a palindrome' }
    ],
    hiddenTests: [
      { id: 'r2-q2-h1', input: '"A man a plan a canal Panama"', expectedOutput: 'True', description: 'Classic palindrome phrase' },
      { id: 'r2-q2-h2', input: '"No lemon, no melon"', expectedOutput: 'True', description: 'Punctuation and spacing' },
      { id: 'r2-q2-h3', input: '"12321"', expectedOutput: 'True', description: 'Numeric palindrome' },
      { id: 'r2-q2-h4', input: '"debugging"', expectedOutput: 'False', description: 'Negative test case' }
    ]
  },
  {
    id: 'r2-q3',
    round: 2,
    number: 3,
    title: 'Matrix Diagonal Sum Collision',
    description: 'Given an N x N square matrix, calculate the sum of elements on the primary diagonal and secondary diagonal. On odd-sized matrices (e.g. 3x3), the center element is erroneously added twice.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def diagonal_sum(matrix):
    n = len(matrix)
    total = 0
    # Bug: Center element matrix[mid][mid] is counted twice when n is odd
    for i in range(n):
        total += matrix[i][i]
        total += matrix[i][n - 1 - i]
    return total

mat = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(diagonal_sum(mat))`,
    solutionCode: `def diagonal_sum(matrix):
    n = len(matrix)
    total = 0
    for i in range(n):
        total += matrix[i][i]
        total += matrix[i][n - 1 - i]
    if n % 2 == 1:
        mid = n // 2
        total -= matrix[mid][mid]
    return total

mat = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(diagonal_sum(mat))`,
    expectedBehavior: 'Deduct the center element matrix[n//2][n//2] once if n % 2 == 1 to prevent double counting.',
    inputFormat: '2D square matrix of integers',
    outputFormat: 'Integer total diagonal sum',
    points: 20,
    visibleTests: [
      { id: 'r2-q3-t1', input: '[[1, 2, 3], [4, 5, 6], [7, 8, 9]]', expectedOutput: '25', description: '3x3 matrix: (1+5+9) + (3+7) = 25 (center 5 not doubled)' },
      { id: 'r2-q3-t2', input: '[[1, 1], [1, 1]]', expectedOutput: '4', description: '2x2 even matrix: all four corners counted = 4' }
    ],
    hiddenTests: [
      { id: 'r2-q3-h1', input: '[[5]]', expectedOutput: '5', description: '1x1 matrix only 5' },
      { id: 'r2-q3-h2', input: '[[1, 0, 1], [0, 2, 0], [1, 0, 1]]', expectedOutput: '6', description: 'Center element 2' },
      { id: 'r2-q3-h3', input: '[[2, 1, 1, 2], [1, 3, 3, 1], [1, 3, 3, 1], [2, 1, 1, 2]]', expectedOutput: '20', description: '4x4 even matrix' }
    ]
  },
  {
    id: 'r2-q4',
    round: 2,
    number: 4,
    title: 'Binary Search Infinite Loop Trap',
    description: 'This binary search algorithm looks for a target value in a sorted list. When an element is greater than mid, it updates `left = mid` instead of `left = mid + 1`, causing an infinite loop when the interval narrows to 2 items.',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # Bug: left = mid creates an infinite loop when left + 1 == right
            left = mid
        else:
            right = mid - 1
            
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38], 16))`,
    solutionCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38], 16))`,
    expectedBehavior: 'Advance the left search pointer to `mid + 1` so the search interval strictly decreases.',
    inputFormat: 'Sorted list and target value',
    outputFormat: 'Index integer or -1 if not found',
    points: 20,
    visibleTests: [
      { id: 'r2-q4-t1', input: '[2, 5, 8, 12, 16, 23, 38], 16', expectedOutput: '4', description: 'Target 16 is at index 4' },
      { id: 'r2-q4-t2', input: '[1, 3, 5], 10', expectedOutput: '-1', description: 'Missing element returns -1' }
    ],
    hiddenTests: [
      { id: 'r2-q4-h1', input: '[10, 20], 20', expectedOutput: '1', description: 'Two element upper bound search' },
      { id: 'r2-q4-h2', input: '[10, 20], 10', expectedOutput: '0', description: 'Two element lower bound search' },
      { id: 'r2-q4-h3', input: '[-5, -2, 0, 4, 9], -2', expectedOutput: '1', description: 'Negative values in list' }
    ]
  },
  {
    id: 'r2-q5',
    round: 2,
    number: 5,
    title: 'Mutable Default Argument Bug',
    description: 'In Python, default parameter expressions are evaluated only once when the function is defined. Using `items=[]` as a default parameter means successive calls mutate and share the exact same list instance!',
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def register_attendee(student_name, attendee_list=[]):
    # Dangerous: mutable default list persists across independent invocations!
    attendee_list.append(student_name)
    return attendee_list

# Test calls that expose the shared state bug:
list1 = register_attendee("Alice")
list2 = register_attendee("Bob")
print(list2) # Erroneously outputs ['Alice', 'Bob'] instead of ['Bob']`,
    solutionCode: `def register_attendee(student_name, attendee_list=None):
    if attendee_list is None:
        attendee_list = []
    attendee_list.append(student_name)
    return attendee_list

list1 = register_attendee("Alice")
list2 = register_attendee("Bob")
print(list2)`,
    expectedBehavior: 'Use `attendee_list=None` as the default, and initialize a new empty list `attendee_list = []` inside the function body.',
    inputFormat: 'Student name string and optional list',
    outputFormat: 'Independent list containing the attendee',
    points: 20,
    visibleTests: [
      { id: 'r2-q5-t1', input: '"Alice"', expectedOutput: "['Alice']", description: 'First independent call' },
      { id: 'r2-q5-t2', input: '"Bob", ["Admin"]', expectedOutput: "['Admin', 'Bob']", description: 'Explicit list argument provided' }
    ],
    hiddenTests: [
      { id: 'r2-q5-h1', input: '"Charlie"', expectedOutput: "['Charlie']", description: 'Consecutive default call must be isolated' },
      { id: 'r2-q5-h2', input: '"David"', expectedOutput: "['David']", description: 'Another isolated attendee' },
      { id: 'r2-q5-h3', input: '"Eve", ["Judge1", "Judge2"]', expectedOutput: "['Judge1', 'Judge2', 'Eve']", description: 'Appended to existing' }
    ]
  }
];
