import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useArchitecture } from '../../context/ArchitectureContext';

export default function TextLabel({ id, data, selected }) {
  const { updateNodeData } = useArchitecture();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <div
      className="text-label-node"
      style={{
        outline: selected ? '1.5px dashed rgba(100,116,139,0.5)' : 'none',
        outlineOffset: '6px',
        borderRadius: 6,
        padding: '4px 8px',
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={data.text || ''}
          onChange={e => updateNodeData(id, { text: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={e => e.key === 'Enter' && setEditing(false)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: data.color || '#64748b',
            fontSize: data.fontSize || 16,
            fontWeight: data.bold ? 900 : 600,
            width: Math.max(120, (data.text?.length || 12) * (data.fontSize || 16) * 0.6),
          }}
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          style={{
            color: data.color || '#64748b',
            fontSize: data.fontSize || 16,
            fontWeight: data.bold ? 900 : 600,
            cursor: 'text',
            display: 'block',
            minWidth: 60,
          }}
        >
          {data.text || 'Double-click to edit'}
        </span>
      )}

      <Handle type="target" position={Position.Left}  style={{ opacity: 0, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 8, height: 8 }} />
    </div>
  );
}
