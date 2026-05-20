// frontend/src/pages/Roadmap.jsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROADMAP_COLUMNS, ROADMAP_ITEMS } from '../data/roadmap';
import {
  CheckCircle2, Loader2, Calendar, Lightbulb,
  ChevronUp, ExternalLink, Tag, Zap, Circle, Rss
} from 'lucide-react';

// ─── Category badge colors (Light and Dark Mode adapted) ───────────────
const CATEGORY_COLORS = {
  Core:          'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/15',
  'Code Gen':    'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-400/20',
  Auth:          'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-400/10 border-rose-200 dark:border-rose-400/20',
  Canvas:        'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-400/10 border-violet-200 dark:border-violet-400/20',
  Docs:          'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-400/10 border-sky-200 dark:border-sky-400/20',
  Growth:        'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20',
  Templates:     'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20',
  Community:     'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-400/10 border-pink-200 dark:border-pink-400/20',
  Collaboration: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 border-indigo-200 dark:border-indigo-400/20',
  Integrations:  'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20',
  Analytics:     'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-400/10 border-teal-200 dark:border-teal-400/20',
  AI:            'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 border-purple-200 dark:border-purple-400/20',
  DevOps:        'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-400/10 border-lime-200 dark:border-lime-400/20',
  Sharing:       'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-400/10 border-fuchsia-200 dark:border-fuchsia-400/20',
  Security:      'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-200 dark:border-red-400/20',
};

const ICON_MAP = {
  CheckCircle2,
  Loader2,
  Calendar,
  Lightbulb,
};

