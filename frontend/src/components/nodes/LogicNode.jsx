import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const HOOK_COLORS = {
  'before-create': 'text-blue-400', 'after-create': 'text-emerald-400',
  'before-update': 'text-amber-400', 'after-update': 'text-orange-400',
  'before-delete': 'text-red-400',  'after-delete': 'text-rose-400',
};

// Visuals (including the code line-count badge) live in ShapeWrapper — it
// renders its own card from CATEGORY_MAP and drops everything here except
// Handles, so anything added below this line is invisible.
export default function LogicNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="logicNode" selected={selected} data={data}>
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name="express" size={16} />
        <span className="font-black text-white text-xs truncate max-w-[90px]">{data.name || 'Logic'}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
        <span className={`text-[10px] font-black ${HOOK_COLORS[data.hook] || 'text-indigo-400'}`}>
          ⚡ {data.hook || 'before-create'}
        </span>
        {data.description && (
          <span className="text-[8px] text-[var(--text-muted)] text-center px-2 italic">{data.description}</span>
        )}
      </div>
      <Handle type="target" position={Position.Left}   className="!bg-indigo-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-indigo-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Top}    className="!bg-indigo-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
