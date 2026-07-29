import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronRight, Pin, Plus,
  Star, Clock, X
} from 'lucide-react';
import { NODE_SHAPE_CONFIG } from './nodes/nodeShapeConfig';
import TechIcon from './nodes/TechIcons';

// ── Node Category Definitions ─────────────────────────────────────────────────
// Exported so the Builder's collapsed palette rail (NodePalette) can render the
// same categories and cards without duplicating the taxonomy.
export const CATEGORIES = [
  {
    name: 'Core',
    color: '#10b981',
    nodes: ['entityNode', 'apiNode'],
    description: 'Data models and API routes',
  },
  {
    name: 'Architecture',
    color: '#6366f1',
    nodes: ['authNode', 'dbNode', 'middlewareNode', 'logicNode'],
    description: 'Auth, database, and processing',
  },
  {
    name: 'Infrastructure',
    color: '#0ea5e9',
    nodes: ['cacheNode', 'loadBalancerNode', 'cdnNode', 'queueNode', 'replicaNode', 'counterServiceNode'],
    description: 'Caching, load balancing, messaging',
  },
  {
    name: 'Operations',
    color: '#a855f7',
    nodes: ['cronNode'],
    description: 'Scheduled jobs and automation',
  },
  {
    name: 'Integrations',
    color: '#f43f5e',
    nodes: ['mailNode', 'storageNode', 'webhookNode'],
    description: 'External services and webhooks',
  },
  {
    name: 'Frontend',
    color: '#06b6d4',
    nodes: ['frontendNode', 'mobileNode', 'browserNode'],
    description: 'Client applications',
  },
  {
    name: 'Annotations',
    color: '#64748b',
    nodes: ['categoryBox', 'zoneGroup', 'stickyNote', 'textLabel'],
    description: 'Labels, notes, zones and category boxes',
  },

];

