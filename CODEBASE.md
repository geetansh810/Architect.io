# Architect.io — Codebase Understanding Document

> **Purpose**: This document provides a complete understanding of the Architect.io codebase. It is designed to be read by both AI agents and human developers to understand the project without parsing individual files.
>
> **Last updated**: July 2026 | **Version**: v0.8.0

---

## 1. Project Overview

**Architect.io** is a visual backend architecture design platform. Users drag-and-drop node components onto a canvas, connect them, configure properties, and generate production-ready backend code (Express.js + MongoDB).

**Live URL**: https://designmysystem.netlify.app/

**Core workflow**:
1. User creates a project (or uses a template)
2. Opens the visual Builder canvas
3. Drags nodes (Entity, API, DB, Auth, Cache, etc.) from the sidebar
4. Connects nodes with edges (validated by a connection rules matrix)
5. Configures each node via the Properties Panel
6. Previews generated code in the Code Preview panel
7. Downloads as a ZIP or copies individual files

---

## 2. Repository Structure

```
/backendflow                         (Project root)
├── README.md                        (6.2KB) Project overview
├── CODEBASE.md                      THIS FILE
├── docs/                            (10 files) GitHub documentation
│   ├── index.md
│   ├── Introduction.md
│   ├── GettingStarted.md
│   ├── VisualBuilderBasics.md
│   ├── AdvancedFeatures.md
│   ├── CodeGeneration.md
│   ├── Deployment.md
│   ├── Templates.md
│   ├── DemoMode.md
│   └── RoadmapChangelog.md
│
├── frontend/                        React + Vite application
│   ├── package.json                 Dependencies (see section 3)
│   ├── vite.config.js               Vite config with React plugin
│   ├── index.html                   SPA entry HTML
│   ├── netlify.toml                 Netlify deploy config (SPA rewrites)
│   └── src/
│       ├── main.jsx                 React root: ThemeProvider > AuthProvider > DemoProvider > ArchitectureProvider > App
│       ├── App.jsx                  React Router setup (all routes)
│       ├── App.css                  (2.9KB) App-level styles
│       ├── index.css                (7.5KB) Global CSS with CSS custom properties
│       │
│       ├── context/                 React Context providers (global state)
│       │   ├── ArchitectureContext.jsx   (23KB, 650 lines) THE CORE: canvas state management
│       │   ├── AuthContext.jsx           (1.5KB) JWT auth state (user, login, logout)
│       │   ├── DemoContext.jsx           (4.4KB) Demo mode state (pre-loaded MERN architecture)
│       │   └── ThemeContext.jsx          (786B) Dark/light theme toggle
│       │
│       ├── pages/                   Route-level page components
│       │   ├── Home.jsx             (38KB) Landing page with hero, features, stats
│       │   ├── Login.jsx            (15KB) Email OTP authentication flow
│       │   ├── Dashboard.jsx        (17KB) User's project list
│       │   ├── Builder.jsx          (35KB, 758 lines) THE MAIN PAGE: visual canvas builder
│       │   ├── DemoCanvas.jsx       (16KB) Demo mode builder (no auth required)
│       │   ├── Templates.jsx        (12KB) Architecture gallery/templates page
│       │   ├── CreateFromTemplate.jsx (1.8KB) Create project from template
│       │   ├── AdminDashboard.jsx   (24KB) Admin analytics (charts, user stats)
│       │   ├── Profile.jsx          (7.1KB) User profile page
│       │   ├── Projects.jsx         (9KB) Projects listing
│       │   ├── Docs.jsx             (2.8KB) Documentation viewer
│       │   ├── Changelog.jsx        (11KB) Release changelog timeline
│       │   └── Roadmap.jsx          (13KB) Public roadmap kanban board
│       │
│       ├── components/              Reusable UI components
│       │   ├── Navbar.jsx           (14KB) Top navigation bar
│       │   ├── NodeSidebar.jsx      (13KB) Node taxonomy + cards (CATEGORIES/NodeCard re-used by NodePalette)
│       │   ├── PropertiesPanel.jsx  (18KB) Inspector body: edit selected node/edge properties
│       │   ├── CodePreview.jsx      (6.4KB) Code preview modal (read-only SyntaxHighlighter)
│       │   ├── CodeEditorPanel.jsx  Split/Code view: file explorer + Monaco + status bar
│       │   ├── MonacoEditor.jsx     Themed @monaco-editor/react wrapper (per-file models)
│       │   ├── ProjectConfigPanel.jsx  JS/TS, Zod/Joi, Swagger, API versioning settings
│       │   ├── DocumentationPanel.jsx (14KB) Auto-generated architecture docs panel
│       │   ├── Documentation.jsx    (32KB) Full documentation renderer
│       │   ├── AIArchitectModal.jsx (12KB) AI architect prompt modal
│       │   ├── ValidationReportModal.jsx (4.6KB) Pre-generation validation report
│       │   ├── RelationshipModal.jsx (5.1KB) Entity-to-entity relationship config modal
│       │   ├── EntityBuilder.jsx    (6.1KB) Entity fields editor
│       │   ├── ApiBuilder.jsx       (3.9KB) API route configurator
│       │   ├── PreviewPanel.jsx     (6.1KB) Preview/presentation mode panel
│       │   ├── ProfileCard.jsx      (6.7KB) User profile card component
│       │   ├── ProjectCard.jsx      (3.6KB) Project card in dashboard
│       │   ├── NodeToolbarWrapper.jsx (799B) Wraps nodes with a floating toolbar
│       │   ├── Layout.jsx           (355B) Outlet wrapper for nested routes
│       │   ├── ErrorBoundary.jsx    (1.2KB) React error boundary
│       │   ├── ScrollToTop.jsx      (246B) Scroll restoration on route change
│       │   │
│       │   ├── nodes/               Custom node components (22 types)
│       │   │   ├── ShapeWrapper.jsx      (11KB) Base wrapper: applies SVG shape + glow + selection
│       │   │   ├── nodeShapeConfig.js    (6.6KB) Central config: shape, color, icon per node type
│       │   │   ├── nodeShapes.css        (7.8KB) SVG shape CSS (cylinder, hexagon, diamond, etc.)
│       │   │   ├── TechIcons.jsx         (9.3KB) Technology logo SVGs (MongoDB, Redis, etc.)
│       │   │   ├── EntityNode.jsx        Data model node (name + fields)
│       │   │   ├── ApiNode.jsx           API route node (route + auth toggle)
│       │   │   ├── AuthNode.jsx          Auth guard node (JWT/OAuth)
│       │   │   ├── DbNode.jsx            Database node (MongoDB/PostgreSQL)
│       │   │   ├── LogicNode.jsx         Lifecycle hook node (before/after create/update/delete)
│       │   │   ├── MiddlewareNode.jsx    Middleware node (rate limiter/logger/custom)
│       │   │   ├── CacheNode.jsx         Cache layer node (Redis)
│       │   │   ├── QueueNode.jsx         Message queue node (BullMQ/Kafka/RabbitMQ)
│       │   │   ├── CronNode.jsx          Scheduler node (cron expressions)
│       │   │   ├── MailNode.jsx          Mailer node (SMTP/SendGrid)
│       │   │   ├── StorageNode.jsx       File storage node (S3/Local)
│       │   │   ├── WebhookNode.jsx       Webhook node (incoming/outgoing)
│       │   │   ├── LoadBalancerNode.jsx  Load balancer node
│       │   │   ├── CdnNode.jsx          CDN/Edge node
│       │   │   ├── CounterServiceNode.jsx ID generator node
│       │   │   ├── ReplicaNode.jsx       Read replica node
│       │   │   ├── FrontendNode.jsx      Frontend app node (visual-only)
│       │   │   ├── CategoryBox.jsx       Resizable colored container (annotation)
│       │   │   ├── ZoneGroup.jsx         Zone boundary (annotation)
│       │   │   ├── StickyNote.jsx        Sticky note (annotation)
│       │   │   └── TextLabel.jsx         Text label (annotation)
│       │   │
│       │   ├── edges/
│       │   │   └── CustomEdge.jsx        Protocol-aware animated edge
│       │   │
│       │   ├── canvas/              Canvas helper components
│       │   │   ├── CanvasToolbar.jsx       (7.8KB) Top toolbar (zoom, layout, export)
│       │   │   ├── CanvasContextMenu.jsx   (4.9KB) Right-click context menu
│       │   │   ├── KeyboardShortcuts.jsx   (2.7KB) Keyboard shortcut handler
│       │   │   ├── ShortcutHelpModal.jsx   (4.4KB) Keyboard shortcuts reference modal
│       │   │   ├── NodeSearchCommand.jsx   (7.8KB) Cmd+K command palette for nodes
│       │   │   ├── ArchitectureIntelligence.jsx (8.3KB) Sidebar health score + issue detection
│       │   │   ├── BuilderHeader.jsx       Workspace header, actions filtered by view mode
│       │   │   ├── NodePalette.jsx         56px icon rail + on-demand flyout (replaces the docked sidebar)
│       │   │   └── FileTree.jsx            Collapsible folder view over the generator's flat paths
│       │   │
│       │   └── demo/                Demo-specific components
│       │
│       ├── generators/              Pluggable stack generators (Path A)
│       │   ├── BaseGenerator.js     Generator interface
│       │   ├── GeneratorRegistry.js Singleton registry (self-registered from index.js)
│       │   └── mern/
│       │       ├── MERNGenerator.js Orchestrator + node<->file map
│       │       ├── emitters/*.js    One emitter per output layer (15 of them)
│       │       └── utils/           naming, lang (JS/TS), projectConfig, fieldHeuristics,
│       │                            graph (entity<->api<->logic traversal, indentBlock)
│       │
│       ├── utils/                   Utility modules
│       │   ├── codeGenerator.js     Thin entry point; `express` delegates to GeneratorRegistry
│       │   ├── codeSync.js          Bridges canvas graph <-> generated file tree for the editor
│       │   ├── architectureAnalyzer.js (8.1KB, 241 lines) Analyzes node graph for codegen
│       │   ├── connectionRules.js   (11KB, 288 lines) Connection validation + architecture validation
│       │   ├── documentationGenerator.js (19KB) Auto-generates architecture documentation
│       │   ├── api.js               (838B) API client helper (fetch wrapper with auth token)
│       │   ├── analytics.js         (374B) Analytics tracking
│       │   ├── templates.js         (347B) Template loader
│       │   └── tour.js              (4.7KB) Onboarding tour (driver.js)
│       │
│       ├── constants/
│       │   └── templates.js         (33KB) 6 pre-built architecture templates (JSON)
│       │
│       ├── data/                    Static data for changelog/roadmap
│       └── assets/                  Static assets
│
├── backend/                         Node.js + Express server
│   ├── package.json                 Dependencies (see section 3)
│   ├── index.js                     (1.3KB) Express app entry point
│   ├── db.js                        (606B) MongoDB connection (Mongoose, lazy singleton)
│   ├── netlify.toml                 Netlify serverless deploy config
│   │
│   ├── models/
│   │   ├── User.js                  (1.6KB) User schema (name, email, password, OTP, location)
│   │   └── Workflow.js              (742B) Workflow schema (user_id, name, architecture_json)
│   │
│   ├── routes/
│   │   ├── auth.js                  (6.1KB) Auth: signup, verify-otp, resend-otp, login, me
│   │   ├── workflows.js            (2.2KB) CRUD for user workflows (protected)
│   │   ├── generate.js             (2.7KB) Code generation: POST /, /validate, /preview
│   │   ├── ai.js                   (1.9KB) AI: POST /generate, POST /refine
│   │   ├── admin.js                (3.8KB) Admin analytics routes
│   │   └── user.js                 (2KB) User profile routes
│   │
│   ├── middleware/
│   │   ├── auth.js                  (767B) JWT protect middleware
│   │   └── adminOnly.js             (828B) Admin role check middleware
│   │
│   ├── services/
│   │   ├── aiArchitect.js           (15KB, 311 lines) AI graph generation + rectification
│   │   └── gemini.js                (3.3KB) Gemini API client wrapper
│   │
│   ├── templates/
│   │   └── generators.js            (46KB, 1232 lines) Server-side enterprise code generation
│   │
│   ├── utils/
│   │   ├── connectionRules.js       (11KB) Server-side mirror of frontend connection rules
│   │   └── email.js                 (2.4KB) OTP and welcome email sender (Nodemailer)
│   │
│   └── netlify/
│       └── functions/               Netlify serverless function wrapper
```

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| React | 19.2.5 | UI framework |
| Vite | 8.0.10 | Build tool and dev server |
| @xyflow/react | 12.10.2 | Node-based canvas (formerly React Flow) |
| TailwindCSS | 4.2.4 | Utility-first CSS |
| Framer Motion | 12.38.0 | Animations |
| react-router-dom | 7.14.2 | Client-side routing |
| react-syntax-highlighter | 16.1.1 | Code display (read-only) |
| Recharts | 3.8.1 | Charts (admin dashboard) |
| dagre | 0.8.5 | Graph auto-layout algorithm |
| html-to-image | 1.11.13 | Canvas export to PNG |
| driver.js | 1.4.0 | Onboarding tour |
| uuid | 14.0.0 | Unique ID generation |
| Lucide React | 1.14.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| Node.js | - | Runtime |
| Express | 4.18.2 | HTTP framework |
| Mongoose | 8.2.1 | MongoDB ODM |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Nodemailer | 6.9.13 | Email sending (OTP) |
| archiver | 7.0.1 | ZIP file generation |
| serverless-http | 3.2.0 | Netlify Functions adapter |

