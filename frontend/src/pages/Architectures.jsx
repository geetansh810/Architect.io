import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { templates } from '../utils/templates';
import {
  Globe,
  Layers,
  Mail,
  Shield,
  ExternalLink,
  Box,
  Sparkles,
  Menu,
  X,
  Plus
} from 'lucide-react';

export default function Architectures() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-x-hidden selection:bg-brand-500/30 transition-colors duration-300">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-[var(--bg-app)]/50 border-b border-[var(--border-main)]">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
              <Box className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter">Architect.io</span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="/#features" className="text-sm font-bold hover:text-brand-500 transition-colors">Features</a>
          <a href="/#why-us" className="text-sm font-bold hover:text-brand-500 transition-colors">Why Us</a>
          <a href="/#about" className="text-sm font-bold hover:text-brand-500 transition-colors">About</a>
          <Link to="/docs" className="text-sm font-bold hover:text-brand-500 transition-colors">Docs</Link>
          <Link to="/architectures" className="text-sm font-bold text-brand-500 transition-colors">Architectures</Link>
          <a
            href="/#ai-builder"
            className="flex items-center gap-1.5 text-sm font-bold text-violet-500 hover:text-violet-400 transition-colors"
          >
            <Sparkles size={14} />
            AI Builder
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded-md leading-none">
              Soon
            </span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold hover:text-brand-500 transition-colors px-4 py-2">
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login?mode=signup"
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-brand-500/20 transition-all"
              >
                Start Free
              </Link>
            </motion.div>
          </div>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-[var(--bg-surface)] rounded-xl transition-colors"
          >
            {showMobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-[var(--bg-app)] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              <a href="/#features" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Features</a>
              <a href="/#process" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Process</a>
              <a href="/#about" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">About</a>
              <Link to="/docs" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Docs</Link>
              <Link to="/architectures" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black text-brand-500 transition-colors">Architectures</Link>
              <div className="h-px bg-[var(--border-main)] my-4" />
              <Link
                to="/login?mode=signup"
                onClick={() => setShowMobileMenu(false)}
                className="text-2xl font-black text-brand-500"
              >
                Start Designing Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">System Design Architectures</h1>
            <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto">
              Explore production-ready system designs for different platform types. Customize them for your own needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((t, i) => (
              <div
                key={i}
                onClick={() => navigate(`/template/${t.slug}`, { state: { from: '/architectures' } })}
                className="relative p-8 rounded-[2rem] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/20 transition-all group flex flex-col h-full cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Layers size={100} />
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-brand-500/30">
                  <Layers size={24} />
                </div>
                <h3 className="text-2xl font-black mb-3 group-hover:text-brand-500 transition-colors z-10">{t.name}</h3>
                <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed mb-8 flex-1 z-10">{t.desc}</p>
                <div className="flex gap-3 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/template/${t.slug}`, { state: { from: '/architectures' } }); }}
                    className="flex-1 py-3.5 bg-[var(--bg-app)] border border-[var(--border-main)] group-hover:border-brand-500 text-center rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-[var(--text-main)] hover:bg-brand-500/5"
                  >
                    <Globe size={18} />
                    View Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate('/login?mode=signup'); }}
                    className="flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-20 pb-12 px-6 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]">
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
                <Link to="/#features" className="block hover:text-brand-500 cursor-pointer transition-colors">Features</Link>
                <Link to="/architectures" className="block hover:text-brand-500 cursor-pointer transition-colors">Templates</Link>
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
