import { Handle, Position } from '@xyflow/react';
import { Globe, Shield } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function ApiNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="apiNode" selected={selected}>
      <div className="bg-blue-600 px-4 py-3 flex items-center justify-between border-b border-[var(--border-main)]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-white" />
          <h4 className="font-black text-white text-sm">API Route</h4>
        </div>
        {data.authEnabled && <Shield className="w-3.5 h-3.5 text-white/80" />}
      </div>

      <div className="p-4 bg-[var(--bg-surface)]">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Path</div>
        <div className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 truncate">
          {data.route || '/api/resource'}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
