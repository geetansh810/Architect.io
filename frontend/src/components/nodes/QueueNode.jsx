import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function QueueNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="queueNode" selected={selected}>
      {/* Header — matches the skewed header polygon (40px high) */}
      <div className="flex items-center gap-2 h-10 border-b border-orange-600/35 px-1">
        <Layers className="w-4 h-4 text-white shrink-0" />
        <span className="font-bold text-white text-xs tracking-wide">Message Queue</span>
      </div>

      {/* Body — fits perfectly inside the rest of the shape */}
      <div className="flex-1 flex flex-col justify-center py-2 px-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Broker</span>
          <span className="text-xs font-bold text-orange-400 truncate max-w-[120px]">
            {data.broker || 'Kafka'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Topic</span>
          <span className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[120px]">
            {data.topic || 'events'}
          </span>
        </div>
      </div>

      {/* Position handles exactly at the edge vertices */}
      <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
