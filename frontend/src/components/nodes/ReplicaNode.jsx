import { Handle, Position } from '@xyflow/react';
import { Copy } from 'lucide-react';

export default function ReplicaNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-slate-400 ring-4 ring-slate-400/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-slate-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Copy className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Read Replica</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Replicas</div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
          {data.replicaCount || '2'} instances
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-2">Strategy</div>
        <div className="text-xs font-mono text-[var(--text-muted)]">{data.strategy || 'Read/Write Split'}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-slate-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
