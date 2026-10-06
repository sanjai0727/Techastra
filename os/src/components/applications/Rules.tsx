import React from 'react';
import Window from '../os/Window';
import ResumeDownload from '../showcase/ResumeDownload';

export interface RulesAppProps extends WindowAppProps {}

const RulesApp: React.FC<RulesAppProps> = (props) => {
    return (
        <Window
            top={32}
            left={32}
            width={780}
            height={600}
            windowTitle="TECHASTRA INC. // DIRECTIVE 80-CR: RULES OF ENGAGEMENT"
            windowBarIcon="windowExplorerIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'SEC-CLASS: CONFIDENTIAL • ZERO-AI TOLERANCE ENFORCED'}
        >
            <div className="site-page-content" style={styles.container}>
                <div style={styles.headerBanner}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="cyber-pill">TAPE NO. 86-CR</span>
                        <span className="cyber-pill cyber-pill-red">DEFCON 1: ACTIVE DISPATCH</span>
                    </div>
                    <h1 style={{ fontSize: 24, margin: '4px 0 8px 0', letterSpacing: 0, textTransform: 'uppercase', fontFamily: 'MillenniumBold, Times New Roman, serif' }}>
                        TECHASTRA CODE RESCUE // RULES OF ENGAGEMENT
                    </h1>
                    <p style={{ margin: 0, fontSize: 13, color: '#333', fontFamily: 'Courier New, monospace' }}>
                        DOCUMENT ID: CR-DOC-2026-REV3 • CSE DEPARTMENT OF EMERGENCY SOFTWARE TRIAGE
                    </p>
                </div>

                <div style={{ margin: '14px 0' }}>
                    <ResumeDownload altText="Download Official PDF Directive (Rules & Regulations)" />
                </div>

                <div className="corporate-callout">
                    <div className="corporate-callout-title">
                        OPERATIONAL MANDATE // INCIDENT COMMAND DISPATCH
                    </div>
                    We don't troubleshoot printers. We don't write "Hello World". When mission-critical production fails at 03:00 AM, Code Rescue engineers execute. Every participant must abide by the directives below. Non-compliance results in immediate operational termination.
                </div>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>DIRECTIVE 01: Eligibility & Verification Clearance</legend>
                    <p>• <b>Candidate Pool:</b> Open to all registered undergraduate and postgraduate engineering students.</p>
                    <p>• <b>Clearance Protocol:</b> Participation is strictly individual. Each candidate must produce a valid institutional physical ID card upon entry.</p>
                    <p>• <b>Station Assignment:</b> Workstations will be assigned via randomized triage lottery.</p>
                </fieldset>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>DIRECTIVE 02: Tournament Structure & Qualification Gates</legend>
                    <p>• <b>Round 1 — Bug Hunt:</b> 20 Minutes • 10 Faults • 100 Points (Rapid syntax, typo, and runtime panic remediation).</p>
                    <p>• <b>Round 2 — Logic Breaker:</b> 25 Minutes • 5 Traps • 100 Points (Deep logical hazard resolution: mutable state, infinite loops, boundary faults).</p>
                    <p>• <b>Round 3 — Code Rescue:</b> 40 Minutes • 1 Legacy System • 100 Points (Multi-module legacy system resuscitation under production clock pressure).</p>
                    <p>• <b>Qualification Gate:</b> Only engineers meeting strict score & speed cutoffs survive to the next operational round.</p>
                </fieldset>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>SANCTION 03 (CRITICAL): Zero-Tolerance Anti-AI & Malpractice Mandate</legend>
                    <div style={styles.dangerBox}>
                        <b>STRICTLY PROHIBITED:</b> Utilization of ChatGPT, Claude, Google Gemini, GitHub Copilot, Cursor AI, or any generative neural model / browser plugin.
                    </div>
                    <p>• <b>Hardware Audit:</b> Workstation processes and egress network traffic are monitored by real-time telemetry and proctors.</p>
                    <p>• <b>Sanction:</b> Any unauthorized external communication, USB insertion, or secondary screen usage triggers immediate disqualification without appeal.</p>
                </fieldset>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>DIRECTIVE 04: Scoring Engine & Latency Arbitration</legend>
                    <p>• <b>Max Total Score:</b> 300 Points across all three completed incident rounds.</p>
                    <p>• <b>Tie-Breakers:</b> In the event of matching scores, priority is determined by <b>earliest submission epoch</b> followed by <b>lowest runtime latency & execution memory</b>.</p>
                    <p>• <b>Arbitration:</b> Decisions rendered by Chief Coordinators & Faculty Arbitrators are absolute, definitive, and final.</p>
                </fieldset>

                <fieldset style={styles.fieldset}>
                    <legend style={styles.legend}>DIRECTIVE 05: Emergency Command Personnel</legend>
                    <p>• <b>Faculty Coordinators:</b> Dr. G. Senthil Velan (Associate Professor), Ms. Anu (Assistant Professor)</p>
                    <p>• <b>Student Incident Leads:</b> Yashvinthan M (Lead & Tech Head), Kavitha G, Sanjai P.A.</p>
                    <p>• <b>Station:</b> Techastra Main Computing Facility • Lab 304</p>
                </fieldset>
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    container: {
        padding: 20,
        backgroundColor: '#ffffff',
        overflowY: 'auto',
    },
    headerBanner: {
        background: '#ffffff',
        boxShadow: 'var(--border-field)',
        padding: '14px 18px',
        marginBottom: 16,
    },
    fieldset: {
        border: '2px groove #dfdfdf',
        padding: '12px 16px',
        marginBottom: 16,
        backgroundColor: '#fbfbfb',
        boxSizing: 'border-box',
    },
    legend: {
        fontWeight: 'bold',
        padding: '0 6px',
        fontSize: 14,
        fontFamily: 'MillenniumBold, Times New Roman, serif',
        color: '#000000',
    },
    dangerBox: {
        background: '#fff0f0',
        boxShadow: 'var(--border-field)',
        color: '#a40e26',
        padding: '10px 14px',
        margin: '10px 0',
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: 'Courier New, monospace',
    },
};

export default RulesApp;