// ── Single Node Card ──────────────────────────────────────────────────────────
export function NodeCard({ type, onAddNode, onPinToggle, isPinned, compact = false }) {
  const config = NODE_SHAPE_CONFIG[type] || {};
  const label = config.label || type;
  const icon  = config.techIcon;
  const glow  = config.glowColor || '100,116,139';
  const badge = config.compactLabel || label.slice(0, 4);

  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (compact) {
    return (
      <motion.div
        draggable
        onDragStart={onDragStart}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title={label}
        className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab
          bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] border border-transparent
          hover:border-[var(--border-main)] transition-all group"
        style={{ '--glow': `rgba(${glow},0.2)` }}
      >
        {icon
          ? <TechIcon name={icon} size={20} />
          : <div className="w-5 h-5 rounded-md" style={{ background: `rgba(${glow},0.3)` }} />
        }
        <span className="text-[8px] font-black text-[var(--text-muted)] text-center leading-tight max-w-[40px] truncate">
          {badge}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      draggable
      onDragStart={onDragStart}
      whileHover={{ x: 3, boxShadow: `0 4px 20px rgba(${glow},0.2)` }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab
        bg-[var(--bg-app)] hover:bg-[var(--bg-surface)] border border-transparent
        hover:border-[var(--border-main)] transition-all group relative"
    >
      {/* Tech icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `rgba(${glow},0.15)` }}
      >
        {icon
          ? <TechIcon name={icon} size={18} />
          : <div className="w-4 h-4 rounded-sm" style={{ background: `rgba(${glow},0.5)` }} />
        }
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[var(--text-main)] truncate leading-tight">{label}</p>
        {config.compactLabel && (
          <p className="text-[9px] text-[var(--text-muted)] font-medium capitalize">{config.category || ''}</p>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onMouseDown={e => { e.stopPropagation(); onPinToggle?.(type); }}
          className={`p-1 rounded-lg transition-all ${isPinned ? 'text-amber-400 bg-amber-400/10' : 'text-[var(--text-muted)] hover:text-amber-400'}`}
          title={isPinned ? 'Unpin' : 'Pin to favorites'}
        >
          <Pin size={11} />
        </button>
        <button
          onMouseDown={e => { e.stopPropagation(); onAddNode?.(type); }}
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-brand-500 transition-all"
          title={`Add ${label} to canvas`}
        >
          <Plus size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Category Section ──────────────────────────────────────────────────────────
function CategorySection({ cat, onAddNode, onPinToggle, pinnedTypes, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-app)] rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-main)]">
            {cat.name}
          </span>
          <span className="text-[8px] font-bold text-[var(--text-muted)] bg-[var(--bg-app)] px-1.5 py-0.5 rounded-full">
            {cat.nodes.length}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={12} className="text-[var(--text-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pl-2 pr-1 pb-1 space-y-0.5">
              {cat.nodes.map(type => (
                <NodeCard
                  key={type}
                  type={type}
                  onAddNode={onAddNode}
                  onPinToggle={onPinToggle}
                  isPinned={pinnedTypes.has(type)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
export default function NodeSidebar({ onAddNode }) {
  const [search, setSearch] = useState('');
  const [pinnedTypes, setPinnedTypes] = useState(new Set(['entityNode', 'apiNode', 'dbNode']));
  const [recentTypes, setRecentTypes] = useState(['entityNode', 'apiNode']);
  const searchRef = useRef(null);

  const handlePinToggle = useCallback((type) => {
    setPinnedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleAddNode = useCallback((type) => {
    onAddNode?.(type);
    setRecentTypes(prev => {
      const next = [type, ...prev.filter(t => t !== type)].slice(0, 5);
      return next;
    });
  }, [onAddNode]);

  const handleDragStart = useCallback((type) => {
    setRecentTypes(prev => {
      const next = [type, ...prev.filter(t => t !== type)].slice(0, 5);
      return next;
    });
  }, []);

  // Search results
  const allTypes = Object.keys(NODE_SHAPE_CONFIG);
  const searchResults = search.length >= 1
    ? allTypes.filter(t => {
        const cfg = NODE_SHAPE_CONFIG[t];
        return (
          t.toLowerCase().includes(search.toLowerCase()) ||
          cfg.label?.toLowerCase().includes(search.toLowerCase()) ||
          cfg.category?.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];

  return (
    <div className="w-72 h-full flex flex-col bg-[var(--bg-sidebar)] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[var(--border-main)] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Components</h3>
          <span className="text-[9px] text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-1 rounded-full font-bold">
            {allTypes.length} nodes
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes… (Ctrl+F)"
            className="w-full pl-8 pr-8 py-2 text-xs bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl
              text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-brand-500
              transition-colors font-medium"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1 no-scrollbar" id="tour-node-palette">

        {/* Search Results */}
        <AnimatePresence>
          {search.length >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 space-y-0.5"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] pb-1">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
              </p>
              {searchResults.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-4">No nodes match</p>
              )}
              {searchResults.map(type => (
                <NodeCard
                  key={type}
                  type={type}
                  onAddNode={handleAddNode}
                  onPinToggle={handlePinToggle}
                  isPinned={pinnedTypes.has(type)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-search view */}
        {!search && (
          <>
            {/* Favorites */}
            {pinnedTypes.size > 0 && (
              <div className="px-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Star size={11} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Favorites</span>
                </div>
                <div className="grid grid-cols-4 gap-1 px-2 pb-2">
                  {[...pinnedTypes].map(type => (
                    <NodeCard key={type} type={type} compact onAddNode={handleAddNode} onPinToggle={handlePinToggle} isPinned={true} />
                  ))}
                </div>
                <div className="h-px bg-[var(--border-main)] mx-3 mb-1" />
              </div>
            )}

            {/* Recently Used */}
            {recentTypes.length > 0 && (
              <div className="px-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Clock size={11} className="text-[var(--text-muted)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Recently Used</span>
                </div>
                <div className="flex gap-1 px-2 pb-2 overflow-x-auto no-scrollbar">
                  {recentTypes.map(type => (
                    <NodeCard key={type} type={type} compact onAddNode={handleAddNode} onPinToggle={handlePinToggle} isPinned={pinnedTypes.has(type)} />
                  ))}
                </div>
                <div className="h-px bg-[var(--border-main)] mx-3 mb-1" />
              </div>
            )}

            {/* All Categories */}
            <div className="px-1 space-y-0.5">
              {CATEGORIES.map((cat, i) => (
                <CategorySection
                  key={cat.name}
                  cat={cat}
                  onAddNode={handleAddNode}
                  onPinToggle={handlePinToggle}
                  pinnedTypes={pinnedTypes}
                  defaultOpen={i < 2}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer drag hint */}
      <div className="px-4 py-3 border-t border-[var(--border-main)] shrink-0">
        <p className="text-[9px] text-[var(--text-muted)] text-center font-medium">
          Drag nodes to canvas · Click + to add at center
        </p>
      </div>
    </div>
  );
}
