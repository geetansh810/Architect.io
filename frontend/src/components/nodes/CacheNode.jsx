import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function CacheNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="cacheNode" selected={selected}>
      <div className="bg-red-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Zap className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Cache Layer</h4>
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
    </ShapeWrapper>
  );
}