---

## 4. Architecture and Data Flow

### 4.1 Frontend Architecture

```
main.jsx
  ThemeProvider (dark/light)
    AuthProvider (JWT user state)
      DemoProvider (demo mode state)
        ArchitectureProvider (canvas state - see 4.2)
          App.jsx (React Router)
            / -> Home (landing) or redirect to /dashboard
            /login -> Login (OTP flow)
            /demo -> DemoCanvas (no auth)
            /templates -> Templates (gallery)
            /template/:slug -> Builder (template mode)
            /docs -> Docs
            /changelog -> Changelog
            /roadmap -> Roadmap
            (protected routes):
              /dashboard -> Dashboard (project list)
              /dashboard/new -> CreateFromTemplate
              /workflow/:id -> Builder (main canvas)
              /profile -> Profile
              /admin -> AdminDashboard (Admin role only)
```

### 4.2 ArchitectureContext: The Core State Manager

**File**: `frontend/src/context/ArchitectureContext.jsx` (650 lines)

This is the central state manager for the entire canvas. It holds:

| State | Type | Description |
|:------|:-----|:------------|
| `nodes` | `Node[]` | All nodes on canvas (React Flow format) |
| `edges` | `Edge[]` | All edges/connections between nodes |
| `documentation` | `string` | Auto-generated architecture documentation |
| `pendingConnection` | `object or null` | Pending entity-entity connection (triggers RelationshipModal) |
| `history` / `historyIndex` | `array` / `number` | Undo/redo stack (snapshots of nodes + edges) |
| `clipboard` | `Node[]` | Copy/paste buffer |
| `toastMessage` | `object or null` | Toast notification state |

