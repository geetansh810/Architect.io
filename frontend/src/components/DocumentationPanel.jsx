import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { generateDocumentation } from '../utils/documentationGenerator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy, Download, FileText, Layers, GitBranch, Check,
  BookOpen, Pencil, Eye, RotateCcw,
  Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code,
  Link as LinkIcon,
} from 'lucide-react';

// ─── Custom Markdown renderers ────────────────────────────────────────
const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-black text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-main)]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-[var(--text-main)] mt-8 mb-3 flex items-center gap-2">
      <span className="w-1 h-4 bg-brand-500 rounded-full inline-block shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-brand-500 mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-3">{children}</p>
  ),
  li: ({ children }) => (
    <li className="text-[var(--text-muted)] text-sm leading-relaxed">{children}</li>
  ),
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 ml-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">{children}</ol>,
  strong: ({ children }) => <strong className="text-[var(--text-main)] font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-[var(--text-muted)] italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-brand-500 pl-4 my-3 text-[var(--text-muted)] italic text-sm">{children}</blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
    ) : (
      <code className="block bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg p-4 text-xs font-mono text-green-400 overflow-x-auto my-3 whitespace-pre">{children}</code>
    ),
  pre: ({ children }) => <div className="my-3">{children}</div>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[var(--bg-sidebar)]">{children}</thead>,
  th: ({ children }) => (
    <th className="text-left text-xs font-semibold text-[var(--text-main)] px-3 py-2 border border-[var(--border-main)]">{children}</th>
  ),
  td: ({ children }) => (
    <td className="text-xs text-[var(--text-muted)] px-3 py-2 border border-[var(--border-main)]">{children}</td>
  ),
  hr: () => <hr className="border-[var(--border-main)] my-6" />,
  a: ({ href, children }) => (
    <a href={href} className="text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
  ),
};

