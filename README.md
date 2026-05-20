# Architect.io 🚀📐
### Visual Backend Architecture & Code Generator

**Architect.io** is a powerful visual development platform that allows engineers to design, visualise, and generate production-ready backend applications using a sophisticated node-based canvas interface.

> **[Try the Live Demo →](https://designmysystem.netlify.app/)** — No account needed.

---

## 🌟 Introduction
Architect.io bridges the gap between high-level architectural design and low-level code implementation. Design complex backend systems visually with 16 specialised node types, 6 production templates, and export clean, modular codebases in seconds.

## ✨ Key Features

### Core Platform
- ✅ **Visual Canvas Builder** — Drag-and-drop node canvas powered by React Flow
- ✅ **16 Node Types** — Entity, API, Auth, DB, Cache, Queue, CDN, Load Balancer, Counter Service, Replica, and more
- ✅ **Express.js Code Generation** — Production-ready MVC code with routes, controllers, models, and services
- ✅ **Multi-Format Export** — Docker Compose, .env templates, architecture README, and Mermaid diagrams
- ✅ **Canvas Layer System** — Six-zone swimlane with auto-layout using the Dagre algorithm
- ✅ **Architecture Documentation Generator** — Auto-generated docs with flow narratives, component references, and failure analysis

### Templates & Learning
- ✅ **6 Production Templates** — E-Commerce, SaaS Multi-Tenant, Real-Time Chat, ETL Pipeline, Serverless API, URL Shortener
- ✅ **System Design Study Templates** — URL Shortener with full capacity estimation, trade-offs, and interview prep
- ✅ **Architecture Gallery** — Browse, star, and fork community architectures

### User Experience
- ✅ **Demo Mode** — Full canvas access without signup, pre-loaded MERN architecture
- ✅ **OTP Email Authentication** — Secure 6-digit OTP verification with JWT sessions
- ✅ **Public Roadmap** — Kanban board with community upvoting
- ✅ **Public Changelog** — Timeline-based release history with filtering
- ✅ **Admin Dashboard** — Radar charts, area charts, and geolocation analytics
- ✅ **Premium Dark Mode UI** — TailwindCSS + Framer Motion animations throughout

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Visual Parser** — Converts node-based JSON architectures into executable JavaScript
- **Auth & Security** — JWT authentication with Email OTP Verification and geolocation detection
- **Analytics Engine** — Custom Mongoose aggregation for user growth and regional distribution
- **Email Service** — Transactional emails (OTP & Welcome) via Nodemailer

### Frontend (React + Vite)
- **Visual Builder** — High-performance canvas using `@xyflow/react` with 16 custom node types
- **Properties Panel** — Configure every node type with specialised form controls
- **Code Preview** — Live multi-tab code preview with file tree, copy, and download
- **Documentation Panel** — Auto-generated architecture docs viewable in-builder

## 🛠️ Tech Stack

| Layer    | Technologies                                                      |
| -------- | ----------------------------------------------------------------- |
| Frontend | React, Vite, TailwindCSS, Framer Motion, @xyflow/react, Recharts |
| Backend  | Node.js, Express.js, MongoDB (Mongoose), JWT, Nodemailer, Bcrypt  |
| APIs     | Ipify & IP-API for geolocation                                    |
| Icons    | Lucide React                                                      |

## 🚀 Quick Start

### Try Online
Visit the live platform and click **"Try Live Demo"** — no installation needed.

### Run Locally

```bash
# Clone the repo
git clone https://github.com/geetansh810/Architect.io.git
cd Architect.io

# Backend
cd backend && npm install
cp .env.example .env   # Configure your MongoDB URI & JWT secret
npm start

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

## 📂 Repository Structure
```text
/Architect.io
├── /frontend         # React + Vite application
│   ├── /src
│   │   ├── /components    # Canvas, nodes, panels, sidebar
│   │   ├── /pages         # Home, Builder, Dashboard, Templates, Docs, Roadmap, Changelog
│   │   ├── /data          # Changelog and Roadmap data
│   │   ├── /constants     # Template architectures
│   │   ├── /context       # Auth, Theme, Demo, Architecture contexts
│   │   └── /utils         # Helper functions
│   └── package.json
├── /backend          # Node.js + Express server
│   ├── /controllers
│   │   ├── /models
│   │   ├── /routes
│   │   ├── /services
│   │   └── /middlewares
│   └── package.json
├── /docs             # GitHub documentation (9 pages)
└── README.md
```

## 📖 Documentation

Full documentation is available at [`/docs`](./docs/index.md):

1. [Introduction](./docs/Introduction.md) — Platform overview and architecture
2. [Getting Started](./docs/GettingStarted.md) — Setup and first project
3. [Visual Builder Basics](./docs/VisualBuilderBasics.md) — Canvas, 16 node types, layers
4. [Advanced Features](./docs/AdvancedFeatures.md) — Auth, Cache, Queue, CDN, and more
5. [Code Generation](./docs/CodeGeneration.md) — Multi-format export
6. [Deployment](./docs/Deployment.md) — Production deployment guide
7. [Templates](./docs/Templates.md) — All 6 architecture templates
8. [Demo Mode](./docs/DemoMode.md) — Try without an account
9. [Roadmap & Changelog](./docs/RoadmapChangelog.md) — What's shipped and planned

## 👨‍💻 Developer Information
**Geetansh Agrawal**  
*Full Stack Developer & Founder*

I built Architect.io with the vision of making backend engineering more accessible, visual, and automated. By combining visual logic with precise code generation, I aim to help developers ship complex infrastructures faster than ever before.

- **LinkedIn**: [Geetansh Agrawal](https://www.linkedin.com/in/geetansh810/)
- **GitHub**: [@geetansh810](https://github.com/geetansh810)
- **Portfolio**: [geetansh810.github.io/portfolio](https://geetansh810.github.io/portfolio/)

---
Built with ❤️ by Geetansh Agrawal