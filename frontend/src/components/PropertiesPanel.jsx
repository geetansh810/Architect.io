import { useArchitecture } from '../context/ArchitectureContext';
import { 
  Settings2, 
  Trash2, 
  Plus, 
  Database, 
  Globe, 
  Shield, 
  Mail, 
  Cpu, 
  Info,
  Filter,
  Upload,
  Clock,
  Webhook
} from 'lucide-react';

const InputWrapper = ({ label, children, description }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{label}</label>
      {description && (
        <div className="group relative">
          <Info className="w-3 h-3 text-[var(--text-muted)] cursor-help" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            {description}
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

export default function PropertiesPanel({ nodeId }) {
  const { nodes, updateNodeData, setNodes } = useArchitecture();
  const node = nodes.find(n => n.id === nodeId);

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-surface)]">
        <div className="w-16 h-16 bg-[var(--bg-app)] rounded-3xl flex items-center justify-center mb-6 text-[var(--text-muted)]">
          <Settings2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-[var(--text-main)]">No Selection</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Select a node on the canvas to configure its properties and logic.
        </p>
      </div>
    );
  }

  const deleteNode = () => {
    if (confirm('Delete this node?')) {
      setNodes(nds => nds.filter(n => n.id !== nodeId));
    }
  };

  const renderProperties = () => {
    switch (node.type) {
      case 'entityNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Entity Name" description="The name of your MongoDB model (e.g. Product)">
              <input
                type="text"
                value={node.data.name}
                onChange={(e) => updateNodeData(node.id, { name: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-xl py-3 px-4 outline-none font-bold transition-all text-[var(--text-main)]"
              />
            </InputWrapper>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Fields</label>
                <button
                  onClick={() => {
                    const fields = [...(node.data.fields || []), { name: 'newField', type: 'string', required: false }];
                    updateNodeData(node.id, { fields });
                  }}
                  className="text-brand-500 hover:bg-brand-500/10 p-1.5 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {node.data.fields?.map((field, idx) => (
                  <div key={idx} className="p-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl space-y-3 relative group">
                    <button
                      onClick={() => {
                        const fields = node.data.fields.filter((_, i) => i !== idx);
                        updateNodeData(node.id, { fields });
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90"
                    >
                      <Trash2 size={12} />
                    </button>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => {
                        const fields = [...node.data.fields];
                        fields[idx].name = e.target.value;
                        updateNodeData(node.id, { fields });
                      }}
                      className="w-full bg-transparent border-b border-[var(--border-main)] focus:border-brand-500 outline-none font-bold text-sm py-1 text-[var(--text-main)]"
                      placeholder="field_name"
                    />
                    <div className="flex gap-2">
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const fields = [...node.data.fields];
                          fields[idx].type = e.target.value;
                          updateNodeData(node.id, { fields });
                        }}
                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none text-[var(--text-main)]"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                      </select>
                      <label className="flex items-center gap-2 px-2 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const fields = [...node.data.fields];
                            fields[idx].required = e.target.checked;
                            updateNodeData(node.id, { fields });
                          }}
                          className="accent-brand-500"
                        />
                        <span className="text-[10px] font-black uppercase text-[var(--text-main)]">Req</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'apiNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Base Route" description="The URL path for this API (e.g. /products)">
              <input
                type="text"
                value={node.data.route}
                onChange={(e) => updateNodeData(node.id, { route: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-xl py-3 px-4 outline-none font-bold transition-all text-[var(--text-main)]"
              />
            </InputWrapper>
            
            <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-brand-500" />
                <span className="text-sm font-bold text-[var(--text-main)]">Require Auth</span>
              </div>
              <input
                type="checkbox"
                checked={node.data.authEnabled}
                onChange={(e) => updateNodeData(node.id, { authEnabled: e.target.checked })}
                className="w-5 h-5 accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        );

      case 'logicNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Logic Name" description="Descriptive name for this service logic">
              <input
                type="text"
                value={node.data.name}
                onChange={(e) => updateNodeData(node.id, { name: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-xl py-3 px-4 outline-none font-bold transition-all text-[var(--text-main)]"
              />
            </InputWrapper>
            <InputWrapper label="Trigger Hook" description="When should this logic execute?">
              <select
                value={node.data.hook}
                onChange={(e) => updateNodeData(node.id, { hook: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-xl py-3 px-4 outline-none font-bold transition-all text-[var(--text-main)]"
              >
                <option value="before-create">Before Create</option>
                <option value="after-create">After Create</option>
                <option value="before-update">Before Update</option>
                <option value="after-update">After Update</option>
                <option value="before-delete">Before Delete</option>
                <option value="after-delete">After Delete</option>
              </select>
            </InputWrapper>
          </div>
        );

      case 'authNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Auth Method">
              <select
                value={node.data.method}
                onChange={(e) => updateNodeData(node.id, { method: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="JWT">JWT (JSON Web Token)</option>
                <option value="OAuth2">OAuth 2.0</option>
                <option value="Session">Session Based</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Token Expiry">
              <input
                type="text"
                value={node.data.expiry}
                onChange={(e) => updateNodeData(node.id, { expiry: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="24h"
              />
            </InputWrapper>
            <InputWrapper label="JWT Secret Key">
              <input
                type="password"
                value={node.data.secret}
                onChange={(e) => updateNodeData(node.id, { secret: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="••••••••"
              />
            </InputWrapper>
          </div>
        );

      case 'dbNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Database Type">
              <select
                value={node.data.type}
                onChange={(e) => updateNodeData(node.id, { type: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="mongodb">MongoDB</option>
                <option value="postgresql">PostgreSQL (Prisma)</option>
                <option value="mysql">MySQL (Sequelize)</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Database Name">
              <input
                type="text"
                value={node.data.dbName}
                onChange={(e) => updateNodeData(node.id, { dbName: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              />
            </InputWrapper>
            <InputWrapper label="Connection URI">
              <input
                type="text"
                value={node.data.uri}
                onChange={(e) => updateNodeData(node.id, { uri: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="mongodb://..."
              />
            </InputWrapper>
          </div>
        );

      case 'mailNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Mail Provider">
              <select
                value={node.data.provider}
                onChange={(e) => updateNodeData(node.id, { provider: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="SMTP">Standard SMTP</option>
                <option value="SendGrid">SendGrid</option>
                <option value="Mailgun">Mailgun</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Sender Email">
              <input
                type="email"
                value={node.data.fromEmail}
                onChange={(e) => updateNodeData(node.id, { fromEmail: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="noreply@architect.io"
              />
            </InputWrapper>
          </div>
        );

      case 'middlewareNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Middleware Type">
              <select
                value={node.data.middlewareType}
                onChange={(e) => updateNodeData(node.id, { middlewareType: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="Rate Limiter">Rate Limiter</option>
                <option value="Logger">Request Logger (Morgan)</option>
                <option value="CORS">CORS Configuration</option>
                <option value="Validator">Input Validator</option>
                <option value="Custom">Custom Middleware</option>
              </select>
            </InputWrapper>
            {node.data.middlewareType === 'Rate Limiter' && (
              <>
                <InputWrapper label="Window (ms)" description="Time frame for limit (e.g. 900000 for 15m)">
                  <input
                    type="number"
                    value={node.data.config?.windowMs}
                    onChange={(e) => updateNodeData(node.id, { config: { ...node.data.config, windowMs: parseInt(e.target.value) } })}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                  />
                </InputWrapper>
                <InputWrapper label="Max Requests" description="Requests allowed per window">
                  <input
                    type="number"
                    value={node.data.config?.maxRequests}
                    onChange={(e) => updateNodeData(node.id, { config: { ...node.data.config, maxRequests: parseInt(e.target.value) } })}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                  />
                </InputWrapper>
              </>
            )}
          </div>
        );

      case 'storageNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Storage Provider">
              <select
                value={node.data.provider}
                onChange={(e) => updateNodeData(node.id, { provider: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="Local (Multer)">Local Disk (Multer)</option>
                <option value="AWS S3">Amazon S3</option>
                <option value="Cloudinary">Cloudinary</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Max File Size (MB)">
              <input
                type="number"
                value={node.data.maxSizeMB}
                onChange={(e) => updateNodeData(node.id, { maxSizeMB: parseInt(e.target.value) })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              />
            </InputWrapper>
          </div>
        );

      case 'cronNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Job Name">
              <input
                type="text"
                value={node.data.jobName}
                onChange={(e) => updateNodeData(node.id, { jobName: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="dailyCleanup"
              />
            </InputWrapper>
            <InputWrapper label="Schedule (Cron Expression)" description="Standard crontab format (* * * * *)">
              <input
                type="text"
                value={node.data.schedule}
                onChange={(e) => updateNodeData(node.id, { schedule: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold font-mono text-[var(--text-main)]"
                placeholder="0 0 * * *"
              />
            </InputWrapper>
          </div>
        );

      case 'webhookNode':
        return (
          <div className="space-y-8">
            <InputWrapper label="Direction">
              <select
                value={node.data.direction}
                onChange={(e) => updateNodeData(node.id, { direction: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="Incoming">Incoming (Webhooks I receive)</option>
                <option value="Outgoing">Outgoing (Webhooks I send)</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Provider Preset">
              <select
                value={node.data.provider}
                onChange={(e) => updateNodeData(node.id, { provider: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
              >
                <option value="Custom">Custom Webhook</option>
                <option value="Stripe">Stripe</option>
                <option value="GitHub">GitHub</option>
                <option value="Slack">Slack</option>
              </select>
            </InputWrapper>
            <InputWrapper label="Endpoint Path / URL">
              <input
                type="text"
                value={node.data.path}
                onChange={(e) => updateNodeData(node.id, { path: e.target.value })}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="/api/webhooks/stripe"
              />
            </InputWrapper>
          </div>
        );

      default:
        return null;
    }
  };

  const NodeTypeIcon = ({ type }) => {
    switch (type) {
      case 'entityNode': return <Database className="text-emerald-500" />;
      case 'apiNode': return <Globe className="text-blue-500" />;
      case 'logicNode': return <Cpu className="text-indigo-500" />;
      case 'authNode': return <Shield className="text-amber-500" />;
      case 'mailNode': return <Mail className="text-rose-500" />;
      case 'middlewareNode': return <Filter className="text-cyan-500" />;
      case 'storageNode': return <Upload className="text-orange-500" />;
      case 'cronNode': return <Clock className="text-purple-500" />;
      case 'webhookNode': return <Webhook className="text-fuchsia-500" />;
      default: return <Settings2 />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-surface)]">
      <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--bg-app)] rounded-xl">
            <NodeTypeIcon type={node.type} />
          </div>
          <h2 className="font-black text-[var(--text-main)]">Properties</h2>
        </div>
        <button
          onClick={deleteNode}
          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {renderProperties()}
      </div>

      <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)]">
        <div className="flex items-center justify-between text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-4">
          <span>Node ID</span>
          <span className="font-mono">{node.id.split('-')[0]}...</span>
        </div>
        <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95">
          Save Changes
        </button>
      </div>
    </div>
  );
}
