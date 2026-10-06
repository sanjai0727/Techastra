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
                <b>Format:</b> 10 Questions • 20 Minutes • 100 Max Points (10 pts/question) • Basic Difficulty
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
                <div style={styles.codeBlock}>
                    <p style={styles.codeComment}># FAULTY CODE — Challenge 03: Sum of Evens</p>
                    <p style={styles.codeRed}>def sum_even_numbers(numbers)</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;total = 0</p>
                    <p style={styles.codeRed}>&nbsp;&nbsp;&nbsp;&nbsp;for n in numbers</p>
                    <p style={styles.codeRed}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if n % 2 = 0:</p>
                    <p style={styles.codeRed}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;total += n</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;return total</p>
                </div>
                <br />
                <p><b>Compiler Diagnostics:</b></p>
                <div style={styles.terminalBox}>
                    <p style={styles.terminalText}>SyntaxError: expected ':' (line 1)</p>
                    <p style={styles.terminalText}>SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='? (line 5)</p>
                    <p style={styles.terminalText}>IndentationError: expected an indented block after 'if' statement on line 5</p>
                </div>
                <br />
                <div style={styles.codeBlock}>
                    <p style={styles.codeComment}># RESCUED CODE — Pass Verdict: 10/10 Points</p>
                    <p style={styles.codeGreen}>def sum_even_numbers(numbers):</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;total = 0</p>
                    <p style={styles.codeGreen}>&nbsp;&nbsp;&nbsp;&nbsp;for n in numbers:</p>
                    <p style={styles.codeGreen}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if n % 2 == 0:</p>
                    <p style={styles.codeGreen}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;total += n</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;return total</p>
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
    codeBlock: {
        backgroundColor: '#1e1e1e',
        color: '#f8f8f2',
        padding: 16,
        fontFamily: 'Terminal, monospace',
        fontSize: 13,
        border: '1px solid #333',
        marginBottom: 16,
        lineHeight: 1.5,
    },
    codeComment: {
        color: '#6272a4',
        marginBottom: 8,
    },
    codeLine: {
        color: '#f8f8f2',
    },
    codeRed: {
        color: '#ff5555',
        backgroundColor: 'rgba(255,85,85,0.1)',
    },
    codeGreen: {
        color: '#50fa7b',
        backgroundColor: 'rgba(80,250,123,0.1)',
    },
    terminalBox: {
        backgroundColor: '#000',
        padding: 12,
        border: '1px solid #444',
        marginBottom: 16,
    },
    terminalText: {
        color: '#ff5555',
        fontFamily: 'Terminal, monospace',
        fontSize: 12,
        marginBottom: 4,
    },
};

export default SoftwareProjects;
