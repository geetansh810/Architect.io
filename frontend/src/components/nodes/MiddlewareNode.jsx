import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const MW_COLORS = {
  'Rate Limiter': 'text-cyan-400',
  'Logger': 'text-blue-400',
  'CORS': 'text-green-400',
  'Validator': 'text-violet-400',
  'Custom': 'text-slate-400',
};

export default function MiddlewareNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="middlewareNode" selected={selected} data={data}>
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name="express" size={16} />
        <span className="font-black text-white text-xs">Middleware</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1.5">
        <span className={`text-[10px] font-black ${MW_COLORS[data.middlewareType] || 'text-cyan-400'}`}>
          {data.middlewareType || 'Rate Limiter'}
        </span>
        {data.middlewareType === 'Rate Limiter' && data.config?.maxRequests && (
          <span className="text-[8px] text-[var(--text-muted)] font-mono">
            {data.config.maxRequests} req / {Math.round((data.config.windowMs || 900000) / 60000)}m
          </span>
        )}
        {data.description && (
          <span className="text-[8px] text-[var(--text-muted)] italic text-center px-2">{data.description}</span>
        )}
      </div>
      <Handle type="target" position={Position.Left}   className="!bg-cyan-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-cyan-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Top}    className="!bg-cyan-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
