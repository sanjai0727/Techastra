import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Preformatted, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#4b5563"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "TECHASTRA '26 — CODE RESCUE")
            self.drawRightString(558, 755, "OFFICIAL VALIDATED QUESTION BANK")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)

        # Footer
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Techastra 2026 | Code Rescue Championship (Calibrated & Streamlined)")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def create_code_rescue_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0284c7'),
        alignment=1,
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )
    
    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155'),
        spaceBefore=4,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        spaceAfter=3
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#334155'),
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0369a1')
    )

    code_num_style = ParagraphStyle(
        'CodeNum',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=8.5,
        textColor=colors.HexColor('#94a3b8'),
        alignment=2
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=8.5,
        textColor=colors.HexColor('#0f172a')
    )

    def make_code_box(code_text, bg_color='#f8fafc', border_color='#cbd5e1'):
        cleaned = code_text.strip()
        lines = cleaned.split('\n')
        data = []
        for idx, line in enumerate(lines, 1):
            disp_line = line if line.strip() else ' '
            data.append([
                Paragraph(f"{idx:2d}", code_num_style),
                Preformatted(disp_line, code_style)
            ])
        t = Table(data, colWidths=[20, 484])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg_color)),
            ('LINEBEFORE', (1, 0), (1, -1), 0.5, colors.HexColor(border_color)),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor(border_color)),
            ('TOPPADDING', (0, 0), (-1, -1), 0.75),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0.75),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ]))
        return t

    def make_kv_table(rows):
        formatted_rows = []
        for k, v in rows:
            formatted_rows.append([
                Paragraph(f"<b>{k}:</b>", ParagraphStyle('kv_k', parent=body_style, fontName='Helvetica-Bold', fontSize=8)),
                Paragraph(v, ParagraphStyle('kv_v', parent=body_style, fontSize=8))
            ])
        t = Table(formatted_rows, colWidths=[105, 399])
        t.setStyle(TableStyle([
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        return t

    story = []

    # Title Banner
    story.append(Paragraph("Techastra '26 — Code Rescue", title_style))
    story.append(Paragraph("OFFICIAL DEBUGGING CHAMPIONSHIP QUESTION BANK (CALIBRATED & STREAMLINED)", subtitle_style))
    story.append(Paragraph("<b>Authoritative Competition Blueprint:</b> Liberal Difficulty | Exactly 2 Bugs (R1), 5 Bugs (R2), 10 Bugs (R3) | Streamlined & Concise Code", ParagraphStyle('c_sub', parent=body_style, alignment=1, fontSize=8.5, textColor=colors.HexColor('#64748b'))))
    story.append(Spacer(1, 8))

    # Tournament Rules Table
    rules_data = [
        [
            Paragraph("<b>Round</b>", meta_style),
            Paragraph("<b>Stage Title</b>", meta_style),
            Paragraph("<b>Questions</b>", meta_style),
            Paragraph("<b>Bugs / Q</b>", meta_style),
            Paragraph("<b>Marks / Q</b>", meta_style),
            Paragraph("<b>Total Marks</b>", meta_style),
            Paragraph("<b>Duration</b>", meta_style),
            Paragraph("<b>Cutoff</b>", meta_style)
        ],
        [
            Paragraph("<b>Round 1</b>", body_style),
            Paragraph("Bug Hunt (Easy / Fast)", body_style),
            Paragraph("10 Questions", body_style),
            Paragraph("<b>Exactly 2</b>", body_style),
            Paragraph("1 Mark", body_style),
            Paragraph("<b>10 Marks</b>", body_style),
            Paragraph("15 Mins", body_style),
            Paragraph("<b>≥ 5 Marks</b>", body_style)
        ],
        [
            Paragraph("<b>Round 2</b>", body_style),
            Paragraph("Logic Breaker (Liberal)", body_style),
            Paragraph("5 Questions", body_style),
            Paragraph("<b>Exactly 5</b>", body_style),
            Paragraph("4 Marks", body_style),
            Paragraph("<b>20 Marks</b>", body_style),
            Paragraph("20 Mins", body_style),
            Paragraph("<b>≥ 10 Marks</b>", body_style)
        ],
        [
            Paragraph("<b>Round 3</b>", body_style),
            Paragraph("Code Rescue Finale", body_style),
            Paragraph("1 Grand System", body_style),
            Paragraph("<b>Exactly 10</b>", body_style),
            Paragraph("5 Marks", body_style),
            Paragraph("<b>5 Marks</b>", body_style),
            Paragraph("25 Mins", body_style),
            Paragraph("Leaderboard", body_style)
        ],
        [
            Paragraph("<b>TOTAL</b>", ParagraphStyle('tb_b', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>All 3 Rounds</b>", ParagraphStyle('tb_b', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>16 Challenges</b>", ParagraphStyle('tb_b', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("<b>55 Total Bugs</b>", ParagraphStyle('tb_b', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("-", body_style),
            Paragraph("<b>35 Marks</b>", ParagraphStyle('tb_b', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0284c7'))),
            Paragraph("<b>60 Mins</b>", ParagraphStyle('tb_b', parent=body_style, fontName='Helvetica-Bold')),
            Paragraph("Top Rankers", body_style)
        ]
    ]

    t_rules = Table(rules_data, colWidths=[52, 105, 62, 54, 52, 58, 48, 55])
    t_rules.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0f2fe')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#0284c7')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f8fafc')),
    ]))
    story.append(t_rules)
    story.append(Spacer(1, 10))

    # ==========================================
    # ROUND 1 QUESTIONS
    # ==========================================
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=6))
    story.append(Paragraph("ROUND 1 — BUG HUNT", h1_style))
    story.append(Paragraph("<b>Format:</b> 10 Questions | <b>Target:</b> Exactly 2 Bugs per Question | <b>Difficulty:</b> Liberal / Accessible (Beginner Friendly) | <b>Score:</b> 1 Mark each (Total: 10 Marks) | <b>Duration:</b> 15 Minutes", ParagraphStyle('r1_sub', parent=body_style, textColor=colors.HexColor('#0369a1'))))
    story.append(Spacer(1, 6))

    r1_questions = [
        {
            "num": "Q1",
            "title": "Student Marks Average",
            "concept": "List Iteration & Arithmetic Division",
            "desc": "Calculate the arithmetic average of marks in a student's mark list, returned as a float rounded to 2 decimal places.",
            "contract": "def calculate_average(marks: list[int]) -> float",
            "sample_in": "[78, 85, 92, 88]",
            "sample_out": "85.75",
            "buggy_code": """def calculate_average(marks):
    total = 0
    for i in range(len(marks) - 1):
        total += marks[i]
    return total // len(marks)""",
            "bugs": [
                "<b>Bug 1 (Line 3):</b> Loop range uses <code>range(len(marks) - 1)</code>, which excludes the last element in the list.",
                "<b>Bug 2 (Line 5):</b> Uses integer floor division <code>//</code> instead of floating-point division <code>/</code>, discarding decimal accuracy."
            ],
            "fixed_code": """def calculate_average(marks):
    if not marks:
        return 0.0
    total = 0
    for i in range(len(marks)):
        total += marks[i]
    return round(total / len(marks), 2)""",
            "tests": "Visible: [78, 85, 92, 88] -> 85.75 | [100, 90] -> 95.0 | Hidden: [45, 55, 65, 75] -> 60.0 | [10] -> 10.0"
        },
        {
            "num": "Q2",
            "title": "Palindrome String Checker",
            "concept": "String Slicing & Case Sensitivity",
            "desc": "Determine whether an input string reads identically forwards and backwards, ignoring character case.",
            "contract": "def is_palindrome(text: str) -> bool",
            "sample_in": "'Racecar'",
            "sample_out": "True",
            "buggy_code": """def is_palindrome(text):
    reversed_text = text[::-1]
    if text == reversed_text:
        return False
    return True""",
            "bugs": [
                "<b>Bug 1 (Line 2):</b> Does not call <code>.lower()</code> on <code>text</code>, causing uppercase letters to fail palindrome symmetry (e.g. 'Racecar').",
                "<b>Bug 2 (Lines 3-5):</b> Returns <code>False</code> when <code>text == reversed_text</code> and <code>True</code> otherwise (inverted boolean logic)."
            ],
            "fixed_code": """def is_palindrome(text):
    cleaned = text.lower()
    return cleaned == cleaned[::-1]""",
            "tests": "Visible: 'Racecar' -> True | 'Python' -> False | Hidden: 'Madam' -> True | '12321' -> True | 'techastra' -> False"
        },
        {
            "num": "Q3",
            "title": "Discount & Final Price Calculator",
            "concept": "Percentage Arithmetic & Price Deduction",
            "desc": "Calculate the final payable price after applying a percentage discount to an item's original price.",
            "contract": "def calculate_final_price(price: float, discount_percent: float) -> float",
            "sample_in": "price = 1200.0, discount_percent = 15.0",
            "sample_out": "1020.0",
            "buggy_code": """def calculate_final_price(price, discount_percent):
    discount = price * (discount_percent / 10)
    final_price = price + discount
    return round(final_price, 2)""",
            "bugs": [
                "<b>Bug 1 (Line 2):</b> Divides <code>discount_percent</code> by <code>10</code> instead of <code>100</code>, inflating discount by 10x.",
                "<b>Bug 2 (Line 3):</b> Adds <code>discount</code> to <code>price</code> instead of subtracting it (price surcharge instead of discount)."
            ],
            "fixed_code": """def calculate_final_price(price, discount_percent):
    discount = price * (discount_percent / 100.0)
    final_price = price - discount
    return round(final_price, 2)""",
            "tests": "Visible: (1200.0, 15.0) -> 1020.0 | (500.0, 10.0) -> 450.0 | Hidden: (250.0, 0.0) -> 250.0 | (199.99, 50.0) -> 100.0"
        },
        {
            "num": "Q4",
            "title": "Find Maximum in Integer List",
            "concept": "Initialization Boundary & Comparison Operator",
            "desc": "Find and return the maximum integer value in a non-empty list of integers, including lists of negative numbers.",
            "contract": "def find_maximum(numbers: list[int]) -> int",
            "sample_in": "[-12, -5, -20, -3]",
            "sample_out": "-3",
            "buggy_code": """def find_maximum(numbers):
    maximum = 0
    for num in numbers:
        if num < maximum:
            maximum = num
    return maximum""",
            "bugs": [
                "<b>Bug 1 (Line 2):</b> Initializes <code>maximum = 0</code>, which incorrectly yields <code>0</code> when all numbers in the list are negative.",
                "<b>Bug 2 (Line 4):</b> Uses <code>if num < maximum</code> (minimum search) instead of <code>num > maximum</code>."
            ],
            "fixed_code": """def find_maximum(numbers):
    maximum = numbers[0]
    for num in numbers:
        if num > maximum:
            maximum = num
    return maximum""",
            "tests": "Visible: [-12, -5, -20, -3] -> -3 | [10, 45, 23] -> 45 | Hidden: [-100] -> -100 | [5, 5, 5] -> 5 | [-1, 0, 1] -> 1"
        },
        {
            "num": "Q5",
            "title": "Count Even Numbers",
            "concept": "Loop Variable Scope & Modulo Condition",
            "desc": "Count how many even integers are present in a given list of integers.",
            "contract": "def count_evens(numbers: list[int]) -> int",
            "sample_in": "[1, 2, 3, 4, 6, 7]",
            "sample_out": "3",
            "buggy_code": """def count_evens(numbers):
    for n in numbers:
        count = 0
        if n % 2 == 1:
            count += 1
    return count""",
            "bugs": [
                "<b>Bug 1 (Line 3):</b> Counter <code>count = 0</code> is reinitialized inside the loop, resetting the tally on every iteration.",
                "<b>Bug 2 (Line 4):</b> Checks <code>n % 2 == 1</code>, which counts odd numbers instead of even numbers."
            ],
            "fixed_code": """def count_evens(numbers):
    count = 0
    for n in numbers:
        if n % 2 == 0:
            count += 1
    return count""",
            "tests": "Visible: [1, 2, 3, 4, 6, 7] -> 3 | [2, 4, 6] -> 3 | Hidden: [1, 3, 5] -> 0 | [] -> 0 | [0, 8, -2] -> 3"
        },
        {
            "num": "Q6",
            "title": "Celsius to Fahrenheit Converter",
            "concept": "Arithmetic Order of Operations & Formula Constants",
            "desc": "Convert a given temperature in Celsius to Fahrenheit using the formula (C * 9/5) + 32, rounded to 2 decimal places.",
            "contract": "def celsius_to_fahrenheit(celsius: float) -> float",
            "sample_in": "25.0",
            "sample_out": "77.0",
            "buggy_code": """def celsius_to_fahrenheit(celsius):
    fahrenheit = (celsius * (5 / 9)) - 32
    return round(fahrenheit, 2)""",
            "bugs": [
                "<b>Bug 1 (Line 2):</b> Inverts temperature ratio to <code>5 / 9</code> instead of <code>9 / 5</code>.",
                "<b>Bug 2 (Line 2):</b> Subtracts <code>32</code> instead of adding <code>32</code> in the conversion equation."
            ],
            "fixed_code": """def celsius_to_fahrenheit(celsius):
    fahrenheit = (celsius * (9.0 / 5.0)) + 32
    return round(fahrenheit, 2)""",
            "tests": "Visible: 25.0 -> 77.0 | 0.0 -> 32.0 | Hidden: 100.0 -> 212.0 | -40.0 -> -40.0 | 37.0 -> 98.6"
        },
        {
            "num": "Q7",
            "title": "Word Frequency Counter",
            "concept": "Dictionary Mutation & Case Normalization",
            "desc": "Count the frequency of each unique word in a list of words, normalized to lowercase.",
            "contract": "def count_words(words: list[str]) -> dict[str, int]",
            "sample_in": "['apple', 'Banana', 'APPLE', 'banana', 'apple']",
            "sample_out": "{'apple': 3, 'banana': 2}",
            "buggy_code": """def count_words(words):
    freq = {}
    for word in words:
        if word in freq:
            freq[word] = 1
        else:
            freq[word] = 1
    return freq""",
            "bugs": [
                "<b>Bug 1 (Line 3):</b> Does not convert words with <code>.lower()</code>, causing uppercase variants to be treated as distinct keys.",
                "<b>Bug 2 (Line 5):</b> Sets <code>freq[word] = 1</code> when the key is already found instead of incrementing <code>freq[word] += 1</code>."
            ],
            "fixed_code": """def count_words(words):
    freq = {}
    for word in words:
        w = word.lower()
        freq[w] = freq.get(w, 0) + 1
    return freq""",
            "tests": "Visible: ['apple', 'Banana', 'APPLE', 'banana', 'apple'] -> {'apple': 3, 'banana': 2} | Hidden: ['a', 'b', 'A'] -> {'a': 2, 'b': 1} | [] -> {}"
        },
        {
            "num": "Q8",
            "title": "Factorial Calculator",
            "concept": "Base Case Initialization & Range Boundary",
            "desc": "Calculate the factorial of a non-negative integer n (0! = 1, 5! = 120).",
            "contract": "def factorial(n: int) -> int",
            "sample_in": "5",
            "sample_out": "120",
            "buggy_code": """def factorial(n):
    if n == 0:
        return 0
    fact = 1
    for i in range(1, n):
        fact *= i
    return fact""",
            "bugs": [
                "<b>Bug 1 (Line 3):</b> Base case <code>n == 0</code> returns <code>0</code> instead of <code>1</code> (0! is mathematically 1).",
                "<b>Bug 2 (Line 5):</b> Range loop <code>range(1, n)</code> stops at <code>n - 1</code>, excluding the multiplicand <code>n</code> itself."
            ],
            "fixed_code": """def factorial(n):
    if n == 0 or n == 1:
        return 1
    fact = 1
    for i in range(1, n + 1):
        fact *= i
    return fact""",
            "tests": "Visible: 5 -> 120 | 0 -> 1 | Hidden: 1 -> 1 | 4 -> 24 | 6 -> 720"
        },
        {
            "num": "Q9",
            "title": "Reverse Sublist by Index Range",
            "concept": "Slicing Index Inclusivity & Direction Step",
            "desc": "Reverse a portion of a list between indices start and end (inclusive) and return the resulting list.",
            "contract": "def reverse_sublist(lst: list, start: int, end: int) -> list",
            "sample_in": "lst = [1, 2, 3, 4, 5, 6], start = 1, end = 4",
            "sample_out": "[1, 5, 4, 3, 2, 6]",
            "buggy_code": """def reverse_sublist(lst, start, end):
    sub = lst[start:end]
    sub_rev = sub[::1]
    return lst[:start] + sub_rev + lst[end + 1:]""",
            "bugs": [
                "<b>Bug 1 (Line 2):</b> Slice <code>lst[start:end]</code> excludes index <code>end</code>; must be <code>lst[start:end + 1]</code> for inclusivity.",
                "<b>Bug 2 (Line 3):</b> Slicing step <code>[::1]</code> preserves forward direction; must be <code>[::-1]</code> to reverse."
            ],
            "fixed_code": """def reverse_sublist(lst, start, end):
    sub = lst[start:end + 1]
    sub_rev = sub[::-1]
    return lst[:start] + sub_rev + lst[end + 1:]""",
            "tests": "Visible: ([1, 2, 3, 4, 5, 6], 1, 4) -> [1, 5, 4, 3, 2, 6] | Hidden: ([10, 20, 30], 0, 2) -> [30, 20, 10] | ([1, 2, 3], 1, 1) -> [1, 2, 3]"
        },
        {
            "num": "Q10",
            "title": "Vowel Counter",
            "concept": "Character Membership & Accumulator Scope",
            "desc": "Count the total number of vowels (A, E, I, O, U, case-insensitive) in a given string.",
            "contract": "def count_vowels(text: str) -> int",
            "sample_in": "'Education'",
            "sample_out": "5",
            "buggy_code": """def count_vowels(text):
    vowels = "aeiou"
    for ch in text:
        count = 0
        if ch in vowels:
            count += 1
    return count""",
            "bugs": [
                "<b>Bug 1 (Line 4):</b> Counter <code>count = 0</code> is reset inside the loop body on every character inspection.",
                "<b>Bug 2 (Line 2):</b> Vowel target string contains only lowercase <code>'aeiou'</code>, missing uppercase vowels like 'E' in 'Education'."
            ],
            "fixed_code": """def count_vowels(text):
    count = 0
    vowels = "aeiouAEIOU"
    for ch in text:
        if ch in vowels:
            count += 1
    return count""",
            "tests": "Visible: 'Education' -> 5 | 'rhythm' -> 0 | Hidden: 'AEIOU' -> 5 | 'Python Programming' -> 4 | '' -> 0"
        }
    ]

    for q in r1_questions:
        story.append(Paragraph(f"<b>{q['num']}. {q['title']}</b> ({q['concept']})", h2_style))
        story.append(make_kv_table([
            ("Work Order", q['desc']),
            ("Function Signature", f"<code>{q['contract']}</code>"),
            ("Verification Sample", f"Input: <code>{q['sample_in']}</code> &rarr; Expected Output: <b><code>{q['sample_out']}</code></b>")
        ]))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>Buggy Starter Code (2 Errors Injected):</b>", h3_style))
        story.append(make_code_box(q['buggy_code'], bg_color='#fff1f2', border_color='#fecdd3'))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>Identified Errors & Explanation:</b>", h3_style))
        for b in q['bugs']:
            story.append(Paragraph(f"&bull; {b}", bullet_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>Verified Correct Solution:</b>", h3_style))
        story.append(make_code_box(q['fixed_code'], bg_color='#f0fdf4', border_color='#bbf7d0'))
        story.append(Spacer(1, 1))
        story.append(Paragraph(f"<b>Test Baseline:</b> {q['tests']}", ParagraphStyle('tb', parent=body_style, fontSize=7, textColor=colors.HexColor('#64748b'))))
        story.append(Spacer(1, 6))

    # ==========================================
    # ROUND 2 QUESTIONS (STREAMLINED & CONCISE)
    # ==========================================
    story.append(PageBreak())
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=6))
    story.append(Paragraph("ROUND 2 — LOGIC BREAKER (STREAMLINED)", h1_style))
    story.append(Paragraph("<b>Format:</b> 5 Questions | <b>Target:</b> Exactly 5 Bugs per Question | <b>Difficulty:</b> Liberal / Moderate (Calibrated for 4 Mins/Q) | <b>Score:</b> 4 Marks each (Total: 20 Marks) | <b>Duration:</b> 20 Minutes", ParagraphStyle('r2_sub', parent=body_style, textColor=colors.HexColor('#0369a1'))))
    story.append(Spacer(1, 6))

    r2_questions = [
        {
            "num": "Q1",
            "title": "Electricity Tariff Slabs & Surcharge Calculator",
            "domain": "Utility Billing & Multi-Tier Slabs",
            "desc": "Calculate electricity bill: first 100 units @ ₹2.50/unit; units above 100 @ ₹4.50/unit. Fixed meter charge: ₹50 for 'domestic', ₹150 for 'commercial'. If energy bill exceeds ₹1000, a 5% surcharge is added to the energy bill before adding fixed charge.",
            "contract": "def calculate_electricity_bill(units: int, meter_type: str) -> float",
            "sample_in": "units = 250, meter_type = 'domestic'",
            "sample_out": "975.0  (Energy: 100*2.5 + 150*4.5 = 925.0, Fixed: 50.0)",
            "buggy_code": """def calculate_electricity_bill(units, meter_type):
    # BUG 1: strict < 100 ignores 100 unit boundary
    # BUG 2: multiplies entire units by 4.5 instead of marginal units
    energy = units * 2.5 if units < 100 else 100 * 2.5 + units * 4.5
    # BUG 3: surcharge calculated on unit count instead of energy bill
    surcharge = units * 0.05 if energy > 1000 else 0.0
    # BUG 4: checks 'comm' instead of 'commercial'
    fixed = 150.0 if meter_type.lower() == 'comm' else 50.0
    # BUG 5: subtracts fixed charge instead of adding it
    total = energy + surcharge - fixed
    return round(total, 2)""",
            "bugs": [
                "<b>Bug 1 (Line 4):</b> Slab boundary uses <code>units < 100</code> instead of <code>units <= 100</code>.",
                "<b>Bug 2 (Line 4):</b> Computes <code>units * 4.5</code> on full consumption instead of marginal units <code>(units - 100) * 4.5</code>.",
                "<b>Bug 3 (Line 6):</b> Computes 5% surcharge on consumption count <code>units * 0.05</code> instead of monetary <code>energy * 0.05</code>.",
                "<b>Bug 4 (Line 8):</b> String lookup checks token <code>'comm'</code> instead of expected parameter <code>'commercial'</code>.",
                "<b>Bug 5 (Line 10):</b> Fixed meter charge is deducted <code>- fixed</code> instead of added <code>+ fixed</code>."
            ],
            "fixed_code": """def calculate_electricity_bill(units, meter_type):
    energy = units * 2.5 if units <= 100 else 100 * 2.5 + (units - 100) * 4.5
    surcharge = energy * 0.05 if energy > 1000 else 0.0
    fixed = 150.0 if meter_type.lower() == 'commercial' else 50.0
    total = energy + surcharge + fixed
    return round(total, 2)""",
            "tests": "Visible: (250, 'domestic') -> 975.0 | (50, 'domestic') -> 175.0 | Hidden: (300, 'commercial') -> 1357.5 | (100, 'domestic') -> 300.0"
        },
        {
            "num": "Q2",
            "title": "Student Academic Evaluation & Ranking Engine",
            "domain": "Academic Analytics & Categorization",
            "desc": "Calculate total marks, average, grade ('A' if average >= 75 else 'B'), and count of subjects with distinction (>= 75). If any subject has marks < 40, grade is immediately 'F'.",
            "contract": "def evaluate_student(marks: list[int]) -> dict",
            "sample_in": "[85, 90, 78, 65, 82]",
            "sample_out": "{'total': 400, 'average': 80.0, 'grade': 'A', 'distinction_count': 4}",
            "buggy_code": """def evaluate_student(marks):
    # BUG 1: omits last mark from sum
    total = sum(marks[:-1])
    average = round(total / len(marks), 2)
    # BUG 2: inverted fail rule: flags fail if mark > 40
    failed = any(m > 40 for m in marks)
    # BUG 3: strict distinction check > 75 instead of >= 75
    distinction_count = sum(1 for m in marks if m > 75)
    # BUG 4: inverted grade cutoff: assigns 'C' for high average and 'A' for low
    grade = "F" if failed else ("A" if average < 75 else "B")
    # BUG 5: typo in key 'avg' instead of 'average'
    return {
        "total": total,
        "avg": average,
        "grade": grade,
        "distinction_count": distinction_count
    }""",
            "bugs": [
                "<b>Bug 1 (Line 3):</b> Slice <code>marks[:-1]</code> excludes the last mark from the total.",
                "<b>Bug 2 (Line 6):</b> Inverted passing condition: <code>m > 40</code> flags passing students as failed.",
                "<b>Bug 3 (Line 8):</b> Distinction check uses strict inequality <code>m > 75</code> instead of <code>m >= 75</code>.",
                "<b>Bug 4 (Line 10):</b> Ternary condition inverted: assigns 'A' when <code>average < 75</code>.",
                "<b>Bug 5 (Line 14):</b> Returned dictionary uses truncated key <code>'avg'</code> instead of <code>'average'</code>."
            ],
            "fixed_code": """def evaluate_student(marks):
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
    }""",
            "tests": "Visible: [85, 90, 78, 65, 82] -> {'total': 400, 'average': 80.0, 'grade': 'A', 'distinction_count': 4} | Hidden: [95, 30, 80] -> grade: 'F'"
        },
        {
            "num": "Q3",
            "title": "E-Commerce Shopping Cart & Checkout Engine",
            "domain": "Retail Cart Processing & Tiered Promotions",
            "desc": "Process a cart of items (each item has 'name', 'price', 'qty'). Ignore items with qty <= 0. Subtotal = sum(price * qty). Coupon 'SAVE10' gives 10% off. Members get flat ₹100 discount. Apply 5% GST on net amount. Shipping is ₹50 if net < 500, else FREE (₹0).",
            "contract": "def calculate_cart_checkout(items: list[dict], coupon: str, is_member: bool) -> dict",
            "sample_in": "items = [{'price': 800, 'qty': 2}, {'price': 300, 'qty': 1}], coupon = 'SAVE10', is_member = True",
            "sample_out": "{'subtotal': 1900.0, 'discount': 290.0, 'final_total': 1690.5}",
            "buggy_code": """def calculate_cart_checkout(items, coupon, is_member):
    # BUG 1: does not skip items with qty <= 0
    # BUG 2: adds price + qty instead of multiplying
    subtotal = sum(item["price"] + item["qty"] for item in items)
    discount = subtotal * 0.10 if coupon == "SAVE10" else 0.0
    # BUG 3: member discount deducted from subtotal instead of added to discount
    if is_member:
        subtotal -= 100.0
    net = max(0.0, subtotal - discount)
    # BUG 4: tax computed on subtotal instead of net amount
    tax = round(subtotal * 0.05, 2)
    # BUG 5: inverted shipping condition: charges 50 when net >= 500
    shipping = 50.0 if net >= 500.0 else 0.0
    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "final_total": round(net + tax + shipping, 2)
    }""",
            "bugs": [
                "<b>Bug 1 (Line 4):</b> Does not filter invalid lines with <code>qty <= 0</code>.",
                "<b>Bug 2 (Line 4):</b> Computes line total as addition <code>price + qty</code> instead of multiplication <code>price * qty</code>.",
                "<b>Bug 3 (Line 8):</b> Mutates base <code>subtotal</code> directly instead of accumulating into <code>discount</code>.",
                "<b>Bug 4 (Line 11):</b> Computes GST on original <code>subtotal</code> instead of net discounted amount.",
                "<b>Bug 5 (Line 13):</b> Free shipping conditional is inverted: charges ₹50 shipping on high orders (>= 500)."
            ],
            "fixed_code": """def calculate_cart_checkout(items, coupon, is_member):
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
    }""",
            "tests": "Visible: 2 items @ 800x2 + 300x1, 'SAVE10', True -> final_total: 1690.5 | Hidden: 1 item @ 200x1, 'NONE', False -> final_total: 260.0"
        },
        {
            "num": "Q4",
            "title": "Matrix Diagonals & Boundary Cell Aggregator",
            "domain": "2D Matrix Processing & Geometric Traversal",
            "desc": "Given an n x n square matrix of integers, calculate: 1. Main diagonal sum (row == col); 2. Secondary diagonal sum (row + col == n - 1); 3. Boundary sum (all outer border cells, counted once). Return dictionary with 'main_diag', 'sec_diag', and 'boundary'.",
            "contract": "def matrix_diagonals_and_boundary(matrix: list[list[int]]) -> dict",
            "sample_in": "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
            "sample_out": "{'main_diag': 15, 'sec_diag': 15, 'boundary': 40}",
            "buggy_code": """def matrix_diagonals_and_boundary(matrix):
    n = len(matrix)
    main_diag, sec_diag = 0, 0
    # BUG 1: loop range(n - 1) ignores last row
    for i in range(n - 1):
        # BUG 2: main_diag reset inside loop
        main_diag = 0
        main_diag += matrix[i][i]
        # BUG 3: IndexError: matrix[i][n - i] instead of n - i - 1
        sec_diag += matrix[i][n - i]
    # BUG 4: boundary double-counts corners
    boundary = sum(matrix[0]) + sum(matrix[n - 1]) + sum(matrix[r][0] + matrix[r][n - 1] for r in range(n))
    # BUG 5: swapped keys for main and secondary diagonals
    return {"main_diag": sec_diag, "sec_diag": main_diag, "boundary": boundary}""",
            "bugs": [
                "<b>Bug 1 (Line 5):</b> Loop runs <code>range(n - 1)</code>, omitting the final matrix row.",
                "<b>Bug 2 (Line 7):</b> Reinitializes accumulator <code>main_diag = 0</code> inside loop body.",
                "<b>Bug 3 (Line 9):</b> Computes index <code>matrix[i][n - i]</code>, throwing fatal <code>IndexError</code>.",
                "<b>Bug 4 (Line 11):</b> Boundary sum naively adds border rows and border columns, double-counting all four corners.",
                "<b>Bug 5 (Line 13):</b> Output dictionary swaps assignment of <code>main_diag</code> and <code>sec_diag</code>."
            ],
            "fixed_code": """def matrix_diagonals_and_boundary(matrix):
    n = len(matrix)
    main_diag = sum(matrix[i][i] for i in range(n))
    sec_diag = sum(matrix[i][n - i - 1] for i in range(n))
    boundary = sum(matrix[r][c] for r in range(n) for c in range(n) if r == 0 or r == n - 1 or c == 0 or c == n - 1)
    return {"main_diag": main_diag, "sec_diag": sec_diag, "boundary": boundary}""",
            "tests": "Visible: 3x3 matrix [[1,2,3],[4,5,6],[7,8,9]] -> {'main_diag': 15, 'sec_diag': 15, 'boundary': 40} | Hidden: 1x1 matrix [[5]] -> boundary: 5"
        },
        {
            "num": "Q5",
            "title": "Password & Security Token Validator",
            "domain": "Authentication & Input Sanitization",
            "desc": "Validate user security credentials. Password must be length 8-20, contain uppercase, lowercase, digit, special character from '!@#$%^&*', and no whitespace. Token must start with 'TK-', length 8, with hex characters after prefix. Both must be valid for is_authorized.",
            "contract": "def validate_credentials(password: str, token: str) -> dict",
            "sample_in": "password = 'Secure@Pass123', token = 'TK-4F2A1'",
            "sample_out": "{'password_valid': True, 'token_valid': True, 'is_authorized': True}",
            "buggy_code": """def validate_credentials(password, token):
    # BUG 1: length condition checks <= 8 instead of >= 8
    len_ok = len(password) <= 8 and len(password) <= 20
    has_char = (any(c.isupper() for c in password) and any(c.islower() for c in password) 
                and any(c.isdigit() for c in password))
    # BUG 2: specials string missing @#$
    has_spec = any(c in "!%^&*" for c in password)
    # BUG 3: inverted space check: requires space instead of forbidding
    has_no_space = ' ' in password
    pw_valid = len_ok and has_char and has_spec and has_no_space
    # BUG 4: token prefix checks 'TK' (len 2) instead of 'TK-' (len 3)
    tk_valid = token.startswith("TK") and len(token) == 8 and all(c in "0123456789abcdefABCDEF" for c in token[2:])
    # BUG 5: authorization uses OR instead of AND
    return {"password_valid": pw_valid, "token_valid": tk_valid, "is_authorized": pw_valid or tk_valid}""",
            "bugs": [
                "<b>Bug 1 (Line 3):</b> Password length condition checks <code>len(password) <= 8</code> instead of <code>len(password) >= 8</code>.",
                "<b>Bug 2 (Line 6):</b> Special character string definition omits <code>@</code>, <code>#</code>, and <code>$</code>.",
                "<b>Bug 3 (Line 8):</b> Whitespace check inverted: <code>' ' in password</code> requires a space instead of forbidding.",
                "<b>Bug 4 (Line 11):</b> Prefix check verifies <code>'TK'</code> without the hyphen <code>'TK-'</code>.",
                "<b>Bug 5 (Line 13):</b> Master authorization flag combines credentials using <code>pw_valid or tk_valid</code> instead of strict <code>and</code>."
            ],
            "fixed_code": """def validate_credentials(password, token):
    len_ok = 8 <= len(password) <= 20
    has_char = (any(c.isupper() for c in password) and any(c.islower() for c in password) 
                and any(c.isdigit() for c in password))
    has_spec = any(c in "!@#$%^&*" for c in password)
    has_no_space = ' ' not in password
    pw_valid = bool(len_ok and has_char and has_spec and has_no_space)
    tk_valid = (token.startswith("TK-") and len(token) == 8 and 
                all(c in "0123456789abcdefABCDEF" for c in token[3:]))
    return {"password_valid": pw_valid, "token_valid": tk_valid, "is_authorized": pw_valid and tk_valid}""",
            "tests": "Visible: ('Secure@Pass123', 'TK-4F2A1') -> is_authorized: True | Hidden: ('weak', 'TK-4F2A1') -> is_authorized: False"
        }
    ]

    for q in r2_questions:
        story.append(Paragraph(f"<b>{q['num']}. {q['title']}</b> ({q['domain']})", h2_style))
        story.append(make_kv_table([
            ("Work Order", q['desc']),
            ("Function Signature", f"<code>{q['contract']}</code>"),
            ("Verification Sample", f"Input: <code>{q['sample_in']}</code> &rarr; Expected Output: <b><code>{q['sample_out']}</code></b>")
        ]))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>Buggy Starter Code (5 Errors Injected):</b>", h3_style))
        story.append(make_code_box(q['buggy_code'], bg_color='#fff1f2', border_color='#fecdd3'))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>Identified Errors & Explanation:</b>", h3_style))
        for b in q['bugs']:
            story.append(Paragraph(f"&bull; {b}", bullet_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>Verified Correct Solution:</b>", h3_style))
        story.append(make_code_box(q['fixed_code'], bg_color='#f0fdf4', border_color='#bbf7d0'))
        story.append(Spacer(1, 1))
        story.append(Paragraph(f"<b>Test Baseline:</b> {q['tests']}", ParagraphStyle('tb', parent=body_style, fontSize=7, textColor=colors.HexColor('#64748b'))))
        story.append(Spacer(1, 6))

    # ==========================================
    # ROUND 3 - CODE RESCUE FINALE (CONCISE 38 LINES)
    # ==========================================
    story.append(PageBreak())
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=6))
    story.append(Paragraph("ROUND 3 — CODE RESCUE FINALE (STREAMLINED ARCHITECTURE)", h1_style))
    story.append(Paragraph("<b>Format:</b> 1 Integrated Enterprise System | <b>Target:</b> Exactly 10 Bugs Total | <b>Difficulty:</b> Liberal / Comprehensive Architecture | <b>Score:</b> 5 Marks | <b>Duration:</b> 25 Minutes | <b>Code Length:</b> 38 Lines", ParagraphStyle('r3_sub', parent=body_style, textColor=colors.HexColor('#0369a1'))))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Flagship Challenge: Smart Restaurant Billing & Order Dispatch System</b>", h2_style))
    story.append(Paragraph("The system powers an omnichannel restaurant ordering and dispatch engine. It validates line items against a menu catalog, calculates loyalty tier discounts and promotional coupons, computes state GST and distance-based delivery logistics fees, and orchestrates the certified customer invoice. The starter code has been <b>streamlined to only 38 lines of code</b> while containing <b>exactly 10 logical and runtime defects</b>.", body_style))
    story.append(Spacer(1, 4))

    story.append(make_kv_table([
        ("Architecture", "2 Streamlined Pipeline Functions: calculate_discounted_bill &rarr; generate_order_invoice"),
        ("Verification Baseline", "Order: 2 Burgers (₹150 ea) + 1 Pizza (₹250), Tier: 'GOLD', Coupon: 'FEAST50', Distance: 5.5 km"),
        ("Baseline Output", "Subtotal: ₹550.0 | Discount: ₹132.50 | GST (5%): ₹20.88 | Delivery: ₹55.00 | <b>Grand Total: ₹493.38</b> (Status: CONFIRMED, Order: 'ORD-1001')")
    ]))
    story.append(Spacer(1, 6))

    r3_streamlined_buggy = """# FUNCTION 1: ITEM TOTALS & PROMO PRICING (Bugs 1 to 5)
def calculate_discounted_bill(order_items, menu_catalog, tier, coupon):
    subtotal = 0.0
    errors = []
    for item in order_items:
        name, qty = item.get("name"), item.get("qty", 0)
        # BUG 1: unhandled KeyError on unknown menu item (missing 'in' check)
        price = menu_catalog[name]
        if qty <= 0:
            errors.append(f"Invalid qty for {name}")
            continue
        # BUG 2: adds price + qty instead of multiplying
        subtotal += price + qty

    # BUG 3: strict lowercase comparison fails on uppercase 'GOLD'
    # BUG 4: silver rate typo 0.50 (50%) instead of 0.05
    rate = 0.20 if tier == "platinum" else (0.15 if tier == "gold" else (0.50 if tier.lower() == "silver" else 0.0))
    discount = subtotal * rate
    if coupon == "FEAST50" and subtotal >= 300:
        discount += 50.0
    discount = min(discount, subtotal * 0.50)
    
    # BUG 5: adds discount to subtotal instead of subtracting
    discounted_amount = subtotal + discount
    return {"subtotal": round(subtotal, 2), "discount": round(discount, 2), 
            "discounted_amount": round(discounted_amount, 2), "errors": errors}

# FUNCTION 2: INVOICE LOGISTICS & GRAND TOTAL (Bugs 6 to 10)
def generate_order_invoice(order_id, order_items, menu_catalog, tier, coupon, distance_km):
    bill = calculate_discounted_bill(order_items, menu_catalog, tier, coupon)
    net = bill["discounted_amount"]
    if bill["subtotal"] == 0:
        return {"order_id": order_id, "status": "REJECTED"}

    # BUG 6: integer division (5 // 100) results in 0.0 GST
    gst = round(net * (5 // 100), 2)
    # BUG 7: overage ignores base slab of Rs 30 for first 3 km
    delivery = 0.0 if distance_km <= 0 else (30.0 if distance_km <= 3.0 else distance_km * 10.0)

    # BUG 8: subtracts delivery fee from total instead of adding
    grand_total = net + gst - delivery
    # BUG 9: inverted status: sets REJECTED when grand_total > 0
    status = "REJECTED" if grand_total > 0 else "CONFIRMED"

    # BUG 10: missing 'order_id' key in invoice payload
    return {
        "subtotal": bill["subtotal"],
        "discount": bill["discount"],
        "gst": gst,
        "delivery_fee": round(delivery, 2),
        "grand_total": round(grand_total, 2),
        "status": status
    }"""

    story.append(Paragraph("<b>Streamlined Buggy Starter Code (Only 38 Lines | 10 Bugs Injected):</b>", h3_style))
    story.append(make_code_box(r3_streamlined_buggy, bg_color='#fff1f2', border_color='#fecdd3'))
    story.append(Spacer(1, 6))

    r3_bugs_list = [
        "<b>Bug 1 (Line 8):</b> Direct dictionary lookup <code>menu_catalog[name]</code> raises fatal <code>KeyError</code> on unrecognized items.",
        "<b>Bug 2 (Line 13):</b> Computes line total as addition <code>price + qty</code> instead of multiplication <code>price * qty</code>.",
        "<b>Bug 3 (Line 17):</b> Tier equality compares raw lowercase <code>tier == 'gold'</code>, failing on standard uppercase tokens <code>'GOLD'</code>.",
        "<b>Bug 4 (Line 17):</b> Silver membership rate contains a decimal typo <code>0.50</code> (50%) instead of <code>0.05</code> (5%).",
        "<b>Bug 5 (Line 23):</b> Computes <code>discounted_amount = subtotal + discount</code>, surcharging customers instead of deducting.",
        "<b>Bug 6 (Line 34):</b> GST evaluated using integer floor division <code>(5 // 100)</code>, evaluating to <code>0</code>, resulting in zero tax.",
        "<b>Bug 7 (Line 36):</b> Overages compute <code>distance_km * 10.0</code>, omitting the required base tier of ₹30 for the initial 3 km.",
        "<b>Bug 8 (Line 39):</b> Subtracts logistics charges <code>- delivery</code> instead of adding logistics to payable invoice.",
        "<b>Bug 9 (Line 41):</b> Confirmation flag is inverted: flags orders as <code>'REJECTED'</code> when payable amount is positive.",
        "<b>Bug 10 (Lines 44-51):</b> Output invoice dictionary fails to return the required identification field <code>'order_id'</code>."
    ]

    r3_elements = [
        Paragraph("<b>Identified Errors & Breakdown (10 Bugs Total):</b>", h3_style)
    ]
    for b in r3_bugs_list:
        r3_elements.append(Paragraph(f"&bull; {b}", bullet_style))
    story.append(KeepTogether(r3_elements))
    story.append(Spacer(1, 6))

    r3_streamlined_fixed = """def calculate_discounted_bill(order_items, menu_catalog, tier, coupon):
    subtotal = 0.0
    errors = []
    for item in order_items:
        name, qty = item.get("name"), item.get("qty", 0)
        if name not in menu_catalog:
            errors.append(f"Item not found: {name}")
            continue
        if qty <= 0:
            errors.append(f"Invalid qty for {name}")
            continue
        subtotal += menu_catalog[name] * qty

    t = tier.upper() if tier else "BRONZE"
    rate = 0.20 if t == "PLATINUM" else (0.15 if t == "GOLD" else (0.05 if t == "SILVER" else 0.0))
    discount = subtotal * rate
    if coupon == "FEAST50" and subtotal >= 300:
        discount += 50.0
    discount = min(discount, subtotal * 0.50)
    discounted_amount = subtotal - discount
    return {"subtotal": round(subtotal, 2), "discount": round(discount, 2), 
            "discounted_amount": round(discounted_amount, 2), "errors": errors}

def generate_order_invoice(order_id, order_items, menu_catalog, tier, coupon, distance_km):
    bill = calculate_discounted_bill(order_items, menu_catalog, tier, coupon)
    if bill["subtotal"] == 0:
        return {"order_id": order_id, "status": "REJECTED"}

    net = bill["discounted_amount"]
    gst = round(net * 0.05, 2)
    delivery = 0.0 if distance_km <= 0 else (30.0 if distance_km <= 3.0 else 30.0 + (distance_km - 3.0) * 10.0)

    grand_total = net + gst + delivery
    status = "CONFIRMED" if grand_total > 0 else "REJECTED"

    return {
        "order_id": order_id,
        "subtotal": bill["subtotal"],
        "discount": bill["discount"],
        "gst": gst,
        "delivery_fee": round(delivery, 2),
        "grand_total": round(grand_total, 2),
        "status": status
    }"""

    story.append(KeepTogether([
        Paragraph("<b>Complete Verified Solution — Streamlined Round 3 Engine:</b>", h3_style),
        make_code_box(r3_streamlined_fixed, bg_color='#f0fdf4', border_color='#bbf7d0'),
        Spacer(1, 4),
        Paragraph("<b>Test Baseline:</b> Order: 2x Burger (@150) + 1x Pizza (@250) = 550.0 | GOLD (15% = 82.5) + FEAST50 = 132.50 | Net = 417.50 | GST = 20.88 | Delivery (5.5km) = 30 + 2.5*10 = 55.0 | Grand Total: <b>₹493.38</b>, Status: 'CONFIRMED', Order: 'ORD-1001'", ParagraphStyle('tb_r3', parent=body_style, fontSize=7, textColor=colors.HexColor('#64748b'))),
        Spacer(1, 10)
    ]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully updated at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.join("docs", "Techastra_26_Code_Rescue_Validated_Questions.pdf")
    create_code_rescue_pdf(out_file)
