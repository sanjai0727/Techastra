import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface SoftwareProjectsProps {}

const SoftwareProjects: React.FC<SoftwareProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Round 1: Bug Hunt</h1>
            <h3>Syntax & Grammar Diagnostics</h3>
            <br />
            <p>
                <b>Format:</b> 10 Questions • 15 Minutes • 10 Max Marks (1 mark/question) • Basic Difficulty
            </p>
            <br />
            <ResumeDownload altText="Download Official Code Rescue Rulebook (PDF)" />
            <br />
            <div className="text-block">
                <h2>Round Concept & Objective</h2>
                <br />
                <p>
                    Bug Hunt is the opening gauntlet of Code Rescue. It evaluates how rapidly
                    a contestant can spot and repair lexical, grammatical, and syntax defects in
                    faulty code. Unlike algorithmic problems where participants design logic from
                    scratch, Bug Hunt requires sharp visual inspection and instant recall of language
                    syntax rules.
                </p>
                <br />
                <h3>Common Bug Archetypes in Round 1:</h3>
                <ul>
                    <li>
                        <p>
                            <b>Missing Colons & Delimiters:</b> Omitting colons after <code>def</code>,
                            <code>if</code>, <code>elif</code>, <code>else</code>, <code>for</code>,
                            <code>while</code>, or class declarations.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Indentation Mismatches:</b> Mixing tab and space characters, or inconsistent
                            indentation depths resulting in <code>IndentationError: unexpected indent</code>.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Assignment vs Comparison Operators:</b> Using single <code>=</code> inside
                            conditional expressions instead of equality comparison <code>==</code>.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Variable Name Typos:</b> Misspelled identifiers (e.g., <code>totla_sum</code> vs
                            <code>total_sum</code>) triggering <code>NameError</code>.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Bracket & Quote Imbalance:</b> Unclosed parentheses, curly braces, or string
                            quotes that cause syntax errors on subsequent lines.
                        </p>
                    </li>
                </ul>
                <br />
                <h2>Sample Challenge Walkthrough</h2>
                <br />
                <div className="code-walkthrough-block" style={styles.codeCard}>
                    <div style={styles.codeHeaderFaulty}>
                        <span>❌ FAULTY CODE — Challenge 03: Sum of Evens (3 Syntax Defects)</span>
                    </div>
                    <pre style={styles.codePre}>
<span style={styles.codeComment}># Missing colon on function definition line:</span>
<span style={styles.codeRed}>def sum_even_numbers(numbers)</span>
<span style={styles.codeLine}>    total = 0</span>
<span style={styles.codeComment}>    # Missing colon on loop header:</span>
<span style={styles.codeRed}>    for n in numbers</span>
<span style={styles.codeComment}>        # Assignment operator (=) used instead of comparison (==):</span>
<span style={styles.codeRed}>        if n % 2 = 0:</span>
<span style={styles.codeComment}>        # Missing 4-space indentation block under if statement:</span>
<span style={styles.codeRed}>        total += n</span>
<span style={styles.codeLine}>    return total</span>
                    </pre>
                </div>
                <br />
                <p><b>Compiler Diagnostics:</b></p>
                <div className="terminal-walkthrough-box" style={styles.terminalCard}>
                    <div style={styles.terminalHeader}>
                        <span>🖥️ Python 3.11 Diagnostic Traceback</span>
                    </div>
                    <div style={styles.terminalBody}>
                        <div style={styles.terminalLine}>❌ SyntaxError: expected ':' (line 1)</div>
                        <div style={styles.terminalLine}>❌ SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='? (line 5)</div>
                        <div style={styles.terminalLine}>❌ IndentationError: expected an indented block after 'if' statement on line 5</div>
                    </div>
                </div>
                <br />
                <div className="code-walkthrough-block" style={styles.codeCard}>
                    <div style={styles.codeHeaderRescued}>
                        <span>✅ RESCUED CODE — Pass Verdict: 10/10 Points (All Test Cases Passed)</span>
                    </div>
                    <pre style={styles.codePre}>
<span style={styles.codeGreen}>def sum_even_numbers(numbers):</span>
<span style={styles.codeLine}>    total = 0</span>
<span style={styles.codeGreen}>    for n in numbers:</span>
<span style={styles.codeGreen}>        if n % 2 == 0:</span>
<span style={styles.codeGreen}>            total += n</span>
<span style={styles.codeLine}>    return total</span>
                    </pre>
                </div>
                <br />
                <h3>Pro-Tips for Qualifying in Round 1:</h3>
                <ul>
                    <li>
                        <p>
                            <b>Check Line Above:</b> If a SyntaxError points to an apparently valid line,
                            always check the line immediately preceding it for an unclosed bracket or parenthesis.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Time Management:</b> You have only 2 minutes per question (20m total). Do not
                            overthink; fix the syntax, run the test cases, and hit Submit immediately.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Preserve Function Signatures:</b> Never alter function names or argument lists
                            unless explicitly asked, as automated judging harnesses will fail.
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    codeCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '2px inset #c0c0c0',
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
        boxShadow: 'inset 1px 1px 0 #808080, 0 1px 3px rgba(0,0,0,0.08)',
    },
    codeHeaderFaulty: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff0f0',
        color: '#b31d28',
        fontWeight: 'bold',
        fontSize: 13,
        padding: '8px 14px',
        borderBottom: '1px solid #ffd0d0',
        fontFamily: 'Consolas, "Courier New", monospace',
    },
    codeHeaderRescued: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6ffed',
        color: '#137333',
        fontWeight: 'bold',
        fontSize: 13,
        padding: '8px 14px',
        borderBottom: '1px solid #bef5cb',
        fontFamily: 'Consolas, "Courier New", monospace',
    },
    codePre: {
        display: 'block',
        margin: 0,
        padding: '14px 18px',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 13.5,
        lineHeight: 1.6,
        color: '#24292f',
        backgroundColor: '#fafbfc',
        overflowX: 'auto',
        whiteSpace: 'pre',
        textAlign: 'left',
    },
    codeComment: {
        color: '#6e7781',
        fontStyle: 'italic',
        display: 'block',
    },
    codeLine: {
        color: '#24292f',
        display: 'block',
    },
    codeRed: {
        color: '#cf222e',
        backgroundColor: '#ffebe9',
        fontWeight: 'bold',
        display: 'block',
        padding: '2px 6px',
        borderRadius: 2,
        margin: '1px 0',
    },
    codeGreen: {
        color: '#116329',
        backgroundColor: '#dafbe1',
        fontWeight: 'bold',
        display: 'block',
        padding: '2px 6px',
        borderRadius: 2,
        margin: '1px 0',
    },
    terminalCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '2px inset #c0c0c0',
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
        boxShadow: 'inset 1px 1px 0 #808080',
    },
    terminalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6f8fa',
        color: '#57606a',
        fontWeight: 'bold',
        fontSize: 12,
        padding: '6px 14px',
        borderBottom: '1px solid #d0d7de',
        fontFamily: 'Consolas, "Courier New", monospace',
    },
    terminalBody: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        backgroundColor: '#fff8f7',
        gap: 8,
    },
    terminalLine: {
        display: 'block',
        color: '#cf222e',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 12.5,
        lineHeight: 1.5,
        textAlign: 'left',
    },
};

export default SoftwareProjects;
