import { Handle, Position } from '@xyflow/react';
import { Globe2 } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function CdnNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="cdnNode" selected={selected}>
      {/* Icon placed nicely in the center-top */}
      <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/25 mb-1.5 shadow-sm">
        <Globe2 className="w-5 h-5 text-amber-400" />
      </div>

      {/* Label and descriptive text */}
      <h4 className="font-black text-[var(--text-main)] text-xs text-center tracking-wide">
        CDN / Edge
      </h4>
      <p className="text-[9px] font-semibold text-amber-400 mt-1 max-w-[110px] text-center leading-snug truncate">
        {data.provider || 'Cloudflare'}
      </p>

      {/* Connectors placed exactly at diamond vertices */}
      <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
