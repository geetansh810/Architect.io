import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Database, 
  Globe, 
  Shield, 
  Cpu, 
  Mail, 
  Zap, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Terminal,
  Code2,
  Clock,
  Cloud,
  Webhook,
  Activity,
  Server,
  HardDrive,
  Radio,
  BarChart3,
  Copy,
  FileText,
  Play,
  Box,
  Type
} from 'lucide-react';

const sections = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: Book,
    content: (
      <div className="space-y-6">
        <p className="text-xl text-[var(--text-muted)] leading-relaxed">
          Architect.io (BackendFlow) is a powerful visual development platform designed to bridge the gap between high-level architectural design and production-ready implementation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10">
            <h4 className="font-bold text-brand-500 mb-2">The Vision</h4>
            <p className="text-sm text-[var(--text-muted)]">Transform complex business logic into modular, scalable, and secure backend applications using a node-based interface. Design entire system architectures visually and export production-ready code.</p>
          </div>
          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <h4 className="font-bold text-indigo-500 mb-2">Core Philosophy</h4>
            <p className="text-sm text-[var(--text-muted)]">Clean architecture, modular services, and automated security should be accessible to every engineer without the boilerplate fatigue.</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mt-6">
          <h4 className="font-bold text-emerald-500 mb-3">Platform Highlights</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              '20 specialised node types',
              '6 production-ready templates',
              'System Design study templates',
              'Demo mode — no account needed',
              'Auto-generated documentation',
              'Docker Compose & .env export',
              'OTP email authentication',
              'Public Roadmap & Changelog',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    content: (
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">1. Try the Demo</h3>
          <p className="text-[var(--text-muted)]">Click <strong>"Try Live Demo"</strong> on the landing page to open a pre-loaded MERN architecture on a full canvas — no account required. You can add, remove, and configure nodes, preview code, and explore documentation.</p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm text-[var(--text-muted)]">
            <strong className="text-amber-500">Note:</strong> Demo progress is stored in your browser. Create an account to save, export, and manage multiple projects.
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">2. Create an Account</h3>
          <p className="text-[var(--text-muted)]">Sign up with your email. We use <strong>6-digit OTP verification</strong> — no passwords required. Once verified, you'll land on your personal Dashboard.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">3. Start a New Project</h3>
          <p className="text-[var(--text-muted)]">From the Dashboard, click <strong>"New Project"</strong>. Choose to start from a blank canvas or select one of our production templates like <em>E-Commerce Platform</em>, <em>SaaS Multi-Tenant</em>, or <em>URL Shortener</em>.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">4. Design Your Architecture</h3>
          <p className="text-[var(--text-muted)]">Drag nodes from the left sidebar onto the canvas. Connect them by drawing edges between ports. Configure each node's properties in the right panel.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">5. Export & Deploy</h3>
          <p className="text-[var(--text-muted)]">Click <strong>"Export Code"</strong> to download a ZIP containing your full backend project. Run <code className="px-2 py-0.5 bg-[var(--bg-app)] rounded text-xs">npm install && npm start</code> to launch.</p>
        </div>
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 mt-8">
          <div className="flex gap-3 items-center mb-2">
            <Shield className="text-amber-500 w-5 h-5" />
            <span className="font-bold text-amber-500">Prerequisites for Generated Code</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] italic">Node.js v16+ and a MongoDB instance (local or Atlas). Optional: Redis for caching nodes, SMTP/SendGrid for mail nodes.</p>
        </div>
      </div>
    )
  },
  {
    id: 'entities',
    title: 'Entities & Modeling',
    icon: Database,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">The foundation of your backend. Entity nodes represent your database collections and their schemas.</p>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Field Definition</h4>
              <p className="text-[var(--text-muted)]">Support for String, Number, Boolean, Date, and ObjectId types. Mark fields as required, unique, or add default values. Fields are rendered visually on the Entity node card.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Relationships</h4>
              <p className="text-[var(--text-muted)]">Model 1:1, 1:N, and N:M relationships visually by connecting Entity nodes. Architect handles the foreign keys, population logic in controllers, and cascade deletion.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Code2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Generated Output</h4>
              <p className="text-[var(--text-muted)]">Each Entity generates a Mongoose model file with full schema definition, timestamps, validation rules, and index configuration.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'api-nodes',
    title: 'API Endpoints',
    icon: Globe,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">Connect Entity nodes to API nodes to expose RESTful interfaces. Each API node generates a complete route + controller pair.</p>
        <div className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl p-6 font-mono text-sm">
          <div className="text-emerald-500 mb-2">// Auto-generated Routes</div>
          <div>GET    /api/products</div>
          <div>POST   /api/products (Auth Protected)</div>
          <div>GET    /api/products/:id</div>
          <div>PUT    /api/products/:id</div>
          <div>DELETE /api/products/:id</div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Controller Auto-Gen', 'Auth Guards', 'Request Validation', 'Error Handling', 'Pagination Support', 'Custom Route Prefixes'].map(f => (
            <li key={f} className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 size={18} className="text-brand-500" /> {f}
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: 'node-types',
    title: 'All Node Types',
    icon: Server,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">Architect.io provides 20 specialised node types across 6 architectural layers.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Entity Node', desc: 'Database collections with schema definition', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { name: 'API Node', desc: 'REST endpoints with CRUD generation', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { name: 'Auth Node', desc: 'JWT authentication with OTP verification', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { name: 'Database Node', desc: 'MongoDB, PostgreSQL, DynamoDB connections', icon: HardDrive, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { name: 'Mail Node', desc: 'Transactional emails via SMTP/SendGrid', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { name: 'Logic Node', desc: 'Custom business logic and service hooks', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { name: 'Middleware Node', desc: 'Rate limiting, CORS, request logging', icon: Code2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { name: 'Storage Node', desc: 'File uploads to AWS S3 or local storage', icon: Cloud, color: 'text-sky-500', bg: 'bg-sky-500/10' },
            { name: 'Cron Node', desc: 'Scheduled background tasks (cron syntax)', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { name: 'Webhook Node', desc: 'External integrations (Stripe, GitHub)', icon: Webhook, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { name: 'Cache Node', desc: 'Redis/Memcached with TTL and eviction', icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
            { name: 'Load Balancer', desc: 'Round Robin, Sticky Sessions, health checks', icon: Radio, color: 'text-teal-500', bg: 'bg-teal-500/10' },
            { name: 'CDN Node', desc: 'Edge caching and HTTPS redirect config', icon: Globe, color: 'text-pink-500', bg: 'bg-pink-500/10' },
            { name: 'Queue Node', desc: 'Kafka, SQS, RabbitMQ message brokers', icon: Layers, color: 'text-lime-500', bg: 'bg-lime-500/10' },
            { name: 'Counter Service', desc: 'Atomic ID generation with Base62 encoding', icon: BarChart3, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
            { name: 'Replica Node', desc: 'Read/write splitting and replication config', icon: Copy, color: 'text-slate-500', bg: 'bg-slate-500/10' },
            { name: 'Frontend Node', desc: 'Visual presets for client Web and Mobile apps', icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { name: 'Zone Group Node', desc: 'Visual boundaries to group and cluster components', icon: Box, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { name: 'Sticky Note Node', desc: 'Post-it style notes for canvas annotations', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { name: 'Text Label Node', desc: 'Lightweight frameless canvas text annotations', icon: Type, color: 'text-slate-500', bg: 'bg-slate-500/10' },
          ].map(node => (
            <div key={node.name} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)]">
              <div className={`w-9 h-9 rounded-lg ${node.bg} ${node.color} flex items-center justify-center shrink-0`}>
                <node.icon size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">{node.name}</h4>
                <p className="text-xs text-[var(--text-muted)]">{node.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: FileText,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">Start with a production-proven architecture and customise it to your needs. All templates include pre-configured nodes, edges, and documentation.</p>
        <div className="space-y-4">
          {[
            { name: 'E-Commerce Platform', nodes: 12, desc: 'Auth, product catalog, orders, payments, notification pipeline with CDN, Load Balancer, and Redis caching.' },
            { name: 'SaaS Multi-Tenant App', nodes: 10, desc: 'Tenant isolation, subscription management, Stripe integration, and per-tenant data segregation.' },
            { name: 'Real-Time Chat System', nodes: 8, desc: 'WebSocket-powered chat with Redis pub/sub for horizontal scaling, message persistence, and push notifications.' },
            { name: 'Data Pipeline / ETL', nodes: 9, desc: 'Kafka-based ETL: ingest, transform, validate, and store in both MongoDB and PostgreSQL.' },
            { name: 'Serverless REST API', nodes: 7, desc: 'AWS Lambda + DynamoDB + S3 with API Gateway authoriser and CloudWatch monitoring.' },
            { name: 'URL Shortener (System Design)', nodes: 18, desc: 'Counter-based ID generation, multi-level Redis caching, Kafka analytics pipeline, PostgreSQL with read replicas. Includes full study documentation.' },
          ].map(t => (
            <div key={t.name} className="p-5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)]">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold">{t.name}</h4>
                <span className="text-xs text-[var(--text-muted)] font-mono">{t.nodes} nodes</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'code-preview',
    title: 'Code Workspace & Export',
    icon: Code2,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">The builder has two view modes. <strong className="text-[var(--text-main)]">Design</strong> is the canvas on its own; <strong className="text-[var(--text-main)]">Code</strong> splits the workspace — generated project on the left, canvas on the right — so you can watch the project rewrite itself as you wire nodes together. The canvas re-centres itself in whatever space it has, so the diagram stays framed either way. Press <code className="px-2 py-0.5 bg-[var(--bg-app)] rounded text-xs">Ctrl/Cmd + E</code> to toggle.</p>

        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Code2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Real Editor, Real Project</h4>
              <p className="text-[var(--text-muted)]">The code pane is a full Monaco editor (the one that powers VS Code) with syntax highlighting, folding, and a collapsible file explorer over the whole generated tree — not a snippet box.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Nodes and Files Are Linked</h4>
              <p className="text-[var(--text-muted)]">Click a node on the canvas and the editor jumps to the file it produced — an Entity opens its module, an API its routes and controller, a Database its connection config, an Auth node its middleware. The crosshair button in the editor does the reverse, selecting the node that owns the open file.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Terminal size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Write Your Own Logic</h4>
              <p className="text-[var(--text-muted)]">Generated files are read-only because they are derived from the graph — with two exceptions. Select a <strong className="text-[var(--text-main)]">Logic Hook</strong> or a <strong className="text-[var(--text-main)]">Custom Middleware</strong> node and the pane becomes editable, bound to that node&apos;s own code. Hook bodies are emitted verbatim into the entity&apos;s <code className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded text-xs">hooks</code> file, and your code is saved with the architecture.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Project Config</h4>
              <p className="text-[var(--text-muted)]">Choose <strong className="text-[var(--text-main)]">JavaScript or TypeScript</strong>, <strong className="text-[var(--text-main)]">Zod or Joi</strong> for request validation, whether to emit a Swagger/OpenAPI document at <code className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded text-xs">/api-docs</code>, and whether routes mount under <code className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded text-xs">/api</code> or <code className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded text-xs">/api/v1</code>. The whole project re-emits instantly, and the settings save with your architecture.</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl p-6 font-mono text-sm overflow-x-auto">
          <div className="text-emerald-500 mb-3">// Generated project — layered, one module per entity</div>
          <div className="space-y-1 text-[var(--text-muted)] whitespace-pre">
            <div>src/</div>
            <div>├── config/      <span className="text-[var(--text-main)]/50">env validation, database, redis, swagger</span></div>
            <div>├── core/        <span className="text-[var(--text-main)]/50">AppError, asyncHandler, ApiResponse, logger, pagination</span></div>
            <div>├── middleware/  <span className="text-[var(--text-main)]/50">errorHandler, validate, auth, authorize, rateLimiter</span></div>
            <div>├── modules/</div>
            <div>│   └── user/    <span className="text-[var(--text-main)]/50">model · repository · hooks · service · controller · validation · routes</span></div>
            <div>├── events/      <span className="text-[var(--text-main)]/50">EventBus for async side effects</span></div>
            <div>└── server.js</div>
            <div className="pt-2">tests/ · Dockerfile · docker-compose.yml · .env.example · README.md</div>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Regenerates live as you edit the canvas',
            'Drag the divider to resize; double-click to even out',
            'Copy any file straight from the editor',
            'Download the whole project as a ZIP',
          ].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 size={16} className="text-brand-500" /> {f}
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: 'demo-mode',
    title: 'Demo Mode',
    icon: Play,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">Try the full canvas experience without creating an account. Perfect for exploring the platform before committing.</p>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Instant Access</h4>
              <p className="text-[var(--text-muted)]">Click "Try Live Demo" on the landing page to open a pre-loaded 8-node MERN architecture. Add nodes, configure properties, and preview code immediately.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Gate Actions</h4>
              <p className="text-[var(--text-muted)]">Save and export actions show a gentle modal encouraging account creation. A 20-minute inactivity nudge reminds you to create an account to preserve your work.</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
          <h4 className="font-bold text-indigo-500 mb-2">What's Available in Demo</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['Full node sidebar (16 types)', 'Properties panel', 'Code preview modal', 'README / Docs preview', 'Canvas controls & minimap', 'Add, remove, connect nodes'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <CheckCircle2 size={14} className="text-indigo-500" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: Terminal,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">Architect.io produces standard Node.js applications that can be deployed anywhere.</p>
        <div className="space-y-6">
          <div className="p-6 rounded-[2rem] bg-[var(--bg-sidebar)] border border-[var(--border-main)]">
            <h4 className="font-bold mb-4">Step-by-Step Guide</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black shrink-0">1</div>
                <p className="text-sm pt-1"><strong>Export Code:</strong> Click "Export Code" in the builder to download a ZIP containing your full project.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black shrink-0">2</div>
                <p className="text-sm pt-1"><strong>Env Config:</strong> Copy <code>.env.example</code> to <code>.env</code> and set your MongoDB URI, JWT secret, and optional Redis/SMTP credentials.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black shrink-0">3</div>
                <p className="text-sm pt-1"><strong>Install & Start:</strong> Run <code>npm install && npm start</code>. For Docker users, run <code>docker-compose up</code>.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" />
              <span className="font-bold text-emerald-500">Ready for Vercel, Railway, Render, Heroku, or any VPS.</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'canvas-tools',
    title: 'Canvas Tools & Shortcuts',
    icon: Zap,
    content: (
      <div className="space-y-8">
        <p className="text-lg text-[var(--text-muted)]">Architect.io features a complete set of canvas control tools and keyboard shortcuts to make canvas editing efficient and fluid.</p>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Interactive Canvas Toolbar</h4>
              <p className="text-[var(--text-muted)]">Located at the bottom of the canvas, the toolbar lets you cycle grid layouts (Dots, Lines, Cross, None), toggle Snap-to-Grid, and auto-layout nodes. It also includes multi-node alignment tools (align top, bottom, center, left, right) and distribution spacing tools.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Terminal size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Desktop Context Menu</h4>
              <p className="text-[var(--text-muted)]">Right-click anywhere on the canvas to open the Context Menu. From here, you can instantly perform viewport adjustments, paste clipboard components, add Zone Groups or annotations (Sticky Notes, Text Labels), and duplicate or delete selected nodes.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Book size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Command Palette Search</h4>
              <p className="text-[var(--text-muted)]">Press <code className="px-2 py-0.5 bg-[var(--bg-app)] rounded text-xs">Ctrl + F</code> or <code className="px-2 py-0.5 bg-[var(--bg-app)] rounded text-xs">Cmd + F</code> to bring up the Search Palette. Type any part of a node's name, type, or description and select it to automatically pan and zoom directly to it on the canvas.</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-[var(--bg-sidebar)] border border-[var(--border-main)]">
          <h4 className="font-black mb-4 uppercase text-xs tracking-widest text-[var(--text-muted)]">Keyboard Shortcuts Cheat Sheet</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Undo Action</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + Z</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Redo Action</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + Y</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Copy Node Selection</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + C</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Paste Clipboard Nodes</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + V</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Duplicate Node Selection</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + D</kbd>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Search / Command Palette</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + F</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Auto-Layout Diagram</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + L</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Fit View to Screen</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + 0</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Presentation Mode</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">F5 / Ctrl+Shift+P</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Toggle Design / Code</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">Ctrl/Cmd + E</kbd>
              </div>
              <div className="flex justify-between border-b border-[var(--border-main)]/50 pb-1.5">
                <span className="text-[var(--text-muted)]">Toggle Shortcuts Panel</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] rounded font-mono font-black border border-[var(--border-main)] text-[10px]">?</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function Documentation({ showHeader = true }) {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const containerRef = React.useRef(null);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Scroll the documentation container into view instead of global window scroll
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full scroll-mt-24">
      {/* Sidebar Nav - Desktop: Vertical Sidebar, Mobile: Horizontal Scrollable Tabs */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24">
          {showHeader && (
            <div className="px-4 py-4 lg:py-6 mb-2 lg:mb-4 hidden lg:block">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Guidebook</h3>
              <p className="text-sm font-bold text-brand-500">v1.7.0 - Stable</p>
            </div>
          )}
          
          {/* Mobile Navigation List */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-2 no-scrollbar px-1 lg:px-0">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`flex items-center gap-3 px-5 lg:px-6 py-3 lg:py-4 rounded-2xl font-bold transition-all whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                  activeSection === section.id 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'text-[var(--text-muted)] bg-[var(--bg-surface)] lg:bg-transparent border border-[var(--border-main)] lg:border-none hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
                }`}
              >
                <section.icon size={18} className="lg:w-5 lg:h-5" />
                <span className="text-sm lg:text-base lg:flex-1 lg:text-left">{section.title}</span>
                <ChevronRight size={16} className={`hidden lg:block transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-4xl min-w-0">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] lg:rounded-[3rem] p-6 md:p-10 lg:p-16 shadow-xl"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 text-[var(--text-muted)]">
             {React.createElement(sections.find(s => s.id === activeSection).icon, { size: 20 })}
             <h2 className="text-lg font-black uppercase tracking-widest">{sections.find(s => s.id === activeSection).title}</h2>
          </div>
          <div className="max-w-none">
            {sections.find(s => s.id === activeSection)?.content}
          </div>
        </motion.div>

        {/* Next Section Shortcut */}
        <div className="mt-8 lg:mt-10 flex justify-end">
          {sections.findIndex(s => s.id === activeSection) < sections.length - 1 && (
            <button
              onClick={() => {
                const nextIdx = sections.findIndex(s => s.id === activeSection) + 1;
                handleSectionChange(sections[nextIdx].id);
              }}
              className="flex items-center gap-2 text-brand-500 font-bold hover:gap-4 transition-all group p-4 rounded-2xl hover:bg-brand-500/5"
            >
              <span className="text-sm lg:text-base">Next: {sections[sections.findIndex(s => s.id === activeSection) + 1].title}</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
