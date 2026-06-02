import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function LoadBalancerNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="loadBalancerNode" selected={selected} data={data}>
      <TechIcon name="nginx" size={28} className="mx-auto mt-4 mb-1" />
      <div className="font-black text-white text-xs text-center">Load Balancer</div>
      <div className="text-[9px] text-sky-300 font-bold text-center mt-0.5">{data.algorithm || 'Round Robin'}</div>
      {data.sslTermination && (
        <div className="text-[8px] text-green-400 font-bold text-center">🔒 SSL</div>
      )}

      <Handle type="target" position={Position.Top}    className="!bg-sky-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-sky-500 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Left}   className="!bg-sky-400 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-sky-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
