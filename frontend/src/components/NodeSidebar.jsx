import { Database, Shield, Mail, Cpu, Globe, Info, X } from 'lucide-react';
import { useState } from 'react';

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
  }
};

export default function NodeSidebar() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleNodeClick = (type) => {
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
        onClick={() => handleNodeClick(type)}
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
        <div className="space-y-3">
          <NodeItem type="entityNode" icon={Database} label="Data Model" color="bg-emerald-500" />
          <NodeItem type="apiNode" icon={Globe} label="API Route" color="bg-blue-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Architecture</h3>
        <div className="space-y-3">
          <NodeItem type="authNode" icon={Shield} label="Auth Guard" color="bg-amber-500" />
          <NodeItem type="dbNode" icon={Database} label="Database" color="bg-slate-700" />
          <NodeItem type="mailNode" icon={Mail} label="Mailer" color="bg-rose-500" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Operations</h3>
        <div className="space-y-3">
          <NodeItem type="logicNode" icon={Cpu} label="Logic Hook" color="bg-indigo-500" />
        </div>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10">
        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-1">Pro Tip</p>
        <p className="text-xs text-[var(--text-muted)] leading-tight">
          Drag nodes to the canvas to start architecting. Click the info icon for documentation.
        </p>
      </div>

      {/* Documentation Overlay */}
      {selectedDoc && (
        <div className="absolute inset-0 bg-[var(--bg-sidebar)] z-50 p-6 animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-black">{selectedDoc.title}</h4>
            <button 
              onClick={() => setSelectedDoc(null)}
              className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-500">Description</label>
              <p className="text-sm mt-1 leading-relaxed">{selectedDoc.desc}</p>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-500">How to use</label>
              <p className="text-sm mt-1 leading-relaxed">{selectedDoc.usage}</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)]">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Data Variables</label>
              <p className="text-xs font-mono mt-1 text-brand-600 dark:text-brand-400">{selectedDoc.variables}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDoc(null)}
            className="mt-auto w-full py-3 bg-[var(--bg-app)] hover:bg-[var(--border-main)] rounded-xl font-bold transition-colors"
          >
            Got it
          </button>
        </div>
      )}
    </aside>
  );
}
