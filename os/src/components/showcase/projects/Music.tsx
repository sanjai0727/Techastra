import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface MusicProjectsProps {}

const MusicProjects: React.FC<MusicProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Round 2: Logic Breaker</h1>
            <h3>Runtime Exceptions & Logical Traps</h3>
            <br />
            <p>
                <b>Format:</b> 5 Questions • 25 Minutes • 100 Max Points (20 pts/question) • Intermediate Difficulty
            </p>
            <br />
            <ResumeDownload altText="Download Official Code Rescue Rulebook (PDF)" />
            <br />
            <div className="text-block">
                <h2>Round Concept & Objective</h2>
                <br />
                <p>
                    In Logic Breaker, the code is syntactically sound and compiles cleanly —
                    yet it fails catastrophically at runtime or produces wildly incorrect
                    results under specific boundary conditions. Contestants must trace execution flow,
                    understand variable state transitions, and diagnose the underlying logical flaw.
                </p>
                <br />
                <h3>Key Logic & Runtime Bug Archetypes:</h3>
                <ul>
                    <li>
                        <p>
                            <b>The Python Mutable Default Argument Trap:</b> Defining <code>def append_item(val, bucket=[])</code>
                            where the default list is allocated once at function definition time, causing state contamination
                            across consecutive calls.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Off-by-One Boundary Invariants:</b> Using <code>range(len(arr))</code> instead
                            of <code>range(len(arr) - 1)</code> in sliding window comparisons, triggering
                            <code>IndexError: list index out of range</code>.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Unchecked Arithmetic Singularities:</b> Failing to guard denominators against 0,
                            causing unhandled <code>ZeroDivisionError</code> on empty or zero-frequency datasets.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Infinite Recursion & Missing Base Cases:</b> Recursive branches that don't reduce
                            towards termination, exhausting stack frames with <code>RecursionError</code>.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Accidental Variable Shadowing & Scope Leaks:</b> Modifying global state or loop
                            variables unintentionally within nested scopes.
                        </p>
                    </li>
                </ul>
                <br />
                <h2>Sample Challenge Walkthrough</h2>
                <br />
                <div style={styles.codeBlock}>
                    <p style={styles.codeComment}># FAULTY CODE — Challenge 04: Session Event Tracker</p>
                    <p style={styles.codeRed}>def register_event(event_id, session_log=[]):</p>
                    <p style={styles.codeRed}>&nbsp;&nbsp;&nbsp;&nbsp;session_log.append(event_id)</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;return session_log</p>
                    <br />
                    <p style={styles.codeComment}># Invocation test:</p>
                    <p style={styles.codeLine}>print(register_event("USER_LOGIN"))&nbsp;&nbsp;&nbsp;&nbsp;# ['USER_LOGIN']</p>
                    <p style={styles.codeRed}>print(register_event("ITEM_VIEW"))&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# ['USER_LOGIN', 'ITEM_VIEW'] !?</p>
                </div>
                <br />
                <p><b>Diagnostic Analysis:</b></p>
                <div style={styles.analysisBox}>
                    <p>
                        In Python, default argument expressions are evaluated once when the function
                        is defined, NOT each time the function is called. Because <code>[]</code> is mutable,
                        every subsequent caller without an explicit second parameter mutates the same list object!
                    </p>
                </div>
                <br />
                <div style={styles.codeBlock}>
                    <p style={styles.codeComment}># RESCUED CODE — Pass Verdict: 20/20 Points</p>
                    <p style={styles.codeGreen}>def register_event(event_id, session_log=None):</p>
                    <p style={styles.codeGreen}>&nbsp;&nbsp;&nbsp;&nbsp;if session_log is None:</p>
                    <p style={styles.codeGreen}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;session_log = []</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;session_log.append(event_id)</p>
                    <p style={styles.codeLine}>&nbsp;&nbsp;&nbsp;&nbsp;return session_log</p>
                </div>
                <br />
                <h3>Pro-Tips for Qualifying in Round 2:</h3>
                <ul>
                    <li>
                        <p>
                            <b>Stress-Test the Boundaries:</b> Always mentally test with: empty array <code>[]</code>,
                            single-item list <code>[x]</code>, negative numbers, and zeroes.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Hidden Test Suites:</b> Scoring in Round 2 relies heavily on hidden edge cases.
                            Just because it passes the visible example test doesn't mean it's solved!
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Trace Variable Mutation:</b> If numbers don't match, print intermediate values
                            in loop steps to watch where the calculation diverges from the specification.
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
    analysisBox: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeeba',
        color: '#856404',
        padding: 12,
        marginBottom: 16,
        fontSize: 13,
    },
};

export default MusicProjects;
