import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function ReplicaNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="replicaNode" selected={selected} data={data}>
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name="mongodb" size={16} />
        <span className="font-black text-white text-xs">Read Replica</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(data.replicaCount || 2, 4) }).map((_, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-slate-500/40 border border-slate-400/50 flex items-center justify-center text-[7px] font-black text-slate-300">
              {i + 1}
            </div>
          ))}
        </div>
        <span className="text-[8px] text-[var(--text-muted)]">{data.strategy || 'Read/Write Split'}</span>
        <span className="text-[8px] text-slate-400 font-mono">lag ≤ {data.lagToleranceMs || 100}ms</span>
      </div>
      <Handle type="target" position={Position.Top}    className="!bg-slate-400 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Left}   className="!bg-slate-500 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
