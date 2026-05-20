import { Handle, Position } from '@xyflow/react';
import { Hash } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function CounterServiceNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="counterServiceNode" selected={selected}>
      {/* Hexagon Header */}
      <div className="flex items-center justify-center gap-1.5 h-11 w-full border-b border-violet-600/35">
        <Hash className="w-4 h-4 text-white" />
        <span className="font-bold text-white text-xs tracking-wide">ID Generator</span>
      </div>

      {/* Hexagon Body */}
      <div className="flex-1 w-full flex flex-col justify-center py-2 px-1 text-center">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Strategy</div>
        <div className="text-xs font-bold text-violet-400 truncate max-w-[120px]">
          {data.strategy || 'Counter + Base62'}
        </div>
        <div className="text-[9px] font-mono text-[var(--text-muted)] mt-0.5">
          Batch: {data.batchSize || '1000'}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-violet-600 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-violet-600 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
