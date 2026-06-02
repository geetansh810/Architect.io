import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function CounterServiceNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="counterServiceNode" selected={selected} data={data}>
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name="redis" size={16} />
        <span className="font-black text-white text-xs">ID Generator</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
        <span className="tech-badge bg-violet-500/15 text-violet-300 text-[9px]">
          {data.strategy || 'Counter + Base62'}
        </span>
        <span className="text-[8px] text-[var(--text-muted)] font-mono">
          {data.encoding || 'Base62'} · {data.codeLength || 7} chars
        </span>
        <span className="text-[8px] text-[var(--text-muted)]">
          batch: {data.batchSize || 1000}
        </span>
      </div>
      <Handle type="target" position={Position.Left}   className="!bg-violet-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-violet-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
