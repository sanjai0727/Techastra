import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface ArtProjectsProps {}

const ArtProjects: React.FC<ArtProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Round 3: Code Rescue</h1>
            <h3>Multi-Bug System Disaster Recovery</h3>
            <br />
            <p>
                <b>Format:</b> 1 Comprehensive Broken System • 40 Minutes • 100 Max Points • Advanced Difficulty
            </p>
            <br />
            <ResumeDownload altText="Download Official Code Rescue Rulebook (PDF)" />
            <br />
            <div className="text-block">
                <h2>The Grand Finale Gauntlet</h2>
                <br />
                <p>
                    Round 3 is the culmination of Code Rescue. The remaining top qualifiers
                    are faced with a mission-critical simulation: a realistic, multi-layered software
                    system has crashed in production due to multiple cascading defects. Contestants
                    act as Emergency Software Triage Engineers to rescue the codebase.
                </p>
                <br />
                <h3>Architecture of a Code Rescue System:</h3>
                <ul>
                    <li>
                        <p>
                            <b>Module 1: Ingestion & Validation:</b> Parses incoming JSON/payload records,
                            enforces data constraints, and filters malformed payloads.
                            <i>(Common bugs: KeyErrors on missing optional fields, improper type conversions).</i>
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Module 2: Core Processing Engine:</b> Performs business calculations,
                            sorting, discounts, tax calculations, or graph traversal.
                            <i>(Common bugs: Sorting stability traps, off-by-one tier boundaries, mutating shared records).</i>
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Module 3: Reporting & Serialization:</b> Aggregates metrics, computes summary statistics,
                            and serializes outputs to strict format specifications.
                            <i>(Common bugs: Floating point precision rounding, missing return statements, unhandled empty sets).</i>
                        </p>
                    </li>
                </ul>
                <br />
                <h2>The Regression Trap</h2>
                <br />
                <div style={styles.warningBox}>
                    <p style={styles.warningTitle}>⚠️ THE MULTI-BUG CHALLENGE:</p>
                    <p>
                        In Round 3, bugs are interdependent. Naively patching a defect in Module 1
                        can break assumptions in Module 2, causing tests that previously passed to fail.
                        Success requires methodical triage and continuous regression testing across
                        the entire test suite!
                    </p>
                </div>
                <br />
                <h2>Sample System Overview: E-Commerce Dispatch Engine</h2>
                <br />
                <div className="code-walkthrough-block" style={styles.codeCard}>
                    <div style={styles.codeHeader}>
                        <span>🏗️ ARCHITECTURE PREVIEW: Order Processing & Tax Dispatch</span>
                    </div>
                    <pre style={styles.codePre}>
<span style={styles.codeLine}>class OrderProcessor:</span>
<span style={styles.codeLine}>    def __init__(self, tax_rate=0.08, currency="INR"):</span>
<span style={styles.codeLine}>        self.tax_rate = tax_rate</span>
<span style={styles.codeLine}>        self.currency = currency</span>

<span style={styles.codeComment}>    # Critical System Defects to Triage:</span>
<span style={styles.codeRed}>    # BUG 1: Ingestion crash on orders missing discount code</span>
<span style={styles.codeRed}>    # BUG 2: Tiered bulk discount applied AFTER tax instead of BEFORE</span>
<span style={styles.codeRed}>    # BUG 3: Zero-item basket results in unhandled ZeroDivisionError</span>
<span style={styles.codeRed}>    # BUG 4: Order status enum mismatch ('FULFILLED' vs 'PROCESSED')</span>
                    </pre>
                </div>
                <br />
                <h3>Winning Strategies from Past Champions:</h3>
                <ul>
                    <li>
                        <p>
                            <b>1. Run the Test Suite First:</b> Immediately run the visible tests before
                            changing any code. Note which tests pass and which ones fail with tracebacks.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>2. Follow the Data Pipeline:</b> Fix ingestion (Module 1) first. If input
                            data is corrupted or missing keys, downstream modules will inevitably fail.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>3. Do Not Refactor Architecture:</b> Your goal is to rescue the code,
                            not rewrite it from scratch. Minimal, precise interventions introduce fewer regressions.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>4. Guard Against Hidden Suites:</b> Before finalizing, check edge conditions:
                            empty order lists, negative values, max capacity orders, and unexpected None values.
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
    codeHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6f8fa',
        color: '#000080',
        fontWeight: 'bold',
        fontSize: 13,
        padding: '8px 14px',
        borderBottom: '1px solid #d0d7de',
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
    warningBox: {
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        color: '#721c24',
        padding: 14,
        marginBottom: 16,
    },
    warningTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
    },
};

export default ArtProjects;
