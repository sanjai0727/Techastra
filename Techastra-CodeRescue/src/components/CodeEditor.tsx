import React, { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onReset: () => void;
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onReset,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  readOnly = false
}) => {
  const [fontSize, setFontSize] = useState<number>(13);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Add command for Ctrl+Enter to trigger Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isRunning && !isSubmitting && !readOnly) {
        onRun();
      }
    });

    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontFamily: "'Courier New', 'Consolas', monospace",
      tabSize: 4,
      insertSpaces: true,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      automaticLayout: true,
      contextmenu: false,
    });

    // Block copy / cut / paste in Monaco
    editor.onKeyDown((e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (
        isCtrl &&
        (e.keyCode === monaco.KeyCode.KeyV ||
          e.keyCode === monaco.KeyCode.KeyC ||
          e.keyCode === monaco.KeyCode.KeyX ||
          e.keyCode === monaco.KeyCode.KeyU)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  };

  const handleResetClick = () => {
    if (resetConfirm) {
      onReset();
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#c0c0c0] font-sans text-black select-none text-xs"
      style={{ boxShadow: 'var(--border-field)', overflow: 'hidden' }}
    >
      {/* Editor Tool Titlebar */}
      <div className="win95-tool-title">
        <div className="flex items-center gap-1.5 truncate">
          <span>📝</span>
          <span className="truncate">solution.py — Python 3.11 Runtime</span>
        </div>
        <div className="flex items-center gap-1">
          {readOnly && (
            <span className="text-[10px] bg-red-700 text-white px-1 font-mono font-bold">
              ROUND ENDED
            </span>
          )}
        </div>
      </div>

      {/* Editor Control Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#808080] bg-[#c0c0c0] text-xs">
        {/* Left: Language & Status */}
        <div className="flex items-center gap-1.5">
          <span className="win95-badge font-mono font-bold">
            PYTHON 3.11
          </span>
          <span className="hidden sm:inline text-gray-700 text-[11px] font-mono">
            [Ctrl+Enter] to Run
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px]">
            <button
              onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
              className="site-button"
              style={{ padding: '0 5px', fontSize: 10, height: 20 }}
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="px-1 text-[11px] font-bold">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(18, prev + 1))}
              className="site-button"
              style={{ padding: '0 5px', fontSize: 10, height: 20 }}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <button
            onClick={handleResetClick}
            disabled={readOnly || isRunning || isSubmitting}
            className="site-button"
            style={{ fontSize: 11, padding: '1px 8px', height: 22 }}
          >
            {resetConfirm ? 'Confirm Reset?' : 'Reset Code'}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative min-h-[220px]" style={{ boxShadow: 'var(--border-field)', backgroundColor: '#ffffff' }}>
        <Editor
          height="100%"
          language="python"
          theme="vs"
          value={code}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorMount}
          options={{
            readOnly,
            fontSize,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            padding: { top: 6, bottom: 6 },
            fontFamily: "'Courier New', Courier, monospace"
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-white text-black gap-2 font-mono text-xs">
              <span>Loading Diagnostic Editor...</span>
            </div>
          }
        />
      </div>

      {/* Bottom Action Ribbon */}
      <div className="px-2 py-1 bg-[#c0c0c0] border-t border-[#808080] flex items-center justify-between text-xs">
        <div className="text-gray-800 hidden sm:block font-sans text-[11px]">
          Click [Run Code] to test assertions, or [Submit Solution] to record score.
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Run Code Button */}
          <button
            onClick={onRun}
            disabled={readOnly || isRunning || isSubmitting}
            className="site-button"
            style={{ fontSize: 12, padding: '3px 12px', fontWeight: 'bold' }}
          >
            {isRunning ? 'Running Baseline...' : '▶ Run Code (Test)'}
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={onSubmit}
            disabled={readOnly || isRunning || isSubmitting}
            className="site-button active font-bold"
            style={{ fontSize: 12, padding: '3px 14px', backgroundColor: '#e6f4ea' }}
          >
            {isSubmitting ? 'Evaluating...' : '✔ Submit Solution'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CodeEditor;
