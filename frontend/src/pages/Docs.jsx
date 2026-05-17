import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, ExternalLink, Shield, Globe, Sparkles, Menu, X } from 'lucide-react';
import Documentation from '../components/Documentation';

export default function Docs() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
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
          <Link to="/docs" className="text-sm font-bold text-brand-500 transition-colors">Docs</Link>
          <Link to="/architectures" className="text-sm font-bold hover:text-brand-500 transition-colors">Architectures</Link>
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
              <Link to="/docs" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black text-brand-500 transition-colors">Docs</Link>
              <Link to="/architectures" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Architectures</Link>
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

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-500 to-indigo-600 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Documentation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto font-medium"
          >
            Master the art of visual backend engineering. Everything you need to design, build, and deploy.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <Documentation showHeader={false} />
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md shadow-brand-500/20">A</div>
            <span className="text-xl font-black tracking-tighter">Architect.io Docs</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-bold">
            © {new Date().getFullYear()} Architect.io. Crafted with ❤️ by <a href="https://geetansh810.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Geetansh Agrawal</a>
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/geetansh810/" className="text-[var(--text-muted)] hover:text-brand-500 transition-colors"><ExternalLink size={20} /></a>
            <a href="https://www.linkedin.com/in/geetansh810/" className="text-[var(--text-muted)] hover:text-brand-500 transition-colors"><Shield size={20} /></a>
            <a href="https://geetansh810.github.io/portfolio/" className="text-[var(--text-muted)] hover:text-brand-500 transition-colors"><Globe size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
