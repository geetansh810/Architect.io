import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function CronNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="cronNode" selected={selected} data={data}>
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name="cron" size={16} />
        <span className="font-black text-white text-xs truncate max-w-[90px]">{data.jobName || 'Scheduler'}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
        <span className="text-[10px] font-black font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full">
          {data.schedule || '0 0 * * *'}
        </span>
        {data.description && (
          <span className="text-[8px] text-[var(--text-muted)] italic text-center px-2">{data.description}</span>
        )}
      </div>
      <Handle type="target" position={Position.Left}   className="!bg-purple-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-purple-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
