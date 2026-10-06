import { Question } from '../types/competition';

export const round3Question: Question = {
  id: 'r3-q1',
  round: 3,
  number: 1,
  title: 'Student Expense & Scholarship Analyzer System',
  description: `You are assigned to rescue a critical college module: the **Student Expense & Scholarship Eligibility Analyzer**.

The system processes student expense logs represented as tuples of \`(category, amount)\`, calculates summary analytics, checks budget threshold compliance, and computes a scholarship need index.

However, the previous developer left behind multiple critical bugs:
- **Syntax Error**: Malformed function declaration / dictionary structure.
- **Runtime Error**: Uncaught \`ZeroDivisionError\` when an empty list or zero-expense dataset is evaluated.
- **Logical Error**: Inverted condition when checking scholarship threshold eligibility.
- **Edge-Case Bug**: Negative expense entries erroneously distort the total and count instead of being filtered out.
- **Output Formatting Bug**: Category summaries are required to be sorted alphabetically by category name, but are currently returned unsorted.

### Your Mission: Rescue the Code!
Thoroughly inspect the system, locate all defects, repair them, verify with the test runner, and submit the complete working solution before time expires.`,
  difficulty: 'Advanced',
  language: 'python',
  bugType: 'Multiple Issues',
  brokenCode: `def analyze_expenses(records, budget_limit):
    # Bug 1 (Edge-case): Negative amounts should be ignored/filtered
    # Bug 2 (Syntax): Missing colon in if statement below
    # Bug 3 (Runtime): ZeroDivisionError when records are empty
    # Bug 4 (Logic): Inverted budget check (< instead of <=)
    # Bug 5 (Output): Categories must be sorted alphabetically
    
    valid_expenses = []
    for item in records
        cat = item[0]
        amt = item[1]
        if amt > 0: # Missing colon or handling
            valid_expenses.append((cat, amt))
            
    total = sum(amt for cat, amt in valid_expenses)
    count = len(valid_expenses)
    
    # CRASH: Raises ZeroDivisionError when valid_expenses is empty
    average = total / count
    
    max_expense = 0
    if valid_expenses:
        max_expense = max(amt for cat, amt in valid_expenses)
        
    categories = {}
    for cat, amt in valid_expenses:
        categories[cat] = categories.get(cat, 0) + amt
        
    # Bug: Categories should be a list of tuples sorted alphabetically by name
    sorted_categories = list(categories.items()) # Unsorted!
    
    # Bug: Should be True if total <= budget_limit, currently total > budget_limit
    within_budget = total > budget_limit
    
    return {
        "total": round(total, 2),
        "average": round(average, 2),
        "max": round(max_expense, 2),
        "categories": sorted_categories,
        "within_budget": within_budget
    }

# Test sample
sample_records = [("Books", 120), ("Food", 45), ("Travel", 35), ("Food", 50)]
print(analyze_expenses(sample_records, 300))`,
  solutionCode: `def analyze_expenses(records, budget_limit):
    valid_expenses = []
    for item in records:
        cat = item[0]
        amt = item[1]
        if amt > 0:
            valid_expenses.append((cat, amt))
            
    total = sum(amt for cat, amt in valid_expenses)
    count = len(valid_expenses)
    
    # Safely handle empty records
    average = (total / count) if count > 0 else 0.0
    
    max_expense = 0.0
    if valid_expenses:
        max_expense = max(amt for cat, amt in valid_expenses)
        
    categories = {}
    for cat, amt in valid_expenses:
        categories[cat] = categories.get(cat, 0) + amt
        
    # Sort categories alphabetically by category name
    sorted_categories = sorted(categories.items(), key=lambda x: x[0])
    
    # Within budget if total is less than or equal to budget limit
    within_budget = total <= budget_limit
    
    return {
        "total": round(total, 2),
        "average": round(average, 2),
        "max": round(max_expense, 2),
        "categories": sorted_categories,
        "within_budget": within_budget
    }

sample_records = [("Books", 120), ("Food", 45), ("Travel", 35), ("Food", 50)]
print(analyze_expenses(sample_records, 300))`,
  expectedBehavior: 'Filter negative values, safely handle empty logs with 0.0 average, sort categories alphabetically, and correctly evaluate within_budget (total <= budget_limit).',
  inputFormat: 'records: List of tuples (category_str, amount_num), budget_limit: float',
  outputFormat: 'Dictionary with keys: total, average, max, categories (sorted list of (name, total)), within_budget (bool)',
  constraints: [
    '0 <= len(records) <= 1000',
    'Amounts can be integers or floats',
    'Negative or zero amounts must be excluded from calculations',
    'If no valid expenses exist, average and max must return 0.0'
  ],
  hints: 'Watch out for division by zero on empty inputs, check the colon on the loop header, sort categories by category[0], and verify the comparison operator for within_budget.',
  points: 100,
  visibleTests: [
    {
      id: 'r3-t1',
      input: '[("Books", 120), ("Food", 45), ("Travel", 35), ("Food", 50)], 300',
      expectedOutput: "{'total': 250, 'average': 62.5, 'max': 120, 'categories': [('Books', 120), ('Food', 95), ('Travel', 35)], 'within_budget': True}",
      description: 'Standard multi-item log within budget'
    },
    {
      id: 'r3-t2',
      input: '[("Tuition", 800), ("Food", 300)], 1000',
      expectedOutput: "{'total': 1100, 'average': 550.0, 'max': 800, 'categories': [('Food', 300), ('Tuition', 800)], 'within_budget': False}",
      description: 'Expenses exceed budget limit'
    }
  ],
  hiddenTests: [
    {
      id: 'r3-h1',
      input: '[], 500',
      expectedOutput: "{'total': 0, 'average': 0.0, 'max': 0.0, 'categories': [], 'within_budget': True}",
      description: 'Empty records: zero division guard check'
    },
    {
      id: 'r3-h2',
      input: '[("Refund", -50), ("Food", 100)], 200',
      expectedOutput: "{'total': 100, 'average': 100.0, 'max': 100, 'categories': [('Food', 100)], 'within_budget': True}",
      description: 'Negative expense filter check'
    },
    {
      id: 'r3-h3',
      input: '[("Travel", 50), ("Books", 50), ("Art", 50)], 150',
      expectedOutput: "{'total': 150, 'average': 50.0, 'max': 50, 'categories': [('Art', 50), ('Books', 50), ('Travel', 50)], 'within_budget': True}",
      description: 'Alphabetical category ordering check: Art, Books, Travel'
    },
    {
      id: 'r3-h4',
      input: '[("Laptop", 1200)], 1200',
      expectedOutput: "{'total': 1200, 'average': 1200.0, 'max': 1200, 'categories': [('Laptop', 1200)], 'within_budget': True}",
      description: 'Exact budget boundary (total == budget_limit is within budget)'
    },
    {
      id: 'r3-h5',
      input: '[("Coffee", 0), ("Snack", -10), ("Lunch", 15)], 20',
      expectedOutput: "{'total': 15, 'average': 15.0, 'max': 15, 'categories': [('Lunch', 15)], 'within_budget': True}",
      description: 'Zero and negative amounts excluded from count and average'
    },
    {
      id: 'r3-h6',
      input: '[("Zebra Supplies", 40), ("Apple Store", 60), ("Stationery", 20)], 100',
      expectedOutput: "{'total': 120, 'average': 40.0, 'max': 60, 'categories': [('Apple Store', 60), ('Stationery', 20), ('Zebra Supplies', 40)], 'within_budget': False}",
      description: 'Exceeded budget with multi-tier alphabetical categories'
    }
  ]
};
