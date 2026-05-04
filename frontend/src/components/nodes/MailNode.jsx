import { Handle, Position } from '@xyflow/react';
import { Mail } from 'lucide-react';

export default function MailNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[180px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-rose-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Mail className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Mailer</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Provider</div>
        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
          {data.provider || 'SMTP'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-rose-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
