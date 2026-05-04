import { Handle, Position } from '@xyflow/react';
import { Shield } from 'lucide-react';

export default function AuthNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[180px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-amber-500 ring-4 ring-amber-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-amber-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Shield className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Auth Config</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Method</div>
        <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
          {data.method || 'JWT'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
