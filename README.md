# TECHASTRA 2026 — Code Rescue & Workstation Platform

> **18th National Level Technical Symposium — TECHASTRA '26 VISION**  
> **Dr. M.G.R. Educational and Research Institute (Deemed to be University)**  
> Department of Computer Science and Engineering & Department of Cyber Security  
> Association of Computing Engineers

---

## 📁 Project Architecture & Directory Layout

The repository is organized into modular subsystems:

```
techastra/
├── admin/               # Coordinator Admin Portal & Real-Time Proctoring Desk (React + TS)
├── coderescue/          # Code Rescue 3-Round Debugging Platform (React + Vite + TS)
├── os/                  # Retro Windows 95 Desktop OS (React + TS)
├── src/                 # 3D Interactive Room & CRT Monitor (Three.js + TS)
├── server/              # Native SQLite Database Engine & REST + SSE Server (Node.js)
├── docs/                # Official Event Rulebooks, Proposals, and Poster Assets
├── static/              # Production Pre-Compiled Distribution Bundles
├── bundler/             # Webpack Dev Server & Production Bundler Configurations
└── package.json         # Root orchestration scripts and dependencies
```

---

## 🚀 Quick Start

### 1. Start Production Server (Recommended)
Starts the unified server hosting the 3D Workstation, Windows 95 OS, Code Rescue Arena, and Coordinator Admin Center:
```bash
npm start
```
- **3D Interactive Workstation & Desktop OS:** [http://localhost:8080/](http://localhost:8080/)
- **Code Rescue Competition Arena:** [http://localhost:8080/coderescue/](http://localhost:8080/coderescue/)
- **Coordinator Admin Control Desk:** [http://localhost:8080/admin](http://localhost:8080/admin)
  - **Admin Username:** `admin`
  - **Passkey:** `techastra2026`

### 2. Development Mode
Run the Webpack development live-reload server:
```bash
npm run dev
```

### 3. Reset All Contest Data
Wipes all contestant registrations, live screens, submissions, and proctoring audit trails from the SQLite database:
```bash
npm run reset:db
```

---

## 🏆 Code Rescue Championship Details

- **Event Date:** `08/10/2026`
- **Venue:** `IBM LAB`
- **Format:** 3 Progressive Rounds (Bug Hunt → Logic Breaker → Code Rescue)
- **Scoring:** 300 Points Maximum (100 Pts / round)
- **Official Rulebook:** [`docs/Code_Rescue_Rules_and_Regulations.pdf`](./docs/Code_Rescue_Rules_and_Regulations.pdf)

### 👥 Event Coordinators

#### **Staff Coordinators:**
- **Dr. G. Senthilvelan** · Staff Coordinator · `+91 98404 66300`
- **Mr. P. Sudarsan** · Staff Coordinator · `+91 97907 80562`

#### **Student Coordinators:**
- **Mr. Sanjai P A** · Student Coordinator · `+91 94878 26286`
- **Ms. Kavitha G** · Student Coordinator · `+91 63824 01242`
- **Mr. Yashvinthan M** · Student Coordinator · `+91 97899 21988`
