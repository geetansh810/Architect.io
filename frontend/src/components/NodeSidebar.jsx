import { Database, Shield, Mail, Cpu, Globe, Info, X, Filter, Upload, Clock, Webhook, PlayCircle, Zap, SplitSquareVertical, Globe2, Layers, Hash, Copy } from 'lucide-react';
import { useState } from 'react';
import { startBuilderTour } from '../utils/tour';

const nodeDocs = {
  entityNode: {
    title: 'Database Entity',
    desc: 'Defines a Mongoose schema. Use this to structure your data models.',
    usage: 'Drag to canvas, add fields like name, type, and required status.',
    variables: 'name (String), fields (Array)'
  },
  apiNode: {
    title: 'API Endpoint',
    desc: 'Exposes CRUD operations for a connected entity.',
    usage: 'Connect an Entity node to this node to generate GET, POST, PUT, DELETE routes.',
    variables: 'route (String), authEnabled (Boolean)'
  },
  logicNode: {
    title: 'Business Logic',
    desc: 'Custom code execution triggered by lifecycle hooks.',
    usage: 'Connect an API node to this node. Choose a hook like "after-create".',
    variables: 'name (String), hook (Enum)'
  },
  authNode: {
    title: 'Auth Config',
    desc: 'Global authentication settings for your backend.',
    usage: 'Configure JWT secret, expiry, and methods.',
    variables: 'method (String), secret (String), expiry (String)'
  },
  dbNode: {
    title: 'Database Config',
    desc: 'Connection settings for your MongoDB/PostgreSQL instance.',
    usage: 'Set the connection URI and database name.',
    variables: 'type (String), uri (String), dbName (String)'
  },
  mailNode: {
    title: 'Mailer Service',
    desc: 'Configure email providers like SendGrid or SMTP.',
    usage: 'Set API keys and sender identities.',
    variables: 'provider (String), fromEmail (String)'
  },
  middlewareNode: {
    title: 'Middleware',
    desc: 'Add reusable logic to your request-response cycle.',
    usage: 'Place between Entity and API nodes to add logging, rate limiting, or validation.',
    variables: 'middlewareType (Enum), config (Object)'
  },
  storageNode: {
    title: 'File Storage',
    desc: 'Handle file uploads and cloud storage integration.',
    usage: 'Configure max file sizes and storage providers like AWS S3 or Cloudinary.',
    variables: 'provider (String), maxSizeMB (Number)'
  },
  cronNode: {
    title: 'Scheduler',
    desc: 'Execute tasks on a recurring schedule.',
    usage: 'Define visual schedules (Daily, Hourly) or custom cron expressions.',
    variables: 'jobName (String), schedule (String)'
  },
  webhookNode: {
    title: 'Webhook',
    desc: 'Send or receive automated event-driven HTTP requests.',
    usage: 'Integrate with third-party services like Stripe, GitHub, or Slack.',
    variables: 'direction (Enum), provider (String)'
  },
  cacheNode: {
    title: 'Cache Layer',
    desc: 'In-memory data store for sub-millisecond reads. Essential for the fast redirect path (< 100ms).',
    usage: 'Place between API Route and Database nodes. The hot read path checks cache first, falls back to DB.',
    variables: 'provider (String: Redis/Memcached), evictionPolicy (LRU/LFU), ttl (seconds), strategy (Cache-Aside/Write-Through)'
  },
  loadBalancerNode: {
    title: 'Load Balancer',
    desc: 'Distributes incoming traffic across multiple application server instances for horizontal scaling.',
    usage: 'Place at the entry point of your architecture, before your API nodes.',
    variables: 'algorithm (Round Robin/Least Connections/IP Hash), healthPath (String), intervalSec (Number)'
  },
  cdnNode: {
    title: 'CDN / Edge',
    desc: 'Content Delivery Network that caches responses at edge locations globally for minimum latency.',
    usage: 'Place at the ingress. For URL shorteners, use 302 redirects so redirects are not cached by browsers.',
    variables: 'provider (Cloudflare/CloudFront/Fastly), redirectType (301/302), regions (String)'
  },
  queueNode: {
    title: 'Message Queue',
    desc: 'Async message broker for decoupling write-heavy operations like click analytics from the hot redirect path.',
    usage: 'Connect from API node (producer) to Logic Hook (consumer). Use for write-behind analytics.',
    variables: 'broker (Kafka/SQS/RabbitMQ), topic (String), consumerGroup (String), partitions (Number)'
  },
  counterServiceNode: {
    title: 'ID Generator',
    desc: 'Distributed counter service for generating unique, sequential short codes via atomic Redis INCR + Base62 encoding.',
    usage: 'Connect to Logic Hook nodes that create short URLs. The counter atomically allocates batches of IDs.',
    variables: 'strategy (Counter+Base62/Hash/Snowflake), encoding (Base62/Base58), batchSize (Number), codeLength (Number)'
  },
  replicaNode: {
    title: 'Read Replica',
    desc: 'Read-only database replica to scale read throughput. Redirect path reads from replicas; writes go to primary.',
    usage: 'Connect from your primary DB node. Set the split strategy to route reads vs writes appropriately.',
    variables: 'replicaCount (Number), strategy (Read/Write Split), lagToleranceMs (Number)'
  }
};

