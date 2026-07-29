import { useEffect, useRef, useState } from 'react';
import {
  FolderTree, Pencil, FileCode2, Copy, Check, PanelLeftClose, PanelLeftOpen,
  Crosshair, Lock,
} from 'lucide-react';
import MonacoEditor from './MonacoEditor';
import FileTree from './canvas/FileTree';
import { describeCodeSource } from '../utils/codeSync';

/**
 * CodeEditorPanel — file tree + Monaco viewer for the generated project.
 * Controlled: Builder.jsx owns activeFilePath so a canvas node click can
 * drive it, and a file click here can drive the canvas selection back.
 *
 * Most generated files are read-only (they're fully derived from the
 * graph). The exception is `editingNode` — when set (a Logic Hook or
 * Custom Middleware node was clicked), the right pane becomes a real
 * editor bound directly to that node's `data.code`, the same field
 * PropertiesPanel's mini-editor writes to. This keeps a single source of
 * truth instead of trying to splice arbitrary edits back into generated
 * boilerplate.
 *
 * Layout note: the explorer header, the file tab bar, and the status bar are
 * fixed at the same heights across both columns (36 / 36 / 26px) and share
 * one border colour. Panes whose chrome doesn't line up are what made the
 * split read as two apps bolted together rather than one workspace.
 */

const HEADER_H = 'h-9';
const STATUS_H = 'h-[26px]';
// Monaco's minimap costs ~15% of the width; below this the code column is
// already too narrow to give any of it away.
const MINIMAP_MIN_WIDTH = 820;
// Below this the 208px explorer leaves under ~250px for code, which is
// narrower than most of the generated lines — the tree collapses instead.
const EXPLORER_MIN_WIDTH = 480;

