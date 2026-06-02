import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useArchitecture } from '../../context/ArchitectureContext';
import { NODE_SHAPE_CONFIG } from '../nodes/nodeShapeConfig';
import TechIcon from '../nodes/TechIcons';

export default function NodeSearchCommand() {
  const { nodes, setSelectedNodes } = useArchitecture();
  const { setCenter } = useReactFlow();
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Toggle with Ctrl+F / Cmd+F
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in a normal input
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === 'input' && document.activeElement !== inputRef.current) return;
        if (activeTag === 'textarea' || activeTag === 'select') return;
        
        e.preventDefault();
        setOpen(true);
      }
      
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter nodes based on search query
  const results = query.length > 0 
    ? nodes.filter(n => {
        const config = NODE_SHAPE_CONFIG[n.type] || {};
        const q = query.toLowerCase();
        return (
          n.id.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q) ||
          config.label?.toLowerCase().includes(q) ||
          (n.data?.name && String(n.data.name).toLowerCase().includes(q)) ||
          (n.data?.label && String(n.data.label).toLowerCase().includes(q)) ||
          (n.data?.description && String(n.data.description).toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (node) => {
    // Select the node
    setSelectedNodes([node.id]);
    
    // Pan to the node
    setCenter(node.position.x + (node.width || 200)/2, node.position.y + (node.height || 100)/2, { zoom: 1.2, duration: 800 });
    
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-[var(--border-main)] gap-3 bg-[var(--glass-bg)]">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search canvas nodes... (by name, type, description)"
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
              />
              <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-md bg-[var(--bg-app)] text-[9px] font-bold tracking-widest px-2 border border-[var(--border-main)]">
                ESC
              </button>
            </div>

            {/* Results */}
            {query.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-[var(--bg-app)]">
                {results.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6">No nodes found on canvas.</p>
                ) : (
                  results.map((node, i) => {
                    const config = NODE_SHAPE_CONFIG[node.type] || {};
                    const isSelected = i === selectedIndex;
                    const title = node.data?.name || node.data?.label || node.data?.dbName || config.label || node.type;
                    
                    return (
                      <button
                        key={node.id}
                        onClick={() => handleSelect(node)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-[var(--bg-surface)] text-[var(--text-main)]'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-[var(--bg-surface)] border border-[var(--border-main)]'}`}>
                            {config.techIcon ? (
                              <TechIcon name={config.techIcon} size={16} />
                            ) : (
                              <span className="text-[10px] font-bold">N</span>
                            )}
                          </div>
                          <div className="text-left min-w-0">
                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[var(--text-main)]'}`}>
                              {title}
                            </p>
                            <p className={`text-[9px] font-medium uppercase tracking-widest truncate ${isSelected ? 'text-brand-100' : 'text-[var(--text-muted)]'}`}>
                              {config.label || node.type}
                            </p>
                          </div>
                        </div>
                        {isSelected && <ChevronRight size={14} className="text-brand-200" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
            
            {/* Empty State / Hint */}
            {query.length === 0 && (
              <div className="p-6 bg-[var(--bg-app)] text-center">
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  Type to quickly jump to any node on the canvas.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
