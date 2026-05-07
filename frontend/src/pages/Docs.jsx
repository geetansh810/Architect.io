import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, ArrowLeft, ExternalLink, Shield, Globe } from 'lucide-react';
import Documentation from '../components/Documentation';

export default function Docs() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto border-b border-[var(--border-main)]">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
            <Box className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter">Architect.io</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-bold hover:text-brand-500 transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-500 to-indigo-600 py-20 px-6">
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
