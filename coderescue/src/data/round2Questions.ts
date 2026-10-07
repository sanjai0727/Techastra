import { Question } from '../types/competition';

export const round2Questions: Question[] = [
  {
    id: 'r2-q1',
    round: 2,
    number: 1,
    title: 'Electricity Tariff Slabs & Surcharge Calculator',
    description: `Calculate the electricity bill based on consumption slabs:
- First 100 units: ₹2.50 per unit
- Units above 100: ₹4.50 per unit
- Fixed meter charge: ₹50.0 for 'domestic', ₹150.0 for 'commercial'
- High consumption surcharge: If the energy bill exceeds ₹1000.0, a 5% surcharge is added to the energy bill before adding the fixed charge.

The starter code has 5 distinct bugs affecting boundary conditions, marginal slab math, surcharge calculations, meter lookup, and fixed charge sign.`,
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def calculate_electricity_bill(units, meter_type):
    # Bug 1: Strict < 100 drops exactly 100 units into the upper tier
    # Bug 2: Multiplies entire units by 4.5 instead of marginal units above 100
    energy = units * 2.5 if units < 100 else 100 * 2.5 + units * 4.5
    # Bug 3: Surcharge calculated on unit count instead of energy bill
    surcharge = units * 0.05 if energy > 1000 else 0.0
    # Bug 4: String lookup checks 'comm' instead of 'commercial'
    fixed = 150.0 if meter_type.lower() == 'comm' else 50.0
    # Bug 5: Subtracts fixed charge instead of adding it
    total = energy + surcharge - fixed
    return round(total, 2)

print(calculate_electricity_bill(250, "domestic"))`,
    solutionCode: `def calculate_electricity_bill(units, meter_type):
    energy = units * 2.5 if units <= 100 else 100 * 2.5 + (units - 100) * 4.5
    surcharge = energy * 0.05 if energy > 1000 else 0.0
    fixed = 150.0 if meter_type.lower() == "commercial" else 50.0
    total = energy + surcharge + fixed
    return round(total, 2)

print(calculate_electricity_bill(250, "domestic"))`,
    expectedBehavior: 'Correctly apply <= 100 slab boundary, (units - 100) marginal calculation, 5% energy surcharge, case-insensitive "commercial" meter check, and add the fixed charge.',
    inputFormat: 'units: int, meter_type: str ("domestic" or "commercial")',
    outputFormat: 'Float total bill rounded to 2 decimal places',
    constraints: ['units >= 0', 'meter_type in ("domestic", "commercial")'],
    hints: 'Use units <= 100, calculate (units - 100) * 4.5 for excess units, apply 0.05 to energy (not units), check meter_type.lower() == "commercial", and add fixed.',
    points: 4,
    visibleTests: [
      { id: 'r2-q1-t1', input: '250, "domestic"', expectedOutput: '975.0', description: '250 units domestic tariff' },
      { id: 'r2-q1-t2', input: '50, "domestic"', expectedOutput: '175.0', description: 'Under 100 units domestic' }
    ],
    hiddenTests: [
      { id: 'r2-q1-h1', input: '300, "commercial"', expectedOutput: '1357.5', description: 'Over 1000 surcharge commercial' },
      { id: 'r2-q1-h2', input: '100, "domestic"', expectedOutput: '300.0', description: 'Exact 100 unit boundary' },
      { id: 'r2-q1-h3', input: '200, "commercial"', expectedOutput: '850.0', description: '200 units commercial' }
    ]
  },
  {
    id: 'r2-q2',
    round: 2,
    number: 2,
    title: 'Student Academic Evaluation & Ranking Engine',
    description: `Evaluate a student academic performance across subjects:
- Total: Sum of all marks
- Average: total / len(marks), rounded to 2 decimal places
- Distinction count: Count of subjects with mark >= 75
- Grade: 'A' if average >= 75, else 'B'. However, if any subject mark is < 40, the student immediately receives 'F'.

The starter code has 5 distinct bugs in list slicing, fail condition check, distinction threshold, grade cutoff order, and dictionary key name.`,
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def evaluate_student(marks):
    # Bug 1: Slice marks[:-1] omits the last subject mark
    total = sum(marks[:-1])
    average = round(total / len(marks), 2)
    # Bug 2: Inverted fail rule: flags fail if mark > 40
    failed = any(m > 40 for m in marks)
    # Bug 3: Strict distinction check > 75 instead of >= 75
    distinction_count = sum(1 for m in marks if m > 75)
    # Bug 4: Inverted grade cutoff: assigns 'A' when average < 75
    grade = "F" if failed else ("A" if average < 75 else "B")
    # Bug 5: Typo in dictionary key 'avg' instead of 'average'
    return {
        "total": total,
        "avg": average,
        "grade": grade,
        "distinction_count": distinction_count
    }

print(evaluate_student([85, 90, 78, 65, 82]))`,
    solutionCode: `def evaluate_student(marks):
    total = sum(marks)
    average = round(total / len(marks), 2)
    failed = any(m < 40 for m in marks)
    distinction_count = sum(1 for m in marks if m >= 75)
    grade = "F" if failed else ("A" if average >= 75 else "B")
    return {
        "total": total,
        "average": average,
        "grade": grade,
        "distinction_count": distinction_count
    }

print(evaluate_student([85, 90, 78, 65, 82]))`,
    expectedBehavior: 'Sum all marks, check m < 40 for fail, check m >= 75 for distinction, assign A for average >= 75, and return dictionary with key "average".',
    inputFormat: 'marks: List of integers (0 to 100)',
    outputFormat: 'Dictionary: {"total": int, "average": float, "grade": str, "distinction_count": int}',
    constraints: ['len(marks) >= 1', 'Marks between 0 and 100'],
    hints: 'Use sum(marks), check m < 40 for failure, m >= 75 for distinction, average >= 75 for "A", and ensure the key is "average".',
    points: 4,
    visibleTests: [
      { id: 'r2-q2-t1', input: '[85, 90, 78, 65, 82]', expectedOutput: "{'total': 400, 'average': 80.0, 'grade': 'A', 'distinction_count': 4}", description: 'Pass with grade A and distinctions' },
      { id: 'r2-q2-t2', input: '[60, 70, 65, 68, 72]', expectedOutput: "{'total': 335, 'average': 67.0, 'grade': 'B', 'distinction_count': 0}", description: 'Pass with grade B' }
    ],
    hiddenTests: [
      { id: 'r2-q2-h1', input: '[95, 30, 80, 85, 90]', expectedOutput: "{'total': 380, 'average': 76.0, 'grade': 'F', 'distinction_count': 4}", description: 'Subject failure triggers grade F' },
      { id: 'r2-q2-h2', input: '[75, 75, 75]', expectedOutput: "{'total': 225, 'average': 75.0, 'grade': 'A', 'distinction_count': 3}", description: 'Exact 75 boundary' },
      { id: 'r2-q2-h3', input: '[100, 100]', expectedOutput: "{'total': 200, 'average': 100.0, 'grade': 'A', 'distinction_count': 2}", description: 'Perfect marks' }
    ]
  },
  {
    id: 'r2-q3',
    round: 2,
    number: 3,
    title: 'E-Commerce Shopping Cart & Checkout Engine',
    description: `Process an e-commerce shopping cart containing line items:
- Each item: {'name': str, 'price': float, 'qty': int}. Items with qty <= 0 must be ignored.
- Subtotal: Sum of price * qty for valid items.
- Coupon: If coupon is 'SAVE10', apply a 10% discount on subtotal.
- Member discount: If is_member is True and subtotal > 0, add an additional ₹100.0 discount. Total discount cannot exceed subtotal.
- Net: subtotal - discount.
- Tax: 5% GST on net amount.
- Shipping: ₹50.0 if net < 500.0 (and net > 0), else FREE (₹0.0).

The starter code has 5 distinct bugs in quantity validation, subtotal calculation, member discount application, tax base calculation, and shipping condition.`,
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def calculate_cart_checkout(items, coupon, is_member):
    # Bug 1: Does not filter items with qty <= 0
    # Bug 2: Adds price + qty instead of multiplying
    subtotal = sum(item["price"] + item["qty"] for item in items)
    discount = subtotal * 0.10 if coupon == "SAVE10" else 0.0
    # Bug 3: Member discount deducted from subtotal instead of added to discount pool
    if is_member:
        subtotal -= 100.0
    net = max(0.0, subtotal - discount)
    # Bug 4: Tax computed on undiscounted subtotal instead of net amount
    tax = round(subtotal * 0.05, 2)
    # Bug 5: Inverted shipping condition: charges 50 when net >= 500
    shipping = 50.0 if net >= 500.0 else 0.0
    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "final_total": round(net + tax + shipping, 2)
    }

print(calculate_cart_checkout([{"price": 800, "qty": 2}, {"price": 300, "qty": 1}], "SAVE10", True))`,
    solutionCode: `def calculate_cart_checkout(items, coupon, is_member):
    subtotal = sum(item["price"] * item["qty"] for item in items if item.get("qty", 0) > 0)
    discount = subtotal * 0.10 if coupon == "SAVE10" else 0.0
    if is_member and subtotal > 0:
        discount += 100.0
    discount = min(discount, subtotal)
    net = subtotal - discount
    tax = round(net * 0.05, 2)
    shipping = 0.0 if (net >= 500.0 or net == 0.0) else 50.0
    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "final_total": round(net + tax + shipping, 2)
    }

