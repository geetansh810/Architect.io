import { Handle, Position } from '@xyflow/react';
import { SplitSquareVertical } from 'lucide-react';

export default function LoadBalancerNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-sky-500 ring-4 ring-sky-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-sky-600 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <SplitSquareVertical className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Load Balancer</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Algorithm</div>
        <div className="text-xs font-bold text-sky-600 dark:text-sky-400 truncate">
          {data.algorithm || 'Round Robin'}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-2">Health Check</div>
        <div className="text-xs font-mono text-[var(--text-muted)]">/{data.healthPath || 'health'} every {data.intervalSec || '30'}s</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-sky-600 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-sky-600 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
