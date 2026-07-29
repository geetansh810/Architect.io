import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Download, Plus, Sparkles, Zap, Settings2,
  LayoutGrid, Code2, MoreHorizontal, Image, Keyboard,
  Presentation, BookOpen, Sun, Moon, Copy,
} from 'lucide-react';

/**
 * BuilderHeader — the workspace chrome, filtered by view mode.
 *
 * The header used to carry every action at once in a horizontally-scrolling
 * row. Actions are now split two ways — always-on (navigation, mode, canvas
 * tools, the primary CTA) and code-only — with the low-frequency ones folded
 * behind an overflow menu so the row never scrolls.
 */

// Two modes, not three. "Code" *is* the split — a code-only view meant hiding
// the canvas the code is generated from, which is the one thing that made the
// pane worth looking at.
const VIEW_MODES = [
  { mode: 'canvas', icon: LayoutGrid, label: 'Design' },
  { mode: 'code',   icon: Code2,      label: 'Code' },
];

export default function BuilderHeader({
  workflow, isTemplate, viewMode, onViewModeChange,
  isRenaming, tempName, onTempNameChange, onStartRename, onCommitRename,
  onBack, canvasTheme, onToggleCanvasTheme,
  onOpenAI, onOpenIntelligence, onOpenConfig, onOpenShortcuts,
  onOpenReadme, onExportImage, onPresent, isExporting,
  onGenerate, onUseTemplate, isGenerating,
  activeFilePath, onCopyActiveFile,
}) {
  // The canvas is on screen in both modes now, so the only mode-dependent
  // actions left are the code-pane ones.
  const isCodeMode = viewMode === 'code';

  return (
    <header className="h-14 shrink-0 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 px-4 z-50">
      {/* ── Left: navigation + title ── */}
      <div className="flex items-center gap-3 min-w-0 shrink">
        <button
          onClick={onBack}
          title="Back"
          className="p-1.5 hover:bg-[var(--bg-app)] rounded-lg transition-colors text-[var(--text-main)]"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="h-5 w-px bg-[var(--border-main)]" />
        {isRenaming ? (
          <input
            autoFocus type="text" value={tempName}
            onChange={(e) => onTempNameChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => e.key === 'Enter' && onCommitRename()}
            className="bg-transparent border-none outline-none font-black text-sm px-2 text-brand-500"
          />
        ) : (
          <h2
            className={`font-black text-sm px-1 ${isTemplate ? '' : 'truncate max-w-[220px]'} text-[var(--text-main)] ${isTemplate ? '' : 'cursor-pointer hover:text-brand-500'}`}
            onClick={() => !isTemplate && onStartRename()}
          >
            {workflow.name}
            {isTemplate && (
              <span className="ml-2 text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Template
              </span>
            )}
          </h2>
        )}
      </div>

      {/* ── Center: mode switcher ── */}
      <div
        className="flex items-center bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl p-0.5 shrink-0"
        id="tour-view-mode"
      >
        {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            title={`${label} view (⌘E to toggle)`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-bold ${
              viewMode === mode
                ? 'bg-brand-500 text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Icon size={14} />
            <span className="hidden lg:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Right: mode-filtered actions ── */}
      <div className="flex items-center gap-2 shrink-0">
        {!isTemplate && (
          <>
            <HeaderButton
              onClick={onOpenAI}
              title="AI Architect — generate a workflow from a prompt"
              className="bg-violet-500/10 border-violet-500/30 hover:border-violet-500 text-violet-500 px-3"
            >
              <Sparkles size={15} />
              <span className="hidden xl:inline">AI Architect</span>
            </HeaderButton>

            <HeaderButton
              onClick={onOpenIntelligence}
              title="Architecture Intelligence"
              className="bg-amber-500/10 border-amber-500/30 hover:border-amber-500 text-amber-500"
            >
              <Zap size={15} className="fill-amber-500/20" />
            </HeaderButton>
          </>
        )}

        {!isTemplate && isCodeMode && (
          <>
            <HeaderButton
              onClick={onCopyActiveFile}
              title={activeFilePath ? `Copy ${activeFilePath}` : 'Copy current file'}
              disabled={!activeFilePath}
            >
              <Copy size={15} />
              <span className="hidden xl:inline">Copy file</span>
            </HeaderButton>

            <HeaderButton onClick={onOpenConfig} title="Project Config — language, validation, docs">
              <Settings2 size={15} />
              <span className="hidden xl:inline">Config</span>
            </HeaderButton>
          </>
        )}

        <OverflowMenu
          isTemplate={isTemplate}
          isCodeMode={isCodeMode}
          canvasTheme={canvasTheme}
          isExporting={isExporting}
          onToggleCanvasTheme={onToggleCanvasTheme}
          onExportImage={onExportImage}
          onPresent={onPresent}
          onOpenShortcuts={onOpenShortcuts}
          onOpenReadme={onOpenReadme}
          onOpenConfig={onOpenConfig}
        />

        <div className="h-5 w-px bg-[var(--border-main)] mx-0.5" />

        {isTemplate ? (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onUseTemplate} disabled={isGenerating}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Use Template
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onGenerate} disabled={isGenerating} id="tour-generate-btn"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Generate
          </motion.button>
        )}
      </div>
    </header>
  );
}

function HeaderButton({ onClick, title, disabled, className = '', children }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`border rounded-lg text-sm font-bold flex items-center gap-2 px-2 py-2 transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap
        ${className || 'bg-[var(--bg-app)] border-[var(--border-main)] hover:border-brand-500 text-[var(--text-muted)] hover:text-brand-500'}`}
    >
      {children}
    </motion.button>
  );
}

function OverflowMenu({
  isTemplate, isCodeMode, canvasTheme, isExporting,
  onToggleCanvasTheme, onExportImage, onPresent, onOpenShortcuts, onOpenReadme, onOpenConfig,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = [
    { show: true, icon: BookOpen, label: 'Readme', onClick: onOpenReadme },
    { show: true, icon: canvasTheme === 'dark' ? Sun : Moon,
      label: canvasTheme === 'dark' ? 'Light canvas' : 'Dark canvas', onClick: onToggleCanvasTheme },
    { show: !isTemplate, icon: isExporting ? Loader2 : Image,
      label: 'Export as PNG', onClick: onExportImage, spin: isExporting },
    { show: true, icon: Presentation, label: 'Presentation mode', onClick: onPresent },
    { show: !isTemplate && !isCodeMode, icon: Settings2, label: 'Project config', onClick: onOpenConfig },
    { show: !isTemplate, icon: Keyboard, label: 'Keyboard shortcuts', onClick: onOpenShortcuts },
  ].filter(i => i.show);

  return (
    <div className="relative" ref={ref}>
      <HeaderButton onClick={() => setOpen(v => !v)} title="More actions">
        <MoreHorizontal size={15} />
      </HeaderButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full mt-2 w-52 bg-[var(--bg-surface)] border border-[var(--border-main)]
              rounded-2xl shadow-2xl p-1.5 z-50"
          >
            {items.map(({ icon: Icon, label, onClick, spin }) => (
              <button
                key={label}
                onClick={() => { onClick?.(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold
                  text-[var(--text-main)] hover:bg-[var(--bg-app)] hover:text-brand-500 transition-colors"
              >
                <Icon size={14} className={spin ? 'animate-spin' : ''} />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
