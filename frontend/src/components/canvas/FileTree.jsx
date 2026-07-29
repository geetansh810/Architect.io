import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, File, FileJson, FileText, FileCode2 } from 'lucide-react';

/**
 * FileTree — collapsible folder view over the generator's flat path list.
 *
 * A generated MERN project is 40+ files with paths like
 * `src/modules/user/user.controller.js`; rendered flat in a 224px column
 * they're indistinguishable truncated strings. The generator emits paths, not
 * a tree, so the nesting is derived here rather than changing its contract.
 */

function buildTree(files) {
  const root = { dirs: new Map(), files: [] };
  files.forEach((file) => {
    const parts = file.path.split('/');
    const name = parts.pop();
    let node = root;
    parts.forEach((part) => {
      if (!node.dirs.has(part)) node.dirs.set(part, { dirs: new Map(), files: [] });
      node = node.dirs.get(part);
    });
    node.files.push({ ...file, name });
  });
  return root;
}

/** Folders on the path to `filePath`, so selecting a file reveals it. */
function ancestorsOf(filePath) {
  if (!filePath) return [];
  const parts = filePath.split('/');
  parts.pop();
  return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
}

const iconFor = (name) => {
  if (name.endsWith('.json')) return FileJson;
  if (name.endsWith('.md')) return FileText;
  if (/\.(js|ts|mjs|cjs)$/.test(name)) return FileCode2;
  return File;
};

export default function FileTree({ files, activeFilePath, onSelectFile, dimmed }) {
  const tree = useMemo(() => buildTree(files), [files]);

  // Open state is tracked as two explicit user intents rather than one synced
  // set: folders on the path to the active file reveal themselves, but a
  // folder the user deliberately collapsed stays collapsed.
  const [openedDirs, setOpenedDirs] = useState(() => new Set(['src']));
  const [closedDirs, setClosedDirs] = useState(() => new Set());

  const revealed = useMemo(() => new Set(ancestorsOf(activeFilePath)), [activeFilePath]);
  const isOpen = (path) => !closedDirs.has(path) && (openedDirs.has(path) || revealed.has(path));

  const toggle = (path) => {
    const open = isOpen(path);
    setOpenedDirs((prev) => {
      const next = new Set(prev);
      if (open) next.delete(path); else next.add(path);
      return next;
    });
    setClosedDirs((prev) => {
      const next = new Set(prev);
      if (open) next.add(path); else next.delete(path);
      return next;
    });
  };

  const renderNode = (node, prefix, depth) => (
    <>
      {[...node.dirs.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, child]) => {
          const path = prefix ? `${prefix}/${name}` : name;
          const open = isOpen(path);
          return (
            <div key={path}>
              <button
                onClick={() => toggle(path)}
                className="w-full text-left h-[22px] text-[11px] flex items-center gap-1 text-[var(--text-main)]
                  hover:bg-[var(--bg-app)] transition-colors font-semibold"
                style={{ paddingLeft: 6 + depth * 11, paddingRight: 8 }}
              >
                {open
                  ? <ChevronDown size={11} className="shrink-0 text-[var(--text-muted)]" />
                  : <ChevronRight size={11} className="shrink-0 text-[var(--text-muted)]" />}
                <span className="truncate">{name}</span>
              </button>
              {open && renderNode(child, path, depth + 1)}
            </div>
          );
        })}

      {node.files
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => {
          const Icon = iconFor(file.name);
          const isActive = !dimmed && activeFilePath === file.path;
          return (
            <button
              key={file.path}
              onClick={() => onSelectFile(file.path)}
              title={file.path}
              className={`w-full text-left h-[22px] text-[11px] flex items-center gap-1.5 relative transition-colors ${
                isActive
                  ? 'bg-brand-500/10 text-brand-500 font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
              }`}
              style={{ paddingLeft: 6 + depth * 11 + 12, paddingRight: 8 }}
            >
              {/* A left accent rail reads as "selected" at 11px far better than
                  a filled row, which at this density looks like a rendering bug. */}
              {isActive && <span className="absolute left-0 inset-y-0 w-0.5 bg-brand-500" />}
              <Icon size={11} className="shrink-0" />
              <span className="truncate">{file.name}</span>
            </button>
          );
        })}
    </>
  );

  if (!files.length) {
    return (
      <p className="px-3 py-4 text-[11px] text-[var(--text-muted)] text-center">
        Add nodes to generate a project
      </p>
    );
  }

  return <div className="pb-2">{renderNode(tree, '', 0)}</div>;
}
