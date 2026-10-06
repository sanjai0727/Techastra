import React from 'react';
import ResumeDownload from './ResumeDownload';

export interface ExperienceProps {}

const Experience: React.FC<ExperienceProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1 style={{ marginLeft: -16 }}>Tournament Structure</h1>
            <h3>Three Progressive Qualification Rounds</h3>
            <br />
            <ResumeDownload altText="Download Official Code Rescue Rulebook (PDF)" />
            <br />
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Round 1: BUG HUNT</h1>
                        <h4>20 Minutes • 10 Questions</h4>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Basic Syntax & Grammar Diagnostics</h3>
                        <b>
                            <p>Max Score: 100 Points (10 pts/question)</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Bug Hunt is the fast-paced opening round designed to test a contestant's
                    speed, observation, and mastery of fundamental language mechanics.
                    Participants receive 10 short, broken code snippets and must swiftly
                    identify and resolve defects.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            <b>Focus Areas:</b> Missing colons, bracket mismatches, indentation
                            faults (spaces vs tabs), typos in variable or built-in function names,
                            and improper assignment vs comparison operators (<code>=</code> vs <code>==</code>).
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Workflow:</b> Read faulty snippet → Identify error in terminal/compiler
                            output → Patch code in editor → Run test suite → Verify pass verdict → Submit.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Qualification Gate:</b> Only contestants achieving the qualification
                            threshold (standard: 50% cutoff) advance to Round 2.
                        </p>
                    </li>
                </ul>
            </div>

            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Round 2: LOGIC BREAKER</h1>
                        <h4>25 Minutes • 5 Questions</h4>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Intermediate Logic & Runtime Triage</h3>
                        <b>
                            <p>Max Score: 100 Points (20 pts/question)</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Logic Breaker escalates the challenge from syntactic errors to deeper,
                    more insidious logical traps and runtime failures where code may compile
                    cleanly but produce wildly incorrect results or crash on edge cases.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            <b>Focus Areas:</b> Infinite loops, off-by-one index bounds, mutable default
                            arguments, recursion depth exhaustion, unhandled zero-division, and
                            incorrect return types or variable scope mutations.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Test Suites:</b> Submissions must satisfy both public visible test cases
                            and rigorous hidden edge-case suites (empty inputs, negative bounds, large sets).
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Qualification Gate:</b> Top performers qualify for the high-stakes
                            Grand Finale: Round 3.
                        </p>
                    </li>
                </ul>
            </div>

            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Round 3: CODE RESCUE</h1>
                        <h4>40 Minutes • 1 Major Broken System</h4>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Advanced Legacy Application Disaster Recovery</h3>
                        <b>
                            <p>Max Score: 100 Points</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    The Grand Finale: Finalists are handed a large, multi-component broken
                    application simulating a critical production outage. The codebase suffers
                    from multiple interconnected bugs spanning architectural flaws, data corruption,
                    and edge-case crashes.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            <b>System Scale:</b> Multiple interconnected functions and classes
                            (e.g., student grading database, e-commerce cart calculation, or network packet router).
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Regression Management:</b> Contestants must isolate each failure
                            without introducing secondary regressions across dependent modules.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Evaluation:</b> High-volume hidden stress tests verify robustness,
                            algorithmic efficiency, and adherence to exact output specifications.
                        </p>
                    </li>
                </ul>
            </div>

            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Scoring & Tie-Breaker Protocol</h1>
                        <h4>300 Cumulative Maximum</h4>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Official Regulations & Integrity</h3>
                        <b>
                            <p>Zero AI Assistance Tolerance</p>
                        </b>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <p>
                    Competition standings are determined on a cumulative basis across all completed
                    rounds. In the event of tied scores, official symposium tie-breakers are applied:
                </p>
                <br />
                <ul>
                    <li style={styles.row}>
                        <p>• <b>Total Score:</b> Cumulative points earned across Rounds 1, 2, and 3 (Max 300 pts).</p>
                    </li>
                    <li style={styles.row}>
                        <p>• <b>Primary Tie-Breaker:</b> Earliest timestamp of final valid submission.</p>
                    </li>
                    <li style={styles.row}>
                        <p>• <b>Secondary Tie-Breaker:</b> Lowest cumulative program execution latency across test suites.</p>
                    </li>
                    <li style={styles.row}>
                        <p>• <b>Anti-AI Enforcement:</b> Any participant detected using ChatGPT, Gemini, Copilot, or Cursor faces instant disqualification.</p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerContainer: {
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
        marginTop: 16,
    },
    headerRow: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        display: 'flex',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
    },
};

export default Experience;
