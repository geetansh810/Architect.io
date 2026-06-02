import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function AuthNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="authNode" selected={selected} data={data}>
      <TechIcon name="jwt" size={28} className="mx-auto mt-4 mb-1" />
      <div className="font-black text-white text-xs text-center">Auth Guard</div>
      <div className="text-[9px] text-amber-300 font-bold text-center mt-0.5">{data.method || 'JWT'}</div>
      {data.expiry && (
        <div className="text-[8px] text-[var(--text-muted)] text-center">Expires: {data.expiry}</div>
      )}

      <Handle type="target" position={Position.Top}    className="!bg-amber-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-amber-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Left}   className="!bg-amber-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
