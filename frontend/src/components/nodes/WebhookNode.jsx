import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';

export default function WebhookNode({ data, selected }) {
  const isIncoming = data.direction === 'Incoming';

  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-fuchsia-500 ring-4 ring-fuchsia-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-fuchsia-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Webhook className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Webhook</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Type</div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter ${isIncoming ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {data.direction || 'Incoming'}
          </span>
        </div>
        <div className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 truncate">
          {data.provider || 'Custom Webhook'}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-fuchsia-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-fuchsia-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
