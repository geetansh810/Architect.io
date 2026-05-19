import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ARCHITECTURE_TEMPLATES } from '../constants/templates';
import { motion } from 'framer-motion';
import { Star, Layers, ArrowRight, Search, Mail, ExternalLink, Shield, Globe } from 'lucide-react';

const CATEGORIES = ['All', 'Full Stack', 'SaaS', 'Real-Time', 'Data Engineering', 'Serverless'];
const COMPLEXITY_COLORS = {
  beginner: 'text-green-500 bg-green-500/10 border-green-500/20',
  intermediate: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-red-500 bg-red-500/10 border-red-500/20',
};

export function Templates() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('architect_user');

  const filtered = ARCHITECTURE_TEMPLATES.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === 'All' || t.category === category;
    return matchSearch && matchCategory;
  });

  const handleUseTemplate = (template) => {
    sessionStorage.setItem('architect_load_template', JSON.stringify(template));
    if (isLoggedIn) {
      navigate('/dashboard/new');
    } else {
      navigate('/login?mode=signup');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300 flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-main)] mb-3 tracking-tight">Architecture Templates</h1>
          <p className="text-[var(--text-muted)] font-medium text-lg">Start with a production-proven architecture. Customize to fit your needs.</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 text-xs rounded-lg border font-bold transition-all ${
                  category === cat
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'
                    : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500/30 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-brand-500/5"
            >
              {template.featured && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/15 border border-amber-500/20 text-amber-500 rounded-full z-10">
                  <Star size={9} fill="currentColor" />
                  Featured
                </div>
              )}

              {/* Architecture preview representation */}
              <div className="h-36 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border-b border-[var(--border-main)] flex items-center justify-center relative">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(template.nodeCount, 8) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-2.5 h-2.5 rounded-sm bg-brand-500/30 border border-brand-500/50"
                      style={{ opacity: 0.4 + (idx / 10) }}
                    />
                  ))}
                  {template.nodeCount > 8 && (
                    <span className="text-xs text-[var(--text-muted)] font-bold">+{template.nodeCount - 8}</span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-bold text-[var(--text-main)] group-hover:text-brand-500 transition-colors">{template.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${COMPLEXITY_COLORS[template.complexity] || COMPLEXITY_COLORS.beginner}`}>
                    {template.complexity}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed h-12 line-clamp-3">{template.description}</p>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-muted)] rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-bold">
                    <Layers size={11} />
                    {template.nodeCount} nodes
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-2.5">
                <button
                  onClick={() => navigate(`/template/${template.id}`)}
                  className="flex-1 py-2.5 text-xs font-semibold bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 text-[var(--text-main)] rounded-xl transition-all"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-md shadow-brand-500/10 group/btn"
                >
                  Use Template
                  <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer (Rendered for Guest/Logged-out users) */}
      {!isLoggedIn && (
        <footer className="pt-20 pb-12 px-6 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)] w-full mt-auto">
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
      )}
    </div>
  );
}

export default Templates;
