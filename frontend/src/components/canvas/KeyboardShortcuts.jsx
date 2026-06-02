import { useCallback, useEffect, useRef } from 'react';
import { useArchitecture } from '../../context/ArchitectureContext';

/**
 * KeyboardShortcuts — Global hotkey handler for the canvas.
 * Attaches to window keydown and dispatches actions.
 */
export default function KeyboardShortcuts({ onFitView, onZoomIn, onZoomOut, onTogglePresentationMode, onOpenExport, onOpenSearch }) {
  const {
    undo, redo, canUndo, canRedo,
    nodes, copyNodes, pasteNodes, duplicateNodes,
    autoLayout, selectAll,
  } = useArchitecture();

  const selectedIds = nodes.filter(n => n.selected).map(n => n.id);

  const handler = useCallback((e) => {
    // Ignore if user is typing in an input/textarea
    const tag = e.target?.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Undo
    if (ctrl && !shift && key === 'z') { e.preventDefault(); if (canUndo) undo(); return; }
    // Redo
    if ((ctrl && shift && key === 'z') || (ctrl && key === 'y')) { e.preventDefault(); if (canRedo) redo(); return; }
    // Select All
    if (ctrl && key === 'a') { e.preventDefault(); selectAll(); return; }
    // Copy
    if (ctrl && !shift && key === 'c' && selectedIds.length) { e.preventDefault(); copyNodes(selectedIds); return; }
    // Paste
    if (ctrl && !shift && key === 'v') { e.preventDefault(); pasteNodes(); return; }
    // Duplicate
    if (ctrl && key === 'd' && selectedIds.length) { e.preventDefault(); duplicateNodes(selectedIds); return; }
    // Auto Layout
    if (ctrl && key === 'l') { e.preventDefault(); autoLayout(); return; }
    // Fit View
    if (ctrl && key === '0') { e.preventDefault(); onFitView?.(); return; }
    // Zoom In
    if (ctrl && (key === '=' || key === '+')) { e.preventDefault(); onZoomIn?.(); return; }
    // Zoom Out
    if (ctrl && key === '-') { e.preventDefault(); onZoomOut?.(); return; }
    // Search / Command Palette
    if (ctrl && key === 'f') { e.preventDefault(); onOpenSearch?.(); return; }
    // Export
    if (ctrl && shift && key === 'e') { e.preventDefault(); onOpenExport?.(); return; }
    // Presentation mode
    if (key === 'f5' || (ctrl && shift && key === 'p')) { e.preventDefault(); onTogglePresentationMode?.(); return; }
  }, [undo, redo, canUndo, canRedo, selectedIds, copyNodes, pasteNodes, duplicateNodes, autoLayout, selectAll, onFitView, onZoomIn, onZoomOut, onOpenExport, onOpenSearch, onTogglePresentationMode]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);

  return null; // Pure behavior component
}
