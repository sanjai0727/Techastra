import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';
import mgrLogo from '../../assets/pictures/mgr_university_logo.png';

export interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
    const navigate = useNavigate();

    const launchArena = () => {
        window.dispatchEvent(
            new CustomEvent('open-os-app', {
                detail: { key: 'coderescue' },
            })
        );
    };

    return (
        <div className="site-page-content">
            {/* University & Symposium Institutional Header */}
            <div style={styles.institutionBanner}>
                <img
                    src={mgrLogo}
                    alt="Dr. M.G.R. Educational and Research Institute University"
                    style={styles.univLogoImg}
                />
                <div style={styles.institutionSubheader}>
                    <p style={styles.deptText}>
                        <b>DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING</b> &bull; <b>DEPARTMENT OF CYBER SECURITY</b>
                    </p>
                    <p style={styles.symposiumText}>
                        18th National Level Technical Symposium &bull; <b>TECHASTRA 2026</b>
                    </p>
                </div>
            </div>

            <h1 style={{ marginLeft: -16 }}>TECHASTRA '26</h1>
            <h3>CODE RESCUE • EVENT DOSSIER</h3>
            <br />
            <div className="text-block">
                <p>
                    Welcome to the official <b>Code Rescue Event Dossier</b> for{' '}
                    <b>Techastra 2026</b>, hosted by the Department of Computer
                    Science & Engineering.
                </p>
                <br />
                <p>
                    <i>"Think. Debug. Fix. Rescue the Code!"</i> — Code Rescue is a
                    high-intensity, 3-round competitive software triage championship
                    designed to test real-world debugging prowess under strict time
                    constraints.
                </p>
            </div>

            {/* Launch Banner Callout */}
            <div style={styles.launchCallout}>
                <div style={{ flex: 1, minWidth: 260 }}>
                    <h3 style={{ margin: 0, color: '#000080' }}>
                        Ready to compete in the debugging arena?
                    </h3>
                    <p style={{ marginTop: 6, fontSize: 14 }}>
                        Launch the live Windows 95 software workstation with embedded Python 3.11 triage engine and interactive MS-DOS terminal.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={launchArena}
                    className="site-button"
                    style={styles.launchBtn}
                >
                    ⚡ Launch Arena in OS &gt;&gt;
                </button>
            </div>

            <ResumeDownload altText="Download Official Code Rescue Rulebook & Proposal" />

            <div className="text-block">
                <h3>Tournament Quick Links</h3>
                <br />
                <div style={styles.cardGrid}>
                    <div style={styles.card} onClick={() => navigate('/about')}>
                        <h4>📄 Event Overview & Philosophy</h4>
                        <p style={{ fontSize: 13, marginTop: 4 }}>
                            Discover why production triage matters more than writing boilerplate from scratch.
                        </p>
                    </div>
                    <div style={styles.card} onClick={() => navigate('/experience')}>
                        <h4>📋 Competition Stages (Rounds 1 - 3)</h4>
                        <p style={{ fontSize: 13, marginTop: 4 }}>
                            Review round qualification thresholds, timers, and point structures.
                        </p>
                    </div>
                    <div style={styles.card} onClick={() => navigate('/projects')}>
                        <h4>⚡ Challenge Tracks & Defect Taxonomy</h4>
                        <p style={{ fontSize: 13, marginTop: 4 }}>
                            Inspect the defect types across syntax, logical traps, and complex legacy recovery.
                        </p>
                    </div>
                    <div style={styles.card} onClick={() => navigate('/contact')}>
                        <h4>👤 Coordinator Help Desk</h4>
                        <p style={{ fontSize: 13, marginTop: 4 }}>
                            Reach out to faculty leads Dr. G. Senthil Velan, Ms. Anu, and student coordinators.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    launchCallout: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        backgroundColor: '#eef4ff',
        border: '2px solid #000080',
        padding: 16,
        marginBottom: 24,
        marginTop: 8,
    },
    launchBtn: {
        fontSize: 14,
        padding: '8px 20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        whiteSpace: 'nowrap',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginTop: 8,
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f8f8',
        border: '1px solid #cccccc',
        padding: 14,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
    },
    institutionBanner: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        border: '2px solid #000080',
        padding: '16px 20px',
        marginBottom: 20,
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
    },
    univLogoImg: {
        maxWidth: 420,
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
        marginBottom: 8,
    },
    institutionSubheader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
    },
    deptText: {
        fontSize: 12,
        color: '#1a1a1a',
        letterSpacing: 0.5,
        margin: 0,
    },
    symposiumText: {
        fontSize: 12,
        color: '#000080',
        margin: 0,
        fontWeight: 600,
    },
};

export default Home;