**Key methods provided via context**:

| Method | What it does |
|:-------|:-------------|
| `addNode(type, position)` | Creates a new node with default data for that type |
| `updateNodeData(nodeId, dataUpdate)` | Merges data into a node's `data` field |
| `updateEdgeData(edgeId, data)` | Updates edge properties (protocol, label, isAsync) |
| `removeElements(elements)` | Deletes nodes and their connected edges |
| `onConnect(params)` | Validates connection against rules, creates edge |
| `applyAIWorkflow({nodes, edges, docs}, mode)` | Applies AI-generated graph (replace or merge) |
| `parseToBackendPayload()` | Converts canvas graph to structured payload for server-side generation |
| `undo() / redo()` | History navigation |
| `copyNodes / pasteNodes / duplicateNodes` | Clipboard operations |
| `autoLayout()` | Column-based auto-layout using COLUMN_MAPPING |
| `alignNodes(dir) / distributeNodes(axis)` | Alignment utilities |
| `selectAll()` | Select all nodes |

**How `addNode()` works** (L247-296): Creates a node with type-specific default data. Each node type has a hardcoded default data object (e.g., entityNode gets `{ name: 'NewEntity', fields: [] }`, apiNode gets `{ route: '/new-api', authEnabled: false }`).

**How `onConnect()` works** (L142-180): Validates the connection against `connectionRules.js`. If invalid, shows a toast error. If entity-to-entity, opens RelationshipModal. Otherwise creates the edge with label and animation.