export default function CodeEditorPanel({
  files, activeFilePath, onSelectFile, editingNode, onEditNodeCode, onStopEditingNode,
  onRevealNode,
}) {
  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];
  const [panelRef, width] = usePanelWidth();

  // `null` means "follow the width" — the explorer gets out of the way when
  // the split is dragged narrow, but an explicit toggle sticks from then on.
  const [treeIntent, setTreeIntent] = useState(null);
  const treeOpen = treeIntent ?? (width === 0 || width >= EXPLORER_MIN_WIDTH);
  const toggleTree = () => setTreeIntent(!treeOpen);

  // No side border on the root: the panel is the left pane, and the split
  // divider already draws the seam against the canvas.
  return (
    <div ref={panelRef} className="flex h-full w-full bg-[var(--bg-app)]">
      {/* ── Explorer ── */}
      {treeOpen && (
        <div className="w-52 shrink-0 flex flex-col border-r border-[var(--border-main)] bg-[var(--bg-sidebar)]">
          <div className={`${HEADER_H} shrink-0 flex items-center justify-between gap-2 px-3 border-b border-[var(--border-main)]`}>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] truncate">
              <FolderTree size={11} className="shrink-0" /> Explorer
            </span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tabular-nums shrink-0">{files.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <FileTree
              files={files}
              activeFilePath={activeFile?.path}
              onSelectFile={onSelectFile}
              dimmed={!!editingNode}
            />
          </div>
        </div>
      )}

      {/* ── Editor ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {editingNode ? (
          <EditableNodeCode
            node={editingNode}
            onChange={onEditNodeCode}
            onDone={onStopEditingNode}
            treeOpen={treeOpen}
            onToggleTree={toggleTree}
            minimap={width >= MINIMAP_MIN_WIDTH}
          />
        ) : (
          <GeneratedFileView
            file={activeFile}
            treeOpen={treeOpen}
            onToggleTree={toggleTree}
            onRevealNode={onRevealNode}
            minimap={width >= MINIMAP_MIN_WIDTH}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Live width of the panel, so the editor can drop chrome as the split
 * narrows. Measured rather than derived from splitRatio because the panel
 * is also the whole viewport in Code mode, and the divider can be dragged.
 */
function usePanelWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

// ── Chrome primitives, shared by both editor states ─────────────────────────

function TabBar({ children, treeOpen, onToggleTree, actions }) {
  return (
    <div className={`${HEADER_H} shrink-0 flex items-stretch border-b border-[var(--border-main)] bg-[var(--bg-sidebar)]`}>
      <button
        onClick={onToggleTree}
        title={treeOpen ? 'Hide explorer' : 'Show explorer'}
        className="px-2.5 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
      >
        {treeOpen ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
      </button>
      <div className="w-px my-2 bg-[var(--border-main)] shrink-0" />
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
      {actions && <div className="flex items-center gap-0.5 pr-1.5 shrink-0">{actions}</div>}
    </div>
  );
}

/** A single active "tab" — directory as muted breadcrumb, filename emphasised. */
function FileTab({ path, icon: Icon = FileCode2, accent = 'text-brand-500' }) {
  const parts = (path || '').split('/');
  const name = parts.pop();
  const dir = parts.join('/');

  return (
    <div className="h-full flex items-center gap-1.5 px-3 min-w-0 bg-[var(--bg-app)]
      border-r border-[var(--border-main)] relative">
      <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-500" />
      <Icon size={12} className={`shrink-0 ${accent}`} />
      <span className="text-[11px] font-mono truncate">
        {dir && <span className="text-[var(--text-muted)]">{dir}/</span>}
        <span className="text-[var(--text-main)] font-semibold">{name}</span>
      </span>
    </div>
  );
}

function TabAction({ icon: Icon, title, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
      }`}
    >
      <Icon size={13} />
    </button>
  );
}

function StatusBar({ left, right }) {
  return (
    <div className={`${STATUS_H} shrink-0 flex items-center justify-between gap-3 px-3
      border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]
      text-[10px] font-medium text-[var(--text-muted)]`}>
      <span className="truncate flex items-center gap-1.5">{left}</span>
      <span className="shrink-0 flex items-center gap-2.5 tabular-nums">{right}</span>
    </div>
  );
}

const lineCountOf = (text) => (text ? text.split('\n').length : 0);

// ── Read-only view of a generated file ──────────────────────────────────────

function GeneratedFileView({ file, treeOpen, onToggleTree, onRevealNode, minimap }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard is permission-gated; a failed copy shouldn't take the pane down.
    }
  };

  if (!file) {
    return (
      <>
        <TabBar treeOpen={treeOpen} onToggleTree={onToggleTree}>
          <span className="px-3 text-[11px] text-[var(--text-muted)]">No file</span>
        </TabBar>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
          <FileCode2 size={22} className="text-[var(--text-muted)]" />
          <p className="text-xs font-bold text-[var(--text-main)]">Nothing to generate yet</p>
          <p className="text-[11px] text-[var(--text-muted)] max-w-[240px]">
            Add an Entity and connect it to an API Route — the project appears here as you build.
          </p>
        </div>
      </>
    );
  }

  const hint = describeCodeSource(file.path);

  return (
    <>
      <TabBar
        treeOpen={treeOpen}
        onToggleTree={onToggleTree}
        actions={
          <>
            <TabAction
              icon={Crosshair}
              title="Reveal the node that owns this file"
              onClick={() => onRevealNode?.(file.path)}
              disabled={!onRevealNode}
            />
            <TabAction icon={copied ? Check : Copy} title="Copy file" onClick={copy} active={copied} />
          </>
        }
      >
        <FileTab path={file.path} />
      </TabBar>

      <div className="flex-1 min-h-0">
        <MonacoEditor
          path={file.path}
          value={file.content}
          language={file.language || 'javascript'}
          minimap={minimap}
          readOnly
        />
      </div>

      <StatusBar
        left={hint ? <>{hint}</> : <><Lock size={10} className="shrink-0" /> Generated from the canvas — read-only</>}
        right={
          <>
            <span>{lineCountOf(file.content)} lines</span>
            <span className="uppercase tracking-wider">{file.language || 'javascript'}</span>
          </>
        }
      />
    </>
  );
}

// ── Editable view bound to a node's own `data.code` ──────────────────────────

function EditableNodeCode({ node, onChange, onDone, treeOpen, onToggleTree, minimap }) {
  const isMiddleware = node.type === 'middlewareNode';
  const label = isMiddleware ? (node.data?.name || 'Custom Middleware') : (node.data?.name || 'Logic Hook');
  const context = isMiddleware
    ? 'Runs as (req, res, next) — remember to call next().'
    : `Runs on the "${node.data?.hook || 'before-create'}" hook. Must return the ${node.data?.hook?.startsWith('before') ? 'payload' : 'saved record'}.`;
  const code = node.data?.code || '';

  return (
    <>
      <TabBar
        treeOpen={treeOpen}
        onToggleTree={onToggleTree}
        actions={
          <button
            onClick={onDone}
            title="Back to the generated file"
            className="flex items-center gap-1.5 px-2.5 py-1 mr-0.5 rounded-md text-[10px] font-bold
              text-[var(--text-muted)] hover:text-brand-500 hover:bg-[var(--bg-app)] transition-colors"
          >
            <FileCode2 size={12} /> View generated
          </button>
        }
      >
        <FileTab path={label} icon={Pencil} accent="text-amber-500" />
      </TabBar>

      <div className="flex-1 min-h-0">
        <MonacoEditor
          path={`node:${node.id}`}
          value={code}
          language="javascript"
          minimap={minimap}
          onChange={(value) => onChange(node.id, value ?? '')}
        />
      </div>

      <StatusBar
        left={
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            {context}
          </>
        }
        right={
          <>
            <span>{lineCountOf(code)} lines</span>
            <span className="uppercase tracking-wider text-amber-500">Editable</span>
          </>
        }
      />
    </>
  );
}
