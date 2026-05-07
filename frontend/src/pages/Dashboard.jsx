import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Code2, Clock, ChevronRight, Layout as LayoutIcon, Loader2, Settings, Layers, BookOpen, Database, CheckCircle2, Globe, Cpu, Mail, Sparkles, Zap, Brain, MessageSquare, Bot, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api.js';
import { startDashboardTour } from '../utils/tour';
import Documentation from '../components/Documentation';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Projects';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const fetchWorkflows = async () => {
    try {
      const res = await api('/workflows');
      const data = await res.json();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    startDashboardTour();
  }, []);

  const createWorkflow = async () => {
    setCreating(true);
    try {
      const res = await api('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: `New Project ${workflows.length + 1}`,
          architecture_json: { entities: [], apis: [], database: 'mongodb' }
        })
      });
      const data = await res.json();
      navigate(`/workflow/${data.id}`);
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  };

  const deleteWorkflow = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api(`/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await api(`/workflows/${editingWorkflow.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to rename project');
      }
      setWorkflows(workflows.map(w => w.id === editingWorkflow.id ? { ...w, name: newName } : w));
      setEditingWorkflow(null);
    } catch (err) {
      console.error(err);
      alert('Rename Error: ' + err.message);
    }
  };

  const handleUseTemplate = async (template) => {
    setCreating(true);
    try {
      const res = await api('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: `${template.name} Project`,
          architecture_json: template.architecture
        })
      });
      const data = await res.json();
      navigate(`/workflow/${data.id}`);
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto w-full p-6 lg:p-10 h-full overflow-y-auto"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} id="tour-welcome-banner">
          <h1 className="text-4xl font-black tracking-tight mb-2">{activeTab}</h1>
          <p className="text-[var(--text-muted)] font-medium">
            {activeTab === 'Projects' ? 'Manage and scale your backend architectures.' :
              activeTab === 'Templates' ? 'Start faster with pre-built architecture patterns.' :
              activeTab === 'AI Builder' ? 'Describe your backend in plain English — let AI design it.' :
                'Learn how to build production-grade backends.'}
          </p>
        </motion.div>

        {activeTab === 'Projects' && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createWorkflow}
            disabled={creating}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-brand-500/25 font-bold disabled:opacity-50"
            id="tour-new-project-btn"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {creating ? 'Initializing...' : 'New Project'}
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-[var(--border-main)] rounded-[2rem] bg-[var(--bg-surface)]">
                <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-6">
                  <LayoutIcon className="w-10 h-10 text-brand-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
                <p className="text-[var(--text-muted)] max-w-sm mb-8">
                  Create your first backend workflow to start generating production-ready MERN stacks.
                </p>
                <button
                  onClick={createWorkflow}
                  className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 hover:text-brand-500 px-6 py-3 rounded-xl font-bold transition-all shadow-sm"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((wf, i) => (
                  <motion.div
                    key={wf.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      onClick={() => navigate(`/workflow/${wf.id}`)}
                      className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 p-6 rounded-3xl transition-all hover:shadow-xl hover:shadow-brand-500/5 group relative flex flex-col min-h-[180px] h-full cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          <Code2 className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWorkflow(wf);
                              setNewName(wf.name);
                            }}
                            className="p-2 text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => deleteWorkflow(wf.id, e)}
                            className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-auto line-clamp-1 group-hover:text-brand-500 transition-colors">{wf.name}</h3>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(wf.updated_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-500">
                          Open <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            id="tour-tab-templates"
          >
            {[
              {
                name: 'E-Commerce Pro',
                desc: 'A production-grade setup with Auth, Inventory Logic, Mailers, and complex Relations.',
                architecture: {
                  nodes: [
                    { id: 'auth', type: 'authNode', position: { x: 0, y: 0 }, data: { method: 'JWT', expiry: '24h', secret: 'arch_secret_123' } },
                    { id: 'db', type: 'dbNode', position: { x: 0, y: 150 }, data: { type: 'mongodb', dbName: 'architect_ecom' } },
                    { id: 'user', type: 'entityNode', position: { x: 300, y: 0 }, data: { name: 'User', fields: [{ name: 'email', type: 'string', required: true }, { name: 'password', type: 'string', required: true }, { name: 'role', type: 'string' }] } },
                    { id: 'prod', type: 'entityNode', position: { x: 300, y: 250 }, data: { name: 'Product', fields: [{ name: 'title', type: 'string', required: true }, { name: 'price', type: 'number', required: true }, { name: 'stock', type: 'number', required: true }] } },
                    { id: 'order', type: 'entityNode', position: { x: 600, y: 250 }, data: { name: 'Order', fields: [{ name: 'total', type: 'number', required: true }, { name: 'status', type: 'string' }] } },
                    { id: 'logic', type: 'logicNode', position: { x: 600, y: 450 }, data: { name: 'Process Order', hook: 'after-create' } },
                    { id: 'mailer', type: 'mailNode', position: { x: 900, y: 450 }, data: { provider: 'SendGrid', fromEmail: 'orders@architect.io' } },
                    { id: 'auth_api', type: 'apiNode', position: { x: 900, y: 0 }, data: { route: '/api/auth', authEnabled: false } },
                    { id: 'prod_api', type: 'apiNode', position: { x: 900, y: 200 }, data: { route: '/api/products', authEnabled: false } },
                    { id: 'order_api', type: 'apiNode', position: { x: 900, y: 350 }, data: { route: '/api/orders', authEnabled: true } }
                  ],
                  edges: [
                    { id: 'e1', source: 'user', target: 'auth' },
                    { id: 'e2', source: 'auth', target: 'auth_api' },
                    { id: 'e3', source: 'prod', target: 'prod_api' },
                    { id: 'e4', source: 'order', target: 'order_api' },
                    { id: 'e5', source: 'order', target: 'logic' },
                    { id: 'e6', source: 'logic', target: 'mailer' }
                  ]
                }
              },
              {
                name: 'SaaS Platform',
                desc: 'Multi-tenant structure with subscription logic.',
                architecture: {
                  nodes: [
                    { id: 'auth', type: 'authNode', position: { x: 100, y: 100 }, data: { method: 'OAuth2' } },
                    { id: 'org', type: 'entityNode', position: { x: 400, y: 100 }, data: { name: 'Organization', fields: [{ name: 'name', type: 'String' }] } },
                    { id: 'api', type: 'apiNode', position: { x: 700, y: 100 }, data: { route: '/api/orgs', authEnabled: true } }
                  ],
                  edges: [
                    { id: 'e1', source: 'org', target: 'api' }
                  ]
                }
              },
              {
                name: 'Social Media',
                desc: 'Feed, Followers, and Real-time notifications.',
                architecture: {
                  nodes: [
                    { id: 'user', type: 'entityNode', position: { x: 100, y: 100 }, data: { name: 'User', fields: [{ name: 'username', type: 'string' }] } },
                    { id: 'post', type: 'entityNode', position: { x: 500, y: 100 }, data: { name: 'Post', fields: [{ name: 'content', type: 'String' }] } },
                    { id: 'api', type: 'apiNode', position: { x: 900, y: 100 }, data: { route: '/api/posts' } }
                  ],
                  edges: [
                    { id: 'e1', source: 'post', target: 'user', label: '1:N', data: { type: '1:N', foreignKey: 'authorId' }, style: { strokeDasharray: '5 5', stroke: '#10b981' }, animated: true },
                    { id: 'e2', source: 'post', target: 'api', label: 'Exposes CRUD', animated: true }
                  ]
                }
              },
              {
                name: 'High-Traffic API',
                desc: 'Optimized for scale with Rate Limiting, Request Logging, and Security Middleware.',
                architecture: {
                  nodes: [
                    { id: 'db', type: 'dbNode', position: { x: 0, y: 150 }, data: { type: 'mongodb', dbName: 'high_traffic_db' } },
                    { id: 'mw_rate', type: 'middlewareNode', position: { x: 300, y: 0 }, data: { middlewareType: 'Rate Limiter', config: { windowMs: 60000, maxRequests: 100 } } },
                    { id: 'mw_log', type: 'middlewareNode', position: { x: 300, y: 150 }, data: { middlewareType: 'Logger' } },
                    { id: 'entity', type: 'entityNode', position: { x: 600, y: 75 }, data: { name: 'Metric', fields: [{ name: 'type', type: 'string' }, { name: 'value', type: 'number' }] } },
                    { id: 'api', type: 'apiNode', position: { x: 900, y: 75 }, data: { route: '/api/v1/metrics', authEnabled: true } }
                  ],
                  edges: [
                    { id: 'e1', source: 'mw_rate', target: 'api', label: 'Applies Middleware', animated: true },
                    { id: 'e2', source: 'mw_log', target: 'api', label: 'Applies Middleware', animated: true },
                    { id: 'e3', source: 'entity', target: 'api', label: 'Exposes CRUD', animated: true }
                  ]
                }
              },
              {
                name: 'Asset Management SaaS',
                desc: 'File handling and complex entity relations for digital assets.',
                architecture: {
                  nodes: [
                    { id: 'storage', type: 'storageNode', position: { x: 0, y: 0 }, data: { provider: 'AWS S3', maxSizeMB: 50 } },
                    { id: 'folder', type: 'entityNode', position: { x: 300, y: 0 }, data: { name: 'Folder', fields: [{ name: 'name', type: 'string' }] } },
                    { id: 'asset', type: 'entityNode', position: { x: 300, y: 250 }, data: { name: 'Asset', fields: [{ name: 'filename', type: 'string' }, { name: 'url', type: 'string' }] } },
                    { id: 'api', type: 'apiNode', position: { x: 700, y: 125 }, data: { route: '/api/assets', authEnabled: true } }
                  ],
                  edges: [
                    { id: 'e1', source: 'asset', target: 'folder', label: '1:N', data: { type: '1:N', foreignKey: 'folderId' }, style: { strokeDasharray: '5 5', stroke: '#10b981' }, animated: true },
                    { id: 'e2', source: 'asset', target: 'storage', label: 'Saves to Storage', animated: true },
                    { id: 'e3', source: 'asset', target: 'api', label: 'Exposes CRUD', animated: true }
                  ]
                }
              },
              {
                name: 'Event Marketing Automation',
                desc: 'Background jobs and webhook integration for marketing flows.',
                architecture: {
                  nodes: [
                    { id: 'cron', type: 'cronNode', position: { x: 0, y: 0 }, data: { jobName: 'EmailCampaign', schedule: '0 9 * * *' } },
                    { id: 'webhook', type: 'webhookNode', position: { x: 0, y: 200 }, data: { direction: 'Incoming', provider: 'Stripe', path: '/webhooks/stripe' } },
                    { id: 'logic', type: 'logicNode', position: { x: 400, y: 100 }, data: { name: 'Process Payment', hook: 'after-create' } },
                    { id: 'user', type: 'entityNode', position: { x: 700, y: 100 }, data: { name: 'Subscriber', fields: [{ name: 'email', type: 'string' }, { name: 'status', type: 'string' }] } },
                    { id: 'api', type: 'apiNode', position: { x: 1000, y: 100 }, data: { route: '/api/subscribers', authEnabled: false } }
                  ],
                  edges: [
                    { id: 'e1', source: 'cron', target: 'logic', label: 'Triggers Logic', animated: true },
                    { id: 'e2', source: 'webhook', target: 'logic', label: 'Triggers Webhook', animated: true },
                    { id: 'e3', source: 'user', target: 'api', label: 'Exposes CRUD', animated: true }
                  ]
                }
              }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 transition-all group flex flex-col h-full">
                <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-8 flex-1">{t.desc}</p>
                <button
                  onClick={() => handleUseTemplate(t)}
                  disabled={creating}
                  className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />}
                  Use Template
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Documentation' && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
            id="tour-tab-docs"
          >
            <Documentation />
          </motion.div>
        )}

        {activeTab === 'AI Builder' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10 w-full"
          >
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-12 bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-500 text-white shadow-2xl shadow-violet-500/20">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Sparkles size={180} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 border border-white/20 shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h2 className="text-4xl font-black tracking-tight">AI Backend Builder</h2>
                    <span className="px-3 py-1 bg-white/15 backdrop-blur border border-white/20 rounded-full text-xs font-black uppercase tracking-widest">Coming Soon</span>
                  </div>
                  <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
                    Describe your backend in plain English. Our AI will design the entire architecture — entities, APIs, relationships, auth, and business logic — ready to generate and deploy instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: MessageSquare,
                  colorClass: 'bg-violet-500/10 text-violet-500',
                  title: 'Natural Language Input',
                  desc: 'Just type "Build me an e-commerce backend with user auth, product catalog, and order management" and watch the canvas build itself.'
                },
                {
                  icon: Brain,
                  colorClass: 'bg-indigo-500/10 text-indigo-500',
                  title: 'Intelligent Architecture',
                  desc: 'The AI understands your domain and automatically suggests data models, relationships, API endpoints, middleware, and business logic hooks.'
                },
                {
                  icon: Zap,
                  colorClass: 'bg-blue-500/10 text-blue-500',
                  title: 'Instant Code Generation',
                  desc: 'Once the AI designs your architecture, export production-ready Node.js/MongoDB code with a single click. No manual wiring needed.'
                }
              ].map(({ icon: Icon, colorClass, title, desc }) => (
                <div key={title} className="p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-violet-500/30 transition-all group">
                  <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{title}</h3>
                  <p className="text-[var(--text-muted)] leading-relaxed font-medium text-sm">{desc}</p>
                </div>
              ))}
            </div>

            {/* How It Works */}
            <div className="p-10 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-main)]">
              <h3 className="text-2xl font-black mb-2">How it will work</h3>
              <p className="text-[var(--text-muted)] font-medium mb-8">A glimpse of the AI Builder experience coming to Architect.io</p>
              <div className="space-y-6">
                {[
                  {
                    num: '1', color: 'bg-violet-500/10 text-violet-400',
                    title: 'Type your idea',
                    content: (
                      <div className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl px-5 py-4 font-mono text-sm text-[var(--text-muted)] flex items-center gap-3 mt-2">
                        <Bot className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="italic">"Create a SaaS platform with multi-tenant orgs, JWT auth, subscription plans, and a usage analytics dashboard"</span>
                      </div>
                    )
                  },
                  {
                    num: '2', color: 'bg-indigo-500/10 text-indigo-400',
                    title: 'AI designs the architecture',
                    content: <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Entities, APIs, relationships, auth middleware, and logic hooks are automatically placed on your canvas — fully editable before export.</p>
                  },
                  {
                    num: '3', color: 'bg-brand-500/10 text-brand-500',
                    title: 'Review, tweak, and export',
                    content: <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Refine any node, adjust field types, toggle auth guards, then export production-ready code in seconds.</p>
                  }
                ].map(({ num, color, title, content }) => (
                  <div key={num} className="flex gap-4 items-start">
                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0 font-black text-sm mt-0.5`}>{num}</div>
                    <div className="flex-1">
                      <p className="font-bold">{title}</p>
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Banner */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-8 rounded-[2rem] border border-dashed border-violet-500/30 bg-violet-500/5">
              <Lock className="w-8 h-8 text-violet-400 shrink-0" />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black text-lg">Feature in Development</p>
                <p className="text-[var(--text-muted)] font-medium text-sm mt-1">AI Builder is actively being developed by the Architect.io team. This tab will unlock automatically when the feature ships.</p>
              </div>
              <button disabled className="shrink-0 px-6 py-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-2xl font-black text-sm cursor-not-allowed opacity-70 whitespace-nowrap">
                🚀 Coming Soon
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {editingWorkflow && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-surface)] w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-[var(--border-main)]"
            >
              <h3 className="text-2xl font-black mb-6">Rename Project</h3>
              <form onSubmit={handleRename} className="space-y-6">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl px-6 py-4 outline-none focus:border-brand-500 font-bold text-lg"
                  placeholder="Enter new name..."
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingWorkflow(null)}
                    className="flex-1 py-4 font-bold text-[var(--text-muted)] hover:bg-[var(--bg-app)] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
                  >
                    Rename
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