**How `parseToBackendPayload()` works** (L530-628): Walks all nodes and edges, categorizing them into structured arrays (entities, apis, auth, db, mailer, middlewares, storage, cronJobs, webhooks, relationships, caches, queues, etc.). Also includes the raw graph for server-side re-validation.

### 4.3 Code Generation Pipeline

There are TWO code generation paths:

**Path A: Frontend (local, instant preview + the Split/Code editor)**:
```
Canvas nodes/edges
  -> architectureAnalyzer.js (categorize nodes, build adjacency, detect features)
  -> codeGenerator.js -> GeneratorRegistry.get('mern').generate(analysis, projectConfig)
       -> mern/emitters/*.js emit config/ core/ middleware/ modules/{entity}/ events/
  -> CodePreview.jsx (preview modal) or codeSync.js -> CodeEditorPanel.jsx (Monaco)
```

`MERNGenerator` also records which node produced which file. `codeSync.buildProjectFiles()`
snapshots that into plain `nodeFileMap` / `fileNodeMap` Maps (the registry holds a *singleton*
generator, so reading it lazily later would race with the preview modal). That map is what
powers click-a-node-open-its-file and the editor's reveal-the-owning-node button.

Logic Hook nodes are **not** wired directly to an entity — `connectionRules` only allows
`entity -> api -> logic` (plus the reverse `logic -> entity` "Mutates entity" edge). Anything
resolving "which hooks belong to this entity" must use `mern/utils/graph.js`, not an
entity-adjacency lookup.