print(calculate_cart_checkout([{"price": 800, "qty": 2}, {"price": 300, "qty": 1}], "SAVE10", True))`,
    expectedBehavior: 'Filter qty <= 0, multiply price * qty, pool member discount into discount, compute tax on net, and offer free shipping for net >= 500.',
    inputFormat: 'items: list[dict], coupon: str, is_member: bool',
    outputFormat: 'Dictionary: {"subtotal": float, "discount": float, "final_total": float}',
    constraints: ['Items have price >= 0'],
    hints: 'Filter if item["qty"] > 0, multiply price * qty, add 100 to discount (not subtract from subtotal), tax on net, shipping 0 if net >= 500.',
    points: 4,
    visibleTests: [
      { id: 'r2-q3-t1', input: '[{"price": 800, "qty": 2}, {"price": 300, "qty": 1}], "SAVE10", True', expectedOutput: "{'subtotal': 1900.0, 'discount': 290.0, 'final_total': 1690.5}", description: 'Two items with coupon and membership' },
      { id: 'r2-q3-t2', input: '[{"price": 200, "qty": 1}], "NONE", False', expectedOutput: "{'subtotal': 200.0, 'discount': 0.0, 'final_total': 260.0}", description: 'Order under 500 with shipping' }
    ],
    hiddenTests: [
      { id: 'r2-q3-h1', input: '[{"price": 500, "qty": 1}, {"price": 100, "qty": -1}], "NONE", False', expectedOutput: "{'subtotal': 500.0, 'discount': 0.0, 'final_total': 525.0}", description: 'Negative quantity line item ignored' },
      { id: 'r2-q3-h2', input: '[], "SAVE10", True', expectedOutput: "{'subtotal': 0.0, 'discount': 0.0, 'final_total': 0.0}", description: 'Empty cart' },
      { id: 'r2-q3-h3', input: '[{"price": 1000, "qty": 2}], "SAVE10", False', expectedOutput: "{'subtotal': 2000.0, 'discount': 200.0, 'final_total': 1890.0}", description: 'High value cart' }
    ]
  },
  {
    id: 'r2-q4',
    round: 2,
    number: 4,
    title: 'Matrix Diagonals & Boundary Cell Aggregator',
    description: `Given an n x n square matrix of integers:
