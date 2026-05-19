import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { templates } from '../utils/templates';
import {
  Zap,
  Shield,
  Cpu,
  Globe,
  Code2,
  Layers,
  ArrowRight,
  Mail,
  CheckCircle2,
  Database,
  Terminal,
  Box,
  ExternalLink,
  MessageSquare,
  Sparkles,
  MousePointer2,
  ChevronDown,
  Menu,
  X,
  Plus,
  Play
} from 'lucide-react';



export default function Home() {
  const targetRef = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  const features = [
    {
      title: 'Visual Architecture',
      desc: 'Design complex backend structures with an intuitive node-based canvas.',
      icon: Layers,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Automated Code Gen',
      desc: 'Generate production-ready MERN stack code in seconds, not hours.',
      icon: Code2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Business Logic Hooks',
      desc: 'Inject custom logic at any lifecycle event with built-in hooks.',
      icon: Cpu,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Secure by Default',
      desc: 'Built-in JWT and OAuth2 support ensures your APIs are always protected.',
      icon: Shield,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-x-hidden selection:bg-brand-500/30 transition-colors duration-300">

      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-brand-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-indigo-500/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse delay-1000" />
        </div>

        <motion.div style={{ opacity, scale, y }} className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-8 md:mb-12"
          >
            <Sparkles size={14} className="animate-spin-slow" />
            <span>The Future of Backend Engineering</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-[9rem] font-black tracking-tighter mb-8 leading-[1.1] md:leading-[0.9]"
          >
            Visual <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500">Architecture</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto mb-16 font-medium leading-relaxed"
          >
            Stop wrestling with boilerplate. Design your MERN stack backend on a visual canvas and export production-ready code in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/login?mode=signup" className="w-full sm:w-auto px-12 py-6 bg-brand-500 hover:bg-brand-600 text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-3 group">
              Launch Builder
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/demo" className="w-full sm:w-auto px-12 py-6 border border-[var(--border-main)] hover:border-brand-500/50 text-[var(--text-main)] hover:text-white rounded-[2rem] font-black text-xl transition-all bg-[var(--bg-surface)] hover:bg-white/[0.06] flex items-center justify-center gap-3 group">
              <Play size={24} className="text-brand-500 fill-brand-500/10 group-hover:scale-110 transition-transform" />
              Try Live Demo
              <span className="text-xs text-[var(--text-muted)] group-hover:text-gray-400 font-bold transition-colors">No account needed</span>
            </Link>
            <a href="#process" className="w-full sm:w-auto px-12 py-6 bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3 group">
              How it works
              <ChevronDown size={24} className="group-hover:translate-y-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>

        {/* Floating Node Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          {[
            { icon: Database, color: 'bg-emerald-500', top: '20%', left: '10%' },
            { icon: Globe, color: 'bg-blue-500', top: '60%', left: '15%' },
            { icon: Shield, color: 'bg-amber-500', top: '15%', right: '12%' },
            { icon: Cpu, color: 'bg-indigo-500', top: '65%', right: '10%' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
              className="absolute group"
              style={{ top: item.top, left: item.left, right: item.right }}
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                className={`p-5 rounded-3xl ${item.color} text-white shadow-2xl shadow-${item.color.split('-')[1]}-500/30 border-4 border-white/20 backdrop-blur-sm`}
              >
                <item.icon size={32} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section id="why-us" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">The Old Way is <br /> <span className="text-red-500">Broken.</span></h2>
              <div className="space-y-6">
                {[
                  'Hours of repetitive boilerplate code',
                  'Complex folder structures and hidden bugs',
                  'Hard-to-maintain spaghetti logic',
                  'Manual authentication configuration'
                ].map(item => (
                  <div key={item} className="flex items-center gap-4 text-lg font-bold text-[var(--text-muted)]">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-12 p-8 rounded-3xl bg-brand-500/5 border border-brand-500/10">
                <p className="text-brand-500 font-black mb-2">The Architect.io Solution</p>
                <p className="text-xl font-bold leading-relaxed">We turned backend engineering into a visual masterpiece. Design once, export forever.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-500/20 border border-[var(--border-main)]"
            >
              <img src="/architect_problem_vs_solution_1777921584002.png" alt="Infographic" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-[var(--bg-sidebar)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Everything You Need</h2>
            <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto">A complete toolkit for modern backend architects.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 transition-all hover:shadow-2xl hover:shadow-brand-500/5 group"
              >
                <div className={`w-16 h-16 ${f.bg} ${f.color} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Process Section */}
      <section id="process" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-40">
            {[
              {
                step: '01',
                title: 'Design Your Schema',
                desc: 'Start by defining your database entities visually. Add fields, types, and validation rules with a few clicks. Architect.io generates production-ready Mongoose schemas automatically.',
                img: '/architect_dashboard_showcase_1777920479549.png',
                color: 'text-emerald-500'
              },
              {
                step: '02',
                title: 'Connect & Orchestrate',
                desc: 'Connect your entities to API nodes. Define CRUD operations, attach authentication guards, and orchestrate complex business logic through visual hooks.',
                img: '/architect_builder_showcase_1777920495821.png',
                color: 'text-indigo-500',
                reverse: true
              },
              {
                step: '03',
                title: 'Export Production Code',
                desc: 'Preview your code in real-time. Once satisfied, export a complete MERN stack project. Clean, modular, and following industry best practices.',
                img: '/architect_code_showcase_1777920511577.png',
                color: 'text-brand-500'
              }
            ].map((item, i) => (
              <div key={i} className={`flex flex-col lg:flex-row items-center gap-20 ${item.reverse ? 'lg:flex-row-reverse' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, x: item.reverse ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1"
                >
                  <span className={`text-6xl font-black ${item.color} opacity-20 mb-4 block`}>{item.step}</span>
                  <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">{item.title}</h3>
                  <p className="text-xl text-[var(--text-muted)] font-medium leading-relaxed mb-10">{item.desc}</p>
                  <div className="flex gap-4">
                    <CheckCircle2 className={item.color} />
                    <span className="font-bold">Instant Code Validation</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: item.reverse ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1 relative"
                >
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--border-main)]">
                    <img src={item.img} alt={item.title} className="w-full" />
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Builder Section */}
      <section id="ai-builder" className="py-32 px-6 bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 font-bold text-sm mb-6">
              <Sparkles size={16} />
              Coming Soon
            </div>
            <h2 className="text-5xl font-black tracking-tight mb-6">
              Build Backends with{' '}
              <span className="bg-gradient-to-r from-violet-500 to-brand-500 bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed font-medium">
              Describe your backend in plain English and let our AI design the entire architecture — entities, APIs, auth, and business logic — in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: '💬',
                title: 'Natural Language Input',
                desc: 'Type what you need in everyday language. No technical jargon required.'
              },
              {
                icon: '🧠',
                title: 'Intelligent Design',
                desc: 'AI maps your requirements to schemas, APIs, and middleware automatically.'
              },
              {
                icon: '⚡',
                title: 'Instant Export',
                desc: 'Review the canvas and export production-ready Node.js code in one click.'
              }
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-8 rounded-[2rem] bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-violet-500/30 transition-all group text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed font-medium text-sm">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mock Prompt Preview */}
          <div className="relative rounded-[2rem] bg-gradient-to-br from-violet-950/60 to-indigo-950/60 border border-violet-500/20 p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500 to-brand-500" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-violet-400 mb-4">Preview — AI Prompt Interface</p>
              <div className="bg-black/40 rounded-2xl p-5 mb-4 border border-white/5 font-mono text-sm text-white/70 flex items-start gap-3">
                <span className="text-violet-400 font-black mt-0.5">›</span>
                <span className="italic">"Build a food delivery app with restaurants, menu items, customer orders, real-time delivery tracking, and Stripe payment integration."</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50 font-medium">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                AI is designing your architecture...
                <span className="ml-auto px-3 py-1 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-black">In Development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-brand-500 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-brand-500/30">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Terminal size={300} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="w-40 h-40 rounded-full bg-white overflow-hidden border-4 border-white/30 shadow-2xl shrink-0">
              <img src="/Geet1.png" alt="Geetansh Agrawal" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">Meet the Architect</h2>
              <div className="mb-6">
                <p className="text-2xl font-black">Geetansh Agrawal</p>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Full Stack Developer & Founder</p>
              </div>
              <p className="text-white/80 text-xl font-medium mb-10 leading-relaxed italic">
                "Architect.io was born from the frustration of writing the same backend boilerplate over and over. I wanted to create a tool that lets developers build at the speed of thought, without sacrificing code quality."
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white">
                <a href="https://github.com/geetansh810/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all border border-white/10 backdrop-blur-sm group">
                  <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/geetansh810/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all border border-white/10 backdrop-blur-sm group">
                  <Shield size={18} className="group-hover:rotate-12 transition-transform" /> LinkedIn
                </a>
                <a href="https://geetansh810.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all border border-white/10 backdrop-blur-sm group">
                  <Globe size={18} className="group-hover:rotate-12 transition-transform" /> Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Docs Section */}
      <section id="docs" className="py-32 px-6 bg-[var(--bg-sidebar)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black tracking-tight mb-4">Documentation</h2>
            <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto">
              Everything you need to go from canvas to production in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: Database,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                step: '01',
                title: 'Model Your Entities',
                desc: 'Drag an Entity Node onto the canvas. Define your fields, choose data types (String, Number, Boolean, Date, ObjectId), and set validation rules — all visually.'
              },
              {
                icon: Globe,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                step: '02',
                title: 'Expose REST APIs',
                desc: 'Connect an API Node to your entity. Architect auto-generates GET, POST, PUT, DELETE endpoints with full controller logic and route bindings.'
              },
              {
                icon: Shield,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                step: '03',
                title: 'Add Authentication',
                desc: 'Drop an Auth Node on your canvas and link it to any API. Architect generates JWT middleware, protected routes, and a login/register system automatically.'
              },
              {
                icon: Cpu,
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/10',
                step: '04',
                title: 'Inject Business Logic',
                desc: 'Use Logic Nodes to attach custom service code at lifecycle hooks (before-create, after-delete, etc.) without breaking your clean architecture.'
              },
              {
                icon: Mail,
                color: 'text-rose-500',
                bg: 'bg-rose-500/10',
                step: '05',
                title: 'Integrate Mailer',
                desc: 'Connect a Mailer Node to any logic hook. Architect generates an email service with SMTP or SendGrid configuration, ready to send transactional emails.'
              },
              {
                icon: Code2,
                color: 'text-brand-500',
                bg: 'bg-brand-500/10',
                step: '06',
                title: 'Export & Deploy',
                desc: 'Click Export to download a production-ready Node.js + Express + MongoDB ZIP. Run npm install, set your .env, and deploy anywhere — Heroku, Railway, or AWS.'
              }
            ].map(({ icon: Icon, color, bg, step, title, desc }) => (
              <div key={step} className="flex gap-5 p-7 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500/30 transition-all group">
                <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Step {step}</p>
                  <h3 className="text-lg font-black mb-2">{title}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-500/25 transition-all"
            >
              Start Building — It's Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[4rem] bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700 p-12 md:p-24 text-center text-white overflow-hidden shadow-2xl shadow-brand-500/40">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Ready to Architect <br /> Your Next Big Thing?</h2>
              <p className="text-xl md:text-2xl text-white/80 font-medium mb-12 max-w-2xl mx-auto">
                Join thousands of developers building high-performance backends in record time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/login?mode=signup" className="w-full sm:w-auto px-12 py-6 bg-white text-brand-600 rounded-[2rem] font-black text-xl hover:bg-slate-50 transition-all shadow-2xl flex items-center justify-center gap-3 group">
                  Start Designing Now
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="w-full sm:w-auto px-12 py-6 bg-transparent border-2 border-white/30 hover:border-white rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3">
                  Schedule Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-12 px-6 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-500/20">A</div>
                <span className="text-3xl font-black tracking-tighter">Architect.io</span>
              </div>
              <p className="text-xl text-[var(--text-muted)] font-medium max-w-sm mb-10 leading-relaxed">
                Empowering the next generation of full-stack developers with visual architecture tools. Built by developers, for developers.
              </p>
              <div className="flex gap-6">
                <a href="mailto:geetanshagrawal810@gmail.com" className="text-[var(--text-muted)] hover:text-brand-500 transition-all hover:scale-110">
                  <Mail />
                </a>
                <a href="https://github.com/geetansh810/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-brand-500 transition-all hover:scale-110">
                  <ExternalLink />
                </a>
                <a href="https://www.linkedin.com/in/geetansh810/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-brand-500 transition-all hover:scale-110">
                  <Shield />
                </a>
                <a href="https://geetansh810.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-brand-500 transition-all hover:scale-110">
                  <Globe />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">Product</h4>
              <ul className="space-y-4 text-[var(--text-main)] font-bold">
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Features</li>
                <Link to="/templates" className="block hover:text-brand-500 cursor-pointer transition-colors">Templates</Link>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Pricing</li>
                <Link to="/docs" className="block hover:text-brand-500 cursor-pointer transition-colors">Documentation</Link>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8">Resources</h4>
              <ul className="space-y-4 text-[var(--text-main)] font-bold">
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Community</li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Discord</li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-brand-500 cursor-pointer transition-colors">Support</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-[var(--border-main)] gap-8">
            <p className="text-sm text-[var(--text-muted)] font-bold">
              © {new Date().getFullYear()} Architect.io. Crafted with ❤️ by <a href="https://geetansh810.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Geetansh Agrawal</a>
            </p>
            <div className="flex items-center gap-8 text-sm text-[var(--text-muted)] font-bold">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                System Operational
              </span>
              <div className="h-4 w-px bg-[var(--border-main)]" />
              <span className="hover:text-brand-500 cursor-pointer">Privacy</span>
              <span className="hover:text-brand-500 cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
