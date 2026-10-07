import json
import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_code_box(doc, code_str, bg_color="F5F6F8", border_color="002060"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    # Left border only (accent blockquote style)
    tcPr = cell._element.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="E0E0E0"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    
    lines = code_str.strip().split('\n')
    for i, line in enumerate(lines):
        run = p.add_run(line)
        run.font.name = 'Consolas'
        run.font.size = Pt(8.8)
        run.font.color.rgb = RGBColor(0x20, 0x24, 0x2B)
        if i < len(lines) - 1:
            p.add_run('\n')
    
    # Space after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def format_table_header(row, col_widths, bg_color="002060"):
    for i, cell in enumerate(row.cells):
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        cell.width = Inches(col_widths[i])
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            for run in p.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.name = 'Arial'
                run.font.size = Pt(9.5)

def style_data_row(row, col_widths, is_even=False):
    bg_color = "F9FAFB" if is_even else "FFFFFF"
    for i, cell in enumerate(row.cells):
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        cell.width = Inches(col_widths[i])
        for p in cell.paragraphs:
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            for run in p.runs:
                run.font.name = 'Arial'
                run.font.size = Pt(9)

def main():
    dump_path = os.path.join(os.path.dirname(__file__), 'questions_dump.json')
    with open(dump_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    r1_questions = data['r1']
    r2_questions = data['r2']
    r3_question = data['r3']

    doc = docx.Document()
    
    # Page Setup: Standard Letter, 0.75" margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.header.is_linked_to_previous = False
        
        # Header
        header_p = section.header.paragraphs[0]
        header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = header_p.add_run("TECHASTRA 2026 — CODE RESCUE | OFFICIAL PROBLEM BANK")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x70, 0x70, 0x70)
        
        # Footer
        footer_p = section.footer.paragraphs[0]
        footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = footer_p.add_run("Department of Computer Science & Engineering • Department of Cyber Security | Dr. M.G.R. Educational and Research Institute")
        frun.font.name = "Arial"
        frun.font.size = Pt(8)
        frun.font.color.rgb = RGBColor(0x80, 0x80, 0x80)

    # =========================================================================
    # DOCUMENT COVER / TITLE BANNER
    # =========================================================================
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_inst = title_p.add_run("DR. M.G.R. EDUCATIONAL AND RESEARCH INSTITUTE\n")
    run_inst.font.name = "Arial"
    run_inst.font.size = Pt(13)
    run_inst.font.bold = True
    run_inst.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
    
    run_deemed = title_p.add_run("(Deemed to be University • NAAC A+ Grade)\n")
    run_deemed.font.name = "Arial"
    run_deemed.font.size = Pt(9.5)
    run_deemed.font.color.rgb = RGBColor(0x40, 0x40, 0x40)

    run_dept = title_p.add_run("Department of Computer Science & Engineering\nDepartment of Cyber Security\n")
    run_dept.font.name = "Arial"
    run_dept.font.size = Pt(10.5)
    run_dept.font.bold = True
    run_dept.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

    banner_p = doc.add_paragraph()
    banner_p.paragraph_format.space_before = Pt(10)
    banner_p.paragraph_format.space_after = Pt(4)
    banner_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    brun = banner_p.add_run("TECHASTRA 2026: CODE RESCUE")
    brun.font.name = "Arial"
    brun.font.size = Pt(20)
    brun.font.bold = True
    brun.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(14)
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    srun = sub_p.add_run("Complete Championship Question Manual & Official Solution Guide\nBroken Code • Corrected Source Code • Unit Test Cases • Scoring & Cutoffs")
    srun.font.name = "Arial"
    srun.font.size = Pt(10.5)
    srun.font.color.rgb = RGBColor(0x50, 0x50, 0x50)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(12)
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    mrun = meta_p.add_run("Event Date: 08 October 2026   |   Venue: IBM Lab   |   Language: Python 3")
    mrun.font.name = "Arial"
    mrun.font.size = Pt(9.5)
    mrun.font.bold = True
    mrun.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    # -------------------------------------------------------------------------
    # TOURNAMENT STRUCTURE TABLE
    # -------------------------------------------------------------------------
    table_p = doc.add_paragraph()
    table_p.paragraph_format.space_before = Pt(6)
    table_p.paragraph_format.space_after = Pt(4)
    t_title = table_p.add_run("CHAMPIONSHIP FORMAT & ROUND CRITERIA")
    t_title.font.name = "Arial"
    t_title.font.size = Pt(11)
    t_title.font.bold = True
    t_title.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    summary_table = doc.add_table(rows=5, cols=7)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.autofit = False
    
    col_w = [1.2, 1.4, 0.7, 0.9, 0.7, 0.8, 0.8]
    headers = ["Round", "Stage Title", "Questions", "Marks / Q", "Total", "Clock", "Cutoff"]
    for i, h in enumerate(headers):
        summary_table.cell(0, i).paragraphs[0].add_run(h)
    format_table_header(summary_table.rows[0], col_w, "002060")

    row_data = [
        ["Round 1", "Bug Hunt (Syntax & Lexical)", "10", "1 Mark", "10 Marks", "15 Mins", "≥ 5 Marks (50%)"],
        ["Round 2", "Logic Breaker (Logic & Runtime)", "5", "4 Marks", "20 Marks", "20 Mins", "≥ 10 Marks (50%)"],
        ["Round 3", "Code Rescue (Legacy System)", "1", "5 Marks", "5 Marks", "25 Mins", "Championship Finale"],
        ["TOTAL", "Full Championship Gauntlet", "16", "—", "35 Marks", "60 Mins", "Cumulative Standing"]
    ]

    for r_idx, r_vals in enumerate(row_data):
        row = summary_table.rows[r_idx + 1]
        for c_idx, val in enumerate(r_vals):
            p = row.cells[c_idx].paragraphs[0]
            r = p.add_run(val)
            if r_idx == 3: # Total row
                r.font.bold = True
                if c_idx == 4:
                    r.font.color.rgb = RGBColor(0x00, 0x20, 0x60)
            if c_idx in [2, 3, 4, 5, 6]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        style_data_row(row, col_w, is_even=(r_idx % 2 == 1 or r_idx == 3))

    doc.add_page_break()

    # =========================================================================
    # ROUND 1: BUG HUNT
    # =========================================================================
    r1_h = doc.add_paragraph()
    r1_h.paragraph_format.space_before = Pt(8)
    r1_h.paragraph_format.space_after = Pt(2)
    r1_hrun = r1_h.add_run("ROUND 1: BUG HUNT (SYNTAX & LEXICAL TRIAGE)")
    r1_hrun.font.name = "Arial"
    r1_hrun.font.size = Pt(14)
    r1_hrun.font.bold = True
    r1_hrun.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    r1_sub = doc.add_paragraph()
    r1_sub.paragraph_format.space_before = Pt(0)
    r1_sub.paragraph_format.space_after = Pt(10)
    r1_srun = r1_sub.add_run("Total Questions: 10   |   Marking: 1 Mark per Question (10 Marks Total)   |   Duration: 15 Minutes   |   Cutoff: ≥ 5 Marks (50%)\nFocus: Swift identification and repair of indentation, colons, typos, brackets, operators, and basic runtime exceptions.")
    r1_srun.font.name = "Arial"
    r1_srun.font.size = Pt(9.5)
    r1_srun.font.color.rgb = RGBColor(0x40, 0x40, 0x40)

    for q in r1_questions:
        add_question_section(doc, q, round_label="Round 1", marks_str="1 Mark")

    doc.add_page_break()

    # =========================================================================
    # ROUND 2: LOGIC BREAKER
    # =========================================================================
    r2_h = doc.add_paragraph()
    r2_h.paragraph_format.space_before = Pt(8)
    r2_h.paragraph_format.space_after = Pt(2)
    r2_hrun = r2_h.add_run("ROUND 2: LOGIC BREAKER (LOGICAL & RUNTIME TRIAGE)")
    r2_hrun.font.name = "Arial"
    r2_hrun.font.size = Pt(14)
    r2_hrun.font.bold = True
    r2_hrun.font.color.rgb = RGBColor(0x70, 0x40, 0x00)

    r2_sub = doc.add_paragraph()
    r2_sub.paragraph_format.space_before = Pt(0)
    r2_sub.paragraph_format.space_after = Pt(10)
    r2_srun = r2_sub.add_run("Total Questions: 10   |   Marking: 2 Marks per Question (20 Marks Total)   |   Duration: 20 Minutes   |   Cutoff: ≥ 10 Marks (50%)\nFocus: Insidious algorithmic faults: off-by-one loops, mutable default arguments, infinite loops, recursion depth, and edge cases.")
    r2_srun.font.name = "Arial"
    r2_srun.font.size = Pt(9.5)
    r2_srun.font.color.rgb = RGBColor(0x40, 0x40, 0x40)

    for q in r2_questions:
        add_question_section(doc, q, round_label="Round 2", marks_str="2 Marks")

    doc.add_page_break()

    # =========================================================================
    # ROUND 3: CODE RESCUE
    # =========================================================================
    r3_h = doc.add_paragraph()
    r3_h.paragraph_format.space_before = Pt(8)
    r3_h.paragraph_format.space_after = Pt(2)
    r3_hrun = r3_h.add_run("ROUND 3: CODE RESCUE (LEGACY APPLICATION DISASTER RECOVERY)")
    r3_hrun.font.name = "Arial"
    r3_hrun.font.size = Pt(14)
    r3_hrun.font.bold = True
    r3_hrun.font.color.rgb = RGBColor(0x9C, 0x00, 0x06)

    r3_sub = doc.add_paragraph()
    r3_sub.paragraph_format.space_before = Pt(0)
    r3_sub.paragraph_format.space_after = Pt(10)
    r3_srun = r3_sub.add_run("Total Questions: 1 Major System   |   Marking: 5 Marks   |   Duration: 25 Minutes   |   Championship Podium Arbitration\nFocus: Multi-component broken production system with cascaded defects across syntax, input filtration, arithmetic, sorting, and edge cases.")
    r3_srun.font.name = "Arial"
    r3_srun.font.size = Pt(9.5)
    r3_srun.font.color.rgb = RGBColor(0x40, 0x40, 0x40)

    add_round3_section(doc, r3_question)

    # Save to file
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'docs')
    out_path = os.path.join(out_dir, 'Code_Rescue_Round_Questions_and_Code.docx')
    doc.save(out_path)
    print(f"Successfully generated Word document: {out_path}")

