import React, { useEffect, useState } from 'react';
import Window from '../os/Window';
import { useInterval } from 'usehooks-ts';
import { motion } from 'framer-motion';

export interface CreditsProps extends WindowAppProps {}

const CREDITS = [
    {
        title: 'Event Leadership & Symposium',
        rows: [
            ['Symposium', 'TECHASTRA 2026'],
            ['Event', 'CODE RESCUE'],
            ['Tagline', '"Think. Debug. Fix. Rescue the Code!"'],
            ['Department', 'Computer Science & Engineering'],
        ],
    },
    {
        title: 'Staff Coordinators',
        rows: [
            ['Dr. G. Senthil Velan', 'Associate Professor / CSE'],
            ['Ms. Anu', 'Assistant Professor / CSE'],
        ],
    },
    {
        title: 'Student Coordinators',
        rows: [
            ['Yashvinthan M', 'Lead Coordinator & Tech Lead'],
            ['Kavitha G', 'Event Operations & Registration'],
            ['Sanjai P.A.', 'Logistics & Scoring Invigilator'],
        ],
    },
    {
        title: 'Competition & Diagnostics Engine',
        rows: [
            ['Debugging Engine', 'Monaco IDE & Python Runtime Sandbox'],
            ['Test Harness', 'Automated Hidden Test Runner'],
            ['Platform Architecture', 'Triage Station & Live Leaderboard'],
        ],
    },
    {
        title: 'Workstation Inspiration',
        rows: [
            ['3D Room & OS Concept', 'Henry Heffernan'],
            ['Office Ambiance Sound', 'Sound Cassette & Microsoft'],
            ['Special Thanks', 'All Participating Colleges & Contestants'],
        ],
    },
];

const Credits: React.FC<CreditsProps> = (props) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [time, setTime] = useState(0);

    // every 5 seconds, move to the next slide
    useInterval(() => {
        setTime(time + 1);
        // setCurrentSlide((currentSlide + 1) % CREDITS.length);
    }, 1000);

    useEffect(() => {
        if (time > 5) {
            setCurrentSlide((currentSlide + 1) % CREDITS.length);
            setTime(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [time]);

    const nextSlide = () => {
        setTime(0);
        setCurrentSlide((currentSlide + 1) % CREDITS.length);
    };

    return (
        // add on resize listener
        <Window
            top={48}
            left={48}
            width={1100}
            height={800}
            windowTitle="TECHASTRA 2026 — Code Rescue Credits"
            windowBarIcon="windowExplorerIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'© 2026 Techastra Symposium • Code Rescue'}
        >
            <div
                onMouseDown={nextSlide}
                className="site-page"
                style={styles.credits}
            >
                <h2>Code Rescue Credits</h2>
                <p>Techastra 2026 National Level Technical Symposium</p>
                <br />
                <br />
                <br />
                <div style={styles.slideContainer}>
                    {
                        <motion.div
                            animate={{ opacity: 1, y: -20 }}
                            transition={{ duration: 0.5 }}
                            key={`section-${CREDITS[currentSlide].title}`}
                            style={styles.section}
                        >
                            <h3 style={styles.sectionTitle}>
                                {CREDITS[currentSlide].title}
                            </h3>
                            {CREDITS[currentSlide].rows.map((row, i) => {
                                return (
                                    <div key={`row-${i}`} style={styles.row}>
                                        <p>{row[0]}</p>
                                        <p>{row[1]}</p>
                                    </div>
                                );
                            })}
                        </motion.div>
                    }
                </div>
                <p>Click to continue...</p>
                <br />
                <div style={styles.nextSlideTimer}>
                    {/* make a time number of dots */}
                    {Array.from(Array(time)).map((i) => {
                        return (
                            <div key={i}>
                                <p>.</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    credits: {
        width: '100%',
        backgroundColor: 'black',
        paddingTop: 64,
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 64,
        color: 'white',
        overflow: 'hidden',
    },
    row: {
        overflow: 'none',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: 600,
        alignSelf: 'center',
    },
    section: {
        overflow: 'none',
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: 32,
        opacity: 0,
    },
    sectionTitle: {
        marginBottom: 32,
    },
    slideContainer: {
        width: '100%',
        height: '70%',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    nextSlideTimer: {
        width: 64,
        height: 32,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
};

export default Credits;
