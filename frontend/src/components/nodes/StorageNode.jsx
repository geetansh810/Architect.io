import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function StorageNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="storageNode" selected={selected} data={data}>
      <TechIcon name="awss3" size={26} className="mx-auto mt-3 mb-1" />
      <div className="font-black text-white text-xs text-center">{data.provider || 'Storage'}</div>
      <div className="text-[9px] text-orange-300 font-bold text-center mt-0.5">
        Max {data.maxSizeMB || 5}MB
      </div>
      <Handle type="target" position={Position.Left}  className="!bg-orange-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-orange-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
