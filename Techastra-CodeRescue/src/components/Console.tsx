import React, { useState, useEffect, useRef } from 'react';
import { ExecutionResult, Submission, TestCase } from '../types/competition';

interface ConsoleProps {
  lastResult: ExecutionResult | null;
  submissions: Submission[];
  visibleTests: TestCase[];
  currentCode?: string;
  questionTitle?: string;
  onRunCode?: () => void;
  onSubmitSolution?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  remainingSeconds?: number;
  score?: number;
}

interface TerminalEntry {
  id: string;
  type: 'cmd' | 'system' | 'stdout' | 'stderr' | 'success' | 'warning' | 'info';
  content: string;
}

export const Console: React.FC<ConsoleProps> = ({
  lastResult,
  submissions,
  visibleTests,
  currentCode = '',
  questionTitle = 'Diagnostic Task',
  onRunCode,
  onSubmitSolution,
  isRunning = false,
  isSubmitting = false,
  remainingSeconds,
  score = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'tests' | 'submissions'>('terminal');
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize terminal banner
  const [terminalLogs, setTerminalLogs] = useState<TerminalEntry[]>([
    {
      id: 'boot-1',
      type: 'system',
      content: 'Microsoft(R) Windows 95\n   (C)Copyright Microsoft Corp 1981-1996.\nTechastra 2026 Code Rescue Diagnostic Subsystem [Version 4.00.950]\nEmbedded Python 3.11.4 Runtime Initialized on Win32 Subsystem.'
    },
    {
      id: 'boot-2',
      type: 'info',
      content: 'Directory: C:\\TECHASTRA\\CODERESCUE\nType \'python solution.py\' or \'run\' to execute code, \'help\' for shell commands.'
    }
  ]);

  // Keep track of the last processed result to avoid duplicating logs
  const lastProcessedResultRef = useRef<ExecutionResult | null>(null);

  // Auto-scroll terminal on new log entry
  const scrollToBottom = () => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLogs, activeTab]);

  // When a code execution finishes (from Monaco button or CLI), append realistic terminal trace
  useEffect(() => {
    if (!lastResult || lastResult === lastProcessedResultRef.current) return;
    lastProcessedResultRef.current = lastResult;

    // Switch to terminal tab so the user sees actual output
    setActiveTab('terminal');

    const newEntries: TerminalEntry[] = [];
    const timestamp = Date.now();

    // 1. Invocation line
    newEntries.push({
      id: `cmd-${timestamp}`,
      type: 'cmd',
      content: `C:\\TECHASTRA\\CODERESCUE> python solution.py`
    });

    // 2. Compilation / AST header
    newEntries.push({
      id: `sys-${timestamp}`,
      type: 'system',
      content: `[Python 3.11 Runtime] Parsing AST for target: ${questionTitle} (${currentCode.length} bytes)...`
    });

    // 3. Test Cases Execution output
    if (lastResult.testResults && lastResult.testResults.length > 0) {
      const visible = lastResult.testResults.filter(t => !t.isHidden);
      visible.forEach((t, i) => {
        if (t.passed) {
          newEntries.push({
            id: `test-${timestamp}-${i}`,
            type: 'stdout',
            content: `--> [TEST ${i + 1}/${visible.length}] Input: ${t.input}\n    Expected: ${t.expected}  |  Actual: ${t.actual}\n    Verdict:  [PASS] (0.${(i + 4) * 2}ms)`
          });
        } else {
          newEntries.push({
            id: `test-${timestamp}-${i}`,
            type: 'stderr',
            content: `--> [TEST ${i + 1}/${visible.length}] Input: ${t.input}\n    Expected: ${t.expected}  |  Actual: ${t.actual || 'None'}\n    Verdict:  [FAIL]`
          });
          if (t.error) {
            newEntries.push({
              id: `err-${timestamp}-${i}`,
              type: 'stderr',
              content: `${t.error}`
            });
          }
        }
      });
    }

    // 4. Output or Error summary
    if (lastResult.status === 'ACCEPTED') {
      newEntries.push({
        id: `summary-${timestamp}`,
        type: 'success',
        content: `==================================================\nALL ${lastResult.visiblePassed}/${lastResult.visibleTotal} VISIBLE TEST ASSERTIONS VERIFIED!\nProcess finished with Exit Code: 0 (OK) in ${lastResult.executionTimeMs || 25}ms.\n[READY FOR SUBMISSION] Click [Submit Solution] to run judge suites.`
      });
    } else if (lastResult.status === 'COMPILATION_ERROR' || lastResult.status === 'RUNTIME_ERROR') {
      newEntries.push({
        id: `summary-${timestamp}`,
        type: 'stderr',
        content: `--------------------------------------------------\n${lastResult.error || 'Execution halted due to runtime exception.'}\nProcess terminated with Exit Code: 1 (Error).`
      });
    } else if (lastResult.status === 'WRONG_ANSWER') {
      newEntries.push({
        id: `summary-${timestamp}`,
        type: 'warning',
        content: `--------------------------------------------------\nAssertionError: Output did not match expected specification.\nPassed: ${lastResult.visiblePassed}/${lastResult.visibleTotal} visible test cases.\nProcess finished with Exit Code: 1.`
      });
    }

    setTerminalLogs(prev => [...prev, ...newEntries]);
  }, [lastResult, questionTitle, currentCode]);

  // Terminal interactive command execution handler
  const executeCommand = (rawText: string) => {
    const rawCmd = rawText.trim();
    if (!rawCmd) return;

    // Add command to history
    setCommandHistory(prev => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setCommandInput('');

    const timestamp = Date.now();
    const cmdEcho: TerminalEntry = {
      id: `cmd-echo-${timestamp}`,
      type: 'cmd',
      content: `C:\\TECHASTRA\\CODERESCUE> ${rawCmd}`
    };

    const parts = rawCmd.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const arg1 = parts[1]?.toLowerCase();

    // 1. CLS / CLEAR
    if (mainCmd === 'cls' || mainCmd === 'clear') {
      setTerminalLogs([]);
      return;
    }

    // Append command echo first
    let responses: TerminalEntry[] = [cmdEcho];

    // 2. HELP
    if (mainCmd === 'help' || mainCmd === '?') {
      responses.push({
        id: `res-${timestamp}`,
        type: 'info',
        content: `TECHASTRA MS-DOS SHELL COMMANDS:
  python solution.py (or run)    - Execute Python code against visible test suite
  python judge.py    (or submit) - Submit solution to automated judge for scoring
  type solution.py   (or cat)    - Display current solution code in buffer
  dir                (or ls)     - List files in current project directory
  score                          - Display current work order score and standings
  time                           - Display remaining round countdown timer
  cls                (or clear)  - Clear terminal screen buffer
  ver                            - Display Windows 95 subsystem build version
  help                           - Show this reference menu`
      });
    }
    // 3. RUN / PYTHON SOLUTION.PY
    else if (
      mainCmd === 'run' || 
      (mainCmd === 'python' && (!arg1 || arg1 === 'solution.py')) ||
      rawCmd === 'python solution.py'
    ) {
      if (onRunCode) {
        responses.push({
          id: `res-${timestamp}`,
          type: 'system',
          content: 'Compiling solution.py and launching test harness...'
        });
        setTerminalLogs(prev => [...prev, ...responses]);
        onRunCode();
        return;
      } else {
        responses.push({
          id: `res-${timestamp}`,
          type: 'stderr',
          content: 'Error: Code execution engine is not connected.'
        });
      }
    }
    // 4. SUBMIT / PYTHON JUDGE.PY
    else if (
      mainCmd === 'submit' ||
      (mainCmd === 'python' && arg1 === 'judge.py') ||
      rawCmd === 'python judge.py'
    ) {
      if (onSubmitSolution) {
        responses.push({
          id: `res-${timestamp}`,
          type: 'system',
          content: 'Submitting solution to automated test judge...'
        });
        setTerminalLogs(prev => [...prev, ...responses]);
        onSubmitSolution();
        return;
      } else {
        responses.push({
          id: `res-${timestamp}`,
          type: 'stderr',
          content: 'Error: Judge submission engine is not connected.'
        });
      }
    }
    // 5. DIR / LS
    else if (mainCmd === 'dir' || mainCmd === 'ls') {
      responses.push({
        id: `res-${timestamp}`,
        type: 'stdout',
        content: ` Volume in drive C is TECHASTRA_OS
 Volume Serial Number is 2609-1995
 Directory of C:\\TECHASTRA\\CODERESCUE

09/24/2026  05:30 PM    <DIR>          .
09/24/2026  05:30 PM    <DIR>          ..
09/24/2026  05:30 PM             ${currentCode.length.toString().padStart(5, ' ')} solution.py
09/24/2026  05:30 PM             1,024 test_runner.py
09/24/2026  05:30 PM               512 readme.txt
09/24/2026  05:30 PM               256 work_order.cfg
               4 File(s)          ${(currentCode.length + 1792).toLocaleString()} bytes
               2 Dir(s)   412,876,800 bytes free`
      });
    }
    // 6. TYPE / CAT SOLUTION.PY
    else if (
      mainCmd === 'type' || 
      mainCmd === 'cat'
    ) {
      responses.push({
        id: `res-${timestamp}`,
        type: 'stdout',
        content: currentCode || '# Empty code buffer'
      });
    }
    // 7. TIME
    else if (mainCmd === 'time') {
      const mins = remainingSeconds !== undefined ? Math.floor(remainingSeconds / 60) : 0;
      const secs = remainingSeconds !== undefined ? remainingSeconds % 60 : 0;
      responses.push({
        id: `res-${timestamp}`,
        type: 'info',
        content: `Round Countdown Remaining: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} (${remainingSeconds || 0} seconds total)`
      });
    }
    // 8. SCORE
    else if (mainCmd === 'score') {
      responses.push({
        id: `res-${timestamp}`,
        type: 'info',
        content: `Current Score: ${score} Points | Submissions Recorded: ${submissions.length}`
      });
    }
    // 9. VER
    else if (mainCmd === 'ver') {
      responses.push({
        id: `res-${timestamp}`,
        type: 'info',
        content: `Microsoft Windows 95 [Version 4.00.950]\nDepartment of Computer Science & Engineering • Techastra 2026`
      });
    }
    // 10. UNRECOGNIZED COMMAND
    else {
      responses.push({
        id: `res-${timestamp}`,
        type: 'stderr',
        content: `'${rawCmd}' is not recognized as an internal or external command, operable program or batch file.\nType 'help' for available commands.`
      });
    }

    setTerminalLogs(prev => [...prev, ...responses]);
  };

  const handleCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeCommand(commandInput);
  };

  // Up/Down arrow command history navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommandSubmit(e);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(commandHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    }
  };

  const getStatusBadge = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="win95-badge cyber-pill-green font-mono font-bold">
            ✔ ACCEPTED
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="win95-badge cyber-pill-red font-mono font-bold">
            ✗ WRONG ANSWER
          </span>
        );
      case 'RUNTIME_ERROR':
        return (
          <span className="win95-badge cyber-pill-red font-mono font-bold">
            ⚠ RUNTIME ERROR
          </span>
        );
      case 'COMPILATION_ERROR':
        return (
          <span className="win95-badge cyber-pill-red font-mono font-bold">
            ⚠ SYNTAX ERROR
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="win95-badge cyber-pill-amber font-mono font-bold">
            ⏱ TIME LIMIT EXCEEDED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col bg-[#c0c0c0] h-full select-none font-sans text-black text-xs"
      style={{ boxShadow: 'var(--border-field)', overflow: 'hidden' }}
    >
      {/* Console Tab Strip (Visual Studio / Win95 Property Sheet style) */}
      <div className="flex items-center justify-between px-1 pt-1 bg-[#c0c0c0] border-b border-[#808080] text-xs shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`win95-tab ${activeTab === 'terminal' ? 'active' : ''}`}
          >
            💻 MS-DOS Terminal
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`win95-tab ${activeTab === 'tests' ? 'active' : ''}`}
          >
            📋 Test Cases {lastResult ? `(${lastResult.visiblePassed}/${lastResult.visibleTotal})` : ''}
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`win95-tab ${activeTab === 'submissions' ? 'active' : ''}`}
          >
            📜 Submissions ({submissions.length})
          </button>
        </div>

        {/* Current status pill */}
        {lastResult && <div className="pr-1 pb-0.5">{getStatusBadge(lastResult.status)}</div>}
      </div>

      {/* Terminal Action Coolbar */}
      {activeTab === 'terminal' && (
        <div className="flex items-center justify-between px-2 py-0.5 bg-[#c0c0c0] border-b border-[#808080] text-[11px] shrink-0 font-mono">
          <div className="flex items-center gap-1">
            <span className="text-gray-700 font-bold hidden sm:inline">Shell:</span>
            <button
              onClick={() => executeCommand('run')}
              disabled={isRunning || isSubmitting}
              className="site-button"
              style={{ fontSize: 10, padding: '1px 6px', fontWeight: 'bold' }}
              title="Run python solution.py"
            >
              {isRunning ? '▶ Running...' : '▶ Run'}
            </button>
            <button
              onClick={() => executeCommand('submit')}
              disabled={isRunning || isSubmitting}
              className="site-button active font-bold"
              style={{ fontSize: 10, padding: '1px 6px', backgroundColor: '#e6f4ea' }}
              title="Submit solution to judges"
            >
              {isSubmitting ? '✔ Evaluating...' : '✔ Submit'}
            </button>
            <button
              onClick={() => executeCommand('cls')}
              className="site-button"
              style={{ fontSize: 10, padding: '1px 6px' }}
              title="Clear screen buffer (cls)"
            >
              CLS
            </button>
            <button
              onClick={() => executeCommand('dir')}
              className="site-button"
              style={{ fontSize: 10, padding: '1px 6px' }}
              title="Directory listing"
            >
              DIR
            </button>
            <button
              onClick={() => executeCommand('type solution.py')}
              className="site-button"
              style={{ fontSize: 10, padding: '1px 6px' }}
              title="Dump code buffer into terminal"
            >
              TYPE
            </button>
            <button
              onClick={() => executeCommand('help')}
              className="site-button"
              style={{ fontSize: 10, padding: '1px 6px' }}
              title="Help on shell commands"
            >
              ? HELP
            </button>
          </div>
          <div className="text-gray-700 text-[10px] hidden sm:block">
            Win95 MS-DOS Prompt • C:\TECHASTRA\CODERESCUE
          </div>
        </div>
      )}

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white min-h-0">
        {/* TAB 1: ACTUAL MS-DOS TERMINAL WITH OUTPUT */}
        {activeTab === 'terminal' && (
          <div
            className="flex-1 flex flex-col bg-black text-white font-mono text-xs select-text overflow-hidden"
            style={{ boxShadow: 'var(--border-field)' }}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Scrollable Output Stream */}
            <div
              ref={terminalScrollRef}
              className="flex-1 p-2 overflow-y-auto space-y-1"
              style={{ fontFamily: "'Consolas', 'Courier New', monospace", fontSize: '11.5px', lineHeight: '1.35' }}
            >
              {terminalLogs.map((entry) => {
                let colorClass = 'text-gray-200';
                if (entry.type === 'cmd') colorClass = 'text-[#ffff66] font-bold';
                else if (entry.type === 'stdout') colorClass = 'text-[#00ff66]';
                else if (entry.type === 'stderr') colorClass = 'text-[#ff5555] font-bold';
                else if (entry.type === 'success') colorClass = 'text-[#55ff55] font-bold';
                else if (entry.type === 'warning') colorClass = 'text-[#ffaa00]';
                else if (entry.type === 'system') colorClass = 'text-[#55ffff]';
                else if (entry.type === 'info') colorClass = 'text-gray-300';

                return (
                  <div key={entry.id} className="whitespace-pre-wrap leading-relaxed">
                    <span className={colorClass}>{entry.content}</span>
                  </div>
                );
              })}

              {/* Live Running Spinner indicator */}
              {(isRunning || isSubmitting) && (
                <div className="text-[#ffff00] animate-pulse">
                  &gt; [Executing subprocess in Python 3.11 virtual environment...]
                </div>
              )}

              {/* Active Command Input Line */}
              <form onSubmit={handleCommandSubmit} className="flex items-center gap-1 pt-1 text-white">
                <span className="text-[#00ff66] font-bold shrink-0">
                  C:\TECHASTRA\CODERESCUE&gt;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-[#ffffff] font-mono text-xs p-0 m-0 focus:ring-0"
                  style={{ fontFamily: "'Consolas', 'Courier New', monospace", caretColor: '#00ff66' }}
                  autoFocus
                  placeholder="type command (e.g. 'run', 'dir', 'help')..."
                />
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: TEST CASES MATRIX */}
        {activeTab === 'tests' && (
          <div className="flex-1 p-2.5 overflow-y-auto space-y-2 text-xs font-mono select-text bg-white">
            {lastResult?.testResults && lastResult.testResults.length > 0 ? (
              lastResult.testResults.filter(tc => !tc.isHidden).map((tc, idx) => (
                <div
                  key={tc.testId || idx}
                  style={{
                    boxShadow: 'var(--border-field)',
                    padding: '6px 10px',
                    backgroundColor: tc.passed ? '#f6fff8' : '#fff5f5',
                    marginBottom: 6,
                  }}
                >
                  <div className="flex items-center justify-between font-bold pb-1 mb-1 border-b border-gray-300 font-sans text-xs">
                    <span>Test Case #{idx + 1} {tc.description ? `• ${tc.description}` : ''}</span>
                    <span className={tc.passed ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                      {tc.passed ? '✔ PASSED' : '✗ FAILED'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                    <div>
                      <span className="text-gray-600 block text-[10px] font-sans font-bold uppercase">Input:</span>
                      <span className="text-black">{tc.input}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-[10px] font-sans font-bold uppercase">Expected Output:</span>
                      <span className="text-blue-900 font-bold">{tc.expected}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block text-[10px] font-sans font-bold uppercase">Actual Output:</span>
                      <span className={`font-bold ${tc.passed ? 'text-green-800' : 'text-red-800'}`}>
                        {tc.actual || 'None'}
                      </span>
                    </div>
                    {tc.error && (
                      <div className="col-span-2 text-red-700 font-semibold pt-1">
                        Traceback Error: {tc.error}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-600 space-y-1 font-sans text-xs">
                <p className="font-bold text-sm">No test cases executed yet.</p>
                <p>Click <b>[Run Code (Test)]</b> or type <b>python solution.py</b> in the terminal to verify solution.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUBMISSIONS HISTORY */}
        {activeTab === 'submissions' && (
          <div className="flex-1 p-2 overflow-y-auto bg-white text-xs select-text">
            {submissions.length > 0 ? (
              <table className="retro-table text-xs">
                <thead>
                  <tr>
                    <th>Attempt</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Tests Passed</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td>#{submissions.length - idx}</td>
                      <td>{new Date(sub.timestamp).toLocaleTimeString()}</td>
                      <td className={sub.result.status === 'ACCEPTED' ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
                        {sub.result.status}
                      </td>
                      <td className="font-bold">+{sub.scoreEarned} Pts</td>
                      <td>{sub.result.visiblePassed}/{sub.result.visibleTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-600 font-sans text-xs">
                No formal submissions recorded for this question yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Console;
