import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const WEBHOOK_ICONS = { Stripe: 'stripe', GitHub: 'github', Slack: 'webhook', Custom: 'webhook' };

export default function WebhookNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="webhookNode" selected={selected} data={data}>
      <TechIcon name={WEBHOOK_ICONS[data.provider] || 'webhook'} size={28} className="mx-auto mt-3 mb-1" />
      <div className="font-black text-white text-xs text-center">{data.provider || 'Webhook'}</div>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${data.direction === 'Outgoing' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-purple-500/20 text-purple-300'}`}>
          {data.direction === 'Outgoing' ? '→ OUT' : '← IN'}
        </span>
      </div>
      {data.path && (
        <div className="text-[8px] text-[var(--text-muted)] font-mono text-center mt-0.5 truncate px-4">{data.path}</div>
      )}
      <Handle type="target" position={Position.Left}   className="!bg-fuchsia-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-fuchsia-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
