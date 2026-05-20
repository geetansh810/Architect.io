import { Handle, Position } from '@xyflow/react';
import { Webhook } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function WebhookNode({ data, selected }) {
  const isIncoming = data.direction === 'Incoming';

  return (
    <ShapeWrapper nodeType="webhookNode" selected={selected}>
      {/* Centered cloud contents */}
      <div className="p-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/25 mb-1 shadow-sm">
        <Webhook className="w-5 h-5 text-fuchsia-400" />
      </div>

      <h4 className="font-black text-[var(--text-main)] text-xs tracking-wide">
        Webhook
      </h4>
      
      <p className="text-[10px] font-semibold text-fuchsia-400 max-w-[120px] truncate leading-tight mt-0.5">
        {data.provider || 'Custom Webhook'}
      </p>

      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider mt-1.5 border ${
        isIncoming 
          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      }`}>
        {data.direction || 'Incoming'}
      </span>

      <Handle type="target" position={Position.Left} className="!bg-fuchsia-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right} className="!bg-fuchsia-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
