import { Handle, Position } from '@xyflow/react';
import { Filter } from 'lucide-react';

export default function MiddlewareNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-cyan-500 ring-4 ring-cyan-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-cyan-500 px-4 py-3 flex items-center justify-between border-b border-[var(--border-main)]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <h4 className="font-black text-white text-sm">Middleware</h4>
        </div>
      </div>
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Type</div>
        <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 truncate">
          {data.middlewareType || 'Rate Limiter'}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
