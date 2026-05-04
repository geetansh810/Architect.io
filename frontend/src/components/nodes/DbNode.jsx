import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

export default function DbNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[180px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-slate-500 ring-4 ring-slate-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-slate-600 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Database className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Database</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Type</div>
        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
          {data.type || 'MongoDB'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
