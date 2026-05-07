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
  Activity
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
            <p className="text-sm text-[var(--text-muted)]">Transform complex business logic into modular, scalable, and secure MERN stack applications using a node-based interface.</p>
          </div>
          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <h4 className="font-bold text-indigo-500 mb-2">Core Philosophy</h4>
            <p className="text-sm text-[var(--text-muted)]">Clean architecture, modular services, and automated security should be accessible to every engineer without the boilerplate fatigue.</p>
          </div>
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
          <h3 className="text-2xl font-bold">1. Launch the Builder</h3>
          <p className="text-[var(--text-muted)]">Head over to your Dashboard and click on <strong>"New Project"</strong>. You can start from a blank canvas or use one of our templates like <em>E-Commerce Pro</em> or <em>SaaS Platform</em>.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">2. Define Your Entities</h3>
          <p className="text-[var(--text-muted)]">Drag an <strong>Entity Node</strong> to define your data models. This will generate Mongoose schemas with full validation support.</p>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">3. Export & Run</h3>
          <p className="text-[var(--text-muted)]">Once your design is ready, click <strong>"Export Code"</strong>. Download the ZIP, run <code>npm install</code>, and start your server.</p>
        </div>
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 mt-8">
          <div className="flex gap-3 items-center mb-2">
            <Shield className="text-amber-500 w-5 h-5" />
            <span className="font-bold text-amber-500">Prerequisites</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] italic">Ensure you have Node.js (v16+) and a MongoDB instance (local or Atlas) ready for the generated code.</p>
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
              <p className="text-[var(--text-muted)]">Support for String, Number, Boolean, Date, and ObjectIds. You can mark fields as required, unique, or add default values.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-1">Relationships</h4>
              <p className="text-[var(--text-muted)]">Model 1:1, 1:N, and N:M relationships visually. Architect handles the foreign keys and population logic in controllers.</p>
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
        <p className="text-lg text-[var(--text-muted)]">Connect Entity nodes to API nodes to expose RESTful interfaces.</p>
        <div className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl p-6 font-mono text-sm">
          <div className="text-emerald-500 mb-2">// Auto-generated Routes</div>
          <div>GET    /api/products</div>
          <div>POST   /api/products (Auth Protected)</div>
          <div>GET    /api/products/:id</div>
          <div>PUT    /api/products/:id</div>
          <div>DELETE /api/products/:id</div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Controller Auto-Gen', 'Auth Guards', 'Request Validation', 'Error Handling'].map(f => (
            <li key={f} className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 size={18} className="text-brand-500" /> {f}
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    icon: Cpu,
    content: (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="text-rose-500 w-6 h-6" />
              <h4 className="font-bold text-xl">Auth Node</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Implements JWT-based authentication. Includes sign-up, login, and profile management out of the box with OTP verification support.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-blue-500 w-6 h-6" />
              <h4 className="font-bold text-xl">Mail Node</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Automated transactional emails. Connect to "after-create" hooks for welcome emails or order confirmations via SendGrid/SMTP.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Cloud className="text-brand-500 w-6 h-6" />
              <h4 className="font-bold text-xl">Storage Node</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Handles file uploads. Configure maximum sizes and allowed file types. Generates middleware for AWS S3 or Local storage.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="text-purple-500 w-6 h-6" />
              <h4 className="font-bold text-xl">Cron Node</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Schedule background jobs using standard Cron syntax. Perfect for daily cleanups, reports, or automated notifications.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Webhook className="text-emerald-500 w-6 h-6" />
              <h4 className="font-bold text-xl">Webhook Node</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Integrate with external services like Stripe or GitHub. Automatically handles incoming events and triggers custom logic.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Code2 className="text-indigo-500 w-6 h-6" />
              <h4 className="font-bold text-xl">Middleware Node</h4>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Inject custom middleware like Rate Limiters, CORS, or Request Loggers into any API route group.</p>
          </div>
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
                <p className="text-sm pt-1"><strong>Extract ZIP:</strong> Unpack your generated project folder.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black shrink-0">2</div>
                <p className="text-sm pt-1"><strong>Env Config:</strong> Copy <code>.env.example</code> to <code>.env</code> and set your MongoDB URI.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black shrink-0">3</div>
                <p className="text-sm pt-1"><strong>Install & Start:</strong> Run <code>npm install && npm start</code>.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" />
              <span className="font-bold text-emerald-500">Ready for Vercel, Netlify, Railway, or Heroku.</span>
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
              <p className="text-sm font-bold text-brand-500">v1.2.0 - Stable</p>
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
          <div className="prose prose-slate dark:prose-invert max-w-none">
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
