import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function EntityNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="entityNode" selected={selected}>
      {/* Hexagon Header — fits inside top 44px band */}
      <div className="flex items-center justify-center gap-1.5 h-11 w-full border-b border-emerald-600/35">
        <Database className="w-4 h-4 text-white" />
        <span className="font-bold text-white text-xs truncate max-w-[100px]">{data.name || 'Entity'}</span>
      </div>

      {/* Hexagon Body — rest of shape */}
      <div className="flex-1 w-full flex flex-col justify-center py-2 px-1">
        {data.fields && data.fields.length > 0 ? (
          <div className="space-y-1">
            {data.fields.slice(0, 3).map(field => (
              <div key={field.name} className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-[var(--text-main)] truncate max-w-[65px]">{field.name}</span>
                <span className="text-emerald-400 font-semibold uppercase text-[8px]">{field.type}</span>
              </div>
            ))}
            {data.fields.length > 3 && (
              <div className="text-[8px] text-[var(--text-muted)] text-center font-bold">
                +{data.fields.length - 3} more fields
              </div>
            )}
          </div>
        ) : (
          <div className="text-[8px] text-[var(--text-muted)] text-center font-bold uppercase tracking-wider opacity-60">
            Empty Schema
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
