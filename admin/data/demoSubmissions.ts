// ============================================================================
// DEMO DATA — TECHASTRA 2026 CODE RESCUE SUBMISSIONS
// Submissions scored with official structure:
// Round 1 = 1 mark/Q | Round 2 = 2 marks/Q | Round 3 = 5 marks
// ============================================================================

import { Submission } from '../types';

export const DEMO_SUBMISSIONS: Submission[] = [
    {
        id: 'SUB-9001',
        participantId: 'CR-0001',
        participantName: 'Aarav Sundaram',
        round: 'R1',
        question: 'Q4: Binary Search Boundary Bug',
        submissionTime: '12:14:22',
        result: 'PASSED',
        score: 1,
        maxScore: 1,
        code: `def binary_search_boundary(arr, target):
    # FIXED: Replaced right boundary initialization from len(arr) to len(arr) - 1
    # PREVENTED: IndexError on out-of-bounds array access
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        testResults: [
            { testName: 'Target at first element', passed: true, input: '[1, 3, 5], 1', expected: '0', actual: '0' },
            { testName: 'Target at last element', passed: true, input: '[1, 3, 5], 5', expected: '2', actual: '2' },
            { testName: 'Target not found (high)', passed: true, input: '[1, 3, 5], 9', expected: '-1', actual: '-1' },
            { testName: 'Empty array handling', passed: true, input: '[], 2', expected: '-1', actual: '-1' },
        ],
        executionOutput: `Running test suite for Q4...
[PASS] Test 1: arr=[1, 3, 5], target=1 -> Result: 0
[PASS] Test 2: arr=[1, 3, 5], target=5 -> Result: 2
[PASS] Test 3: arr=[1, 3, 5], target=9 -> Result: -1
[PASS] Test 4: arr=[], target=2 -> Result: -1
Summary: 4/4 test cases passed in 0.042s. Score: 1/1 Mark`,
    },
    {
        id: 'SUB-9002',
        participantId: 'CR-0002',
        participantName: 'Bhavani Ramesh',
        round: 'R1',
        question: 'Q7: Nested List Flattener Memory Leak',
        submissionTime: '12:16:40',
        result: 'PASSED',
        score: 1,
        maxScore: 1,
        code: `def flatten_tree(nested):
    # FIXED: Converted recursive accumulator from default arg mutable list to clean recursion
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten_tree(item))
        else:
            result.append(item)
    return result`,
        testResults: [
            { testName: 'Single depth list', passed: true },
            { testName: 'Arbitrary depth nesting', passed: true },
            { testName: 'Repeated calls isolation', passed: true },
        ],
        executionOutput: `Test Results: 3/3 passed. Recursion depth safe. Score: 1/1 Mark`,
    },
    {
        id: 'SUB-9003',
        participantId: 'CR-0003',
        participantName: 'Chetan Karthik',
        round: 'R2',
        question: 'Q2: LRU Cache Eviction Deadlock',
        submissionTime: '12:08:11',
        result: 'FAILED',
        score: 0,
        maxScore: 2,
        code: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        # BUG: Eviction order never updated on access!
        return self.cache[key]
        
    def put(self, key: int, value: int) -> None:
        if len(self.cache) >= self.capacity:
            # BUG: Pops arbitrary dict key instead of least recently used
            self.cache.pop(next(iter(self.cache)))
        self.cache[key] = value`,
        testResults: [
            { testName: 'Basic put and get', passed: true },
            { testName: 'Evict least recently used on capacity', passed: false, expected: '2 evicted', actual: '1 evicted' },
            { testName: 'Update existing key moves to front', passed: false },
        ],
        executionOutput: `AssertionError: Key 2 was incorrectly evicted when Key 1 was least recently accessed.
Score: 0/2 Marks`,
        errorTraceback: `Traceback (most recent call last):
  File "test_runner.py", line 42, in test_lru_eviction
    self.assertEqual(cache.get(2), 2)
AssertionError: -1 != 2`,
    },
    {
        id: 'SUB-9004',
        participantId: 'CR-0005',
        participantName: 'Eashwar Pradeep',
        round: 'R1',
        question: 'Q3: String Tokenizer Regex ReDoS',
        submissionTime: '12:02:18',
        result: 'SYNTAX_ERROR',
        score: 0,
        maxScore: 1,
        code: `def parse_log_line(line):
    # Syntax error: Unmatched parenthesis in regex compile
    pattern = re.compile(r"(\\[([^\\]]+)\\]"
    return pattern.findall(line)`,
        testResults: [],
        executionOutput: `SyntaxError during compilation of triage script.`,
        errorTraceback: `  File "solution.py", line 3
    pattern = re.compile(r"(\\[([^\\]]+)\\]"
                                          ^
SyntaxError: '(' was never closed`,
    },
    {
        id: 'SUB-9005',
        participantId: 'CR-0007',
        participantName: 'Gowtham Raj',
        round: 'R3',
        question: 'Q1: Student Expense & Scholarship Analyzer',
        submissionTime: '12:22:04',
        result: 'PASSED',
        score: 5,
        maxScore: 5,
        code: `def analyze_expenses(records, budget_limit):
    # All 5 bugs rescued:
    # 1. ZeroDivisionError avoided on empty input
    # 2. Inverted budget check fixed
    # 3. Negative entries filtered
    # 4. Syntax colon restored
    # 5. Categories sorted alphabetically
    valid_expenses = []
    for item in records:
        cat = item[0]
        amt = item[1]
        if amt > 0:
            valid_expenses.append((cat, amt))
    total = sum(amt for cat, amt in valid_expenses)
    count = len(valid_expenses)
    average = (total / count) if count > 0 else 0
    return {"total": total, "average": average}`,
        testResults: [
            { testName: 'Empty records zero-safe', passed: true },
            { testName: 'Budget threshold condition', passed: true },
            { testName: 'Sorted categories output', passed: true },
        ],
        executionOutput: `Comprehensive suite passed. Flagship rescued! Score: 5/5 Marks`,
    },
];
