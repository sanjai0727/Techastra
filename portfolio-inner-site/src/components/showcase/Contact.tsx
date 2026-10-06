import React, { useEffect, useState } from 'react';
import colors from '../../constants/colors';
import ResumeDownload from './ResumeDownload';
import mgrLogo from '../../assets/pictures/mgr_university_logo.png';

export interface ContactProps {}

const validateEmail = (email: string) => {
    const re =
        // eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const Contact: React.FC<ContactProps> = (props) => {
    const [college, setCollege] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [formMessageColor, setFormMessageColor] = useState('');

    useEffect(() => {
        if (validateEmail(email) && name.length > 0 && message.length > 0) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [email, name, message]);

    function submitForm() {
        if (!isFormValid) {
            setFormMessage('Please complete all required fields.');
            setFormMessageColor(colors.red);
            return;
        }
        setIsLoading(true);
        // Simulate immediate coordinator dispatch
        setTimeout(() => {
            setFormMessage(`Query registered! Coordinators will reach out to ${name}.`);
            setCollege('');
            setEmail('');
            setName('');
            setMessage('');
            setFormMessageColor(colors.blue);
            setIsLoading(false);
        }, 600);
    }

    useEffect(() => {
        if (formMessage.length > 0) {
            const timer = setTimeout(() => {
                setFormMessage('');
                setFormMessageColor('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [formMessage]);

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

            <div style={styles.header}>
                <h1>Event Coordinators</h1>
                <h3>TECHASTRA 2026 • CODE RESCUE</h3>
            </div>
            <br />
            <ResumeDownload altText="Download Official Code Rescue Rulebook & Guidelines" />
            <br />
            <div className="corporate-callout">
                <div className="corporate-callout-title">
                    READY TO INTERFACE? // INCIDENT DISPATCH DESK
                </div>
                Don't waste valuable time. Review our tournament dossier, check the operational directives, and interface with our command team. Pick up the phone, send a telex, or submit a dispatch inquiry below. When production collapses, our triage team is already hot. Let's execute.
            </div>
            <div className="text-block">
                <h2>Coordinators & Leadership</h2>
                <br />
                <div style={styles.coordinatorGrid}>
                    <div style={styles.coordinatorCard}>
                        <h4 style={styles.roleTitle}>Staff Coordinators</h4>
                        <div style={styles.personRow}>
                            <p>• <b>Dr. G. Senthil Velan</b></p>
                            <p style={styles.subtext}>Associate Professor, Dept. of CSE</p>
                        </div>
                        <div style={styles.personRow}>
                            <p>• <b>Ms. Anu</b></p>
                            <p style={styles.subtext}>Assistant Professor, Dept. of CSE</p>
                        </div>
                    </div>

                    <div style={styles.coordinatorCard}>
                        <h4 style={styles.roleTitle}>Student Coordinators</h4>
                        <div style={styles.personRow}>
                            <p>• <b>Yashvinthan M</b></p>
                            <p style={styles.subtext}>Lead Coordinator & Technical Head</p>
                        </div>
                        <div style={styles.personRow}>
                            <p>• <b>Kavitha G</b></p>
                            <p style={styles.subtext}>Event Operations & Registration Head</p>
                        </div>
                        <div style={styles.personRow}>
                            <p>• <b>Sanjai P.A.</b></p>
                            <p style={styles.subtext}>Logistics & Scoring Invigilator</p>
                        </div>
                    </div>
                </div>

                <br />
                <h3>Symposium Venue & Department</h3>
                <p>
                    <b>Symposium:</b> Techastra 2026 National Level Technical Symposium<br />
                    <b>Department:</b> Department of Computer Science & Engineering<br />
                    <b>Event Station:</b> Lab Systems / Computer Center • Stations 1 to 50
                </p>

                <br />
                <h2>Participant Help Desk & Queries</h2>
                <p>
                    Have questions regarding eligibility, rules, rounds, or on-spot registration?
                    Submit your inquiry below to notify the Code Rescue coordinator desk:
                </p>

                <div style={styles.form}>
                    <label>
                        <p>
                            {!name && <span style={styles.star}>*</span>}
                            <b>Participant Name:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label>
                        <p>
                            {!validateEmail(email) && (
                                <span style={styles.star}>*</span>
                            )}
                            <b>Contact Email:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="email"
                        name="email"
                        placeholder="student@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>
                        <p>
                            <b>College / Institution:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="text"
                        name="college"
                        placeholder="Your college / university name"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                    />
                    <label>
                        <p>
                            {!message && <span style={styles.star}>*</span>}
                            <b>Query / Issue:</b>
                        </p>
                    </label>
                    <textarea
                        name="message"
                        placeholder="Describe your query regarding Code Rescue (e.g., round details, platform questions, eligibility)..."
                        style={styles.formItem}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <div style={styles.buttons}>
                        <button
                            className="site-button"
                            style={styles.button}
                            type="button"
                            disabled={!isFormValid || isLoading}
                            onClick={submitForm}
                        >
                            {!isLoading ? (
                                'Submit Query'
                            ) : (
                                <p className="loading">Dispatching</p>
                            )}
                        </button>
                        <div style={styles.formInfo}>
                            <p
                                style={Object.assign(
                                    {},
                                    { color: formMessageColor }
                                )}
                            >
                                <b>
                                    <sub>
                                        {formMessage
                                            ? `${formMessage}`
                                            : ' Queries are dispatched directly to the student & faculty coordinators.'}
                                    </sub>
                                </b>
                            </p>
                            <p>
                                <sub>
                                    {!isFormValid ? (
                                        <span>
                                            <b style={styles.star}>*</b> = required
                                        </span>
                                    ) : (
                                        '\xa0'
                                    )}
                                </sub>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    form: {
        flexDirection: 'column',
        marginTop: 24,
    },
    formItem: {
        marginTop: 4,
        marginBottom: 16,
    },
    buttons: {
        justifyContent: 'space-between',
        alignItems: 'center',
        display: 'flex',
    },
    formInfo: {
        textAlign: 'right',
        flexDirection: 'column',
        alignItems: 'flex-end',
        paddingLeft: 24,
    },
    star: {
        paddingRight: 4,
        color: 'red',
    },
    button: {
        minWidth: 184,
        height: 32,
    },
    header: {
        flexDirection: 'column',
        marginBottom: 8,
    },
    coordinatorGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },
    coordinatorCard: {
        flex: 1,
        minWidth: 240,
        backgroundColor: '#f8f8f8',
        border: '1px solid #ddd',
        padding: 16,
    },
    roleTitle: {
        fontSize: 16,
        marginBottom: 12,
        borderBottom: '2px solid #ccc',
        paddingBottom: 4,
        color: '#111',
    },
    personRow: {
        marginBottom: 10,
    },
    subtext: {
        fontSize: 12,
        color: '#666',
        marginLeft: 14,
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
};

export default Contact;
