import { useReactFlow, useViewport } from '@xyflow/react';
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Maximize2, LayoutTemplate,
  Grid3X3, Magnet, AlignLeft, AlignRight, AlignCenterHorizontal,
  AlignStartVertical, AlignEndVertical, AlignCenterVertical,
  AlignJustify, Rows3, Undo2, Redo2, ChevronDown, Map
} from 'lucide-react';
import { useArchitecture } from '../../context/ArchitectureContext';

const GRID_MODES = ['dots', 'lines', 'cross', 'none'];
const GRID_LABELS = { dots: 'Dots', lines: 'Lines', cross: 'Cross', none: 'None' };

export default function CanvasToolbar({ gridMode, onGridModeChange, snapEnabled, onSnapToggle, miniMapOpen, onMiniMapToggle }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const { undo, redo, canUndo, canRedo, autoLayout, alignNodes, distributeNodes } = useArchitecture();
  const [showAlignMenu, setShowAlignMenu] = useState(false);

  const handleZoomIn = () => { zoomIn(); };
  const handleZoomOut = () => { zoomOut(); };
  const handleFitView = () => { fitView({ padding: 0.15, duration: 400 }); };
  const cycleGridMode = () => {
    const idx = GRID_MODES.indexOf(gridMode);
    onGridModeChange(GRID_MODES[(idx + 1) % GRID_MODES.length]);
  };
  const handleAutoLayout = () => {
    autoLayout();
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 450 });
    }, 80);
  };

  const Divider = () => <div className="w-px h-6 bg-[var(--border-main)] shrink-0" />;

  const ToolBtn = ({ onClick, title, icon: Icon, active, disabled, className = '' }) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all flex items-center justify-center
        ${active ? 'bg-brand-500/15 text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
    >
      <Icon size={15} />
    </motion.button>
  );

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5
      bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-main)]
      rounded-2xl px-3 py-2 shadow-2xl shadow-black/20"
    >
      {/* Undo / Redo */}
      <ToolBtn onClick={undo} icon={Undo2} title="Undo (Ctrl+Z)" disabled={!canUndo} />
      <ToolBtn onClick={redo} icon={Redo2} title="Redo (Ctrl+Y)" disabled={!canRedo} />

      <Divider />

      {/* Zoom */}
      <ToolBtn onClick={handleZoomOut} icon={ZoomOut} title="Zoom Out (-)" />
      <span className="text-[11px] font-black text-[var(--text-muted)] px-1 min-w-[38px] text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <ToolBtn onClick={handleZoomIn} icon={ZoomIn} title="Zoom In (+)" />
      <ToolBtn onClick={handleFitView} icon={Maximize2} title="Fit View (Ctrl+0)" />
      <ToolBtn onClick={onMiniMapToggle} icon={Map} title="Toggle Minimap" active={miniMapOpen} />

      <Divider />

      {/* Auto Layout */}
      <ToolBtn onClick={handleAutoLayout} icon={LayoutTemplate} title="Auto Layout (Ctrl+L)" />

      <Divider />

      {/* Grid Mode */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={cycleGridMode}
        title={`Grid: ${GRID_LABELS[gridMode]} (click to cycle)`}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold
          ${gridMode !== 'none'
            ? 'bg-brand-500/10 text-brand-500'
            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'}`}
      >
        <Grid3X3 size={14} />
        {GRID_LABELS[gridMode]}
      </motion.button>

      {/* Snap */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSnapToggle}
        title="Snap to Grid (S)"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold
          ${snapEnabled
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'}`}
      >
        <Magnet size={14} />
        Snap
      </motion.button>

      <Divider />

      {/* Align Tools */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAlignMenu(v => !v)}
          title="Alignment Tools"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-all text-[11px] font-bold"
        >
          <AlignCenterHorizontal size={14} />
          Align
          <ChevronDown size={11} className={`transition-transform ${showAlignMenu ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {showAlignMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                bg-[var(--bg-surface)] border border-[var(--border-main)]
                rounded-2xl shadow-2xl p-2 flex flex-col gap-1 min-w-[160px]"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] px-2 pb-1">Align</p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { dir: 'left', icon: AlignLeft, label: 'Left' },
                  { dir: 'centerV', icon: AlignCenterVertical, label: 'Center V' },
                  { dir: 'right', icon: AlignRight, label: 'Right' },
                  { dir: 'top', icon: AlignStartVertical, label: 'Top' },
                  { dir: 'centerH', icon: AlignCenterHorizontal, label: 'Center H' },
                  { dir: 'bottom', icon: AlignEndVertical, label: 'Bottom' },
                ].map(({ dir, icon: Icon, label }) => (
                  <button
                    key={dir}
                    onClick={() => { alignNodes(dir); setShowAlignMenu(false); }}
                    title={`Align ${label}`}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-[var(--bg-app)] transition-colors text-[var(--text-muted)] hover:text-brand-500"
                  >
                    <Icon size={14} />
                    <span className="text-[8px] font-bold">{label}</span>
                  </button>
                ))}
              </div>
              <div className="h-px bg-[var(--border-main)] my-1" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] px-2 pb-1">Distribute</p>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { axis: 'horizontal', icon: AlignJustify, label: 'Horizontal' },
                  { axis: 'vertical',   icon: Rows3,        label: 'Vertical' },
                ].map(({ axis, icon: Icon, label }) => (
                  <button
                    key={axis}
                    onClick={() => { distributeNodes(axis); setShowAlignMenu(false); }}
                    title={`Distribute ${label}`}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-[var(--bg-app)] transition-colors text-[var(--text-muted)] hover:text-brand-500 text-[10px] font-bold"
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
