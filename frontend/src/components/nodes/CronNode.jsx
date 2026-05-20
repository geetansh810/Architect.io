import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function CronNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="cronNode" selected={selected}>
      {/* Header */}
      <div className="flex items-center gap-2 h-10 border-b border-purple-600/35 px-1">
        <Clock className="w-4 h-4 text-white shrink-0" />
        <span className="font-bold text-white text-xs tracking-wide">Scheduler</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center py-2 px-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Schedule</span>
          <span className="text-xs font-bold text-purple-400 truncate max-w-[110px]">
            {data.schedule || 'Daily'}
          </span>
        </div>
        {data.jobName && (
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job</span>
            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[110px]">
              {data.jobName}
            </span>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="!bg-purple-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
