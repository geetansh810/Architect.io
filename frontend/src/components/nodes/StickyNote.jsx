import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useArchitecture } from '../../context/ArchitectureContext';

const NOTE_COLORS = {
  yellow: { bg: '#fef3c7', border: '#fbbf24', text: '#78350f', header: '#fde68a' },
  pink:   { bg: '#fce7f3', border: '#f472b6', text: '#831843', header: '#fbcfe8' },
  blue:   { bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a', header: '#bfdbfe' },
  green:  { bg: '#d1fae5', border: '#34d399', text: '#064e3b', header: '#a7f3d0' },
  purple: { bg: '#ede9fe', border: '#a78bfa', text: '#4c1d95', header: '#ddd6fe' },
};

export default function StickyNote({ id, data, selected }) {
  const { updateNodeData } = useArchitecture();
  const [editing, setEditing] = useState(false);
  const textRef = useRef(null);
  const palette = NOTE_COLORS[data.color || 'yellow'];

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
      const len = textRef.current.value.length;
      textRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  return (
    <div
      className="sticky-note-node"
      style={{
        background: palette.bg,
        borderTop: `4px solid ${palette.border}`,
        border: `1px solid ${palette.border}66`,
        minWidth: 180,
        minHeight: 120,
        maxWidth: 260,
        outline: selected ? `2px solid ${palette.border}` : 'none',
        outlineOffset: '3px',
      }}
    >
      {/* Color strip top */}
      <div
        className="h-8 flex items-center px-3 gap-2 cursor-grab"
        style={{ background: palette.header }}
      >
        {['yellow','pink','blue','green','purple'].map(c => (
          <button
            key={c}
            onMouseDown={e => { e.stopPropagation(); updateNodeData(id, { color: c }); }}
            className="w-3 h-3 rounded-full border-2 transition-transform hover:scale-125"
            style={{
              background: NOTE_COLORS[c].bg,
              borderColor: NOTE_COLORS[c].border,
              outline: data.color === c ? `2px solid ${NOTE_COLORS[c].border}` : 'none',
              outlineOffset: '1px',
            }}
          />
        ))}
      </div>

      {/* Editable content */}
      <div className="p-3" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <textarea
            ref={textRef}
            value={data.content || ''}
            onChange={e => updateNodeData(id, { content: e.target.value })}
            onBlur={() => setEditing(false)}
            rows={4}
            className="w-full resize-none text-sm leading-relaxed outline-none"
            style={{ background: 'transparent', color: palette.text, border: 'none' }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: palette.text, minHeight: 72 }}
          >
            {data.content || '📝 Double-click to edit'}
          </p>
        )}
      </div>

      <Handle type="target" position={Position.Left}  className="!bg-gray-400 !border-white" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !border-white" />
    </div>
  );
}