def add_question_section(doc, q, round_label, marks_str):
    num = q['number']
    title = q['title']
    
    # Question Title Header
    qp = doc.add_paragraph()
    qp.paragraph_format.space_before = Pt(10)
    qp.paragraph_format.space_after = Pt(2)
    
    q_badge = qp.add_run(f"Q{num}. {title} ")
    q_badge.font.name = "Arial"
    q_badge.font.size = Pt(11)
    q_badge.font.bold = True
    q_badge.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    marks_run = qp.add_run(f"[{marks_str}]")
    marks_run.font.name = "Arial"
    marks_run.font.size = Pt(10)
    marks_run.font.bold = True
    marks_run.font.color.rgb = RGBColor(0x13, 0x73, 0x33)

    # Metadata Line
    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(4)
    m_run = meta_p.add_run(f"Difficulty: {q['difficulty']}   |   Category: {q['bugType']}   |   Question ID: {q['id']}")
    m_run.font.name = "Arial"
    m_run.font.size = Pt(8.5)
    m_run.font.color.rgb = RGBColor(0x60, 0x60, 0x60)

    # Problem Description
    desc_p = doc.add_paragraph()
    desc_p.paragraph_format.space_before = Pt(2)
    desc_p.paragraph_format.space_after = Pt(4)
    d_label = desc_p.add_run("Description: ")
    d_label.font.bold = True
    d_label.font.size = Pt(9.5)
    d_text = desc_p.add_run(q['description'])
    d_text.font.size = Pt(9.5)

    # Expected Behavior
    if q.get('expectedBehavior'):
        exp_p = doc.add_paragraph()
        exp_p.paragraph_format.space_before = Pt(0)
        exp_p.paragraph_format.space_after = Pt(4)
        exp_lbl = exp_p.add_run("Expected Behavior: ")
        exp_lbl.font.bold = True
        exp_lbl.font.size = Pt(9)
        exp_txt = exp_p.add_run(q['expectedBehavior'])
        exp_txt.font.size = Pt(9)

    # Broken Code Label & Box
    b_lbl = doc.add_paragraph()
    b_lbl.paragraph_format.space_before = Pt(4)
    b_lbl.paragraph_format.space_after = Pt(2)
    b_run = b_lbl.add_run("❌ Faulty / Broken Code:")
    b_run.font.name = "Arial"
    b_run.font.size = Pt(9.5)
    b_run.font.bold = True
    b_run.font.color.rgb = RGBColor(0xA0, 0x00, 0x00)

    add_code_box(doc, q['brokenCode'], bg_color="FFF5F5", border_color="C00000")

    # Correct Solution Code Label & Box
    s_lbl = doc.add_paragraph()
    s_lbl.paragraph_format.space_before = Pt(4)
    s_lbl.paragraph_format.space_after = Pt(2)
    s_run = s_lbl.add_run("✅ Corrected Solution Code:")
    s_run.font.name = "Arial"
    s_run.font.size = Pt(9.5)
    s_run.font.bold = True
    s_run.font.color.rgb = RGBColor(0x00, 0x60, 0x00)

    add_code_box(doc, q['solutionCode'], bg_color="F4FFF4", border_color="137333")

    # Test Cases Table (Visible & Hidden)
    tests = q.get('visibleTests', []) + q.get('hiddenTests', [])
    if tests:
        t_lbl = doc.add_paragraph()
        t_lbl.paragraph_format.space_before = Pt(2)
        t_lbl.paragraph_format.space_after = Pt(2)
        t_run = t_lbl.add_run("Unit Test Cases:")
        t_run.font.bold = True
        t_run.font.size = Pt(9)
        t_run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

        t_table = doc.add_table(rows=len(tests) + 1, cols=4)
        t_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_table.autofit = False
        t_widths = [1.0, 2.4, 1.4, 1.7]
        
        t_headers = ["Test Type", "Input Parameters", "Expected Output", "Evaluation Note"]
        for idx, h in enumerate(t_headers):
            t_table.cell(0, idx).paragraphs[0].add_run(h)
        format_table_header(t_table.rows[0], t_widths, "2F5597")

        for idx, t in enumerate(tests):
            row = t_table.rows[idx + 1]
            is_hidden = 'h' in t.get('id', '')
            t_type = "Hidden Test" if is_hidden else "Visible Test"
            
            p0 = row.cells[0].paragraphs[0]
            r0 = p0.add_run(t_type)
            r0.font.bold = True
            r0.font.color.rgb = RGBColor(0x70, 0x40, 0x00) if is_hidden else RGBColor(0x00, 0x60, 0x00)
            
            p1 = row.cells[1].paragraphs[0]
            r1 = p1.add_run(str(t.get('input', '')))
            r1.font.name = 'Consolas'
            r1.font.size = Pt(8.5)
            
            p2 = row.cells[2].paragraphs[0]
            r2 = p2.add_run(str(t.get('expectedOutput', '')))
            r2.font.name = 'Consolas'
            r2.font.size = Pt(8.5)
            r2.font.bold = True
            
            p3 = row.cells[3].paragraphs[0]
            r3 = p3.add_run(str(t.get('description', '')))
            r3.font.size = Pt(8.5)

            style_data_row(row, t_widths, is_even=(idx % 2 == 1))

        # Space after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(4)
        sp.paragraph_format.space_after = Pt(6)