**Path B: Backend (server, enterprise-grade)**:
```
Canvas nodes/edges
  -> ArchitectureContext.parseToBackendPayload()
  -> POST /api/generate (or /api/generate/preview)
  -> routes/generate.js -> validateArchitecture() -> buildProjectFiles(payload)
  -> templates/generators.js (1232 lines, full enterprise project generation)
  -> Returns ZIP (download) or JSON file map (preview)
```

The server-side generator produces significantly more code including: config, models with indexes, validations (express-validator), services with pagination/filtering/hooks/caching, thin controllers with asyncHandler + ApiError, versioned route index, lifecycle hooks, BullMQ/Kafka workers, node-cron jobs, webhook receivers, Dockerfile + docker-compose.

### 4.4 AI Architecture Generation

**Files**: `backend/services/aiArchitect.js` + `backend/services/gemini.js`

1. User enters a natural-language prompt
2. Frontend sends to `POST /api/ai/generate`
3. `aiArchitect.js` constructs a detailed system prompt with all node types, schemas, and connection rules
4. Sends to Gemini API via `gemini.js`, gets JSON graph back
5. **Rectification** (`rectifyGraph()`): cleans AI output (drops unknown types, coerces data, validates/flips/removes edges, deduplicates entity names)
6. **Layout**: positions nodes in columns by type
7. Returns `{ nodes, edges, corrections, validation }` to frontend
8. Frontend calls `applyAIWorkflow()` to render on canvas

