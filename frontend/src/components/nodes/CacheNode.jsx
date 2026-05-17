import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export default function CacheNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-red-500 ring-4 ring-red-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-red-500 px-4 py-3 flex items-center justify-between border-b border-[var(--border-main)]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-white" />
          <h4 className="font-black text-white text-sm">Cache Layer</h4>
        </div>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Provider</div>
        <div className="text-xs font-bold text-red-500 dark:text-red-400 truncate">
          {data.provider || 'Redis'}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-2">TTL</div>
        <div className="text-xs font-mono text-[var(--text-muted)]">{data.ttl || '3600'}s</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-red-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-red-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
