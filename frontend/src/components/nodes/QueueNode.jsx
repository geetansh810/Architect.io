import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';

export default function QueueNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-orange-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Layers className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Message Queue</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Broker</div>
        <div className="text-xs font-bold text-orange-600 dark:text-orange-400 truncate">
          {data.broker || 'Kafka'}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-2">Topic</div>
        <div className="text-xs font-mono text-[var(--text-muted)] truncate">{data.topic || 'events'}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-orange-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-orange-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
