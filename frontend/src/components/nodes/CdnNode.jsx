import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function CdnNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="cdnNode" selected={selected} data={data}>
      <TechIcon name="cloudflare" size={30} className="mx-auto mt-4 mb-1" />
      <div className="font-black text-white text-xs text-center">{data.provider || 'CDN'}</div>
      <div className="text-[9px] text-amber-300 font-bold text-center mt-0.5">{data.regions || 'Global'}</div>
      <div className="text-[8px] text-[var(--text-muted)] text-center font-mono">{data.redirectType || 'HTTP 302'}</div>

      <Handle type="target" position={Position.Top}    className="!bg-amber-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Left}   className="!bg-amber-400 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-amber-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
