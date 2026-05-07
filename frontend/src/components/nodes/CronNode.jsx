import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export default function CronNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-purple-500 ring-4 ring-purple-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-purple-600 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Clock className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">Scheduler</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Schedule</div>
        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">
          {data.schedule || 'Daily at Midnight'}
        </div>
        {data.jobName && (
          <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">Job: {data.jobName}</div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
