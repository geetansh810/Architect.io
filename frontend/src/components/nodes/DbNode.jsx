import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const DB_ICONS = { mongodb: 'mongodb', postgresql: 'postgresql', mysql: 'mysql' };

export default function DbNode({ data, selected }) {
  const icon = DB_ICONS[data.type] || 'mongodb';
  return (
    <ShapeWrapper nodeType="dbNode" selected={selected} data={data}>
      {/* Cylinder Header */}
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name={icon} size={18} />
        <span className="font-black text-white text-xs">{data.dbName || 'Database'}</span>
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2">
        <span className="tech-badge bg-slate-500/20 text-slate-300 text-[9px]">
          {data.type || 'MongoDB'}
        </span>
        {data.uri && (
          <div className="text-[8px] text-[var(--text-muted)] truncate max-w-[120px] font-mono">{data.uri}</div>
        )}
        {data.description && (
          <div className="text-[8px] text-[var(--text-muted)] italic text-center px-2">{data.description}</div>
        )}
      </div>

      <Handle type="target" position={Position.Top}    className="!bg-slate-400 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Left}   className="!bg-slate-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-slate-500 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