// ─── Stat Badge ───────────────────────────────────────────────────────
function StatBadge({ label, value, colorClass }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colorClass}`}>{value}</span>
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
        <FileText size={28} className="text-brand-400" />
      </div>
      <h3 className="text-[var(--text-main)] font-bold text-base mb-2">No architecture yet</h3>
      <p className="text-[var(--text-muted)] text-sm max-w-xs leading-relaxed">
        Add nodes to your canvas. Documentation will be auto-generated — flow walkthrough, Mermaid diagram, component reference, and more.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 text-left w-full max-w-xs">
        {[
          { icon: '📖', label: 'Narrative flow' },
          { icon: '📊', label: 'Mermaid diagram' },
          { icon: '🔧', label: 'Component ref' },
          { icon: '⚠️', label: 'Failure analysis' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-2">
            <span className="text-base">{item.icon}</span>
            <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Markdown Toolbar ─────────────────────────────────────────────────
function MarkdownToolbar({ onInsert }) {
  const tools = [
    { icon: Bold,        action: () => onInsert('**', '**'),     title: 'Bold' },
    { icon: Italic,      action: () => onInsert('*', '*'),       title: 'Italic' },
    null,
    { icon: Heading1,    action: () => onInsert('# '),            title: 'Heading 1' },
    { icon: Heading2,    action: () => onInsert('## '),           title: 'Heading 2' },
    null,
    { icon: List,        action: () => onInsert('- '),            title: 'Bullet list' },
    { icon: ListOrdered, action: () => onInsert('1. '),           title: 'Numbered list' },
    null,
    { icon: Quote,       action: () => onInsert('> '),            title: 'Quote' },
    { icon: Code,        action: () => onInsert('`', '`'),        title: 'Inline code' },
    { icon: LinkIcon,    action: () => onInsert('[', '](url)'),   title: 'Link' },
  ];

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] shrink-0">
      {tools.map((t, i) =>
        t === null ? (
          <div key={i} className="w-px h-4 bg-[var(--border-main)] mx-1" />
        ) : (
          <button
            key={i}
            onClick={t.action}
            title={t.title}
            className="p-1.5 hover:bg-[var(--bg-app)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <t.icon size={14} />
          </button>
        )
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
/**
 * Props:
 *   nodes, edges        — from ReactFlow
 *   projectName         — string, used in the overview heading
 *   documentation       — controlled string from ArchitectureContext
 *   setDocumentation    — setter from ArchitectureContext
 *   isTemplate          — bool, disables edit mode in templates
 */
export function DocumentationPanel({
  nodes,
  edges,
  projectName,
  documentation,
  setDocumentation,
  isTemplate = false,
}) {
  const [viewMode, setViewMode] = useState('preview'); // 'edit' | 'preview'
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  // Auto-generate content and seed into `documentation` when empty
  const autoGenerated = useMemo(
    () => generateDocumentation(nodes, edges, projectName),
    [nodes, edges, projectName]
  );

  // When docs is empty and nodes exist, seed with auto-generated content
  useEffect(() => {
    if ((!documentation || documentation.trim() === '') && nodes && nodes.length > 0) {
      setDocumentation?.(autoGenerated);
    }
  }, [autoGenerated]); // only re-seed when auto-gen changes (i.e. when architecture changes and doc is empty)

  // The content shown is always `documentation` (user-editable), falling back to auto-gen
  const displayContent = documentation || autoGenerated;

  // Insert markdown at cursor position
  const insertMarkdown = useCallback((prefix, suffix = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = documentation || '';
    const newText = `${text.substring(0, start)}${prefix}${text.substring(start, end)}${suffix}${text.substring(end)}`;
    setDocumentation?.(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  }, [documentation, setDocumentation]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [displayContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([displayContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectName || 'architecture').toLowerCase().replace(/\s+/g, '-')}-readme.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [displayContent, projectName]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset to auto-generated documentation? Your edits will be lost.')) {
      setDocumentation?.(autoGenerated);
    }
  }, [autoGenerated, setDocumentation]);

  const isEmpty = !nodes || nodes.length === 0;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] overflow-hidden">

      {/* ── Header bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] shrink-0">

        {/* Left: Edit / Preview toggle */}
        {!isTemplate && !isEmpty && (
          <div className="flex items-center gap-1 bg-[var(--bg-app)] rounded-lg p-0.5 border border-[var(--border-main)]">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all font-semibold ${
                viewMode === 'edit'
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Pencil size={11} />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all font-semibold ${
                viewMode === 'preview'
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Eye size={11} />
              Preview
            </button>
          </div>
        )}

        {/* If template, show a spacer so right side aligns */}
        {(isTemplate || isEmpty) && <div />}

        {/* Right: Stats + actions */}
        <div className="flex items-center gap-3">
          {!isEmpty && (
            <div className="flex items-center gap-3 mr-2">
              <StatBadge label="Nodes" value={nodes.length} colorClass="text-brand-400 bg-brand-500/10" />
              <StatBadge label="Edges" value={edges.length} colorClass="text-violet-400 bg-violet-500/10" />
              <StatBadge label="APIs" value={nodes.filter(n => n.type === 'apiNode').length} colorClass="text-blue-400 bg-blue-500/10" />
              <StatBadge label="DBs" value={nodes.filter(n => n.type === 'dbNode').length} colorClass="text-emerald-400 bg-emerald-500/10" />
            </div>
          )}
          {!isTemplate && !isEmpty && (
            <button
              onClick={handleReset}
              title="Reset to auto-generated"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            title="Copy to clipboard"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded transition-colors disabled:opacity-40"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
          <button
            onClick={handleDownload}
            disabled={isEmpty}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-md hover:bg-brand-500/20 transition-all disabled:opacity-40 font-semibold"
          >
            <Download size={11} />
            Export .md
          </button>
        </div>
      </div>

      {/* ── Content area ──────────────────────────────────────────── */}
      {isEmpty ? (
        <EmptyState />
      ) : viewMode === 'edit' && !isTemplate ? (
        /* ─ Edit mode ─ */
        <div className="flex flex-col flex-1 min-h-0">
          <MarkdownToolbar onInsert={insertMarkdown} />
          <textarea
            ref={textareaRef}
            value={documentation || ''}
            onChange={(e) => setDocumentation?.(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 outline-none resize-none font-mono text-sm text-[var(--text-main)] leading-relaxed"
            placeholder="Write your README here (Markdown supported)…"
            spellCheck={false}
          />
        </div>
      ) : (
        /* ─ Preview mode ─ */
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {displayContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
