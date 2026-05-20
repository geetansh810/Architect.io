import { Handle, Position } from '@xyflow/react';
import { SplitSquareVertical } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function LoadBalancerNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="loadBalancerNode" selected={selected}>
      {/* Icon placed nicely in the center-top */}
      <div className="p-2 rounded-full bg-sky-500/10 border border-sky-500/25 mb-1.5 shadow-sm">
        <SplitSquareVertical className="w-5 h-5 text-sky-400" />
      </div>

      {/* Label and descriptive text */}
      <h4 className="font-black text-[var(--text-main)] text-xs text-center tracking-wide">
        Load Balancer
      </h4>
      <p className="text-[9px] font-semibold text-sky-400 mt-1 max-w-[110px] text-center leading-snug truncate">
        {data.algorithm || 'Round Robin'}
      </p>

      {/* Connectors placed exactly at diamond vertices */}
      <Handle type="target" position={Position.Left} className="!bg-sky-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-sky-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