---

## 5. Node Type Reference

### 5.1 All Node Types and Data Schemas

| Type | Shape | Category | Data Schema | CodeGen |
|:-----|:------|:---------|:------------|:--------|
| `entityNode` | Hexagon | Core | `{ name, fields: [{name, type, required, unique?}] }` | Yes |
| `apiNode` | Rect | Core | `{ route, authEnabled }` | Yes |
| `authNode` | Diamond | Architecture | `{ method, expiry, secret }` | Yes |
| `dbNode` | Cylinder | Architecture | `{ type: 'mongodb'/'postgresql'/'mysql', dbName, uri }` | Yes |
| `logicNode` | Hexagon | Operations | `{ name, hook: 'before-create'/'after-create'/etc. }` | Yes |
| `middlewareNode` | Hexagon | Architecture | `{ middlewareType: 'Rate Limiter'/'Logger'/'Custom', config }` | Yes |
| `cacheNode` | Rect | Infrastructure | `{ provider, evictionPolicy, ttl, strategy }` | Yes |
| `queueNode` | Parallelogram | Infrastructure | `{ broker, topic, consumerGroup, partitions }` | Yes |
| `cronNode` | Parallelogram | Operations | `{ jobName, schedule }` | Yes |
| `mailNode` | Cloud | Integrations | `{ provider, fromEmail }` | Yes |
| `storageNode` | Cloud | Integrations | `{ provider, maxSizeMB, allowedTypes }` | Yes |
| `webhookNode` | Cloud | Integrations | `{ direction, provider, path }` | Yes |
| `loadBalancerNode` | Diamond | Infrastructure | `{ algorithm, healthPath, intervalSec, sslTermination }` | Yes |
| `cdnNode` | Diamond | Infrastructure | `{ provider, redirectType, regions }` | Yes |
| `counterServiceNode` | Hexagon | Infrastructure | `{ strategy, encoding, batchSize, codeLength }` | Yes |
| `replicaNode` | Cylinder | Infrastructure | `{ replicaCount, strategy, lagToleranceMs }` | Yes |
| `frontendNode` | Rect | Frontend | `{ name }` | No |
| `categoryBox` | Custom | Annotations | `{ title, color, width, height }` | No |
| `zoneGroup` | Zone | Annotations | `{ title }` | No |
| `stickyNote` | Sticky | Annotations | `{ text }` | No |
| `textLabel` | Text | Annotations | `{ text }` | No |

### 5.2 Connection Rules (Key Valid Connections)

- `entityNode -> apiNode` ("Exposes CRUD")
- `entityNode -> dbNode` ("Persists to")
- `entityNode -> entityNode` ("Relates to", triggers RelationshipModal)
- `apiNode -> logicNode / cacheNode / queueNode / webhookNode / storageNode / mailNode / dbNode`
- `authNode -> apiNode` ("Protects")
- `frontendNode -> apiNode / loadBalancerNode / cdnNode / authNode`
- `loadBalancerNode -> apiNode / middlewareNode`
- `logicNode -> dbNode / mailNode / queueNode / storageNode / webhookNode / cacheNode / entityNode`
- `queueNode -> logicNode / mailNode / webhookNode / dbNode`
- `cronNode -> logicNode / queueNode / dbNode / mailNode / apiNode`
- `dbNode -> replicaNode`

Annotation types can NEVER participate in edges.

---

