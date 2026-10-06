import React, { useState, useEffect } from 'react';
import Window from '../os/Window';

export interface ThisComputerProps extends WindowAppProps {}

type ComputerTab = 'general' | 'drives' | 'devices';

const ThisComputerApp: React.FC<ThisComputerProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ComputerTab>('general');
    const [screenRes, setScreenRes] = useState<string>('1920 x 1080');
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [apiLatency, setApiLatency] = useState<string>('Checking...');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setScreenRes(`${window.innerWidth} x ${window.innerHeight}`);
            setIsOnline(navigator.onLine);

            const handleResize = () => setScreenRes(`${window.innerWidth} x ${window.innerHeight}`);
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);

            window.addEventListener('resize', handleResize);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            // Quick latency check
            const start = performance.now();
            fetch('/api/rounds')
                .then(() => {
                    const elapsed = Math.round(performance.now() - start);
                    setApiLatency(`${elapsed} ms (Optimal)`);
                })
                .catch(() => {
                    setApiLatency('Offline / Standalone');
                });

            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    return (
        <Window
            top={50}
            left={80}
            width={520}
            height={460}
            windowBarIcon="myComputer"
            windowTitle="My Computer - System Properties"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText="Station CR-26 Workstation"
        >
            <div style={styles.dialogContainer}>
                {/* Win95 Tab Bar */}
                <div style={styles.tabBar}>
                    <button
                        type="button"
                        style={Object.assign(
                            {},
                            styles.tabButton,
                            activeTab === 'general' ? styles.activeTab : styles.inactiveTab
                        )}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        type="button"
                        style={Object.assign(
                            {},
                            styles.tabButton,
                            activeTab === 'drives' ? styles.activeTab : styles.inactiveTab
                        )}
                        onClick={() => setActiveTab('drives')}
                    >
                        Storage Drives
                    </button>
                    <button
                        type="button"
                        style={Object.assign(
                            {},
                            styles.tabButton,
                            activeTab === 'devices' ? styles.activeTab : styles.inactiveTab
                        )}
                        onClick={() => setActiveTab('devices')}
                    >
                        Device Manager
                    </button>
                </div>

                {/* Tab Pane Body */}
                <div style={styles.tabBodyWrapper}>
                    {activeTab === 'general' && (
                        <div style={styles.tabContent}>
                            <div style={styles.headerRow}>
                                <div style={styles.iconBox}>🖥️</div>
                                <div style={styles.headerInfo}>
                                    <div style={styles.boldTitle}>TECHASTRA 2026 Code Rescue OS</div>
                                    <div style={styles.mutedText}>Release 4.00.950 B (Symposium Edition)</div>
                                    <div style={styles.mutedText}>Dr. M.G.R. Educational and Research Institute</div>
                                </div>
                            </div>

                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Institutional Deployment</legend>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Department:</span>
                                    <span>Dept. of CSE & Dept. of Cyber Security</span>
                                </div>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Event Track:</span>
                                    <span>Code Rescue — 18th National Symposium</span>
                                </div>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Registered To:</span>
                                    <span>Participant Terminal (Slot CR-26)</span>
                                </div>
                            </fieldset>

                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Workstation Hardware & Environment</legend>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Processor:</span>
                                    <span>Intel(R) Core(TM) Architecture / WebAssembly V8</span>
                                </div>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Physical RAM:</span>
                                    <span>16,384 KB System Memory Allocated</span>
                                </div>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Screen Viewport:</span>
                                    <span>{screenRes} • 24-bit True Color</span>
                                </div>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Network Link:</span>
                                    <span style={{ color: isOnline ? '#0d652d' : '#a00000', fontWeight: 'bold' }}>
                                        {isOnline ? 'Online (LAN Connected)' : 'Offline / Local Airgap'}
                                    </span>
                                </div>
                                <div style={styles.fieldRow}>
                                    <span style={styles.fieldLabel}>Server Latency:</span>
                                    <span>{apiLatency}</span>
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {activeTab === 'drives' && (
                        <div style={styles.tabContent}>
                            <div style={styles.driveList}>
                                <div style={styles.driveCard}>
                                    <div style={styles.driveIcon}>💾</div>
                                    <div style={styles.driveDetails}>
                                        <div style={styles.driveName}>3½ Floppy (A:)</div>
                                        <div style={styles.driveMeta}>Type: 1.44 MB Floppy Disk</div>
                                        <div style={styles.driveMeta}>Status: Empty (Ready for Write)</div>
                                    </div>
                                </div>

                                <div style={styles.driveCard}>
                                    <div style={styles.driveIcon}>💽</div>
                                    <div style={styles.driveDetails}>
                                        <div style={styles.driveName}>Code Rescue Root (C:)</div>
                                        <div style={styles.driveMeta}>Type: Local Fixed Disk (FAT32)</div>
                                        <div style={styles.driveMeta}>Total: 2.1 GB • Free: 1.4 GB</div>
                                        <div style={styles.progressBarWrapper}>
                                            <div style={{ ...styles.progressBarFill, width: '35%' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.driveCard}>
                                    <div style={styles.driveIcon}>💿</div>
                                    <div style={styles.driveDetails}>
                                        <div style={styles.driveName}>Techastra 2026 Master (D:)</div>
                                        <div style={styles.driveMeta}>Type: CD-ROM Compact Disc (ISO-9660)</div>
                                        <div style={styles.driveMeta}>Capacity: 650 MB • Problem Bank & Rubrics</div>
                                    </div>
                                </div>

                                <div style={styles.driveCard}>
                                    <div style={styles.driveIcon}>🌐</div>
                                    <div style={styles.driveDetails}>
                                        <div style={styles.driveName}>Coordinator Command Link (Z:)</div>
                                        <div style={styles.driveMeta}>Type: CR-NET Server Share (Port 8080)</div>
                                        <div style={styles.driveMeta}>Status: Connected to Coordinator Portal</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'devices' && (
                        <div style={styles.tabContent}>
                            <fieldset style={styles.fieldset}>
                                <legend style={styles.legend}>Hardware Device Tree</legend>
                                <div style={styles.deviceTree}>
                                    <div style={styles.deviceItem}>🖥️ <b>Display Adapters</b></div>
                                    <div style={styles.deviceSubItem}>└─ Retro CRT Shaded Rasterizer (VGA 1024x768)</div>
                                    <div style={styles.deviceItem}>⌨️ <b>Keyboards & Pointers</b></div>
                                    <div style={styles.deviceSubItem}>└─ Standard 101-Key PS/2 Mechanical Keyboard</div>
                                    <div style={styles.deviceSubItem}>└─ Microsoft 2-Button Serial Mouse</div>
                                    <div style={styles.deviceItem}>🛡️ <b>Security & Anti-Tamper Sensors</b></div>
                                    <div style={styles.deviceSubItem}>└─ Real-Time Anti-AI Proctoring Controller (Active)</div>
                                    <div style={styles.deviceSubItem}>└─ Window Focus & Tab-Switch Penalty Arbiter</div>
                                    <div style={styles.deviceItem}>🐍 <b>Execution Environments</b></div>
                                    <div style={styles.deviceSubItem}>└─ Pyodide / Emscripten Python 3.11 WASM Engine</div>
                                    <div style={styles.deviceItem}>🔊 <b>Sound, Video & Game Controllers</b></div>
                                    <div style={styles.deviceSubItem}>└─ Creative Labs Sound Blaster 16 Stereo DSP</div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                </div>

                {/* Bottom OK button */}
                <div style={styles.buttonRow}>
                    <button
                        type="button"
                        className="win95-dialog-btn"
                        onClick={props.onClose}
                    >
                        OK
                    </button>
                    <button
                        type="button"
                        className="win95-dialog-btn"
                        onClick={props.onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    dialogContainer: {
        backgroundColor: '#c0c0c0',
        padding: '10px 12px 12px 12px',
        boxSizing: 'border-box',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: 11,
        color: '#000000',
        userSelect: 'none',
    },
    tabBar: {
        display: 'flex',
        alignItems: 'flex-end',
        paddingLeft: 6,
        zIndex: 2,
    },
    tabButton: {
        fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: 11,
        padding: '3px 12px',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        marginRight: 2,
        backgroundColor: '#c0c0c0',
        boxSizing: 'border-box',
    },
    activeTab: {
        fontWeight: 'bold',
        paddingTop: 5,
        paddingBottom: 5,
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px 0px 0px #000000, inset -2px 0px 0px #808080',
        backgroundColor: '#c0c0c0',
        position: 'relative',
        top: 1,
        zIndex: 3,
    },
    inactiveTab: {
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px 0px 0px #808080, inset -2px 0px 0px #000000',
        backgroundColor: '#b0b0b0',
        position: 'relative',
        top: 2,
        zIndex: 1,
    },
    tabBodyWrapper: {
        flex: 1,
        backgroundColor: '#c0c0c0',
        border: '1px solid #000000',
        boxShadow: 'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080',
        padding: 12,
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: 2,
    },
    tabContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    headerRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 4,
    },
    iconBox: {
        fontSize: 36,
    },
    headerInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    boldTitle: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#000000',
    },
    mutedText: {
        fontSize: 10,
        color: '#333333',
    },
    fieldset: {
        borderTop: '1px solid #808080',
        borderLeft: '1px solid #808080',
        borderRight: '1px solid #ffffff',
        borderBottom: '1px solid #ffffff',
        padding: '8px 10px 10px 10px',
        margin: 0,
        boxSizing: 'border-box',
    },
    legend: {
        fontFamily: '"MS Sans Serif", "Segoe UI", Tahoma, Arial, sans-serif',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000000',
        padding: '0 4px',
    },
    fieldRow: {
        display: 'flex',
        fontSize: 11,
        lineHeight: 1.6,
    },
    fieldLabel: {
        fontWeight: 'bold',
        width: 140,
        color: '#111111',
    },
    driveList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    driveCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        backgroundColor: '#dfdfdf',
        borderTop: '1px solid #ffffff',
        borderLeft: '1px solid #ffffff',
        borderRight: '1px solid #808080',
        borderBottom: '1px solid #808080',
    },
    driveIcon: {
        fontSize: 26,
    },
    driveDetails: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    driveName: {
        fontWeight: 'bold',
        fontSize: 11,
    },
    driveMeta: {
        fontSize: 10,
        color: '#444444',
    },
    progressBarWrapper: {
        width: '100%',
        height: 10,
        backgroundColor: '#ffffff',
        border: '1px solid #808080',
        boxShadow: 'inset 1px 1px 0px #000000',
        marginTop: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#000080',
    },
    deviceTree: {
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.5,
        backgroundColor: '#ffffff',
        padding: 8,
        border: '1px solid #808080',
        boxShadow: 'inset 1px 1px 0px #000000',
    },
    deviceItem: {
        marginTop: 4,
        color: '#000000',
    },
    deviceSubItem: {
        color: '#444444',
        paddingLeft: 16,
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 6,
        marginTop: 10,
    },
};

export default ThisComputerApp;
