import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function CacheNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="cacheNode" selected={selected} data={data}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-red-700/90 border-b border-red-600/40">
        <div className="flex items-center gap-2">
          <TechIcon name="redis" size={16} />
          <span className="font-black text-white text-sm">{data.provider || 'Cache'}</span>
        </div>
        <span className="text-[9px] font-black bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded-full">
          {data.evictionPolicy || 'LRU'}
        </span>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest">TTL</span>
          <span className="font-black font-mono text-red-400">{data.ttl || 3600}s</span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest">Strategy</span>
          <span className="font-black text-red-300">{data.strategy || 'Cache-Aside'}</span>
        </div>
        {data.description && (
          <div className="text-[8px] text-[var(--text-muted)] italic pt-0.5">{data.description}</div>
        )}
      </div>
      <Handle type="target" position={Position.Left}   className="!bg-red-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-red-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Top}    className="!bg-red-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
