# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Architect.io** — a visual backend architecture design platform. Users drag nodes (Entity, API, Auth, DB, Cache, Queue, etc.) onto a React Flow canvas, connect them, configure properties, and generate a production-ready Express.js + MongoDB backend.

Two independent apps in one repo: `frontend/` (React + Vite) and `backend/` (Node/Express API + code generation + AI). There is no root-level package.json or workspace tooling — always `cd` into the relevant app first.

Detailed architecture reference: **`CODEBASE.md`** (repo root) — read it before making non-trivial changes; it documents the full node schema, connection rules, and both code-generation paths in depth. Two other root docs (`EXECUTION_PLAN.md`, `IMPLEMENTATION_PLAN.md`) track an in-progress "Architect Pro" generator refactor — `IMPLEMENTATION_PLAN.md` is authoritative when they conflict.

## Commands

```bash
# Backend (port 4000)
cd backend && npm install
npm run dev              # nodemon, watches *.js
npm start                # node index.js, no watch

# Frontend (dev server pinned to port 5190, see gotcha below)
cd frontend && npm install
npm run dev
npm run build
npm run lint              # eslint .
npm run preview
```

No test suite exists for either app (`backend`'s `npm test` is a placeholder that exits 1; frontend has no test script).

**Dev server port gotcha**: `.claude/launch.json` pins the frontend to `--port 5190 --strictPort`. Ports 5173–5175 are commonly held by unrelated stale processes on this machine — don't assume the Vite default port is free, and don't kill processes on it without asking. If changing the frontend port, update both `runtimeArgs` and `port` in `.claude/launch.json` together.

**Verifying generator/codegen changes**: prefer direct Node execution against the generator modules (e.g. `node -e "import('./src/generators/mern/MERNGenerator.js')..."`, or `node --check` on emitted output) over driving the canvas UI through browser automation. It's faster and catches syntax/runtime errors directly. `GeneratorRegistry.js` uses an extensionless `./BaseGenerator` import that only Vite's bundler resolves — plain Node ESM needs `MERNGenerator.js` imported directly, bypassing the registry, which is fine for testing.

## Architecture

### Frontend state: `ArchitectureContext.jsx`

`frontend/src/context/ArchitectureContext.jsx` is the single source of truth for canvas state (`nodes`, `edges`, undo/redo history, clipboard). Provider order in `main.jsx`: `ThemeProvider > AuthProvider > DemoProvider > ArchitectureProvider > App`. Key methods: `addNode`, `updateNodeData`, `onConnect` (validates against `connectionRules.js` before creating an edge), `applyAIWorkflow` (renders AI-generated graphs), `parseToBackendPayload` (flattens the graph into the structured payload the server-side generator consumes).

Project settings (JS/TS, Zod/Joi, Swagger docs, API versioning) live in `data.projectConfig`-style state exposed via `ProjectConfigContext.jsx`, which is a thin reader over `ArchitectureContext` (no separate provider) so config autosaves with the rest of the architecture JSON. Defaults live in `frontend/src/generators/mern/utils/projectConfig.js`.

### Two independent code-generation pipelines

**Path A — frontend, instant preview.** Canvas graph → `architectureAnalyzer.js` (categorizes nodes, builds adjacency) → `codeGenerator.js`, whose `express` format now delegates to `GeneratorRegistry.get('mern').generate(analysis, projectConfig)` → rendered in `CodePreview.jsx` / editable in `CodeEditorPanel.jsx` (Monaco).

`MERNGenerator` also records node→file ownership; `codeSync.buildProjectFiles()` snapshots it into plain Maps right after generation (the registry holds a singleton generator, so reading it lazily would race with the preview modal). That map drives click-a-node-open-its-file. `_trackInfrastructureNodes` is what makes non-entity nodes (API, Logic, DB, Cache, Auth, Middleware) resolve to a file at all.

This is the pluggable generator system under `frontend/src/generators/`: `BaseGenerator.js` defines the interface, `GeneratorRegistry.js` is a singleton registry, `mern/MERNGenerator.js` is the orchestrator, and `mern/emitters/*.js` (Core, Config, Model, Repository, Service, Controller, Route, Validation, Hook, Middleware, Test, Swagger, Docker, TypeScript, Server) each own one slice of the 6-layer output (`config/ → core/ → middleware/ → modules/{entity}/ → integrations/ → events/`). Supports dual JS/TS emission via `mern/utils/lang.js`.

**Path B — backend, download/ZIP.** Canvas graph → `parseToBackendPayload()` → `POST /api/generate` (or `/preview`) → `backend/routes/generate.js` → `backend/templates/generators.js` (a **separate, still-monolithic** ~1200-line generator, not yet migrated to the frontend's registry pattern) → ZIP or JSON file map.

These two pipelines are not the same codebase and can drift — the frontend's `generators/mern/` is the actively-developed one; `backend/templates/generators.js` mirrors it only loosely. Check `[[architect_pro_generator_refactor]]`-style context (or `IMPLEMENTATION_PLAN.md`) before assuming a fix to one applies to the other.

### Logic Hooks are two hops from their entity

`connectionRules.js` does **not** allow an `entity → logic` edge — the canonical path is `entity → api → logic` (plus the reverse `logic → entity` "Mutates entity" edge). Any code answering "which Logic Hooks belong to this entity" must walk that path via `generators/mern/utils/graph.js` (`logicNodesForEntity`), never `analysis.incoming/outgoing` against the entity directly. `HookEmitter` did the latter, which meant no hook body could ever match and every LogicNode's `data.code` was silently dropped from the generated output.

### Builder layout: two modes, code left / canvas right

`Builder.jsx` has exactly two view modes — `canvas` and `code`, toggled with ⌘E. **`code` *is* the split**: editor on the left, canvas on the right. There is no code-only mode; the canvas is always on screen, so `isSplit === (viewMode === 'code')` is the only layout branch.

`splitRatio` is the *code* pane's share, measured from the left edge, persisted under `architect_split_ratio_v2` (the `_v2` suffix exists because the old key stored the canvas share; reading it under the new meaning would flip a saved layout). The left pane subtracts the divider's full 8px so the row lands on exactly 100%.

`DemoCanvas.jsx` (the `/demo` sandbox) shares the same chrome — header bar, `NodePalette` rail, `CanvasToolbar`, selection-driven inspector — and must keep its `nodeTypes` map in step with Builder's, since `NodePalette` offers every category.

### Re-framing the canvas viewport

Opening the code pane halves the canvas, so the viewport is re-centred and zoomed to fit by a `ResizeObserver` on the canvas pane (debounced 160ms to collapse the 300ms width transition into one move). Getting this right needs three non-obvious things:

- **`fitView` does not work here.** It only *queues* a fit, and the queue isn't drained again after the initial mount — post-resize calls silently no-op.
- **`setCenter` does not work here either.** It derives the transform from React Flow's *stored* width, which still holds the pre-transition size when the pane has just been halved — it centres against 1680px inside an 840px pane, i.e. hard against the right edge. Use `setViewport` with a transform computed from the pane's own `getBoundingClientRect()`.
- **Measure bounds from the store's `nodeLookup`, not from context `nodes`.** Internal nodes carry `measured` sizes and `internals.positionAbsolute`; plain nodes need size guesses, and a guess a couple of hundred pixels off puts the "centre" visibly off-centre.

Verifying this in a headless/hidden browser is unreliable: when `document.hidden` is true, CSS transitions and `ResizeObserver` delivery are throttled, so the pane never resizes and the observer never fires. Force a render (take a screenshot) before measuring, or the layout will read as stuck at its pre-transition width.

### Connection rules are duplicated, not shared

`frontend/src/utils/connectionRules.js` and `backend/utils/connectionRules.js` are two independent copies of the same validation matrix (which node types may connect to which, and what each edge means). Changes to valid connections must be applied to both files.

### AI architecture generation

`backend/services/aiArchitect.js` builds a system prompt (all node types, schemas, connection rules) and calls Gemini via `backend/services/gemini.js`. The raw model output is sanitized by `rectifyGraph()` — drops unknown node types, coerces data to each node's schema, validates/flips/removes invalid edges, deduplicates entity names, then column-layouts nodes by type. Frontend calls `POST /api/ai/generate` and renders the result via `applyAIWorkflow()`.

### Node rendering: `ShapeWrapper.jsx` owns all visuals

Every custom node component (`frontend/src/components/nodes/*.jsx`) is rendered inside `ShapeWrapper.jsx`, which applies the SVG shape/glow/selection chrome from a hardcoded `CATEGORY_MAP` keyed by node type. **`ShapeWrapper` discards each node component's own JSX children** (except React Flow `Handle` elements) — so adding icons, badges, or text directly inside e.g. `LogicNode.jsx` has no visual effect. Any new per-node visual (like the `⚡ N lines` code badge) must be added inside `ShapeWrapper.jsx` itself, gated on node type.

### Backend request flow

`backend/index.js` is a plain Express app (ESM, `"type": "module"`). No controller layer — route handlers in `backend/routes/*.js` contain logic directly. A DB-connect middleware (lazy singleton in `db.js`) runs before every request. JWT auth via `middleware/auth.js` (`protect`) and `middleware/adminOnly.js`. Deployed as Netlify Functions via `serverless-http` (`backend/netlify/functions/api.js`); `index.js` only calls `app.listen()` when `NODE_ENV !== 'production'`.

### Data model

`User` (auth + OTP + geolocation) and `Workflow` (`user_id`, `name`, `architecture_json`) are the only two Mongoose models. `architecture_json` is a freeform blob holding the entire canvas state (nodes, edges, docs, project config) — there is no normalized schema for architectures server-side; the frontend's node/edge shapes are the schema.

## Conventions

- Frontend: functional components + hooks only, React Context for state (no Redux/Zustand), Framer Motion for animation, Lucide React for icons exclusively, TailwindCSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`), theme colors via CSS custom properties (`var(--bg-app)`, `var(--text-main)`, etc. in `index.css`).
- Backend: ESM only, no CJS `require`.
- ESLint: `no-unused-vars` is configured with `argsIgnorePattern`/`varsIgnorePattern: '^_'` and explicit `caughtErrors: 'none'` — the explicit `caughtErrors` setting exists because overriding this rule previously silently flipped ESLint's `caughtErrors` default from off to `'all'` and broke unrelated `catch` blocks. Keep it explicit if touching this rule again.
- When editing generator emitters, relative imports in `.ts` output must keep explicit `.js` extensions (Node ESM + `moduleResolution: "Bundler"` requirement) — `tsc --noEmit` passing is not sufficient verification; also run the actual `build` and execute the compiled output.
