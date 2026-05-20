import { Handle, Position } from '@xyflow/react';
import { Mail } from 'lucide-react';
import ShapeWrapper from './ShapeWrapper';

export default function MailNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="mailNode" selected={selected}>
      {/* Centered cloud contents */}
      <div className="p-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 mb-1 shadow-sm">
        <Mail className="w-5 h-5 text-rose-400" />
      </div>

      <h4 className="font-black text-[var(--text-main)] text-xs tracking-wide">
        Mailer
      </h4>
      
      <p className="text-[10px] font-semibold text-rose-400 max-w-[120px] truncate leading-tight mt-0.5">
        {data.provider || 'SMTP'}
      </p>

      <Handle type="source" position={Position.Bottom} className="!bg-rose-500 !w-3 !h-3 !border-2 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
