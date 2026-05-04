import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

export default function EntityNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[220px] min-h-[100px] transition-all shadow-xl ${selected ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Database className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">{data.name || 'Entity'}</h4>
      </div>
      
      <div className="p-4 bg-[var(--bg-surface)]">
        {data.fields && data.fields.length > 0 ? (
          <div className="space-y-2">
            {data.fields.map(field => (
              <div key={field.name} className="flex items-center justify-between text-xs font-bold">
                <span className="text-[var(--text-main)]">{field.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-black">{field.type}</span>
                  {field.required && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-[var(--text-muted)] text-center py-4 font-black uppercase tracking-widest opacity-50">Empty Schema</div>
        )}
      </div>
      
      <Handle type="target" position={Position.Top} className="!bg-[var(--border-main)] !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
