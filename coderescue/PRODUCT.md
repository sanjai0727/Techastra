# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, Vite, TypeScript, Tailwind CSS, Monaco Editor (@monaco-editor/react), Lucide React, LocalStorage persistence.

## Users

1. **Primary Users (Contestants)**: Engineering & computer science students participating individually in a high-stakes college technical symposium debugging competition.
2. **Secondary Users (Event Organizers / Judges)**: College event coordinators and technical judges who administer rounds, verify qualification criteria, handle tie-breakers, and project final leaderboards.

## Product Purpose

CODE RESCUE ("Three-Round Debugging Challenge") exists to deliver a complete, realistic, and playable technical competition environment. Participants race against the clock to diagnose and fix broken software, guided by the competition philosophy: *"Think. Debug. Fix. Rescue the Code!"* Success means correctly identifying faults, fixing code in the embedded editor, passing visible and hidden test cases, meeting qualification thresholds, and securing a top spot on the leaderboard.

## Positioning

Unlike traditional algorithmic platforms (LeetCode, HackerRank, Codeforces) where users write solutions from scratch, Code Rescue tests real-world software diagnosis and triage. It specifically evaluates a participant's ability to read other developers' broken code, decipher compiler/runtime tracebacks, spot syntax bugs, uncover insidious logic traps (off-by-one errors, mutable default arguments, subtle boundary conditions), and rescue complex multi-bug legacy codebases under timed competition constraints.

## Operating Context

- **Event Flow**:
  1. Welcome & Briefing (Brand identity, round structure, difficulty ladder)
  2. Participant Registration (Full Name, College, Department, Year, Participant ID)
  3. Official Rules & Anti-AI Agreement (Enforcing manual debugging; ChatGPT, Claude, Gemini, Copilot prohibited)
  4. Round 1 — BUG HUNT (Basic syntax, variables, conditions; 10 questions, 20 minutes, 100 points)
  5. Round 1 Result & Qualification Gate (Configurable cutoff, default 50%)
  6. Round 2 — LOGIC BREAKER (Intermediate logic, loop boundaries, runtime crashes; 5 questions, 25 minutes, 100 points)
  7. Round 2 Result & Qualification Gate (Configurable cutoff, default 50%)
  8. Round 3 — CODE RESCUE (Advanced broken application with multi-layered bugs; 40 minutes, 100 points)
  9. Final Result & Winner Evaluation (300 points cumulative score, accuracy, tie-breaker analytics)
  10. Leaderboard (Dynamic standings with demo contestants and live participant ranking)
- **Environment**: High-contrast, dark-mode technical competition workstation (laptop/desktop primary, responsive for tablet monitoring).

## Capabilities and Constraints

- **Code Editor**: Monaco Editor with full Python syntax highlighting, line numbers, vs-dark theme, keyboard shortcuts, and code reset.
- **Execution Engine**: Realistic browser-side execution simulator validating syntax (colons, indentation, brackets), running visible test cases and hidden test cases, returning authentic Python tracebacks (`SyntaxError`, `IndentationError`, `ZeroDivisionError`, `IndexError`, `AssertionError`), and tracking simulated execution latency.
- **Persistence**: Comprehensive LocalStorage synchronization preserving participant profile, active round, question code buffers, submission history, timer state, and qualification statuses across browser refreshes.
- **Security & Integrity UX**: "🔒 Competition Mode" badge, copy/paste guards on problem specifications, strict sequential round progression (no jumping ahead), and hidden organizer mode for coordinators to review/reset.
- **Organizer Mode**: Discrete control drawer for administrators to fast-track rounds, jump to specific challenges, simulate timer expiry (10s), adjust qualification thresholds, and reset session data.

## Brand Commitments

- **Official Title**: CODE RESCUE
- **Subtitle**: Three-Round Debugging Challenge
- **Tagline**: *"Think. Debug. Fix. Rescue the Code!"*
- **Round Identities**:
  - 🐞 BUG HUNT (Basic Debugging)
  - 🧠 LOGIC BREAKER (Logic + Runtime Debugging)
  - 🚨 CODE RESCUE (Advanced Multi-Bug System Rescue)
- **Aesthetic**: Technical, dark IDE aesthetic, cyan/indigo brand accents, emerald green for accepted verdicts, rose red for error tracebacks, amber for countdown warnings.

## Evidence on Hand

- `Code_RescueDescription..pdf`: Official event overview, round-wise breakdown, objectives, skills matrix.
- `Code_Rescue_Rules_and_Regulations.pdf`: Official 10-clause rulebook covering eligibility, format, prohibited AI tools, submission policies, tie-breakers, and disqualification.

## Product Principles

1. **Authentic Diagnostic Realism**: Real buggy code with realistic compiler errors and stack traces, not simulated toy prompts or mock alert boxes.
2. **Integrity-First Progression**: Strict qualification gates between rounds that mirror official collegiate hackathons.
3. **Resilient Local Continuity**: Zero data loss on refresh; every keystroke and test execution result persists seamlessly in local storage.
4. **Focused Developer Ergonomics**: Split-pane interface giving priority to the code editor and terminal console without cognitive clutter.
