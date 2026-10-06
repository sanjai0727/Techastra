import React, { useCallback, useEffect, useState } from 'react';
import Colors from '../../constants/colors';
import ShowcaseExplorer from '../applications/ShowcaseExplorer';
import Doom from '../applications/Doom';
import OregonTrail from '../applications/OregonTrail';
import ShutdownSequence from './ShutdownSequence';
// import ThisComputer from '../applications/ThisComputer';
import Henordle from '../applications/Henordle';
import Toolbar from './Toolbar';
import DesktopShortcut, { DesktopShortcutProps } from './DesktopShortcut';
import Scrabble from '../applications/Scrabble';
import { IconName } from '../../assets/icons';
import Credits from '../applications/Credits';
import RulesApp from '../applications/Rules';
import SettingsApp from '../applications/Settings';
import CodeRescueApp from '../applications/CodeRescueApp';

export interface DesktopProps {}

type ExtendedWindowAppProps<T> = T & WindowAppProps;

const APPLICATIONS: {
    [key in string]: {
        key: string;
        name: string;
        shortcutIcon: IconName;
        component: React.FC<ExtendedWindowAppProps<any>>;
    };
} = {
    coderescue: {
        key: 'coderescue',
        name: 'Code Rescue Arena',
        shortcutIcon: 'computerBig',
        component: CodeRescueApp,
    },
    showcase: {
        key: 'showcase',
        name: 'Event Dossier',
        shortcutIcon: 'showcaseIcon',
        component: ShowcaseExplorer,
    },
    rules: {
        key: 'rules',
        name: 'Official Rules',
        shortcutIcon: 'computerBig',
        component: RulesApp,
    },
    settings: {
        key: 'settings',
        name: 'Settings',
        shortcutIcon: 'settings',
        component: SettingsApp,
    },
    trail: {
        key: 'trail',
        name: 'The Oregon Trail',
        shortcutIcon: 'trailIcon',
        component: OregonTrail,
    },
    doom: {
        key: 'doom',
        name: 'Doom',
        shortcutIcon: 'doomIcon',
        component: Doom,
    },
    scrabble: {
        key: 'scrabble',
        name: 'Scrabble',
        shortcutIcon: 'scrabbleIcon',
        component: Scrabble,
    },
    henordle: {
        key: 'henordle',
        name: 'CodeWordle',
        shortcutIcon: 'henordleIcon',
        component: Henordle,
    },
    credits: {
        key: 'credits',
        name: 'Credits',
        shortcutIcon: 'credits',
        component: Credits,
    },
};

