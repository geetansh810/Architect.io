import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutTemplate, Maximize2, Copy, ClipboardPaste,
  MousePointer2, Layers2, StickyNote, Type, Trash2, SquareDashed
} from 'lucide-react';
import { useArchitecture } from '../../context/ArchitectureContext';

export default function CanvasContextMenu({ x, y, isOpen, onClose, onFitView, onAddNode }) {
  const menuRef = useRef(null);
  const { autoLayout, pasteNodes, clipboard, nodes, setNodes, setEdges } = useArchitecture();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    window.addEventListener('mousedown', handler, true);
    return () => window.removeEventListener('mousedown', handler, true);
  }, [isOpen, onClose]);

  const selectedNodes = nodes.filter(n => n.selected);

  const action = (fn) => { fn(); onClose(); };

  const MenuSection = ({ label }) => (
    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] px-3 pt-2 pb-1">{label}</p>
  );

  const MenuItem = ({ icon: Icon, label, shortcut, onClick, disabled, danger }) => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all text-left
        ${danger ? 'hover:bg-red-500/10 hover:text-red-500 text-[var(--text-main)]' : 'hover:bg-[var(--bg-app)] text-[var(--text-main)]'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="flex items-center gap-2.5 text-sm font-semibold">
        <Icon size={14} className="shrink-0 opacity-70" />
        {label}
      </span>
      {shortcut && (
        <span className="text-[10px] text-[var(--text-muted)] font-mono">{shortcut}</span>
      )}
    </button>
  );

  const Divider = () => <div className="h-px bg-[var(--border-main)] my-1 mx-2" />;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -6 }}
          transition={{ duration: 0.12 }}
          style={{ position: 'fixed', left: x, top: y, zIndex: 1000 }}
          className="w-56 bg-[var(--bg-surface)]/98 backdrop-blur-xl border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden py-2"
        >
          <MenuSection label="View" />
          <MenuItem icon={Maximize2} label="Fit View" shortcut="Ctrl+0" onClick={() => action(onFitView)} />
          <MenuItem icon={LayoutTemplate} label="Auto Layout" shortcut="Ctrl+L" onClick={() => action(autoLayout)} />

          <Divider />
          <MenuSection label="Edit" />
          <MenuItem
            icon={ClipboardPaste}
            label="Paste"
            shortcut="Ctrl+V"
            disabled={!clipboard?.length}
            onClick={() => action(pasteNodes)}
          />
          <MenuItem
            icon={MousePointer2}
            label="Select All"
            shortcut="Ctrl+A"
            onClick={() => action(() => setNodes(nds => nds.map(n => ({ ...n, selected: true }))))}
          />

          <Divider />
          <MenuSection label="Add Node" />
          <MenuItem icon={SquareDashed} label="Category Box" onClick={() => action(() => onAddNode?.('categoryBox'))} />
          <MenuItem icon={Layers2} label="Zone Group" onClick={() => action(() => onAddNode?.('zoneGroup'))} />
          <MenuItem icon={StickyNote} label="Sticky Note" onClick={() => action(() => onAddNode?.('stickyNote'))} />
          <MenuItem icon={Type} label="Text Label" onClick={() => action(() => onAddNode?.('textLabel'))} />

          {selectedNodes.length > 0 && (
            <>
              <Divider />
              <MenuSection label="Selection" />
              <MenuItem
                icon={Copy}
                label={`Duplicate ${selectedNodes.length > 1 ? `(${selectedNodes.length})` : 'Node'}`}
                shortcut="Ctrl+D"
                onClick={() => action(() => {
                  const { duplicateNodes } = useArchitecture();
                  duplicateNodes(selectedNodes.map(n => n.id));
                })}
              />
              <MenuItem
                icon={Trash2}
                label="Delete Selected"
                shortcut="Del"
                danger
                onClick={() => action(() => {
                  const ids = new Set(selectedNodes.map(n => n.id));
                  setNodes(nds => nds.filter(n => !ids.has(n.id)));
                  setEdges(eds => eds.filter(e => !ids.has(e.source) && !ids.has(e.target)));
                })}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
