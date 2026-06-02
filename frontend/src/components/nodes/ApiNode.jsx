import { Handle, Position } from '@xyflow/react';
import { Shield, Lock } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

export default function ApiNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="apiNode" selected={selected} data={data}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-blue-700/90 border-b border-blue-600/40">
        <div className="flex items-center gap-2">
          <TechIcon name="rest" size={16} />
          <span className="font-black text-white text-sm">API Route</span>
        </div>
        {data.authEnabled && (
          <span className="flex items-center gap-1 text-[9px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
            <Lock size={8} /> Auth
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-3 space-y-1.5">
        <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Route</div>
        <div className="text-xs font-black font-mono text-blue-400 truncate bg-blue-500/10 px-2 py-1 rounded-lg">
          {data.route || '/api/resource'}
        </div>
        {data.description && (
          <div className="text-[9px] text-[var(--text-muted)] truncate italic pt-0.5">{data.description}</div>
        )}
      </div>

      <Handle type="target" position={Position.Left}   className="!bg-blue-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-indigo-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Top}    className="!bg-blue-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
