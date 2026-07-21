import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  Globe,
  Code2,
  Layers,
  ArrowRight,
  Mail,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Sparkles,
  Play,
  GitBranch,
  ShieldCheck,
  Boxes,
  FileCode2,
  Workflow,
} from 'lucide-react';

/* ── Signature: animated architecture blueprint (the product's own canvas) ──── */
function BlueprintNode({ x, y, w = 118, label, sub, accent, delay = 0 }) {
  return (
    <g className="blueprint-node" style={{ animationDelay: `${delay}s` }}>
      <rect x={x} y={y} width={w} height={44} rx={10}
        fill="var(--bg-surface)" stroke={accent} strokeWidth="1.4" />
      <circle cx={x + 14} cy={y + 22} r={3.5} fill={accent} />
      <text x={x + 26} y={y + 19} fontFamily="JetBrains Mono, monospace" fontSize="9"
        fontWeight="600" fill="var(--text-main)">{label}</text>
      <text x={x + 26} y={y + 33} fontFamily="JetBrains Mono, monospace" fontSize="8.5"
        fill="var(--text-muted)">{sub}</text>
    </g>
  );
}

function BlueprintEdge({ d, label, lx, ly, delay = 0 }) {
  return (
    <g className="blueprint-node" style={{ animationDelay: `${delay}s` }}>
      <path d={d} fill="none" stroke="var(--color-brand-500)" strokeOpacity="0.55"
        strokeWidth="1.5" className="blueprint-edge" />
      {label && (
        <>
          <rect x={lx - label.length * 2.6 - 6} y={ly - 8} width={label.length * 5.2 + 12} height={15} rx={7}
            fill="var(--bg-app)" stroke="var(--border-main)" strokeWidth="1" />
          <text x={lx} y={ly + 3} textAnchor="middle" fontFamily="JetBrains Mono, monospace"
            fontSize="7.5" fill="var(--text-muted)">{label}</text>
        </>
      )}
    </g>
  );
}

function ArchitectureBlueprint() {
  return (
    <div className="relative w-full">
      <svg viewBox="0 0 560 400" className="w-full h-auto" role="img"
        aria-label="Example architecture graph: a User model exposing a protected API, persisting to MongoDB, with cache and queue">
        {/* edges first (under nodes) */}
        <BlueprintEdge d="M188 84 C 232 84, 232 84, 268 84" label="Exposes CRUD" lx={228} ly={62} delay={0.55} />
        <BlueprintEdge d="M129 106 C 129 156, 240 150, 268 172" label="Persists to" lx={168} ly={162} delay={0.7} />
        <BlueprintEdge d="M327 62 C 327 40, 327 40, 327 40 M327 106 C 327 130, 327 130, 327 150" label="" lx={0} ly={0} delay={0.8} />
        <BlueprintEdge d="M386 84 C 430 84, 430 84, 442 84" label="Reads through" lx={416} ly={62} delay={0.85} />
        <BlueprintEdge d="M386 194 C 430 194, 430 194, 442 194" label="Replicates" lx={416} ly={216} delay={0.95} />
        <BlueprintEdge d="M327 194 L 327 262 C 327 262, 327 262, 268 296" label="Enqueues job" lx={366} ly={252} delay={1.05} />
        <BlueprintEdge d="M148 296 C 120 296, 104 250, 104 214" label="Sends mail" lx={94} ly={252} delay={1.2} />
        <BlueprintEdge d="M501 106 L 501 172" label="" lx={0} ly={0} delay={1.1} />

        {/* auth guard above the api */}
        <BlueprintEdge d="M327 40 L 327 62" label="" lx={0} ly={0} delay={0.6} />
        <g className="blueprint-node" style={{ animationDelay: '0.5s' }}>
          <rect x={269} y={14} width={116} height={26} rx={13} fill="var(--bg-surface)"
            stroke="#f59e0b" strokeWidth="1.3" />
          <circle cx={283} cy={27} r={3} fill="#f59e0b" />
          <text x={293} y={31} fontFamily="JetBrains Mono, monospace" fontSize="8.5"
            fontWeight="600" fill="var(--text-main)">auth · JWT guard</text>
        </g>

        <BlueprintNode x={70} y={62} label="Data Model" sub="User · 9 fields" accent="#10b981" delay={0.1} />
        <BlueprintNode x={268} y={62} label="API Route" sub="/api/v1/users" accent="#3b82f6" delay={0.25} />
        <BlueprintNode x={268} y={150} w={118} label="Database" sub="MongoDB · users_db" accent="#64748b" delay={0.35} />
        <BlueprintNode x={442} y={62} w={104} label="Cache" sub="Redis · TTL 3600" accent="#ef4444" delay={0.45} />
        <BlueprintNode x={442} y={172} w={104} label="Replica" sub="read split ×2" accent="#64748b" delay={0.5} />
        <BlueprintNode x={148} y={274} label="Queue" sub="BullMQ · email-jobs" accent="#f97316" delay={0.6} />
        <BlueprintNode x={46} y={170} w={116} label="Mailer" sub="SMTP · transact" accent="#f43f5e" delay={0.65} />
      </svg>

      {/* verification chip — the rectifier at work */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="absolute -bottom-3 right-2 sm:right-6 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-[var(--bg-surface)] px-3.5 py-1.5 shadow-lg shadow-emerald-500/10"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="eyebrow text-emerald-500">graph verified · 0 errors</span>
      </motion.div>
    </div>
  );
}

/* ── Workflow step visuals (replace static screenshots) ─────────────────────── */
function PanelShell({ title, accent = 'text-[var(--text-muted)]', children }) {
  return (
    <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)] overflow-hidden shadow-xl shadow-black/10">
      <div className="px-5 py-3 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] flex items-center justify-between">
        <span className={`eyebrow ${accent}`}>{title}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-[var(--border-main)]" />
          <span className="w-2 h-2 rounded-full bg-[var(--border-main)]" />
          <span className="w-2 h-2 rounded-full bg-brand-500/60" />
        </span>
      </div>
      {children}
    </div>
  );
}

