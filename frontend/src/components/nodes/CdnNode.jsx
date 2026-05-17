import { Handle, Position } from '@xyflow/react';
import { Globe2 } from 'lucide-react';

export default function CdnNode({ data, selected }) {
  return (
    <div className={`bg-[var(--bg-surface)] border-2 rounded-2xl overflow-hidden min-w-[200px] min-h-[80px] transition-all shadow-xl ${selected ? 'border-amber-500 ring-4 ring-amber-500/10' : 'border-[var(--border-main)]'}`}>
      <div className="bg-amber-500 px-4 py-3 flex items-center gap-2 border-b border-[var(--border-main)]">
        <Globe2 className="w-4 h-4 text-white" />
        <h4 className="font-black text-white text-sm">CDN / Edge</h4>
      </div>
      <div className="p-4 bg-[var(--bg-surface)] space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Provider</div>
        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 truncate">
          {data.provider || 'Cloudflare'}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-2">Redirect</div>
        <div className="text-xs font-mono text-[var(--text-muted)]">{data.redirectType || 'HTTP 302'}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-4 !h-4 !border-2 !border-[var(--bg-surface)]" />
    </div>
  );
}
