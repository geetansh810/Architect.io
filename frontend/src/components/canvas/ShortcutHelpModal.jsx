import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { group: 'Edit', shortcuts: [
    { keys: ['Ctrl', 'Z'], label: 'Undo' },
    { keys: ['Ctrl', 'Y'], label: 'Redo' },
    { keys: ['Ctrl', 'C'], label: 'Copy selected nodes' },
    { keys: ['Ctrl', 'V'], label: 'Paste nodes' },
    { keys: ['Ctrl', 'D'], label: 'Duplicate selected' },
    { keys: ['Ctrl', 'A'], label: 'Select all' },
    { keys: ['Delete'], label: 'Delete selected' },
  ]},
  { group: 'Canvas', shortcuts: [
    { keys: ['Ctrl', 'L'], label: 'Auto-layout' },
    { keys: ['Ctrl', '0'], label: 'Fit view' },
    { keys: ['Ctrl', '+'], label: 'Zoom in' },
    { keys: ['Ctrl', '-'], label: 'Zoom out' },
    { keys: ['Space', '+', 'Drag'], label: 'Pan canvas' },
    { keys: ['S'], label: 'Toggle snap to grid' },
  ]},
  { group: 'Tools', shortcuts: [
    { keys: ['Ctrl', 'F'], label: 'Search / Command palette' },
    { keys: ['Ctrl', 'Shift', 'E'], label: 'Export diagram' },
    { keys: ['F5'], label: 'Presentation mode' },
    { keys: ['?'], label: 'Show this help panel' },
  ]},
];

export default function ShortcutHelpModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500">
                  <Keyboard size={20} />
                </div>
                <div>
                  <h2 className="font-black text-[var(--text-main)]">Keyboard Shortcuts</h2>
                  <p className="text-xs text-[var(--text-muted)]">Speed up your workflow</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Shortcuts grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto">
              {SHORTCUTS.map(({ group, shortcuts }) => (
                <div key={group}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-3">{group}</p>
                  <div className="space-y-2">
                    {shortcuts.map(({ keys, label }) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[var(--text-muted)]">{label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {keys.map((k, i) => (
                            <span key={i} className="text-[10px] font-black px-1.5 py-0.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-md text-[var(--text-main)] font-mono">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--border-main)] text-center">
              <p className="text-xs text-[var(--text-muted)]">Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded text-[10px] font-mono">?</kbd> to toggle this panel anytime</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