/* Step 01 — the entity inspector: fields become a real schema */
function SchemaCardVisual() {
  const fields = [
    ['email', 'string', 'required · unique'],
    ['name', 'string', 'required'],
    ['role', 'string', "enum: user | admin"],
    ['plan', 'string', 'default: free'],
    ['lastSeenAt', 'date', 'optional'],
  ];
  return (
    <PanelShell title="data model · User" accent="text-emerald-500">
      <div className="p-5 font-mono text-[13px]">
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-x-6 gap-y-2.5">
          {fields.map(([name, type, flags]) => (
            <div key={name} className="contents">
              <span className="font-semibold">{name}</span>
              <span className="text-brand-500 text-right sm:text-left">{type}</span>
              <span className="text-[var(--text-muted)] text-[11px] self-center hidden sm:block">{flags}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--border-main)] flex flex-wrap gap-2">
          {['Mongoose model', 'validation rules', 'indexes'].map((t) => (
            <span key={t} className="eyebrow text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 rounded-full px-2.5 py-1">
              → {t}
            </span>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

/* Step 02 — the rectifier: one edge lands, one is refused */
function WiringVisual() {
  return (
    <PanelShell title="canvas · connection rules" accent="text-brand-500">
      <div className="p-5">
        <svg viewBox="0 0 460 210" className="w-full h-auto" role="img"
          aria-label="A valid connection from Data Model to API Route is accepted; an invalid one from Database to Data Model is blocked">
          {/* valid edge */}
          <path d="M148 52 C 190 52, 200 52, 238 52" fill="none" stroke="#10b981"
            strokeWidth="1.6" className="blueprint-edge" />
          <rect x={155} y={22} width={82} height={16} rx={8} fill="var(--bg-app)" stroke="var(--border-main)" />
          <text x={196} y={33} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#10b981">Exposes CRUD</text>

          {/* invalid edge attempt */}
          <path d="M148 158 C 190 158, 200 158, 238 158" fill="none" stroke="#ef4444"
            strokeOpacity="0.75" strokeWidth="1.6" strokeDasharray="4 5" />
          <g transform="translate(186, 150)">
            <circle cx={7} cy={8} r={8} fill="var(--bg-surface)" stroke="#ef4444" strokeWidth="1.4" />
            <path d="M4 5 L10 11 M10 5 L4 11" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* nodes */}
          <BlueprintNode x={30} y={30} label="Data Model" sub="User · 5 fields" accent="#10b981" />
          <BlueprintNode x={238} y={30} label="API Route" sub="/api/v1/users" accent="#3b82f6" />
          <BlueprintNode x={30} y={136} label="Database" sub="MongoDB" accent="#64748b" />
          <BlueprintNode x={238} y={136} label="Data Model" sub="Order · 7 fields" accent="#10b981" />
        </svg>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <p className="font-mono text-[11.5px] leading-relaxed text-[var(--text-muted)]">
            <span className="text-red-500 font-semibold">blocked:</span> invalid direction —
            connect <span className="text-[var(--text-main)]">Data Model → Database</span> instead
          </p>
        </div>
      </div>
    </PanelShell>
  );
}

/* Step 03 — the exported service booting for the first time */
function TerminalVisual() {
  const lines = [
    ['$', 'unzip order-platform-backend.zip && npm install', 'text-slate-100'],
    ['✓', '42 files · graph verified before export', 'text-emerald-400'],
    ['$', 'docker compose up -d mongo redis && npm run dev', 'text-slate-100'],
    ['›', 'info: MongoDB connected', 'text-slate-400'],
    ['›', 'info: Redis connected', 'text-slate-400'],
    ['›', 'info: Job dailyCleanup registered · worker email-jobs started', 'text-slate-400'],
    ['✓', 'Server listening on port 5000 (development)', 'text-emerald-400'],
  ];
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-[#0d1117] overflow-hidden shadow-xl shadow-black/20">
      <div className="px-5 py-3 border-b border-slate-700/70 flex items-center justify-between">
        <span className="eyebrow text-slate-400">terminal · generated-backend</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
        </span>
      </div>
      <div className="p-5 font-mono text-[12.5px] leading-[2]">
        {lines.map(([prefix, text, cls], i) => (
          <p key={i} className={cls}>
            <span className={prefix === '$' ? 'text-brand-400' : prefix === '✓' ? 'text-emerald-400' : 'text-slate-600'}>{prefix}</span>{' '}
            {text}
          </p>
        ))}
        <p aria-hidden="true" className="text-slate-100">
          <span className="text-brand-400">$</span>{' '}
          <span className="inline-block w-2 h-4 bg-slate-300/80 align-middle animate-pulse" />
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const capabilities = [
    {
      icon: Sparkles, accent: 'text-violet-500 bg-violet-500/10',
      title: 'AI Architect',
      desc: 'Describe the system in plain language. Gemini designs the full graph — models, APIs, auth, caching, queues — then the rectifier verifies every connection before it reaches your canvas.',
      tag: 'Live',
    },
    {
      icon: ShieldCheck, accent: 'text-emerald-500 bg-emerald-500/10',
      title: 'Connection rectification',
      desc: 'A typed rule matrix governs what can connect to what. Invalid wiring is blocked as you drag, reported before generation, and re-checked server-side. Broken graphs never become code.',
    },
    {
      icon: FileCode2, accent: 'text-blue-500 bg-blue-500/10',
      title: 'Production-grade output',
      desc: 'Every export is a layered service: config, structured logging, request validation, service layer with pagination, central error handling, Docker Compose, health probes.',
    },
    {
      icon: Workflow, accent: 'text-brand-500 bg-brand-500/10',
      title: 'Visual canvas',
      desc: '19 typed nodes — from data models and API routes to load balancers, CDNs, replicas and schedulers. Keyboard shortcuts, auto-layout, alignment tools, presentation mode.',
    },
    {
      icon: Shield, accent: 'text-amber-500 bg-amber-500/10',
      title: 'Auth scaffolding',
      desc: 'Drop an auth guard on any route and the export includes a complete JWT module: bcrypt hashing, register/login endpoints, and role-based guards.',
    },
    {
      icon: Boxes, accent: 'text-orange-500 bg-orange-500/10',
      title: 'Architecture templates',
      desc: 'Start from production-proven blueprints — multi-tenant SaaS, real-time chat, data pipelines, URL shorteners — and adapt them to your domain.',
    },
  ];

  const generatedTree = [
    ['src/config/', 'env config · db bootstrap · redis'],
    ['src/models/', 'Mongoose schemas + relations'],
    ['src/validations/', 'rules derived from your fields'],
    ['src/services/', 'pagination · search · hooks'],
    ['src/controllers/', 'thin HTTP layer'],
    ['src/routes/', 'versioned + health probe'],
    ['src/middlewares/', 'auth · cache · errors · limits'],
    ['src/queues/', 'BullMQ / Kafka workers'],
    ['src/jobs/', 'cron schedules'],
    ['src/webhooks/', 'HMAC-verified receivers'],
    ['docker-compose.yml', 'app + mongo + redis'],
    ['Dockerfile', 'non-root · production build'],
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-x-hidden selection:bg-brand-500/25 transition-colors duration-300">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-5 sm:px-8">
        <div className="grid-backdrop absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="eyebrow text-brand-500 mb-6 flex items-center gap-2.5"
              >
                <span className="h-px w-8 bg-brand-500/60" />
                Visual backend platform · AI architect now live
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold leading-[1.05] mb-6"
              >
                Design the backend.
                <br />
                <span className="text-brand-500">Ship the system.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl leading-relaxed mb-9"
              >
                Architect.io turns system design into working software. Model your architecture
                on a validated canvas — or describe it and let AI draw the graph — then export a
                production-grade Node.js service with auth, caching, queues and Docker included.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className="flex flex-col sm:flex-row gap-3.5"
              >
                <Link to="/login?mode=signup"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-brand-500/25 transition-all group">
                  Launch builder
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/demo"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-[15px] border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-brand-500/60 transition-all group">
                  <Play size={16} className="text-brand-500 fill-brand-500/15" />
                  Try the live demo
                  <span className="eyebrow text-[var(--text-muted)] normal-case tracking-normal hidden sm:inline">no account</span>
                </Link>
              </motion.div>

              {/* metric strip — real product numbers */}
              <motion.dl
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-xl"
              >
                {[
                  ['19', 'typed node kinds'],
                  ['40+', 'files per export'],
                  ['~5s', 'AI graph design'],
                  ['3×', 'validation passes'],
                ].map(([value, label]) => (
                  <div key={label} className="border-l border-[var(--border-main)] pl-4">
                    <dt className="font-display text-2xl font-bold">{value}</dt>
                    <dd className="eyebrow text-[var(--text-muted)] mt-1">{label}</dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="relative rounded-2xl border border-[var(--border-main)] bg-[var(--bg-sidebar)]/60 p-4 sm:p-7 shadow-2xl shadow-black/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="eyebrow text-[var(--text-muted)]">canvas · order-platform.arch</span>
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-main)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-main)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500/60" />
                </span>
              </div>
              <ArchitectureBlueprint />
            </motion.div>
          </div>

          {/* generated stack strip */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-20 pt-8 border-t border-[var(--border-main)] flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            <span className="eyebrow text-[var(--text-muted)]">exports run on</span>
            {['Node.js', 'Express', 'MongoDB', 'Redis', 'BullMQ', 'Docker', 'JWT'].map((t) => (
              <span key={t} className="font-mono text-[13px] font-semibold text-[var(--text-muted)]">{t}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section id="features" className="py-20 md:py-28 px-5 sm:px-8 bg-[var(--bg-sidebar)] border-y border-[var(--border-main)]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="eyebrow text-brand-500 mb-4">Platform</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything between the whiteboard and production
            </h2>
            <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
              Built for teams that design internal systems every week — not a toy generator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl ${c.accent} flex items-center justify-center`}>
                    <c.icon size={21} />
                  </div>
                  {c.tag && (
                    <span className="eyebrow text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 rounded-full px-2.5 py-1">
                      {c.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold mb-2.5">{c.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process (a real sequence → numbering earns its place) ── */}
      <section id="process" className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow text-brand-500 mb-4">Workflow</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">From prompt to repository in three steps</h2>
          </div>

          <div className="space-y-20 md:space-y-28">
            {[
              {
                step: '01',
                title: 'Model the domain',
                desc: 'Define entities, fields and relations visually — or hand the brief to the AI Architect and review the graph it draws. Either way the schema is real: it becomes Mongoose models with indexes and validation.',
                proof: 'Every field you type ships as schema + validation',
                visual: <SchemaCardVisual />,
              },
              {
                step: '02',
                title: 'Wire it, and let the rules argue back',
                desc: 'Connect APIs, auth guards, caches and queues. The connection matrix blocks invalid wiring while you drag, and the pre-flight report lists anything questionable before a single file is generated.',
                proof: 'Invalid edges never reach code generation',
                visual: <WiringVisual />,
                reverse: true,
              },
              {
                step: '03',
                title: 'Export the service',
                desc: 'Download a layered Express project — service layer, request validation, structured logging, JWT auth, Redis caching, workers, cron, Docker Compose. npm install, set the env, deploy.',
                proof: 'Boots first try — config, containers and probes included',
                visual: <TerminalVisual />,
              },
            ].map((item) => (
              <div key={item.step}
                className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${item.reverse ? 'lg:flex-row-reverse' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="flex-1 w-full"
                >
                  <p className="eyebrow text-[var(--text-muted)] mb-3">step {item.step}</p>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">{item.title}</h3>
                  <p className="text-[var(--text-muted)] leading-relaxed mb-6 max-w-lg">{item.desc}</p>
                  <div className="flex items-center gap-2.5 text-sm font-semibold">
                    <CheckCircle2 size={17} className="text-emerald-500" />
                    {item.proof}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="flex-1 w-full max-w-xl mx-auto lg:mx-0"
                >
                  {item.visual}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Architect (live) ── */}
      <section id="ai-builder" className="py-20 md:py-28 px-5 sm:px-8 bg-[var(--bg-sidebar)] border-y border-[var(--border-main)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow text-violet-500 mb-4 flex items-center gap-2">
              <Sparkles size={13} /> AI architect · live
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">
              Describe the system. Review the graph.
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-7 max-w-lg">
              Powered by Google Gemini with a rectification layer on top: every AI-proposed node is
              coerced onto a real schema, every edge is checked against the connection rules, and the
              corrections are shown to you before anything touches your canvas.
            </p>
            <ul className="space-y-3.5 mb-8">
              {[
                'Full graphs from a sentence — models, routes, auth, queues, cron',
                'Refine mode edits the architecture already on your canvas',
                'Every response is validated; invalid edges are flipped or dropped',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/login?mode=signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all">
              Generate your first architecture
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* real interaction transcript */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)] overflow-hidden shadow-xl shadow-black/5"
          >
            <div className="px-5 py-3.5 border-b border-[var(--border-main)] flex items-center justify-between">
              <span className="eyebrow text-[var(--text-muted)]">ai architect</span>
              <span className="eyebrow text-violet-500">gemini</span>
            </div>
            <div className="p-5 sm:p-6 font-mono text-[13px] leading-relaxed">
              <p className="text-[var(--text-muted)] mb-1.5">› prompt</p>
              <p className="mb-5">"A blog backend with posts, comments, authors, JWT auth and a daily cleanup job"</p>
              <p className="text-[var(--text-muted)] mb-1.5">‹ response · 4.0s</p>
              <div className="space-y-1.5">
                <p><span className="text-violet-500">BlogEngine</span> — 12 nodes · 14 connections</p>
                <p className="text-[var(--text-muted)]">entities: Post, Comment, Author</p>
                <p className="text-[var(--text-muted)]">infra: auth · cache · queue · cron · mailer</p>
                <p className="flex items-center gap-2 text-emerald-500 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  graph verified — 0 errors, 0 corrections
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── What you actually export ── */}
      <section className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-sidebar)] p-5 sm:p-7 order-2 lg:order-1"
          >
            <p className="eyebrow text-[var(--text-muted)] mb-4 flex items-center gap-2">
              <Terminal size={13} /> generated-backend.zip
            </p>
            <div className="font-mono text-[12.5px] leading-[1.9]">
              {generatedTree.map(([path, note]) => (
                <div key={path} className="flex items-baseline justify-between gap-4 border-b border-[var(--border-main)]/60 last:border-0 py-0.5">
                  <span className={path.endsWith('/') ? 'text-brand-500' : ''}>{path}</span>
                  <span className="text-[var(--text-muted)] text-[11px] text-right hidden sm:block">{note}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow text-brand-500 mb-4">Output</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">
              Code your reviewers won't reject
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-7 max-w-lg">
              The generator writes the service the way a senior engineer would structure it:
              a thin HTTP layer over a real service layer, validation derived from your schema,
              errors handled in one place, and the ops story — logging, health probes,
              graceful shutdown, containers — already answered.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {[
                [GitBranch, 'Pagination, search & filtering built in'],
                [Shield, 'JWT auth with role-based guards'],
                [Layers, 'Cache-aside Redis with invalidation'],
                [Code2, 'Central error handling & ApiError'],
              ].map(([Icon, t]) => (
                <div key={t} className="flex items-center gap-3 text-sm font-semibold">
                  <Icon size={16} className="text-brand-500 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder ── */}
      <section id="about" className="py-20 md:py-24 px-5 sm:px-8 bg-[var(--bg-sidebar)] border-y border-[var(--border-main)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border border-[var(--border-main)] shrink-0 shadow-lg">
              <img src="/Geet1.png" alt="Geetansh Agrawal" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <p className="eyebrow text-brand-500 mb-3">From the builder</p>
              <blockquote className="font-display text-xl md:text-2xl font-bold leading-snug mb-5 max-w-2xl">
                "Architect.io exists because I was tired of writing the same backend twice —
                once on the whiteboard, once in the editor. Now the whiteboard is the editor."
              </blockquote>
              <p className="font-bold">Geetansh Agrawal</p>
              <p className="eyebrow text-[var(--text-muted)] mt-1 mb-6">Full-stack developer · founder</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {[
                  ['GitHub', 'https://github.com/geetansh810/', ExternalLink],
                  ['LinkedIn', 'https://www.linkedin.com/in/geetansh810/', Shield],
                  ['Portfolio', 'https://geetansh810.github.io/portfolio/', Globe],
                ].map(([label, href, Icon]) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-brand-500/60 text-sm font-bold transition-colors">
                    <Icon size={15} className="text-[var(--text-muted)]" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow text-brand-500 mb-5">Get started</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Your next service is a diagram away
          </h2>
          <p className="text-[var(--text-muted)] text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Free to design, free to export. Bring a brief, leave with a repository.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/login?mode=signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all group">
              Start designing now
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-brand-500/60 font-bold transition-all">
              Browse templates
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-16 pb-10 px-5 sm:px-8 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black text-lg">A</div>
                <span className="font-display text-xl font-bold">Architect.io</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed mb-7">
                The visual backend platform: design on a validated canvas, generate with AI,
                export production-grade services.
              </p>
              <div className="flex gap-5">
                {[
                  [Mail, 'mailto:geetanshagrawal810@gmail.com'],
                  [ExternalLink, 'https://github.com/geetansh810/'],
                  [Shield, 'https://www.linkedin.com/in/geetansh810/'],
                  [Globe, 'https://geetansh810.github.io/portfolio/'],
                ].map(([Icon, href], i) => (
                  <a key={i} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                    <Icon size={19} />
                  </a>
                ))}
              </div>
            </div>

            <nav aria-label="Product">
              <h4 className="eyebrow text-[var(--text-muted)] mb-5">Product</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><a href="/#features" className="hover:text-brand-500 transition-colors">Features</a></li>
                <li><Link to="/templates" className="hover:text-brand-500 transition-colors">Templates</Link></li>
                <li><Link to="/demo" className="hover:text-brand-500 transition-colors">Live demo</Link></li>
                <li><Link to="/docs" className="hover:text-brand-500 transition-colors">Documentation</Link></li>
              </ul>
            </nav>

            <nav aria-label="Company">
              <h4 className="eyebrow text-[var(--text-muted)] mb-5">Company</h4>
              <ul className="space-y-3 text-sm font-semibold">
                <li><Link to="/changelog" className="hover:text-brand-500 transition-colors">Changelog</Link></li>
                <li><Link to="/roadmap" className="hover:text-brand-500 transition-colors">Roadmap</Link></li>
                <li><a href="/#about" className="hover:text-brand-500 transition-colors">About</a></li>
                <li><a href="mailto:geetanshagrawal810@gmail.com" className="hover:text-brand-500 transition-colors">Contact</a></li>
              </ul>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--border-main)] gap-4">
            <p className="font-mono text-xs text-[var(--text-muted)]">
              © {new Date().getFullYear()} Architect.io · built by{' '}
              <a href="https://geetansh810.github.io/portfolio/" target="_blank" rel="noopener noreferrer"
                className="text-brand-500 hover:underline">Geetansh Agrawal</a>
            </p>
            <p className="font-mono text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              all systems operational
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
