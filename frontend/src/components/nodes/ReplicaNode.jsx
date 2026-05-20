import { Handle, Position } from '@xyflow/react';
import { Copy } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function ReplicaNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="replicaNode" selected={selected}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 h-10 border-b border-[var(--border-main)] px-3">
        <Copy className="w-4 h-4 text-white shrink-0" />
        <span className="font-bold text-white text-xs tracking-wide">Read Replica</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center px-4 py-2">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Replicas</div>
        <div className="text-xs font-bold text-[var(--text-main)] truncate">
          {data.replicaCount || '2'} instances
        </div>
        <div className="text-[9px] font-mono text-[var(--text-muted)] truncate mt-1">
          {data.strategy || 'Read/Write Split'}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-slate-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-slate-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
