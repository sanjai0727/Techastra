import React, { useEffect, useState } from 'react';
import { Link } from '../general';
import { useLocation, useNavigate } from 'react-router-dom';
import mgrLogo from '../../assets/pictures/mgr_university_logo.png';

export interface VerticalNavbarProps {}

const VerticalNavbar: React.FC<VerticalNavbarProps> = (props) => {
    const location = useLocation();
    const [projectsExpanded, setProjectsExpanded] = useState(false);
    const [isHome, setIsHome] = useState(false);

    const navigate = useNavigate();
    const goToContact = () => {
        navigate('/contact');
    };

    useEffect(() => {
        if (location.pathname.includes('/projects')) {
            setProjectsExpanded(true);
        } else {
            setProjectsExpanded(false);
        }
        if (location.pathname === '/') {
            setIsHome(true);
        } else {
            setIsHome(false);
        }
        return () => {};
    }, [location.pathname]);

    return (
        <div style={styles.navbar}>
            <div style={styles.header}>
                <div style={styles.logoBadgeContainer}>
                    <img
                        src={mgrLogo}
                        alt="Dr. M.G.R. University"
                        style={styles.navbarLogoImg}
                    />
                </div>
                <h1 style={styles.headerText}>TECHASTRA</h1>
                <h2 style={styles.headerSub}>CODE RESCUE</h2>
                <h3 style={styles.headerShowcase}>Event Dossier '26</h3>
            </div>
            <div style={styles.links}>
                <Link containerStyle={styles.link} to="" text="HOME" />
                <Link containerStyle={styles.link} to="about" text="ABOUT" />
                <Link
                    containerStyle={styles.link}
                    to="experience"
                    text="ROUNDS"
                />
                <Link
                    containerStyle={Object.assign(
                        {},
                        styles.link,
                        projectsExpanded && styles.expandedLink
                    )}
                    to="projects"
                    text="CHALLENGES"
                />
                {
                    // if current path contains projects
                    projectsExpanded && (
                        <div style={styles.insetLinks}>
                            <Link
                                containerStyle={styles.insetLink}
                                to="projects/software"
                                text="R1: BUG HUNT"
                            />
                            <Link
                                containerStyle={styles.insetLink}
                                to="projects/music"
                                text="R2: LOGIC BREAKER"
                            />
                            <Link
                                containerStyle={styles.insetLink}
                                to="projects/art"
                                text="R3: CODE RESCUE"
                            />
                        </div>
                    )
                }
                <Link
                    containerStyle={styles.link}
                    to="contact"
                    text="COORDINATORS"
                />
            </div>
            <div style={styles.spacer} />
            <div style={Object.assign({}, styles.forHireContainer, { cursor: 'pointer' })} onClick={goToContact}>
                {/* <img src={forHire} style={styles.image} alt="" /> */}
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    navbar: {
        width: 300,
        height: '100%',
        flexDirection: 'column',
        padding: 48,
        boxSizing: 'border-box',
        position: 'fixed',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'column',
        marginBottom: 48,
    },
    logoBadgeContainer: {
        backgroundColor: '#ffffff',
        padding: '6px 8px',
        border: '1px solid #b0b0b0',
        borderRadius: 2,
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #ffffff',
    },
    navbarLogoImg: {
        width: '100%',
        maxWidth: 200,
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
    },
    headerText: {
        fontSize: 34,
        lineHeight: 1,
    },
    headerSub: {
        fontSize: 22,
        lineHeight: 1.1,
        marginTop: 4,
        color: '#222',
    },
    headerShowcase: {
        marginTop: 12,
    },
    logo: {
        width: '100%',
        marginBottom: 8,
    },
    link: {
        marginBottom: 32,
    },
    expandedLink: {
        marginBottom: 16,
    },
    insetLinks: {
        flexDirection: 'column',
        marginLeft: 32,
        marginBottom: 16,
    },
    insetLink: {
        marginBottom: 8,
    },
    links: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
    },
    image: {
        width: '80%',
    },
    spacer: {
        flex: 1,
    },
    forHireContainer: {
        cursor: 'pointer',

        width: '100%',
    },
};

export default VerticalNavbar;
