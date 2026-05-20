import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function DbNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="dbNode" selected={selected}>
      {/* Header — fits into the top cap of the cylinder */}
      <div className="flex items-center justify-center gap-2 h-10 border-b border-[var(--border-main)] px-3">
        <Database className="w-4 h-4 text-white shrink-0" />
        <span className="font-bold text-white text-xs tracking-wide">Database</span>
      </div>

      {/* Body — cylinder face */}
      <div className="flex-1 flex flex-col justify-center px-4 py-2">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Type</div>
        <div className="text-xs font-bold text-[var(--text-main)] truncate">
          {data.type || 'MongoDB'}
        </div>
        {data.dbName && (
          <div className="text-[10px] text-[var(--text-muted)] truncate mt-1">{data.dbName}</div>
        )}
      </div>

      {/* Position handles perfectly outside the cylinder caps */}
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