const Desktop: React.FC<DesktopProps> = (props) => {
    const [windows, setWindows] = useState<DesktopWindows>({});
    const [shutdown, setShutdown] = useState(false);
    const [numShutdowns, setNumShutdowns] = useState(1);
    const [crtEnabled, setCrtEnabled] = useState(
        () => localStorage.getItem('cr_crt') === 'true'
    );
    const [vcrEnabled, setVcrEnabled] = useState(
        () => localStorage.getItem('cr_vcr') === 'true'
    );

    useEffect(() => {
        if (shutdown === true) {
            rebootDesktop();
        }
    }, [shutdown]);

    const rebootDesktop = useCallback(() => {
        setWindows({});
    }, []);

    const removeWindow = useCallback((key: string) => {
        setWindows((prevWindows) => {
            const newWindows = { ...prevWindows };
            delete newWindows[key];
            return newWindows;
        });
    }, []);

    const minimizeWindow = useCallback((key: string) => {
        setWindows((prevWindows) => {
            if (!prevWindows[key]) return prevWindows;
            return {
                ...prevWindows,
                [key]: {
                    ...prevWindows[key],
                    minimized: true,
                },
            };
        });
    }, []);

    const toggleMinimize = useCallback((key: string) => {
        setWindows((prevWindows) => {
            if (!prevWindows[key]) return prevWindows;
            let highestIndex = 0;
            Object.keys(prevWindows).forEach((k) => {
                const win = prevWindows[k];
                if (win && win.zIndex > highestIndex) {
                    highestIndex = win.zIndex;
                }
            });

            const isMinimized = prevWindows[key].minimized;
            const isTop = prevWindows[key].zIndex === highestIndex;
            const shouldMinimize = !isMinimized && isTop;

            return {
                ...prevWindows,
                [key]: {
                    ...prevWindows[key],
                    minimized: shouldMinimize,
                    zIndex: highestIndex + 1,
                },
            };
        });
    }, []);

    const onWindowInteract = useCallback((key: string) => {
        setWindows((prevWindows) => {
            if (!prevWindows[key]) return prevWindows;
            let highestIndex = 0;
            Object.keys(prevWindows).forEach((k) => {
                const win = prevWindows[k];
                if (win && win.zIndex > highestIndex) {
                    highestIndex = win.zIndex;
                }
            });

            return {
                ...prevWindows,
                [key]: {
                    ...prevWindows[key],
                    zIndex: highestIndex + 1,
                },
            };
        });
    }, []);

    const startShutdown = useCallback(() => {
        setTimeout(() => {
            setShutdown(true);
            setNumShutdowns((n) => n + 1);
        }, 600);
    }, []);

    const addWindow = useCallback((key: string, element: JSX.Element) => {
        setWindows((prevState) => {
            let highestIndex = 0;
            Object.keys(prevState).forEach((k) => {
                const win = prevState[k];
                if (win && win.zIndex > highestIndex) {
                    highestIndex = win.zIndex;
                }
            });

            return {
                ...prevState,
                [key]: {
                    zIndex: highestIndex + 1,
                    minimized: false,
                    component: element,
                    name: APPLICATIONS[key].name,
                    icon: APPLICATIONS[key].shortcutIcon,
                },
            };
        });
    }, []);

    const openApp = useCallback(
        (key: string) => {
            const app = APPLICATIONS[key];
            if (!app) return;
            addWindow(
                app.key,
                <app.component
                    onInteract={() => onWindowInteract(app.key)}
                    onMinimize={() => minimizeWindow(app.key)}
                    onClose={() => removeWindow(app.key)}
                    crtEnabled={crtEnabled}
                    setCrtEnabled={setCrtEnabled}
                    vcrEnabled={vcrEnabled}
                    setVcrEnabled={setVcrEnabled}
                    key={app.key}
                />
            );
        },
        [addWindow, onWindowInteract, minimizeWindow, removeWindow, crtEnabled, vcrEnabled]
    );

    useEffect(() => {
        const handleOpenApp = (e: any) => {
            const key = e.detail?.key;
            if (key) {
                openApp(key);
            }
        };
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'OPEN_OS_APP' && e.data?.key) {
                openApp(e.data.key);
            }
        };
        window.addEventListener('open-os-app', handleOpenApp);
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('open-os-app', handleOpenApp);
            window.removeEventListener('message', handleMessage);
        };
    }, [openApp]);

    // Auto-launch default app only ONCE on mount
    useEffect(() => {
        openApp('showcase');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return !shutdown ? (
        <div style={styles.desktop}>
            {crtEnabled && <div className="crt-scanlines" />}
            {vcrEnabled && (
                <div className="vcr-osd-bar">
                    <div>
                        <span>▶ PLAY&nbsp;&nbsp;SP&nbsp;&nbsp;00:85:00</span>
                        <span style={{ marginLeft: 16 }}>
                            <span className="vcr-rec-dot">●</span> REC&nbsp;
                            [TECHASTRA // CODE RESCUE]
                        </span>
                    </div>
                    <div>
                        <span>DISPATCH STATION: CR-26</span>
                    </div>
                </div>
            )}
            {/* For each window in windows, loop over and render  */}
            {Object.keys(windows).map((key) => {
                const element = windows[key].component;
                if (!element) return <div key={`win-${key}`}></div>;
                return (
                    <div
                        key={`win-${key}`}
                        style={Object.assign(
                            {},
                            { zIndex: windows[key].zIndex },
                            windows[key].minimized && styles.minimized
                        )}
                    >
                        {React.cloneElement(element, {
                            key,
                            onInteract: () => onWindowInteract(key),
                            onMinimize: () => minimizeWindow(key),
                            onClose: () => removeWindow(key),
                            crtEnabled,
                            setCrtEnabled,
                            vcrEnabled,
                            setVcrEnabled,
                        })}
                    </div>
                );
            })}
            <div style={styles.shortcuts}>
                {Object.keys(APPLICATIONS).map((key, i) => {
                    const app = APPLICATIONS[key];
                    return (
                        <div
                            style={Object.assign({}, styles.shortcutContainer, {
                                top: (i % 6) * 96,
                                left: Math.floor(i / 6) * 96,
                            })}
                            key={app.key}
                        >
                            <DesktopShortcut
                                icon={app.shortcutIcon}
                                shortcutName={app.name}
                                onOpen={() => openApp(app.key)}
                            />
                        </div>
                    );
                })}
            </div>

            <Toolbar
                windows={windows}
                toggleMinimize={toggleMinimize}
                shutdown={startShutdown}
                openApp={openApp}
            />
        </div>
    ) : (
        <ShutdownSequence
            setShutdown={setShutdown}
            numShutdowns={numShutdowns}
        />
    );
};

const styles: StyleSheetCSS = {
    desktop: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: Colors.turquoise,
    },
    shutdown: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: '#1d2e2f',
    },
    shortcutContainer: {
        position: 'absolute',
    },
    shortcuts: {
        position: 'absolute',
        top: 8,
        left: 6,
    },
    minimized: {
        pointerEvents: 'none',
        opacity: 0,
    },
};

export default Desktop;