- main_diag: Sum of elements where row == col
- sec_diag: Sum of elements where row + col == n - 1
- boundary: Sum of all cells located on the outer border (row 0, row n-1, col 0, col n-1), with each cell counted exactly once.

The starter code has 5 distinct bugs in loop range, accumulator reset, secondary diagonal index out-of-bounds, boundary corner double-counting, and swapped dictionary keys.`,
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def matrix_diagonals_and_boundary(matrix):
    n = len(matrix)
    main_diag, sec_diag = 0, 0
    # Bug 1: Loop range(n - 1) ignores the last row
    for i in range(n - 1):
        # Bug 2: main_diag reset inside loop
        main_diag = 0
        main_diag += matrix[i][i]
        # Bug 3: IndexError: matrix[i][n - i] instead of n - i - 1
        sec_diag += matrix[i][n - i]
    # Bug 4: Boundary double-counts corners
    boundary = sum(matrix[0]) + sum(matrix[n - 1]) + sum(matrix[r][0] + matrix[r][n - 1] for r in range(n))
    # Bug 5: Swapped keys for main and secondary diagonals
    return {"main_diag": sec_diag, "sec_diag": main_diag, "boundary": boundary}

print(matrix_diagonals_and_boundary([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))`,
    solutionCode: `def matrix_diagonals_and_boundary(matrix):
    n = len(matrix)
    main_diag = sum(matrix[i][i] for i in range(n))
    sec_diag = sum(matrix[i][n - i - 1] for i in range(n))
    boundary = sum(matrix[r][c] for r in range(n) for c in range(n) if r == 0 or r == n - 1 or c == 0 or c == n - 1)
    return {"main_diag": main_diag, "sec_diag": sec_diag, "boundary": boundary}

print(matrix_diagonals_and_boundary([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))`,
    expectedBehavior: 'Iterate across all n rows, use n - i - 1 for secondary diagonal, count boundary cells uniquely, and return correctly mapped dictionary keys.',
    inputFormat: 'matrix: 2D list of integers (square n x n)',
    outputFormat: 'Dictionary: {"main_diag": int, "sec_diag": int, "boundary": int}',
    constraints: ['Matrix is square (n x n)', 'n >= 1'],
    hints: 'Loop over range(n), secondary diagonal is matrix[i][n - i - 1], check cell on border if r==0 or r==n-1 or c==0 or c==n-1, assign correct keys.',
    points: 4,
    visibleTests: [
      { id: 'r2-q4-t1', input: '[[1, 2, 3], [4, 5, 6], [7, 8, 9]]', expectedOutput: "{'main_diag': 15, 'sec_diag': 15, 'boundary': 40}", description: '3x3 standard matrix' },
      { id: 'r2-q4-t2', input: '[[5]]', expectedOutput: "{'main_diag': 5, 'sec_diag': 5, 'boundary': 5}", description: '1x1 single cell matrix' }
    ],
    hiddenTests: [
      { id: 'r2-q4-h1', input: '[[1, 2], [3, 4]]', expectedOutput: "{'main_diag': 5, 'sec_diag': 5, 'boundary': 10}", description: '2x2 matrix' },
      { id: 'r2-q4-h2', input: '[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1]]', expectedOutput: "{'main_diag': 4, 'sec_diag': 4, 'boundary': 4}", description: '4x4 sparse matrix' },
      { id: 'r2-q4-h3', input: '[[2, 1, 3], [1, 4, 1], [3, 1, 2]]', expectedOutput: "{'main_diag': 8, 'sec_diag': 10, 'boundary': 16}", description: '3x3 asymmetric diagonal' }
    ]
  },
  {
    id: 'r2-q5',
    round: 2,
    number: 5,
    title: 'Password & Security Token Validator',
    description: `Validate user access credentials:
- Password: Length 8 to 20, contains at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character from '!@#$%^&*', and no whitespace characters.
- Token: Starts with prefix 'TK-', length exactly 8, and remaining characters after prefix must be hexadecimal (0-9, a-f, A-F).
- is_authorized: True only if BOTH password and token are valid.

The starter code has 5 distinct bugs in password length logic, special character set definition, whitespace check, token prefix check, and logical operator for authorization.`,
    difficulty: 'Intermediate',
    language: 'python',
    bugType: 'Multiple Issues',
    brokenCode: `def validate_credentials(password, token):
    # Bug 1: Length condition checks <= 8 instead of >= 8
    len_ok = len(password) <= 8 and len(password) <= 20
    has_char = (any(c.isupper() for c in password) and any(c.islower() for c in password) 
                and any(c.isdigit() for c in password))
    # Bug 2: Specials string missing symbols @#$
    has_spec = any(c in "!%^&*" for c in password)
    # Bug 3: Inverted space check: requires space instead of forbidding
    has_no_space = ' ' in password
    pw_valid = len_ok and has_char and has_spec and has_no_space
    # Bug 4: Token prefix checks 'TK' (len 2) instead of 'TK-' (len 3)
    tk_valid = token.startswith("TK") and len(token) == 8 and all(c in "0123456789abcdefABCDEF" for c in token[2:])
    # Bug 5: Authorization uses OR instead of AND
    return {"password_valid": pw_valid, "token_valid": tk_valid, "is_authorized": pw_valid or tk_valid}

print(validate_credentials("Secure@Pass123", "TK-4F2A1"))`,
    solutionCode: `def validate_credentials(password, token):
    len_ok = 8 <= len(password) <= 20
    has_char = (any(c.isupper() for c in password) and any(c.islower() for c in password) 
                and any(c.isdigit() for c in password))
    has_spec = any(c in "!@#$%^&*" for c in password)
    has_no_space = ' ' not in password
    pw_valid = bool(len_ok and has_char and has_spec and has_no_space)
    tk_valid = (token.startswith("TK-") and len(token) == 8 and 
                all(c in "0123456789abcdefABCDEF" for c in token[3:]))
    return {"password_valid": pw_valid, "token_valid": tk_valid, "is_authorized": pw_valid and tk_valid}

print(validate_credentials("Secure@Pass123", "TK-4F2A1"))`,
    expectedBehavior: 'Verify password length >= 8 and <= 20, check special character including @#$, forbid spaces, verify prefix "TK-", and require BOTH valid for authorization.',
    inputFormat: 'password: str, token: str',
    outputFormat: 'Dictionary: {"password_valid": bool, "token_valid": bool, "is_authorized": bool}',
    constraints: ['Valid string inputs'],
    hints: '8 <= len(password) <= 20, specials must include "@#$", check " " not in password, token starts with "TK-", and authorization is pw_valid and tk_valid.',
    points: 4,
    visibleTests: [
      { id: 'r2-q5-t1', input: '"Secure@Pass123", "TK-4F2A1"', expectedOutput: "{'password_valid': True, 'token_valid': True, 'is_authorized': True}", description: 'Valid credentials' },
      { id: 'r2-q5-t2', input: '"weak", "TK-4F2A1"', expectedOutput: "{'password_valid': False, 'token_valid': True, 'is_authorized': False}", description: 'Short password' }
    ],
    hiddenTests: [
      { id: 'r2-q5-h1', input: '"Valid#Pass1", "TK-ZZZZZ"', expectedOutput: "{'password_valid': True, 'token_valid': False, 'is_authorized': False}", description: 'Invalid token non-hex' },
      { id: 'r2-q5-h2', input: '"Pass with space1!", "TK-12345"', expectedOutput: "{'password_valid': False, 'token_valid': True, 'is_authorized': False}", description: 'Password with space' },
      { id: 'r2-q5-h3', input: '"NoSpecial123", "TK-ABCDE"', expectedOutput: "{'password_valid': False, 'token_valid': True, 'is_authorized': False}", description: 'Password without special char' }
    ]
  }
];
