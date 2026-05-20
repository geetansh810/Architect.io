import { Handle, Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function LogicNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="logicNode" selected={selected}>
      {/* Hexagon Header */}
      <div className="flex items-center justify-center gap-1.5 h-11 w-full border-b border-indigo-600/35">
        <Cpu className="w-4 h-4 text-white" />
        <span className="font-bold text-white text-xs tracking-wide">Logic Hook</span>
      </div>

      {/* Hexagon Body */}
      <div className="flex-1 w-full flex flex-col justify-center py-2 px-1 text-center">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Hook</div>
        <div className="text-xs font-bold text-indigo-400 truncate max-w-[120px]">
          {data.hook || 'after-create'}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
