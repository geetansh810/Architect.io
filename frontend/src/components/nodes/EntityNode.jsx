import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function EntityNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="entityNode" selected={selected} data={data}>
      {/* Hexagon Header */}
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name="schema" size={16} />
        <span className="font-black text-white text-xs truncate max-w-[100px]">{data.name || 'Entity'}</span>
      </div>

      {/* Body */}
      <div className="flex-1 w-full flex flex-col justify-center py-2 px-1 gap-0.5">
        {data.fields?.length > 0 ? (
          <>
            {data.fields.slice(0, 3).map(field => (
              <div key={field.name} className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-[var(--text-main)] truncate max-w-[60px]">{field.name}</span>
                <span className="tech-badge bg-emerald-500/15 text-emerald-400">{field.type}</span>
              </div>
            ))}
            {data.fields.length > 3 && (
              <div className="text-[8px] text-[var(--text-muted)] text-center font-bold">
                +{data.fields.length - 3} more
              </div>
            )}
          </>
        ) : (
          <div className="text-[8px] text-[var(--text-muted)] text-center font-bold uppercase tracking-wider opacity-60">
            Empty Schema
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top}    className="!bg-emerald-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-emerald-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
