import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Pin, Star, Boxes, Layers, Server, Clock,
  Plug, Monitor, StickyNote as StickyNoteIcon, PanelLeftClose,
} from 'lucide-react';
import { NODE_SHAPE_CONFIG } from '../nodes/nodeShapeConfig';
import { CATEGORIES, NodeCard } from '../NodeSidebar';

/**
 * NodePalette — the Builder's node palette as a 56px icon rail plus an
 * on-demand flyout, replacing the permanently-docked 288px sidebar.
 *
 * The rail is always mounted (so the palette is one click away); the flyout
 * floats *over* the canvas rather than displacing it, which is what buys the
 * canvas its width back. Which category was last open — and whether the
 * flyout is pinned open — persists across sessions.
 */

const CATEGORY_ICONS = {
  Core: Boxes,
  Architecture: Layers,
  Infrastructure: Server,
  Operations: Clock,
  Integrations: Plug,
  Frontend: Monitor,
  Annotations: StickyNoteIcon,
};

const STORAGE_KEY = 'architect_palette_state';

const readStored = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
};

function RailBtn({ icon: Icon, label, active, onClick, color }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        active
          ? 'bg-brand-500/15 text-brand-500'
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
      }`}
    >
      <Icon size={17} />
      {color && (
        <span
          className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
    </motion.button>
  );
}

export default function NodePalette({ onAddNode, compactRail = false }) {
  // `openCategory === null` means the flyout is closed.
  const [openCategory, setOpenCategory] = useState(() => {
    const s = readStored();
    return s.pinned ? s.category ?? null : null;
  });
  const [pinned, setPinned] = useState(() => !!readStored().pinned);
  const [search, setSearch] = useState('');
  const [pinnedTypes, setPinnedTypes] = useState(
    () => new Set(readStored().favorites || ['entityNode', 'apiNode', 'dbNode'])
  );

  // Split view is tight on space — the flyout never stays pinned open there.
  const isPinned = pinned && !compactRail;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pinned, category: openCategory, favorites: [...pinnedTypes],
    }));
  }, [pinned, openCategory, pinnedTypes]);

  const handlePinToggle = useCallback((type) => {
    setPinnedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }, []);

  // Adding from the flyout closes it unless the user pinned it open, so the
  // node they just dropped is immediately visible.
  const handleAddNode = useCallback((type) => {
    onAddNode?.(type);
    if (!isPinned) setOpenCategory(null);
  }, [onAddNode, isPinned]);

  const toggleCategory = (name) => {
    setSearch('');
    setOpenCategory(prev => (prev === name ? null : name));
  };

  const searchRef = useRef(null);
  const openSearch = () => {
    setOpenCategory(prev => prev ?? CATEGORIES[0].name);
    // The input only exists once the flyout has mounted.
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const allTypes = Object.keys(NODE_SHAPE_CONFIG);
  const query = search.trim().toLowerCase();
  const searchResults = query
    ? allTypes.filter(t => {
        const cfg = NODE_SHAPE_CONFIG[t];
        return t.toLowerCase().includes(query)
          || cfg.label?.toLowerCase().includes(query)
          || cfg.category?.toLowerCase().includes(query);
      })
    : [];

  const activeCategory = CATEGORIES.find(c => c.name === openCategory);
  const favorites = [...pinnedTypes];

  return (
    <>
      {/* ── Rail (always mounted, 56px) ── */}
      <div
        id="tour-node-sidebar"
        className="w-14 shrink-0 h-full flex flex-col items-center gap-1 py-3
          border-r border-[var(--border-main)] bg-[var(--bg-sidebar)] z-30"
      >
        <RailBtn icon={Search} label="Search nodes" onClick={openSearch} active={!!query} />
        <div className="h-px w-6 bg-[var(--border-main)] my-1.5" />

        {CATEGORIES.map(cat => (
          <RailBtn
            key={cat.name}
            icon={CATEGORY_ICONS[cat.name] || Boxes}
            label={`${cat.name} — ${cat.description}`}
            color={cat.color}
            active={openCategory === cat.name && !query}
            onClick={() => toggleCategory(cat.name)}
          />
        ))}

        {favorites.length > 0 && (
          <>
            <div className="h-px w-6 bg-[var(--border-main)] my-1.5" />
            <RailBtn
              icon={Star}
              label="Favorites"
              active={openCategory === '__favorites__'}
              onClick={() => toggleCategory('__favorites__')}
            />
          </>
        )}
      </div>

      {/* ── Flyout (floats over the canvas) ── */}
      <AnimatePresence>
        {openCategory && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className="absolute left-14 top-0 bottom-0 w-72 z-30 flex flex-col
              bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] shadow-2xl shadow-black/20"
            id="tour-node-palette"
          >
            {/* Header */}
            <div className="px-3 pt-3 pb-2.5 border-b border-[var(--border-main)] shrink-0">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {activeCategory && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: activeCategory.color }} />
                  )}
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] truncate">
                    {query ? 'Search' : openCategory === '__favorites__' ? 'Favorites' : openCategory}
                  </h3>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {!compactRail && (
                    <button
                      onClick={() => setPinned(v => !v)}
                      title={isPinned ? 'Unpin palette' : 'Keep palette open'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPinned ? 'text-brand-500 bg-brand-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Pin size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => { setOpenCategory(null); setPinned(false); }}
                    title="Close palette"
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    <PanelLeftClose size={13} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search all nodes…"
                  className="w-full pl-7 pr-7 py-1.5 text-xs bg-[var(--bg-app)] border border-[var(--border-main)]
                    rounded-lg text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none
                    focus:border-brand-500 transition-colors font-medium"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
              {query ? (
                <>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1 pb-1">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] text-center py-6">No nodes match</p>
                  )}
                  {searchResults.map(type => (
                    <NodeCard key={type} type={type} onAddNode={handleAddNode}
                      onPinToggle={handlePinToggle} isPinned={pinnedTypes.has(type)} />
                  ))}
                </>
              ) : openCategory === '__favorites__' ? (
                favorites.map(type => (
                  <NodeCard key={type} type={type} onAddNode={handleAddNode}
                    onPinToggle={handlePinToggle} isPinned />
                ))
              ) : (
                <>
                  {activeCategory && (
                    <p className="text-[10px] text-[var(--text-muted)] px-1 pb-1.5 leading-snug">
                      {activeCategory.description}
                    </p>
                  )}
                  {activeCategory?.nodes.map(type => (
                    <NodeCard key={type} type={type} onAddNode={handleAddNode}
                      onPinToggle={handlePinToggle} isPinned={pinnedTypes.has(type)} />
                  ))}
                </>
              )}
            </div>

            <div className="px-3 py-2 border-t border-[var(--border-main)] shrink-0">
              <p className="text-[9px] text-[var(--text-muted)] text-center font-medium">
                Drag to canvas · Click + to add at center
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
