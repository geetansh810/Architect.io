import { Handle, Position } from '@xyflow/react';
import { Hash } from 'lucide-react';

export default function CounterServiceNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-violet-500 ring-4 ring-violet-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-violet-600 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Hash className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">ID Generator</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Strategy</div>
        <div className="text-xs font-bold text-violet-600 dark:text-violet-400 truncate">
          {data.strategy || 'Counter + Base62'}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-2">Batch Size</div>
        <div className="text-xs font-mono text-[var(--text-muted)]">{data.batchSize || '1000'} IDs</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-violet-600 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
