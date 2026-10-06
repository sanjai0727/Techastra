# Techastra Backend Server & SQLite Engine

> **High-Performance Express Server & Native SQLite Database Engine**  
> Built with **Node.js, Express, node:sqlite, and Server-Sent Events (SSE)**.

---

## 🎯 Overview

The backend server is the central neural hub of the entire Techastra platform. It serves the production static bundles and provides high-throughput real-time APIs for contest telemetry:

- **Database Engine (`server/db.js`):** Built on Node's native `node:sqlite` for zero-dependency local ACID persistence. Stored in `data/techastra.db` (gitignored).
- **REST & SSE Router (`server/api.js`):**
  - Participant registration and session lifecycle.
  - Problem submissions, test results, and automatic score calculation.
  - Score masking: scores are hidden (`--/100`, `null`) while the competition is active, revealed only when `event_ended` is set to `true`.
  - Proctoring event ingestion (tab blur, copy-paste, fullscreen escape).
  - High-frequency screen thumbnail and code broadcast stream for coordinator proctoring.
- **Static Hosting (`server/index.js`):** Serves the 3D room, OS desktop, Code Rescue arena, and Admin center on port 8080.

## 📁 Architecture

```
server/
├── index.js                # Express app configuration, static routes, and email handler
├── api.js                  # REST endpoints and SSE proctoring stream router
└── db.js                   # SQLite database initialization, schemas, and queries
```

## 🛠️ Usage

- **Start Server:** `npm start` (Runs on `http://localhost:8080`)
- **Reset Database:** `npm run reset:db` (Wipes all participant records)