// ─── Single Roadmap Card ───────────────────────────────────────────────
function RoadmapCard({ item, columnAccent, isShipped }) {
  const [votes, setVotes] = useState(item.votes);
  const [voted, setVoted] = useState(() => {
    return localStorage.getItem(`roadmap_vote_${item.id}`) === 'true';
  });

  const catColor = CATEGORY_COLORS[item.category] || 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10';

  const handleVote = (e) => {
    e.stopPropagation();
    if (isShipped || voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
    // Persist vote in localStorage
    const key = `roadmap_vote_${item.id}`;
    localStorage.setItem(key, 'true');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--text-muted)]/30 rounded-xl p-4 transition-all duration-300 cursor-default shadow-sm hover:shadow-md flex flex-col justify-between min-h-[140px]"
    >
      <div>
        {/* Category badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${catColor}`}>
            {item.category}
          </span>
          {item.version && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">{item.version}</span>
          )}
          {item.eta && !item.version && (
            <span className="text-[10px] text-[var(--text-muted)] font-bold flex items-center gap-1">
              <Calendar size={9} />
              {item.eta}
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="text-sm font-semibold text-[var(--text-main)] mb-1.5 leading-snug transition-colors group-hover:text-brand-500">
          {item.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 transition-colors">
          {item.description}
        </p>
      </div>

      {/* Footer: votes */}
      <div>
        {!isShipped && (
          <button
            onClick={handleVote}
            disabled={voted}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
              voted
                ? `${columnAccent} bg-current/10 border-current/30 opacity-90`
                : 'text-[var(--text-muted)] border-[var(--border-main)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)]/50 hover:bg-[var(--bg-app)]'
            }`}
          >
            <ChevronUp size={13} className={voted ? 'fill-current' : ''} />
            <span className="font-semibold">{votes}</span>
            <span className="opacity-80">{voted ? '· Voted' : '· Upvote'}</span>
          </button>
        )}

        {isShipped && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500 font-bold">
            <CheckCircle2 size={12} />
            <span>Shipped</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────
function RoadmapColumn({ column, items }) {
  const Icon = ICON_MAP[column.icon] || Circle;
  const isShipped = column.id === 'shipped';

  return (
    <div className={`flex flex-col min-w-[280px] max-w-[320px] rounded-2xl border ${column.border} ${column.bg} overflow-hidden h-[calc(100vh-280px)] min-h-[480px] transition-colors duration-300`}>
      {/* Column header */}
      <div className="px-4 py-3.5 border-b border-[var(--border-main)] bg-[var(--bg-surface)]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-0.5">
          <div className={`w-2 h-2 rounded-full ${column.dotColor} ${column.animate ? 'animate-pulse' : ''}`} />
          <Icon size={14} className={`${column.accent}`} />
          <span className={`text-sm font-black tracking-tight ${column.accent}`}>{column.title}</span>
          <span className="ml-auto text-xs text-[var(--text-muted)] font-mono font-bold bg-[var(--bg-app)] px-2 py-0.5 rounded-md border border-[var(--border-main)]">
            {items.length}
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] ml-4 font-medium">{column.description}</p>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto min-h-0 scrollbar-thin scrollbar-track-transparent">
        {items.length === 0 ? (
          <div className="text-center text-xs text-[var(--text-muted)] font-bold py-12 border border-dashed border-[var(--border-main)]/50 rounded-xl bg-[var(--bg-app)]/20">
            Nothing here yet
          </div>
        ) : (
          items.map((item) => (
            <RoadmapCard
              key={item.id}
              item={item}
              columnAccent={column.accent}
              isShipped={isShipped}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────
export default function Roadmap() {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const allCategories = useMemo(() => {
    const cats = [...new Set(ROADMAP_ITEMS.map((i) => i.category))].sort();
    return ['All', ...cats];
  }, []);

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'All') return ROADMAP_ITEMS;
    return ROADMAP_ITEMS.filter((i) => i.category === categoryFilter);
  }, [categoryFilter]);

  const itemsByColumn = useMemo(() => {
    const map = {};
    ROADMAP_COLUMNS.forEach((col) => {
      map[col.id] = filteredItems
        .filter((i) => i.column === col.id)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0)); // Sort by votes desc
    });
    return map;
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      {/* Page header */}
      <div className="relative border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] pt-32 pb-12 px-6 transition-colors">
        {/* Subtle grid background accent for modern feel */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,gray_1px,transparent_1px),linear-gradient(to_bottom,gray_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-screen-2xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-brand-500 animate-pulse" />
            <span className="text-xs font-black font-mono text-brand-500 uppercase tracking-widest">Product Roadmap</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight transition-colors text-[var(--text-main)]">What We're Building</h1>
              <p className="text-sm text-[var(--text-muted)] mt-2 max-w-lg transition-colors font-medium">
                Our public roadmap. Upvote features you want to see sooner — your votes directly influence priority.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/changelog"
                className="flex items-center gap-1.5 px-4 py-2 text-xs border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-brand-500 rounded-xl transition-all font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] shadow-sm cursor-pointer"
              >
                <Rss size={12} className="text-brand-500" />
                Changelog
              </Link>
              <a
                href="https://github.com/geetansh810/Architect.io/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-brand-500 rounded-xl transition-all font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] shadow-sm cursor-pointer"
              >
                <ExternalLink size={12} />
                Suggest a Feature
              </a>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            <Tag size={12} className="text-[var(--text-muted)]" />
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs rounded-lg border transition-all font-bold cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-brand-500/10 border-brand-500 text-brand-500 shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban board — horizontally scrollable */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-auto scrollbar-thin">
        <div className="flex gap-6 pb-6 select-none">
          {ROADMAP_COLUMNS.map((column, i) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex-shrink-0"
            >
              <RoadmapColumn
                column={column}
                items={itemsByColumn[column.id] || []}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="max-w-3xl mx-auto text-center pb-16 text-xs text-[var(--text-muted)] font-semibold transition-colors space-y-2">
        <p>Roadmap is updated as priorities shift. Estimated dates are targets, not guarantees.</p>
        <p>
          Have feedback or found a bug?{' '}
          <a
            href="https://github.com/geetansh810/Architect.io/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:text-brand-600 font-bold transition-colors underline"
          >
            Open an issue on GitHub →
          </a>
        </p>
      </div>
    </div>
  );
}