## 6. Backend API Endpoints

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| POST | /api/auth/signup | No | Create account (sends OTP email) |
| POST | /api/auth/verify-otp | No | Verify email OTP, returns JWT |
| POST | /api/auth/resend-otp | No | Resend OTP (max 3 attempts) |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Bearer | Get current user |
| GET | /api/workflows | Bearer | List user workflows |
| GET | /api/workflows/:id | Bearer | Get single workflow |
| POST | /api/workflows | Bearer | Create workflow |
| PUT | /api/workflows/:id | Bearer | Update workflow |
| DELETE | /api/workflows/:id | Bearer | Delete workflow |
| POST | /api/generate | No | Generate + download ZIP |
| POST | /api/generate/validate | No | Validate architecture |
| POST | /api/generate/preview | No | Preview generated file map as JSON |
| POST | /api/ai/generate | Bearer | AI: generate architecture from prompt |
| POST | /api/ai/refine | Bearer | AI: refine existing architecture |
| GET | /api/admin/stats | Admin | Platform statistics |

---

## 7. Database Models

### User
```
name: String (required, trimmed)
email: String (required, unique, lowercase)
password: String (required, min 6, bcrypt-hashed via pre-save hook)
role: 'Architect' | 'Admin' (default: 'Architect')
lastLogin: Date
isVerified: Boolean (default: false)
otp: String (6-digit, nullable)
otpExpires: Date (10 min TTL)
otpResendCount: Number (max 3)
location: { country, region, city, zip, lat, lon, ip }
timestamps: true (createdAt, updatedAt)
```

### Workflow
```
user_id: ObjectId (ref: User, required)
name: String (required, trimmed)
architecture_json: Mixed (the complete canvas state: nodes, edges, docs)
timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
```

The `architecture_json` field stores the full canvas state as a freeform JSON object containing nodes, edges, documentation, and potentially categoryBoxes (legacy format).

---

## 8. Key Conventions and Patterns

### Frontend
- **CSS Custom Properties**: Theme colors use `var(--bg-app)`, `var(--bg-sidebar)`, `var(--text-main)`, `var(--text-muted)`, `var(--border-main)`, `var(--bg-surface)` defined in `index.css`
- **TailwindCSS v4**: Uses `@tailwindcss/vite` plugin (no tailwind.config.js needed)
- **Component pattern**: Functional components with hooks only
- **State management**: React Context only (no Redux/Zustand)
- **Animation**: Framer Motion with AnimatePresence for transitions
- **Icons**: Lucide React exclusively
- **Node rendering**: All nodes use ShapeWrapper which applies SVG clip-paths for shapes (cylinder, hexagon, diamond, parallelogram, cloud, rect)

### Backend
- **ESM modules**: Uses import/export with "type": "module" in package.json
- **No controllers**: Routes contain handler logic directly
- **Auth pattern**: JWT in Authorization Bearer header, verified by protect middleware
- **DB connection**: Lazy singleton via connectDB() called per-request as middleware
- **Deployment**: Netlify Functions via serverless-http wrapper

### Code Generation
- **Dual generators**: Frontend uses the pluggable `generators/mern/` emitter system (also feeds the Monaco editor); backend has the still-monolithic templates/generators.js for the ZIP download. They can drift — see IMPLEMENTATION_PLAN.md
- **Project config**: language (JS/TS), validation (Zod/Joi), docs (Swagger/none), and API versioning live in `data.projectConfig`, defaults in `generators/mern/utils/projectConfig.js`, saved inside architecture_json
- **Architecture analysis**: architectureAnalyzer.js creates semantic model from raw node/edge graph
- **Connection validation**: connectionRules.js is the single source of truth, mirrored on both frontend and backend
- **AI rectification**: AI output goes through rectifyGraph() which sanitizes types, coerces data, validates edges, and applies layout

---

## 9. Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000/api
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-app-password
GEMINI_API_KEY=your-gemini-key
PORT=4000
```

---

## 10. Running the Project

```bash
# Backend
cd backend && npm install
cp .env.example .env  # Configure MongoDB URI, JWT secret, SMTP, Gemini key
npm run dev            # Starts on port 4000 with nodemon

# Frontend (separate terminal)
cd frontend && npm install
npm run dev            # Starts Vite dev server on port 5173
```
