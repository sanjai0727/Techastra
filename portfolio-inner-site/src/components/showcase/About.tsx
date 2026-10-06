import React from 'react';
import posterImg from '../../assets/pictures/code_rescue_poster.png';
import mgrLogo from '../../assets/pictures/mgr_university_logo.png';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface AboutProps {}

const About: React.FC<AboutProps> = (props) => {
    return (
        <div className="site-page-content">
            {/* University Institutional Header */}
            <div style={styles.institutionBanner}>
                <img
                    src={mgrLogo}
                    alt="Dr. M.G.R. Educational and Research Institute University"
                    style={styles.univLogoImg}
                />
                <p style={styles.univDeptText}>
                    <b>DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING</b> &bull; <b>DEPARTMENT OF CYBER SECURITY</b>
                </p>
                <p style={styles.univSymposiumText}>
                    18th National Level Technical Symposium &bull; <b>TECHASTRA 2026</b>
                </p>
            </div>

            <h1 style={{ marginLeft: -16 }}>Event Overview</h1>
            <h3>TECHASTRA 2026 • CODE RESCUE</h3>
            <br />
            <div className="text-block">
                <p>
                    Welcome to <b>CODE RESCUE ("Three-Round Debugging Challenge")</b>,
                    a premier competitive debugging event hosted as part of the{' '}
                    <b>Techastra National Level Technical Symposium</b> by the
                    Department of Computer Science & Engineering.
                </p>
                <br />
                <p>
                    Guided by our event philosophy —{' '}
                    <i>"Think. Debug. Fix. Rescue the Code!"</i> — Code Rescue challenges
                    engineering and computer science students to race against the clock,
                    diagnose faulty software, uncover subtle logical flaws, and restore
                    mission-critical codebases to full health.
                </p>
            </div>
            <ResumeDownload altText="Official Code Rescue Rulebook & Proposal" />
            <div className="text-block">
                <h3>The Code Rescue Philosophy</h3>
                <br />
                <p>
                    Unlike traditional algorithmic platforms (LeetCode, Codeforces)
                    where contestants write code from scratch, Code Rescue tests
                    real-world software diagnosis and triage. In production software
                    engineering, over 80% of developer time is spent reading, deciphering,
                    and fixing existing code.
                </p>
                <br />
                <p>
                    Code Rescue rigorously evaluates your ability to:
                </p>
                <ul>
                    <li>
                        <p>
                            <b>Decipher compiler & runtime tracebacks:</b> Quickly trace
                            SyntaxError, IndentationError, ZeroDivisionError, and IndexError back to the source.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Uncover insidious logic traps:</b> Detect off-by-one boundary
                            conditions, mutable default argument traps, unhandled edge cases, and infinite loops.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Triage multi-bug systems:</b> Navigate interconnected legacy modules
                            where fixing one defect without regression testing could break another.
                        </p>
                    </li>
                    <li>
                        <p>
                            <b>Perform under pressure:</b> Manage strict, non-negotiable countdown
                            timers across three escalating qualification rounds.
                        </p>
                    </li>
                </ul>
                <br />
                <div className="captioned-image" style={{ textAlign: 'center' }}>
                    <img
                        src={posterImg}
                        style={styles.posterImage}
                        alt="Techastra '26 Code Rescue Official Poster"
                    />
                    <p style={{ marginTop: 8 }}>
                        <sub>
                            <b>Figure 1:</b> Official Techastra '26 Code Rescue Event Poster —
                            Department of Computer Science &amp; Engineering &amp; Department of Cyber Security,
                            Dr. M.G.R. Educational and Research Institute University.
                        </sub>
                    </p>
                </div>
                <br />
                <h3>Tournament Organization</h3>
                <br />
                <p>
                    Code Rescue is organized and adjudicated by the faculty and student
                    leadership of the Department of Computer Science & Engineering:
                </p>
                <br />
                <div style={styles.organizerSection}>
                    <div style={styles.organizerBlock}>
                        <h4>Staff Coordinators:</h4>
                        <p>• <b>Dr. G. Senthil Velan</b> (Associate Professor)</p>
                        <p>• <b>Ms. Anu</b> (Assistant Professor)</p>
                    </div>
                    <div style={styles.organizerBlock}>
                        <h4>Student Coordinators:</h4>
                        <p>• <b>Yashvinthan M</b> (Lead Coordinator)</p>
                        <p>• <b>Kavitha G</b> (Student Coordinator)</p>
                        <p>• <b>Sanjai P.A.</b> (Student Coordinator)</p>
                    </div>
                </div>
                <br />
                <p>
                    Ready to learn more about the competition stages? Check out our{' '}
                    <Link to="/experience">Rounds & Tournament Blueprint</Link> or inspect{' '}
                    <Link to="/projects">Challenge Tracks</Link>. For any queries, reach out
                    directly to the coordinators via the{' '}
                    <Link to="/contact">Coordinator Help Desk</Link>.
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    contentHeader: {
        marginBottom: 16,
        fontSize: 48,
    },
    posterImage: {
        height: 'auto',
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
        display: 'block',
        border: '2px solid #333333',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    institutionBanner: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        border: '2px solid #000080',
        padding: '14px 20px',
        marginBottom: 20,
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    },
    univLogoImg: {
        maxWidth: 380,
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
        marginBottom: 8,
    },
    univDeptText: {
        fontSize: 12,
        color: '#1a1a1a',
        letterSpacing: 0.5,
        margin: '2px 0',
    },
    univSymposiumText: {
        fontSize: 12,
        color: '#000080',
        margin: '2px 0',
        fontWeight: 600,
    },
    organizerSection: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        padding: 16,
        marginBottom: 16,
    },
    organizerBlock: {
        flex: 1,
        minWidth: 200,
        flexDirection: 'column',
    },
};

export default About;
