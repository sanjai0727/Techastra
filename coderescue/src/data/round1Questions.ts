import { Question } from '../types/competition';

export const round1Questions: Question[] = [
  {
    id: 'r1-q1',
    round: 1,
    number: 1,
    title: 'Student Marks Average',
    description: 'Calculate the arithmetic average of marks in a student mark list, returned as a numeric float rounded to 2 decimal places. The function must include every mark in the list.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def calculate_average(marks):
    total = 0
    # Bug 1: Loop excludes the final element in the list
    for i in range(len(marks) - 1):
        total += marks[i]
    # Bug 2: Floor division discards floating decimal accuracy
    return total // len(marks)

marks = [78, 85, 92, 88]
print(calculate_average(marks))`,
    solutionCode: `def calculate_average(marks):
    if not marks:
        return 0.0
    total = 0
    for i in range(len(marks)):
        total += marks[i]
    return round(total / len(marks), 2)

marks = [78, 85, 92, 88]
print(calculate_average(marks))`,
    expectedBehavior: 'Include every item in the marks list and compute the true float average rounded to 2 decimal places.',
    inputFormat: 'marks: List of integers',
    outputFormat: 'Float numeric value rounded to 2 decimal places',
    constraints: ['marks is a non-empty list of integers', 'All marks must be included'],
    hints: 'Check the range boundary in line 4 (len(marks) vs len(marks)-1) and replace floor division // with float division /.',
    points: 1,
    visibleTests: [
      { id: 'r1-q1-t1', input: '[78, 85, 92, 88]', expectedOutput: '85.75', description: 'Sample student marks' },
      { id: 'r1-q1-t2', input: '[100, 90]', expectedOutput: '95.0', description: 'Two marks average' }
    ],
    hiddenTests: [
      { id: 'r1-q1-h1', input: '[45, 55, 65, 75]', expectedOutput: '60.0', description: 'Four integer marks' },
      { id: 'r1-q1-h2', input: '[10]', expectedOutput: '10.0', description: 'Single element list' },
      { id: 'r1-q1-h3', input: '[70, 80, 90]', expectedOutput: '80.0', description: 'Three marks average' }
    ]
  },
  {
    id: 'r1-q2',
    round: 1,
    number: 2,
    title: 'Palindrome String Checker',
    description: 'Determine whether a given string reads identically forwards and backwards, ignoring uppercase/lowercase differences.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def is_palindrome(text):
    # Bug 1: Missing case normalization (fails for capitalized words)
    reversed_text = text[::-1]
    # Bug 2: Inverted boolean return
    if text == reversed_text:
        return False
    return True

print(is_palindrome("Racecar"))`,
    solutionCode: `def is_palindrome(text):
    cleaned = text.lower()
    return cleaned == cleaned[::-1]

print(is_palindrome("Racecar"))`,
    expectedBehavior: 'Return True if the text is a case-insensitive palindrome, False otherwise.',
    inputFormat: 'text: String',
    outputFormat: 'Boolean (True or False)',
    constraints: ['Alphanumeric string characters', 'Must ignore uppercase vs lowercase'],
    hints: 'Call .lower() on the text and return True when text == reversed_text.',
    points: 1,
    visibleTests: [
      { id: 'r1-q2-t1', input: '"Racecar"', expectedOutput: 'True', description: 'Capitalized palindrome word' },
      { id: 'r1-q2-t2', input: '"Python"', expectedOutput: 'False', description: 'Non-palindrome word' }
    ],
    hiddenTests: [
      { id: 'r1-q2-h1', input: '"Madam"', expectedOutput: 'True', description: 'Mixed-case palindrome' },
      { id: 'r1-q2-h2', input: '"12321"', expectedOutput: 'True', description: 'Numeric palindrome string' },
      { id: 'r1-q2-h3', input: '"techastra"', expectedOutput: 'False', description: 'Standard word' }
    ]
  },
  {
    id: 'r1-q3',
    round: 1,
    number: 3,
    title: 'Discount & Final Price Calculator',
    description: 'Calculate the final payable price of an item after applying a percentage discount.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def calculate_final_price(price, discount_percent):
    # Bug 1: Divides by 10 instead of 100
    discount = price * (discount_percent / 10)
    # Bug 2: Surcharges discount instead of subtracting
    final_price = price + discount
    return round(final_price, 2)

print(calculate_final_price(1200.0, 15.0))`,
    solutionCode: `def calculate_final_price(price, discount_percent):
    discount = price * (discount_percent / 100.0)
    final_price = price - discount
    return round(final_price, 2)

print(calculate_final_price(1200.0, 15.0))`,
    expectedBehavior: 'Correctly calculate percentage discount (rate / 100) and deduct it from the initial price.',
    inputFormat: 'price: float, discount_percent: float',
    outputFormat: 'Float final price rounded to 2 decimal places',
    constraints: ['price >= 0', '0 <= discount_percent <= 100'],
    hints: 'Percentage is out of 100 (not 10), and discount must be subtracted from price.',
    points: 1,
    visibleTests: [
      { id: 'r1-q3-t1', input: '1200.0, 15.0', expectedOutput: '1020.0', description: '15% discount on 1200' },
      { id: 'r1-q3-t2', input: '500.0, 10.0', expectedOutput: '450.0', description: '10% discount on 500' }
    ],
    hiddenTests: [
      { id: 'r1-q3-h1', input: '250.0, 0.0', expectedOutput: '250.0', description: '0% discount' },
      { id: 'r1-q3-h2', input: '100.0, 50.0', expectedOutput: '50.0', description: '50% half off' },
      { id: 'r1-q3-h3', input: '199.99, 10.0', expectedOutput: '179.99', description: 'Decimal price' }
    ]
  },
  {
    id: 'r1-q4',
    round: 1,
    number: 4,
    title: 'Find Maximum in Integer List',
    description: 'Find and return the highest integer value in a list of numbers, including lists where all numbers are negative.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def find_maximum(numbers):
    # Bug 1: Initializing to 0 incorrectly fails for negative numbers
    maximum = 0
    for num in numbers:
        # Bug 2: Comparison operator < finds minimum instead of maximum
        if num < maximum:
            maximum = num
    return maximum

print(find_maximum([-12, -5, -20, -3]))`,
    solutionCode: `def find_maximum(numbers):
    maximum = numbers[0]
    for num in numbers:
        if num > maximum:
            maximum = num
    return maximum

print(find_maximum([-12, -5, -20, -3]))`,
    expectedBehavior: 'Correctly identify the maximum number, including when all values are negative.',
    inputFormat: 'numbers: List of integers (non-empty)',
    outputFormat: 'Integer maximum value',
    constraints: ['len(numbers) >= 1', 'Handles negative numbers properly'],
    hints: 'Initialize maximum to numbers[0] instead of 0, and use the > comparison operator.',
    points: 1,
    visibleTests: [
      { id: 'r1-q4-t1', input: '[-12, -5, -20, -3]', expectedOutput: '-3', description: 'Negative list maximum' },
      { id: 'r1-q4-t2', input: '[10, 45, 23]', expectedOutput: '45', description: 'Positive list maximum' }
    ],
    hiddenTests: [
      { id: 'r1-q4-h1', input: '[-100]', expectedOutput: '-100', description: 'Single element list' },
      { id: 'r1-q4-h2', input: '[5, 5, 5]', expectedOutput: '5', description: 'Identical numbers' },
      { id: 'r1-q4-h3', input: '[-1, 0, 1]', expectedOutput: '1', description: 'Mixed sign list' }
    ]
  },
  {
    id: 'r1-q5',
    round: 1,
    number: 5,
    title: 'Count Even Numbers',
    description: 'Count how many even integers are present in a given list of numbers.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def count_evens(numbers):
    for n in numbers:
        # Bug 1: Counter reset inside the loop on each iteration
        count = 0
        # Bug 2: Modulo checks odd numbers (== 1) instead of even (== 0)
        if n % 2 == 1:
            count += 1
    return count

print(count_evens([1, 2, 3, 4, 6, 7]))`,
    solutionCode: `def count_evens(numbers):
    count = 0
    for n in numbers:
        if n % 2 == 0:
            count += 1
    return count

print(count_evens([1, 2, 3, 4, 6, 7]))`,
    expectedBehavior: 'Initialize counter before the loop and check n % 2 == 0 to count even integers.',
    inputFormat: 'numbers: List of integers',
    outputFormat: 'Integer tally of even numbers',
    constraints: ['0 <= len(numbers) <= 1000'],
    hints: 'Move count = 0 outside the for loop and change n % 2 == 1 to n % 2 == 0.',
    points: 1,
    visibleTests: [
      { id: 'r1-q5-t1', input: '[1, 2, 3, 4, 6, 7]', expectedOutput: '3', description: 'Mixed even and odd integers' },
      { id: 'r1-q5-t2', input: '[2, 4, 6]', expectedOutput: '3', description: 'All even numbers' }
    ],
    hiddenTests: [
      { id: 'r1-q5-h1', input: '[1, 3, 5]', expectedOutput: '0', description: 'All odd numbers' },
      { id: 'r1-q5-h2', input: '[]', expectedOutput: '0', description: 'Empty list' },
      { id: 'r1-q5-h3', input: '[0, 8, -2]', expectedOutput: '3', description: 'Zero and negative evens' }
    ]
  },
  {
    id: 'r1-q6',
    round: 1,
    number: 6,
    title: 'Celsius to Fahrenheit Converter',
    description: 'Convert a temperature value from Celsius to Fahrenheit using the standard formula: (C * 9/5) + 32.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def celsius_to_fahrenheit(celsius):
    # Bug 1: Inverted ratio 5 / 9 instead of 9 / 5
    # Bug 2: Subtracts 32 instead of adding 32
    fahrenheit = (celsius * (5 / 9)) - 32
    return round(fahrenheit, 2)

print(celsius_to_fahrenheit(25.0))`,
    solutionCode: `def celsius_to_fahrenheit(celsius):
    fahrenheit = (celsius * (9.0 / 5.0)) + 32
    return round(fahrenheit, 2)

print(celsius_to_fahrenheit(25.0))`,
    expectedBehavior: 'Correctly apply (celsius * 9 / 5) + 32 and return the float value.',
    inputFormat: 'celsius: Numeric float temperature',
    outputFormat: 'Float Fahrenheit temperature rounded to 2 decimal places',
    constraints: ['Valid numeric Celsius temperature'],
    hints: 'Multiply by 9.0 / 5.0 (not 5/9) and add 32 (not subtract).',
    points: 1,
    visibleTests: [
      { id: 'r1-q6-t1', input: '25.0', expectedOutput: '77.0', description: 'Room temperature 25C' },
      { id: 'r1-q6-t2', input: '0.0', expectedOutput: '32.0', description: 'Freezing point 0C' }
    ],
    hiddenTests: [
      { id: 'r1-q6-h1', input: '100.0', expectedOutput: '212.0', description: 'Boiling point 100C' },
      { id: 'r1-q6-h2', input: '-40.0', expectedOutput: '-40.0', description: 'Equal scale point -40' },
      { id: 'r1-q6-h3', input: '37.0', expectedOutput: '98.6', description: 'Body temperature 37C' }
    ]
  },
  {
    id: 'r1-q7',
    round: 1,
    number: 7,
    title: 'Word Frequency Counter',
    description: 'Count how many times each unique word occurs in a list of words, normalized to lowercase.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def count_words(words):
    freq = {}
    for word in words:
        # Bug 1: Missing .lower() causes uppercase words to be stored separately
        if word in freq:
            # Bug 2: Overwrites count to 1 instead of incrementing += 1
            freq[word] = 1
        else:
            freq[word] = 1
    return freq

print(count_words(["apple", "Banana", "APPLE", "banana", "apple"]))`,
    solutionCode: `def count_words(words):
    freq = {}
    for word in words:
        w = word.lower()
        freq[w] = freq.get(w, 0) + 1
    return freq

print(count_words(["apple", "Banana", "APPLE", "banana", "apple"]))`,
    expectedBehavior: 'Return a dictionary with lowercase word keys and their corresponding occurrence counts.',
    inputFormat: 'words: List of string words',
    outputFormat: 'Dictionary of {word: count}',
    constraints: ['Case-insensitive word comparison'],
    hints: 'Convert word to lowercase with word.lower() and increment count with freq[w] += 1 or freq.get(w, 0) + 1.',
    points: 1,
    visibleTests: [
      { id: 'r1-q7-t1', input: '["apple", "Banana", "APPLE", "banana", "apple"]', expectedOutput: "{'apple': 3, 'banana': 2}", description: 'Mixed casing frequency' },
      { id: 'r1-q7-t2', input: '["cat", "dog", "cat"]', expectedOutput: "{'cat': 2, 'dog': 1}", description: 'Basic animal list' }
    ],
    hiddenTests: [
      { id: 'r1-q7-h1', input: '["a", "b", "A"]', expectedOutput: "{'a': 2, 'b': 1}", description: 'Single letter words' },
      { id: 'r1-q7-h2', input: '[]', expectedOutput: '{}', description: 'Empty words list' },
      { id: 'r1-q7-h3', input: '["tech", "TECH", "Tech"]', expectedOutput: "{'tech': 3}", description: 'Identical word different casing' }
    ]
  },
  {
    id: 'r1-q8',
    round: 1,
    number: 8,
    title: 'Factorial Calculator',
    description: 'Calculate the factorial of a non-negative integer n (0! = 1, 5! = 120).',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def factorial(n):
    # Bug 1: Base case 0 returns 0 instead of 1
    if n == 0:
        return 0
    fact = 1
    # Bug 2: Range stops at n instead of n+1 (excluding n)
    for i in range(1, n):
        fact *= i
    return fact

print(factorial(5))`,
    solutionCode: `def factorial(n):
    if n == 0 or n == 1:
        return 1
    fact = 1
    for i in range(1, n + 1):
        fact *= i
    return fact

print(factorial(5))`,
    expectedBehavior: 'Return 1 for 0! and 1!, and calculate the complete product up to n inclusive.',
    inputFormat: 'n: Non-negative integer',
    outputFormat: 'Integer factorial product',
    constraints: ['0 <= n <= 20'],
    hints: '0! is mathematically 1 (not 0), and range must go up to n + 1.',
    points: 1,
    visibleTests: [
      { id: 'r1-q8-t1', input: '5', expectedOutput: '120', description: 'Factorial of 5' },
      { id: 'r1-q8-t2', input: '0', expectedOutput: '1', description: 'Base case zero factorial' }
    ],
    hiddenTests: [
      { id: 'r1-q8-h1', input: '1', expectedOutput: '1', description: 'Factorial of 1' },
      { id: 'r1-q8-h2', input: '4', expectedOutput: '24', description: 'Factorial of 4' },
      { id: 'r1-q8-h3', input: '6', expectedOutput: '720', description: 'Factorial of 6' }
    ]
  },
  {
    id: 'r1-q9',
    round: 1,
    number: 9,
    title: 'Reverse Sublist by Index Range',
    description: 'Reverse a section of a list between indices start and end (inclusive) and return the resulting list.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def reverse_sublist(lst, start, end):
    # Bug 1: Slice excludes end index (should be end + 1)
    sub = lst[start:end]
    # Bug 2: Slicing step [::1] preserves direction instead of reversing [::-1]
    sub_rev = sub[::1]
    return lst[:start] + sub_rev + lst[end + 1:]

print(reverse_sublist([1, 2, 3, 4, 5, 6], 1, 4))`,
    solutionCode: `def reverse_sublist(lst, start, end):
    sub = lst[start:end + 1]
    sub_rev = sub[::-1]
    return lst[:start] + sub_rev + lst[end + 1:]

print(reverse_sublist([1, 2, 3, 4, 5, 6], 1, 4))`,
    expectedBehavior: 'Extract the slice from start to end + 1, reverse it with [::-1], and stitch it back.',
    inputFormat: 'lst: List, start: int, end: int',
    outputFormat: 'New list with sublist reversed',
    constraints: ['0 <= start <= end < len(lst)'],
    hints: 'Make the slice inclusive with lst[start:end + 1] and reverse with [::-1].',
    points: 1,
    visibleTests: [
      { id: 'r1-q9-t1', input: '[1, 2, 3, 4, 5, 6], 1, 4', expectedOutput: '[1, 5, 4, 3, 2, 6]', description: 'Sublist reverse from index 1 to 4' },
      { id: 'r1-q9-t2', input: '[10, 20, 30], 0, 2', expectedOutput: '[30, 20, 10]', description: 'Full list reverse via indices' }
    ],
    hiddenTests: [
      { id: 'r1-q9-h1', input: '[1, 2, 3], 1, 1', expectedOutput: '[1, 2, 3]', description: 'Single element sublist' },
      { id: 'r1-q9-h2', input: '[4, 5, 6, 7, 8], 2, 4', expectedOutput: '[4, 5, 8, 7, 6]', description: 'Sublist reverse 2 to 4' },
      { id: 'r1-q9-h3', input: '["a", "b", "c", "d"], 0, 1', expectedOutput: '["b", "a", "c", "d"]', description: 'String elements sublist' }
    ]
  },
  {
    id: 'r1-q10',
    round: 1,
    number: 10,
    title: 'Vowel Counter',
    description: 'Count the total number of vowels (A, E, I, O, U, case-insensitive) in a given string.',
    difficulty: 'Basic',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def count_vowels(text):
    # Bug 1: Target vowels missing uppercase letters
    vowels = "aeiou"
    for ch in text:
        # Bug 2: Counter initialized inside the loop (resets every iteration)
        count = 0
        if ch in vowels:
            count += 1
    return count

print(count_vowels("Education"))`,
    solutionCode: `def count_vowels(text):
    count = 0
    vowels = "aeiouAEIOU"
    for ch in text:
        if ch in vowels:
            count += 1
    return count

print(count_vowels("Education"))`,
    expectedBehavior: 'Count all vowels whether uppercase or lowercase without resetting the accumulator.',
    inputFormat: 'text: String',
    outputFormat: 'Integer total vowel count',
    constraints: ['Valid string input'],
    hints: 'Initialize count = 0 before the loop and include uppercase vowels "aeiouAEIOU".',
    points: 1,
    visibleTests: [
      { id: 'r1-q10-t1', input: '"Education"', expectedOutput: '5', description: 'Word with both uppercase and lowercase vowels' },
      { id: 'r1-q10-t2', input: '"rhythm"', expectedOutput: '0', description: 'Word with no vowels' }
    ],
    hiddenTests: [
      { id: 'r1-q10-h1', input: '"AEIOU"', expectedOutput: '5', description: 'All uppercase vowels' },
      { id: 'r1-q10-h2', input: '"Python Programming"', expectedOutput: '4', description: 'Sentence string' },
      { id: 'r1-q10-h3', input: '""', expectedOutput: '0', description: 'Empty string' }
    ]
  }
];
