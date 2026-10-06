import { Question } from '../types/competition';

export const round1Questions: Question[] = [
  {
    id: 'r1-q1',
    round: 1,
    number: 1,
    title: 'Fix the Function Header & Return',
    description: 'The following function is supposed to calculate and return the sum of two integers. However, it contains a syntax error in the definition line and does not return the computed value correctly.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Syntax Error',
    brokenCode: `def calculate_sum(a, b)
    result = a + b
    # Fix the missing return and function header syntax

print(calculate_sum(10, 20))`,
    solutionCode: `def calculate_sum(a, b):
    result = a + b
    return result

print(calculate_sum(10, 20))`,
    expectedBehavior: 'Function definition must include a colon, and explicitly return the calculated sum.',
    inputFormat: 'Two integers a and b',
    outputFormat: 'Integer sum',
    constraints: ['Both numbers are valid integers'],
    hints: 'Check line 1 for Python syntax requirements and ensure a return statement is present.',
    points: 10,
    visibleTests: [
      { id: 'r1-q1-t1', input: '10, 20', expectedOutput: '30', description: 'Basic addition: 10 + 20' },
      { id: 'r1-q1-t2', input: '0, 5', expectedOutput: '5', description: 'Zero identity: 0 + 5' },
    ],
    hiddenTests: [
      { id: 'r1-q1-h1', input: '-5, 15', expectedOutput: '10', description: 'Negative and positive addition' },
      { id: 'r1-q1-h2', input: '100, 250', expectedOutput: '350', description: 'Larger numbers' },
      { id: 'r1-q1-h3', input: '-40, -60', expectedOutput: '-100', description: 'Two negative numbers' }
    ]
  },
  {
    id: 'r1-q2',
    round: 1,
    number: 2,
    title: 'Variable Scope & Typo',
    description: 'The calculate_area function should multiply width by height. The author made a typo referencing an undeclared variable name, causing a NameError at runtime.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Runtime Error',
    brokenCode: `def calculate_area(width, height):
    tot_area = width * heigth
    return tot_area

print(calculate_area(5, 8))`,
    solutionCode: `def calculate_area(width, height):
    tot_area = width * height
    return tot_area

print(calculate_area(5, 8))`,
    expectedBehavior: 'Correctly reference the height parameter without spelling mistakes.',
    inputFormat: 'Two numeric dimensions',
    outputFormat: 'Calculated area',
    constraints: ['width > 0, height > 0'],
    hints: 'Inspect the variable spelling on line 2 carefully.',
    points: 10,
    visibleTests: [
      { id: 'r1-q2-t1', input: '5, 8', expectedOutput: '40', description: '5 * 8' },
      { id: 'r1-q2-t2', input: '10, 10', expectedOutput: '100', description: 'Square dimensions 10 * 10' }
    ],
    hiddenTests: [
      { id: 'r1-q2-h1', input: '12, 4', expectedOutput: '48', description: 'Rectangular dimensions' },
      { id: 'r1-q2-h2', input: '7, 3', expectedOutput: '21', description: 'Prime dimensions' },
      { id: 'r1-q2-h3', input: '25, 4', expectedOutput: '100', description: 'Boundary case' }
    ]
  },
  {
    id: 'r1-q3',
    round: 1,
    number: 3,
    title: 'Even Number Condition',
    description: 'This function should check if an integer is even and return True, or False if odd. The programmer wrote the wrong modulo comparison.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def is_even(num):
    # Bug: currently returns True for odd numbers
    if num % 2 == 1:
        return True
    else:
        return False

print(is_even(4))`,
    solutionCode: `def is_even(num):
    if num % 2 == 0:
        return True
    else:
        return False

print(is_even(4))`,
    expectedBehavior: 'Return True when num % 2 == 0, False otherwise.',
    inputFormat: 'Integer num',
    outputFormat: 'Boolean (True or False)',
    points: 10,
    visibleTests: [
      { id: 'r1-q3-t1', input: '4', expectedOutput: 'True', description: 'Even number: 4' },
      { id: 'r1-q3-t2', input: '7', expectedOutput: 'False', description: 'Odd number: 7' }
    ],
    hiddenTests: [
      { id: 'r1-q3-h1', input: '0', expectedOutput: 'True', description: 'Zero is even' },
      { id: 'r1-q3-h2', input: '-2', expectedOutput: 'True', description: 'Negative even number' },
      { id: 'r1-q3-h3', input: '99', expectedOutput: 'False', description: 'Large odd number' }
    ]
  },
  {
    id: 'r1-q4',
    round: 1,
    number: 4,
    title: 'List Index Out of Range',
    description: 'The print_first_n function attempts to print the first N elements of a list, but the range limit exceeds the available indices, causing an IndexError.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Runtime Error',
    brokenCode: `def print_first_element(items):
    # Error: Accessing index len(items) raises IndexError
    first = items[len(items)]
    return first

print(print_first_element([10, 20, 30]))`,
    solutionCode: `def print_first_element(items):
    first = items[0]
    return first

print(print_first_element([10, 20, 30]))`,
    expectedBehavior: 'Return the first element (index 0) of the list.',
    inputFormat: 'Non-empty list of integers',
    outputFormat: 'First integer element',
    points: 10,
    visibleTests: [
      { id: 'r1-q4-t1', input: '[10, 20, 30]', expectedOutput: '10', description: 'First element of [10, 20, 30]' },
      { id: 'r1-q4-t2', input: '[99]', expectedOutput: '99', description: 'Single element list' }
    ],
    hiddenTests: [
      { id: 'r1-q4-h1', input: '[42, 13, 7]', expectedOutput: '42', description: 'Multiple elements' },
      { id: 'r1-q4-h2', input: '[-5, 0, 5]', expectedOutput: '-5', description: 'Negative start element' },
      { id: 'r1-q4-h3', input: '[1, 2, 3, 4, 5]', expectedOutput: '1', description: 'Five elements' }
    ]
  },
  {
    id: 'r1-q5',
    round: 1,
    number: 5,
    title: 'String Immutability Pitfall',
    description: 'In Python, strings are immutable. The replace() method returns a new string rather than modifying the original in-place. Fix the function so the modified string is returned.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def censor_word(text, bad_word):
    # Strings are immutable; replace does not mutate text in-place
    text.replace(bad_word, '***')
    return text

print(censor_word("hello world", "world"))`,
    solutionCode: `def censor_word(text, bad_word):
    text = text.replace(bad_word, '***')
    return text

print(censor_word("hello world", "world"))`,
    expectedBehavior: 'Reassign the output of text.replace(...) to text before returning.',
    inputFormat: 'Original text string and word to replace',
    outputFormat: 'Modified text string',
    points: 10,
    visibleTests: [
      { id: 'r1-q5-t1', input: '"hello world", "world"', expectedOutput: 'hello ***', description: 'Basic replacement' },
      { id: 'r1-q5-t2', input: '"apple banana apple", "apple"', expectedOutput: '*** banana ***', description: 'Multiple occurrences' }
    ],
    hiddenTests: [
      { id: 'r1-q5-h1', input: '"bad code is bad", "bad"', expectedOutput: '*** code is ***', description: 'Edge word replace' },
      { id: 'r1-q5-h2', input: '"safe text", "danger"', expectedOutput: 'safe text', description: 'Target word absent' },
      { id: 'r1-q5-h3', input: '"code rescue", "rescue"', expectedOutput: 'code ***', description: 'Contest theme check' }
    ]
  },
  {
    id: 'r1-q6',
    round: 1,
    number: 6,
    title: 'Loop Accumulator Initialization',
    description: 'The sum_list function initializes the accumulator inside the for loop, resetting it on every iteration. Move the accumulator to the correct position so all numbers are summed.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def sum_list(numbers):
    for num in numbers:
        total = 0
        total += num
    return total

print(sum_list([1, 2, 3, 4]))`,
    solutionCode: `def sum_list(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

print(sum_list([1, 2, 3, 4]))`,
    expectedBehavior: 'Initialize total = 0 outside and before the loop.',
    inputFormat: 'List of numbers',
    outputFormat: 'Sum of all numbers in list',
    points: 10,
    visibleTests: [
      { id: 'r1-q6-t1', input: '[1, 2, 3, 4]', expectedOutput: '10', description: '1 + 2 + 3 + 4 = 10' },
      { id: 'r1-q6-t2', input: '[5, 5, 5]', expectedOutput: '15', description: '5 * 3 = 15' }
    ],
    hiddenTests: [
      { id: 'r1-q6-h1', input: '[]', expectedOutput: '0', description: 'Empty list sum' },
      { id: 'r1-q6-h2', input: '[10, -5, 20]', expectedOutput: '25', description: 'Negative and positive numbers' },
      { id: 'r1-q6-h3', input: '[100, 200, 300, 400]', expectedOutput: '1000', description: 'Large sum' }
    ]
  },
  {
    id: 'r1-q7',
    round: 1,
    number: 7,
    title: 'Dictionary Key Safe Lookup',
    description: 'Looking up a non-existent key with square brackets raises a KeyError. Modify the function to safely retrieve the student score or return a default of 0.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Runtime Error',
    brokenCode: `def get_student_score(scores_dict, student_name):
    # Crashes with KeyError if student_name is not in scores_dict
    return scores_dict[student_name]

scores = {"Alice": 95, "Bob": 82}
print(get_student_score(scores, "Charlie"))`,
    solutionCode: `def get_student_score(scores_dict, student_name):
    return scores_dict.get(student_name, 0)

scores = {"Alice": 95, "Bob": 82}
print(get_student_score(scores, "Charlie"))`,
    expectedBehavior: 'Use scores_dict.get(student_name, 0) or check if student_name in scores_dict.',
    inputFormat: 'Dictionary and student string name',
    outputFormat: 'Integer score or 0',
    points: 10,
    visibleTests: [
      { id: 'r1-q7-t1', input: '{"Alice": 95, "Bob": 82}, "Charlie"', expectedOutput: '0', description: 'Missing key returns default 0' },
      { id: 'r1-q7-t2', input: '{"Alice": 95, "Bob": 82}, "Alice"', expectedOutput: '95', description: 'Existing key returns score' }
    ],
    hiddenTests: [
      { id: 'r1-q7-h1', input: '{}, "David"', expectedOutput: '0', description: 'Empty dictionary lookup' },
      { id: 'r1-q7-h2', input: '{"Bob": 82}, "Bob"', expectedOutput: '82', description: 'Found in small dict' },
      { id: 'r1-q7-h3', input: '{"Sanjai": 100}, "Alex"', expectedOutput: '0', description: 'Contestant key lookup' }
    ]
  },
  {
    id: 'r1-q8',
    round: 1,
    number: 8,
    title: 'Chained If Override (Grade Classifier)',
    description: 'The classify_grade function evaluates student marks. Because independent `if` statements are used rather than `elif`, later conditions overwrite earlier passing grades.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Logical Error',
    brokenCode: `def classify_grade(score):
    grade = 'F'
    if score >= 90:
        grade = 'A'
    if score >= 75:
        grade = 'B'
    if score >= 50:
        grade = 'C'
    return grade

print(classify_grade(95))`,
    solutionCode: `def classify_grade(score):
    if score >= 90:
        return 'A'
    elif score >= 75:
        return 'B'
    elif score >= 50:
        return 'C'
    else:
        return 'F'

print(classify_grade(95))`,
    expectedBehavior: 'Properly return A for >= 90, B for >= 75, C for >= 50, and F otherwise without overwriting.',
    inputFormat: 'Integer score (0 to 100)',
    outputFormat: 'Single letter grade string',
    points: 10,
    visibleTests: [
      { id: 'r1-q8-t1', input: '95', expectedOutput: 'A', description: 'Score 95 must yield grade A' },
      { id: 'r1-q8-t2', input: '80', expectedOutput: 'B', description: 'Score 80 must yield grade B' }
    ],
    hiddenTests: [
      { id: 'r1-q8-h1', input: '60', expectedOutput: 'C', description: 'Score 60 must yield grade C' },
      { id: 'r1-q8-h2', input: '45', expectedOutput: 'F', description: 'Score 45 must yield grade F' },
      { id: 'r1-q8-h3', input: '90', expectedOutput: 'A', description: 'Boundary score 90 must yield A' }
    ]
  },
  {
    id: 'r1-q9',
    round: 1,
    number: 9,
    title: 'Missing Recursion Base Case',
    description: 'The factorial function is missing its terminating base condition. Without checking if n <= 1, it calls itself infinitely, triggering a RecursionError.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Runtime Error',
    brokenCode: `def factorial(n):
    # Missing base case: causes infinite recursion
    return n * factorial(n - 1)

print(factorial(4))`,
    solutionCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(4))`,
    expectedBehavior: 'Return 1 when n <= 1 to properly terminate recursive calls.',
    inputFormat: 'Non-negative integer n',
    outputFormat: 'Calculated factorial integer',
    points: 10,
    visibleTests: [
      { id: 'r1-q9-t1', input: '4', expectedOutput: '24', description: '4! = 4 * 3 * 2 * 1 = 24' },
      { id: 'r1-q9-t2', input: '1', expectedOutput: '1', description: 'Base case 1! = 1' }
    ],
    hiddenTests: [
      { id: 'r1-q9-h1', input: '0', expectedOutput: '1', description: '0! is 1' },
      { id: 'r1-q9-h2', input: '5', expectedOutput: '120', description: '5! = 120' },
      { id: 'r1-q9-h3', input: '6', expectedOutput: '720', description: '6! = 720' }
    ]
  },
  {
    id: 'r1-q10',
    round: 1,
    number: 10,
    title: 'Discount Calculator Type Bug',
    description: 'The calculate_final_price function receives the discount as a string from an input form, causing a TypeError when attempting arithmetic with floats and strings.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Type Error',
    brokenCode: `def calculate_final_price(price, discount_percent):
    # discount_percent can be passed as string e.g. "20"
    # Convert discount_percent to numeric before math
    discount_amount = price * (discount_percent / 100)
    return round(price - discount_amount, 2)

print(calculate_final_price(100.0, "20"))`,
    solutionCode: `def calculate_final_price(price, discount_percent):
    discount_percent = float(discount_percent)
    discount_amount = price * (discount_percent / 100)
    return round(price - discount_amount, 2)

print(calculate_final_price(100.0, "20"))`,
    expectedBehavior: 'Convert discount_percent to float before performing division.',
    inputFormat: 'Float price and string/number discount percentage',
    outputFormat: 'Discounted final price rounded to 2 decimal places',
    points: 10,
    visibleTests: [
      { id: 'r1-q10-t1', input: '100.0, "20"', expectedOutput: '80.0', description: '100 with "20"% discount = 80.0' },
      { id: 'r1-q10-t2', input: '50.0, 10', expectedOutput: '45.0', description: 'Numeric discount 50 with 10% = 45.0' }
    ],
    hiddenTests: [
      { id: 'r1-q10-h1', input: '200.0, "50"', expectedOutput: '100.0', description: 'Half price discount' },
      { id: 'r1-q10-h2', input: '79.99, "0"', expectedOutput: '79.99', description: 'Zero discount' },
      { id: 'r1-q10-h3', input: '150.0, "15.5"', expectedOutput: '126.75', description: 'Decimal string discount' }
    ]
  }
];
