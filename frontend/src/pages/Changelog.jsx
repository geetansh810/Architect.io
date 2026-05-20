// frontend/src/pages/Changelog.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CHANGELOG } from '../data/changelog';
import { Sparkles, Wrench, ArrowUpCircle, Rss, ChevronDown, Zap } from 'lucide-react';

// ─── Tag Config ───────────────────────────────────────────────────────
const TAG_STYLES = {
  major:   { label: 'Major Release', color: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' },
  minor:   { label: 'Minor Release', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  patch:   { label: 'Patch',         color: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

// ─── Change Item Icons ─────────────────────────────────────────────────
const CHANGE_ICONS = {
  new:      { icon: Sparkles,        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'New' },
  improved: { icon: ArrowUpCircle,   color: 'text-brand-500 dark:text-indigo-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/20',  label: 'Improved' },
  fixed:    { icon: Wrench,          color: 'text-amber-600 dark:text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   label: 'Fixed' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Single Entry ─────────────────────────────────────────────────────
function ChangelogEntry({ entry, index, totalEntries }) {
  const [expanded, setExpanded] = useState(index === 0); // First entry open by default
  const tag = TAG_STYLES[entry.tag] || TAG_STYLES.patch;

  const grouped = {
    new:      entry.items.filter((i) => i.type === 'new'),
    improved: entry.items.filter((i) => i.type === 'improved'),
    fixed:    entry.items.filter((i) => i.type === 'fixed'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center w-10 shrink-0">
        {/* Dot */}
        <div className={`w-3.5 h-3.5 rounded-full border-2 mt-1.5 shrink-0 z-10 transition-colors ${
          entry.tag === 'major'
            ? 'border-violet-500 bg-violet-500/30'
            : entry.tag === 'minor'
            ? 'border-indigo-500 bg-indigo-500/20'
            : 'border-slate-400 dark:border-slate-600 bg-slate-400/25 dark:bg-slate-600/20'
        }`} />
        {/* Line extending down */}
        {index < totalEntries - 1 && (
          <div className="flex-1 w-px bg-[var(--border-main)] mt-2 transition-colors" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono text-[var(--text-muted)]">{entry.version}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-colors ${tag.color}`}>
                {tag.label}
              </span>
            </div>
            <h2 className="text-xl font-black text-[var(--text-main)] leading-snug transition-colors">{entry.title}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 transition-colors">{formatDate(entry.date)}</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 transition-colors">{entry.summary}</p>

        {/* Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-black text-brand-500 hover:text-brand-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors mb-2"
        >
          {expanded ? 'Hide details' : `Show ${entry.items.length} changes`}
          <ChevronDown
            size={13}
            className={`transition-transform duration-250 ease-out ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Change items */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden space-y-5 pl-0.5"
            >
              {Object.entries(grouped).map(([type, items]) => {
                if (!items.length) return null;
                const conf = CHANGE_ICONS[type];
                const Icon = conf.icon;
                return (
                  <div key={type} className="pt-2">
                    <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border mb-2.5 transition-colors ${conf.color} ${conf.bg} ${conf.border}`}>
                      <Icon size={10} />
                      {conf.label}
                    </div>
                    <ul className="space-y-2 ml-1">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors leading-relaxed">
                          <span className="text-[var(--text-muted)]/40 mt-0.5 shrink-0 font-bold">—</span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function Changelog() {
  const [filter, setFilter] = useState('all');

  const filtered = CHANGELOG.filter(
    (e) => filter === 'all' || e.tag === filter
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      
      {/* Page Header */}
      <div className="relative border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] pt-32 pb-16 px-6 transition-colors">
        {/* Subtle grid background accent for modern feel */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,gray_1px,transparent_1px),linear-gradient(to_bottom,gray_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Rss size={14} className="text-brand-500 animate-pulse" />
                <span className="text-xs font-black font-mono text-brand-500 uppercase tracking-widest">Release History</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight transition-colors">Changelog</h1>
              <p className="text-sm text-[var(--text-muted)] font-medium mt-2 transition-colors">
                Every update, fix, and new feature — documented publicly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Roadmap link */}
              <Link
                to="/roadmap"
                className="flex items-center gap-1.5 px-4 py-2 text-xs border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-brand-500 rounded-xl transition-all font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] shadow-sm"
              >
                <Zap size={12} className="text-brand-500" />
                Roadmap
              </Link>
              {/* RSS link */}
              <a
                href="/changelog.xml"
                className="flex items-center gap-1.5 px-4 py-2 text-xs border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-brand-500 rounded-xl transition-all font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-app)] shadow-sm"
              >
                <Rss size={12} />
                RSS Feed
              </a>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            {[
              { id: 'all',   label: 'All' },
              { id: 'major', label: 'Major' },
              { id: 'minor', label: 'Minor' },
              { id: 'patch', label: 'Patches' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 text-xs rounded-lg border transition-all font-bold cursor-pointer ${
                  filter === f.id
                    ? 'bg-brand-500/10 border-brand-500 text-brand-500 shadow-sm'
                    : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)]/50'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-[var(--text-muted)] font-bold transition-colors">
              {filtered.length} release{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        {filtered.length > 0 ? (
          <div>
            {filtered.map((entry, i) => (
              <ChangelogEntry 
                key={entry.version} 
                entry={entry} 
                index={i} 
                totalEntries={filtered.length} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-[var(--border-main)] rounded-3xl p-8 bg-[var(--bg-surface)]">
            <p className="text-sm text-[var(--text-muted)] font-bold">No releases matching the selected filter.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-[var(--border-main)] text-center transition-colors">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Have feedback or found a bug?{' '}
            <a
              href="https://github.com/geetansh810/Architect.io/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:text-brand-600 font-bold transition-colors"
            >
              Open an issue on GitHub →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