def add_round3_section(doc, q):
    qp = doc.add_paragraph()
    qp.paragraph_format.space_before = Pt(10)
    qp.paragraph_format.space_after = Pt(2)
    
    q_badge = qp.add_run(f"CHALLENGE: {q['title']} ")
    q_badge.font.name = "Arial"
    q_badge.font.size = Pt(12)
    q_badge.font.bold = True
    q_badge.font.color.rgb = RGBColor(0x9C, 0x00, 0x06)

    marks_run = qp.add_run("[5 Marks | 25 Minutes]")
    marks_run.font.name = "Arial"
    marks_run.font.size = Pt(10.5)
    marks_run.font.bold = True
    marks_run.font.color.rgb = RGBColor(0x13, 0x73, 0x33)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(4)
    m_run = meta_p.add_run(f"Difficulty: {q['difficulty']}   |   Category: {q['bugType']}   |   Question ID: {q['id']}")
    m_run.font.name = "Arial"
    m_run.font.size = Pt(8.5)
    m_run.font.color.rgb = RGBColor(0x60, 0x60, 0x60)

    desc_p = doc.add_paragraph()
    desc_p.paragraph_format.space_before = Pt(2)
    desc_p.paragraph_format.space_after = Pt(4)
    d_label = desc_p.add_run("System Overview & Mission Directive:\n")
    d_label.font.bold = True
    d_label.font.size = Pt(10)
    d_text = desc_p.add_run(q['description'])
    d_text.font.size = Pt(9.5)

    # Defect Breakdown Box
    defects_p = doc.add_paragraph()
    defects_p.paragraph_format.space_before = Pt(6)
    defects_p.paragraph_format.space_after = Pt(2)
    d_head = defects_p.add_run("Detailed Breakdown of Defects to Rescue:")
    d_head.font.bold = True
    d_head.font.size = Pt(10)
    d_head.font.color.rgb = RGBColor(0x00, 0x20, 0x60)

    defects = [
        ("Defect 1 (Input Sanitization / Edge Case)", "Negative or non-positive expense entries distort the total and count instead of being filtered out."),
        ("Defect 2 (Syntax Error)", "Malformed for-loop declaration on records (`for item in records` missing colon `:`)."),
        ("Defect 3 (Runtime ZeroDivisionError)", "Division by zero crash (`average = total / count`) when the records list is empty or contains zero valid entries."),
        ("Defect 4 (Logical Comparison Inversion)", "Inverted budget compliance check (`within_budget = total > budget_limit` instead of `total <= budget_limit`)."),
        ("Defect 5 (Output Sorting Requirement)", "Category summaries must be returned sorted alphabetically by category name (`sorted(categories.items())`), but were returned unsorted.")
    ]

    for d_title, d_desc in defects:
        dp = doc.add_paragraph()
        dp.paragraph_format.space_before = Pt(1)
        dp.paragraph_format.space_after = Pt(1)
        dp.paragraph_format.left_indent = Inches(0.25)
        r_dt = dp.add_run(f"• {d_title}: ")
        r_dt.font.bold = True
        r_dt.font.size = Pt(9)
        r_dt.font.color.rgb = RGBColor(0xA0, 0x00, 0x00)
        r_dd = dp.add_run(d_desc)
        r_dd.font.size = Pt(9)

    # Broken System Code
    b_lbl = doc.add_paragraph()
    b_lbl.paragraph_format.space_before = Pt(8)
    b_lbl.paragraph_format.space_after = Pt(2)
    b_run = b_lbl.add_run("❌ Faulty Legacy System Code (Broken Application):")
    b_run.font.name = "Arial"
    b_run.font.size = Pt(10)
    b_run.font.bold = True
    b_run.font.color.rgb = RGBColor(0xA0, 0x00, 0x00)

    add_code_box(doc, q['brokenCode'], bg_color="FFF5F5", border_color="C00000")

    # Correct Solution Code
    s_lbl = doc.add_paragraph()
    s_lbl.paragraph_format.space_before = Pt(8)
    s_lbl.paragraph_format.space_after = Pt(2)
    s_run = s_lbl.add_run("✅ Fully Patched & Rescued System Code:")
    s_run.font.name = "Arial"
    s_run.font.size = Pt(10)
    s_run.font.bold = True
    s_run.font.color.rgb = RGBColor(0x00, 0x60, 0x00)

    add_code_box(doc, q['solutionCode'], bg_color="F4FFF4", border_color="137333")

    # Test Cases Table
    tests = q.get('visibleTests', []) + q.get('hiddenTests', [])
    if tests:
        t_lbl = doc.add_paragraph()
        t_lbl.paragraph_format.space_before = Pt(4)
        t_lbl.paragraph_format.space_after = Pt(2)
        t_run = t_lbl.add_run("Round 3 System Verification Test Suite:")
        t_run.font.bold = True
        t_run.font.size = Pt(9.5)

        t_table = doc.add_table(rows=len(tests) + 1, cols=4)
        t_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_table.autofit = False
        t_widths = [1.0, 2.5, 1.5, 1.5]
        
        t_headers = ["Test Suite", "Input Dataset", "Expected Output Dictionary", "Validation Focus"]
        for idx, h in enumerate(t_headers):
            t_table.cell(0, idx).paragraphs[0].add_run(h)
        format_table_header(t_table.rows[0], t_widths, "9C0006")

        for idx, t in enumerate(tests):
            row = t_table.rows[idx + 1]
            is_hidden = 'h' in t.get('id', '')
            t_type = "Hidden Edge Case" if is_hidden else "Visible Sample"
            
            p0 = row.cells[0].paragraphs[0]
            r0 = p0.add_run(t_type)
            r0.font.bold = True
            r0.font.color.rgb = RGBColor(0x9C, 0x00, 0x06) if is_hidden else RGBColor(0x00, 0x60, 0x00)
            
            p1 = row.cells[1].paragraphs[0]
            r1 = p1.add_run(str(t.get('input', '')))
            r1.font.name = 'Consolas'
            r1.font.size = Pt(8)
            
            p2 = row.cells[2].paragraphs[0]
            r2 = p2.add_run(str(t.get('expectedOutput', '')))
            r2.font.name = 'Consolas'
            r2.font.size = Pt(8)
            r2.font.bold = True
            
            p3 = row.cells[3].paragraphs[0]
            r3 = p3.add_run(str(t.get('description', '')))
            r3.font.size = Pt(8.5)

            style_data_row(row, t_widths, is_even=(idx % 2 == 1))

if __name__ == '__main__':
    main()
