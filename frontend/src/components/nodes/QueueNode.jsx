import { Handle, Position } from '@xyflow/react';
import ShapeWrapper from './ShapeWrapper';
import TechIcon from './TechIcons';

const BROKER_ICONS = { Kafka: 'kafka', SQS: 'sqs', RabbitMQ: 'rabbitmq', 'Pub/Sub': 'kafka' };

export default function QueueNode({ data, selected }) {
  return (
    <ShapeWrapper nodeType="queueNode" selected={selected} data={data}>
      <div className="flex items-center justify-center gap-2 h-11 w-full">
        <TechIcon name={BROKER_ICONS[data.broker] || 'kafka'} size={18} />
        <span className="font-black text-white text-xs">{data.broker || 'Kafka'}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
        <span className="tech-badge bg-orange-500/15 text-orange-300 font-mono text-[9px]">
          {data.topic || 'events'}
        </span>
        <span className="text-[8px] text-[var(--text-muted)]">
          {data.partitions || 3} partitions · {data.consumerGroup || 'service'}
        </span>
        {data.description && (
          <span className="text-[8px] text-[var(--text-muted)] italic text-center px-2">{data.description}</span>
        )}
      </div>
      <Handle type="target" position={Position.Left}   className="!bg-orange-500 !border-[var(--bg-surface)]" />
      <Handle type="source" position={Position.Right}  className="!bg-orange-400 !border-[var(--bg-surface)]" />
      <Handle type="target" position={Position.Top}    className="!bg-orange-400 !border-[var(--bg-surface)]" />
    </ShapeWrapper>
  );
}
