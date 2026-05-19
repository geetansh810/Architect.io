import { useState, useMemo } from 'react';
import { generateCode } from '../utils/codeGenerator';
import { Copy, Download, ChevronRight, FileCode, FileText, Package } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import { useArchitecture } from '../context/ArchitectureContext';

const FORMAT_TABS = [
  { id: 'express', label: 'Express.js', icon: FileCode },
  { id: 'docker', label: 'Docker Compose', icon: Package },
  { id: 'env', label: '.env Template', icon: FileText },
  { id: 'readme', label: 'Architecture README', icon: FileText },
];

export default function CodePreview({ nodes, edges }) {
  const { theme } = useTheme();
  const { showToast, documentation } = useArchitecture();
  const [activeFormat, setActiveFormat] = useState('express');
  const [activeFile, setActiveFile] = useState(0);

  const generatedFiles = useMemo(
    () => generateCode(nodes, edges, activeFormat, documentation),
    [nodes, edges, activeFormat, documentation]
  );

  const currentFile = Array.isArray(generatedFiles)
    ? generatedFiles[activeFile]
    : { path: activeFormat, content: generatedFiles, language: 'yaml' };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile?.content || '');
    showToast('Code copied to clipboard!', 'info');
  };

  const handleDownload = () => {
    const content = currentFile?.content || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let filename = 'download.txt';
    if (Array.isArray(generatedFiles)) {
      filename = currentFile.path.split('/').pop();
    } else {
      if (activeFormat === 'docker') filename = 'docker-compose.yml';
      else if (activeFormat === 'env') filename = '.env';
      else if (activeFormat === 'readme') filename = 'README.md';
      else filename = `${activeFormat}.txt`;
    }
    
    a.download = filename;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] w-full">
      {/* Format tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)]">
        {FORMAT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveFormat(tab.id); setActiveFile(0); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
              activeFormat === tab.id
                ? 'bg-brand-600/30 text-brand-500 border border-brand-500/40'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <tab.icon size={11} />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={handleCopy} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded">
          <Copy size={13} />
        </button>
        <button onClick={handleDownload} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded">
          <Download size={13} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* File tree (Express format only) */}
        {Array.isArray(generatedFiles) && (
          <div className="w-48 border-r border-[var(--border-main)] overflow-y-auto py-2 bg-[var(--bg-sidebar)]">
            {generatedFiles.map((file, i) => (
              <button
                key={file.path}
                onClick={() => setActiveFile(i)}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                  activeFile === i ? 'bg-brand-600/20 text-brand-500' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ChevronRight size={10} className="shrink-0" />
                <span className="truncate">{file.path.split('/').pop()}</span>
              </button>
            ))}
          </div>
        )}

        {/* Code panel */}
        <div className="flex-1 overflow-auto flex flex-col bg-[var(--bg-app)]">
          <div className="px-2 py-1 border-b border-[var(--border-main)] bg-[var(--bg-surface)]">
            <span className="text-[10px] text-[var(--text-muted)] font-mono">{currentFile?.path}</span>
          </div>
          <SyntaxHighlighter
            language={currentFile?.language || 'javascript'}
            style={theme === 'dark' ? vscDarkPlus : prism}
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '11px', flex: 1 }}
          >
            {currentFile?.content || '// Add nodes to generate code'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
