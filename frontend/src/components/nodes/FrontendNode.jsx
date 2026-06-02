import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const TECH_ICONS = {
  'React': 'react', 'Next.js': 'nextjs', 'Vue': 'react', 'Angular': 'react',
  'React Native': 'mobile', 'Expo': 'mobile',
};

export default function FrontendNode({ data, selected }) {
  const icon = TECH_ICONS[data.framework || data.technology] || 'browser';
  return (
    <ShapeWrapper nodeType="frontendNode" selected={selected} data={data}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-cyan-700/90 border-b border-cyan-600/40">
        <div className="flex items-center gap-2">
          <TechIcon name={icon} size={16} />
          <span className="font-black text-white text-sm truncate max-w-[120px]">{data.name || 'Frontend App'}</span>
        </div>
        <span className="text-[8px] font-black bg-cyan-500/20 text-cyan-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
          {data.technology || 'Web'}
        </span>
      </div>
      <div className="p-3 space-y-1">
        {data.framework && (
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-[var(--text-muted)] font-bold uppercase tracking-widest">Framework</span>
            <span className="font-black text-cyan-400">{data.framework}</span>
          </div>
        )}
        {data.description && (
          <div className="text-[8px] text-[var(--text-muted)] italic">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right}  className="!bg-cyan-500 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Left}   className="!bg-cyan-400 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