export default function NodeSidebar() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [popoverY, setPopoverY] = useState(0);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (type, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverY(rect.top);
    setSelectedDoc(nodeDocs[type]);
  };

  const NodeItem = ({ type, icon: Icon, label, color }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] cursor-grab hover:border-brand-500 hover:shadow-md transition-all group active:cursor-grabbing`}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} text-white`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <button 
        onClick={(e) => handleNodeClick(type, e)}
        className="p-1.5 text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-colors"
        title="Node Info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <aside className="h-full w-72 border-r border-[var(--border-main)] bg-[var(--bg-sidebar)] p-6 flex flex-col gap-8 shrink-0 relative overflow-y-auto">
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Core Entities</h3>
        <div className="space-y-3" id="tour-core-nodes">
          <NodeItem type="entityNode" icon={Database} label="Data Model" color="bg-emerald-500" />
          <NodeItem type="apiNode" icon={Globe} label="API Route" color="bg-blue-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Architecture</h3>
        <div className="space-y-3" id="tour-arch-nodes">
          <NodeItem type="authNode" icon={Shield} label="Auth Guard" color="bg-amber-500" />
          <NodeItem type="dbNode" icon={Database} label="Database" color="bg-slate-700" />
          <NodeItem type="mailNode" icon={Mail} label="Mailer" color="bg-rose-500" />
          <NodeItem type="middlewareNode" icon={Filter} label="Middleware" color="bg-cyan-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Operations</h3>
        <div className="space-y-3">
          <NodeItem type="logicNode" icon={Cpu} label="Logic Hook" color="bg-indigo-500" />
          <NodeItem type="cronNode" icon={Clock} label="Scheduler" color="bg-purple-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Integrations</h3>
        <div className="space-y-3">
          <NodeItem type="storageNode" icon={Upload} label="File Upload" color="bg-orange-500" />
          <NodeItem type="webhookNode" icon={Webhook} label="Webhook" color="bg-fuchsia-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Infrastructure</h3>
        <div className="space-y-3">
          <NodeItem type="cacheNode" icon={Zap} label="Cache Layer" color="bg-red-500" />
          <NodeItem type="loadBalancerNode" icon={SplitSquareVertical} label="Load Balancer" color="bg-sky-600" />
          <NodeItem type="cdnNode" icon={Globe2} label="CDN / Edge" color="bg-amber-500" />
          <NodeItem type="queueNode" icon={Layers} label="Message Queue" color="bg-orange-500" />
          <NodeItem type="counterServiceNode" icon={Hash} label="ID Generator" color="bg-violet-600" />
          <NodeItem type="replicaNode" icon={Copy} label="Read Replica" color="bg-slate-500" />
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <button
          onClick={() => startBuilderTour(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 font-bold hover:bg-brand-500/20 transition-all"
        >
          <PlayCircle size={18} />
          Take a Tour
        </button>
        <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
          <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-1">Pro Tip</p>
          <p className="text-xs text-[var(--text-muted)] leading-tight">
            Drag nodes to the canvas to start architecting. Click the info icon for documentation.
          </p>
        </div>
      </div>

      {/* Documentation Popover — fixed near clicked node */}
      {selectedDoc && (
        <div
          className="fixed z-50 w-72 bg-[var(--bg-sidebar)] border border-[var(--border-main)] rounded-2xl shadow-2xl flex flex-col"
          style={{
            left: 292,
            top: Math.max(16, Math.min(popoverY, window.innerHeight - 48)),
            maxHeight: `calc(100vh - ${Math.max(16, Math.min(popoverY, window.innerHeight - 48))}px - 16px)`,
          }}
        >
          {/* Fixed header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-main)] shrink-0">
            <h4 className="text-base font-black text-[var(--text-main)]">{selectedDoc.title}</h4>
            <button
              onClick={() => setSelectedDoc(null)}
              className="p-1.5 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-500">Description</label>
              <p className="text-sm mt-1 leading-relaxed text-[var(--text-main)]">{selectedDoc.desc}</p>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-500">How to use</label>
              <p className="text-sm mt-1 leading-relaxed text-[var(--text-main)]">{selectedDoc.usage}</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)]">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Data Variables</label>
              <p className="text-xs font-mono mt-1 text-brand-600 dark:text-brand-400 break-words">{selectedDoc.variables}</p>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="p-4 border-t border-[var(--border-main)] shrink-0">
            <button
              onClick={() => setSelectedDoc(null)}
              className="w-full py-2.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 rounded-xl font-bold transition-colors text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
