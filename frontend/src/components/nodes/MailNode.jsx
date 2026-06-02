import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const MAIL_ICONS = { SMTP: 'smtp', SendGrid: 'sendgrid', Mailgun: 'smtp' };

export default function MailNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="mailNode" selected={selected} data={data}>
      <TechIcon name={MAIL_ICONS[data.provider] || 'smtp'} size={28} className="mx-auto mt-3 mb-1" />
      <div className="font-black text-white text-xs text-center">{data.provider || 'Mailer'}</div>
      {data.fromEmail && (
        <div className="text-[9px] text-rose-300 font-mono text-center truncate px-4 mt-0.5">{data.fromEmail}</div>
      )}
      <Handle type="target" position={Position.Left}   className="!bg-rose-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-rose-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
