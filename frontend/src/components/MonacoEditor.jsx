import { Editor } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * MonacoEditor — thin themed wrapper around @monaco-editor/react.
 * Path is passed through so Monaco keeps a separate model (and undo
 * stack) per file instead of reusing one buffer across selections.
 *
 * `minimap` is a prop rather than a constant because the editor lives in a
 * resizable split pane: at split widths the minimap eats the ~15% of
 * horizontal space that the code actually needs, so the panel turns it off
 * below a width threshold.
 */
export default function MonacoEditor({
  path, value, language = 'javascript', onChange, readOnly = false, minimap = false,
}) {
  const { theme } = useTheme();

  return (
    <Editor
      path={path}
      value={value}
      language={language}
      theme={theme === 'dark' ? 'vs-dark' : 'vs'}
      onChange={onChange}
      loading={
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
          <Loader2 size={14} className="animate-spin" /> Loading editor…
        </div>
      }
      options={{
        readOnly,
        domReadOnly: readOnly,
        minimap: { enabled: minimap, renderCharacters: false, maxColumn: 80 },
        fontSize: 12.5,
        lineHeight: 20,
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        fontLigatures: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'off',
        renderLineHighlight: readOnly ? 'none' : 'line',
        // A generated tree is read top-to-bottom, so the chrome that helps is
        // structural (sticky scope header, indent guides) and the chrome that
        // just eats width (glyph margin, fat line-number gutter) is trimmed.
        stickyScroll: { enabled: true, maxLineCount: 3 },
        guides: { indentation: true, bracketPairs: 'active' },
        glyphMargin: false,
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 8,
        folding: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
        overviewRulerBorder: false,
        padding: { top: 12, bottom: 24 },
      }}
    />
  );
}
