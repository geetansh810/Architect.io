import { Handle, Position } from '@xyflow/react';
import { Filter } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function MiddlewareNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="middlewareNode" selected={selected}>
      {/* Hexagon Header */}
      <div className="flex items-center justify-center gap-1.5 h-11 w-full border-b border-cyan-600/35">
        <Filter className="w-4 h-4 text-white" />
        <span className="font-bold text-white text-xs tracking-wide">Middleware</span>
      </div>

      {/* Hexagon Body */}
      <div className="flex-1 w-full flex flex-col justify-center py-2 px-1 text-center">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Type</div>
        <div className="text-xs font-bold text-cyan-400 truncate max-w-[120px]">
          {data.middlewareType || 'Rate Limiter'}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
