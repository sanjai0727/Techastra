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
                <div className="code-walkthrough-block" style={styles.codeCard}>
                    <div style={styles.codeHeaderFaulty}>
                        <span>❌ FAULTY CODE — Challenge 04: Session Event Tracker (Mutable Default Trap)</span>
                    </div>
                    <pre style={styles.codePre}>
<span style={styles.codeComment}># Defect: session_log defaults to a mutable empty list []</span>
<span style={styles.codeRed}>def register_event(event_id, session_log=[]):</span>
<span style={styles.codeRed}>    session_log.append(event_id)</span>
<span style={styles.codeLine}>    return session_log</span>

<span style={styles.codeComment}># Invocation test showing state leakage across independent calls:</span>
<span style={styles.codeLine}>print(register_event("USER_LOGIN"))    # ['USER_LOGIN']</span>
<span style={styles.codeRed}>print(register_event("ITEM_VIEW"))     # ['USER_LOGIN', 'ITEM_VIEW'] !? (State Leaked)</span>
                    </pre>
                </div>
                <br />
                <p><b>Diagnostic Analysis:</b></p>
                <div className="analysis-walkthrough-box" style={styles.analysisCard}>
                    <div style={styles.analysisHeader}>
                        <span>💡 Python Execution Model Insight</span>
                    </div>
                    <div style={styles.analysisBody}>
                        In Python, default argument expressions are evaluated once when the function
                        is defined, NOT each time the function is called. Because <code>[]</code> is mutable,
                        every subsequent caller without an explicit second parameter mutates the exact same list object!
                    </div>
                </div>
                <br />
                <div className="code-walkthrough-block" style={styles.codeCard}>
                    <div style={styles.codeHeaderRescued}>
                        <span>✅ RESCUED CODE — Pass Verdict: 20/20 Points</span>
                    </div>
                    <pre style={styles.codePre}>
<span style={styles.codeGreen}>def register_event(event_id, session_log=None):</span>
<span style={styles.codeGreen}>    if session_log is None:</span>
<span style={styles.codeGreen}>        session_log = []</span>
<span style={styles.codeLine}>    session_log.append(event_id)</span>
<span style={styles.codeLine}>    return session_log</span>
                    </pre>
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
    analysisCard: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fffdf5',
        border: '1.5px solid #ffeeba',
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
    },
    analysisHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        color: '#856404',
        fontWeight: 'bold',
        fontSize: 13,
        padding: '6px 14px',
        borderBottom: '1px solid #ffeeba',
        fontFamily: 'Consolas, "Courier New", monospace',
    },
    analysisBody: {
        display: 'block',
        padding: '12px 16px',
        color: '#856404',
        fontSize: 14,
        lineHeight: 1.6,
        textAlign: 'left',
    },
};

export default MusicProjects;
