import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, Sparkles, Zap, Brain, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api.js';
import { startDashboardTour } from '../utils/tour';
import Documentation from '../components/Documentation';
import Projects from './Projects';

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

  // ── AI Builder tab state ──
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    if (activeTab === 'AI Builder' && aiStatus === null) {
      api('/ai/status').then(r => r.json()).then(setAiStatus).catch(() => setAiStatus({ configured: false }));
    }
  }, [activeTab, aiStatus]);

  const generateWithAI = async () => {
    if (aiPrompt.trim().length < 10) {
      setAiError('Describe your backend in at least a sentence.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api('/ai/generate-workflow', {
        method: 'POST',
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);

      const createRes = await api('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name || 'AI Architecture',
          architecture_json: {
            nodes: data.nodes,
            edges: data.edges,
            documentation: data.documentation || '',
            database: 'mongodb',
          },
        }),
      });
      const project = await createRes.json();
      if (!createRes.ok) throw new Error(project.error || 'Could not save the generated project.');
      navigate(`/workflow/${project.id}`);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

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
    if (sessionStorage.getItem('architect_load_template')) {
      navigate('/dashboard/new');
      return;
    }
    fetchWorkflows();
    startDashboardTour();
  }, [navigate]);

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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api(`/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const duplicateWorkflow = async (id) => {
    try {
      const sourceWorkflow = workflows.find(w => w.id === id);
      if (!sourceWorkflow) return;
      
      const res = await api('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: `${sourceWorkflow.name} (Copy)`,
          architecture_json: sourceWorkflow.architecture_json
        })
      });
      if (!res.ok) {
        throw new Error('Failed to duplicate project');
      }
      const data = await res.json();
      setWorkflows([data, ...workflows]);
    } catch (err) {
      console.error(err);
      alert('Duplicate Error: ' + err.message);
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
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{activeTab}</h1>
          <p className="text-[var(--text-muted)] font-medium">
            {activeTab === 'Projects' ? 'Manage and scale your backend architectures.' :
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
            <Projects
              projects={workflows}
              onOpen={(id) => navigate(`/workflow/${id}`)}
              onRename={(wf) => {
                setEditingWorkflow(wf);
                setNewName(wf.name);
              }}
              onDelete={deleteWorkflow}
              onDuplicate={duplicateWorkflow}
              onCreateProject={createWorkflow}
              creating={creating}
            />
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
            className="space-y-8 w-full"
          >
            {/* Prompt panel — the actual builder */}
            <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-sidebar)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold">Describe your backend</h2>
                    <p className="text-xs text-[var(--text-muted)]">Gemini designs the graph · the rectifier verifies every connection · you get an editable project</p>
                  </div>
                </div>
                {aiStatus && (
                  <span className={`eyebrow flex items-center gap-2 ${aiStatus.configured ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${aiStatus.configured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {aiStatus.configured ? `${aiStatus.model} ready` : 'api key missing'}
                  </span>
                )}
              </div>

              <div className="p-6">
                {aiStatus && !aiStatus.configured && (
                  <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm">
                    <AlertTriangle size={17} className="text-amber-500 shrink-0 mt-0.5" />
                    <p>
                      Add <code className="px-1.5 py-0.5 rounded bg-[var(--bg-app)] font-mono text-xs">GEMINI_API_KEY</code> to{' '}
                      <code className="px-1.5 py-0.5 rounded bg-[var(--bg-app)] font-mono text-xs">backend/.env</code> (free key at{' '}
                      <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-brand-500 underline">aistudio.google.com</a>)
                      and restart the backend.
                    </p>
                  </div>
                )}

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. A subscription billing backend with organizations, plans, invoices, Stripe webhooks, usage metering and a nightly reconciliation job…"
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-violet-500 outline-none rounded-xl p-4 text-sm resize-none transition-colors"
                />

                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    'E-commerce: products, carts, orders, payments, inventory sync',
                    'HR system: employees, leave requests, approvals, payroll cron',
                    'Logistics: shipments, warehouses, tracking events, SLA alerts',
                  ].map((p) => (
                    <button key={p} onClick={() => setAiPrompt(p)}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-[var(--border-main)] text-[var(--text-muted)] hover:border-violet-500 hover:text-violet-500 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>

                {aiError && (
                  <div className="flex items-start gap-2.5 p-3.5 mt-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-medium">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {aiError}
                  </div>
                )}

                <div className="flex items-center justify-between mt-5">
                  {aiLoading ? (
                    <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin text-violet-500" />
                      Designing your architecture — this takes a few seconds…
                    </span>
                  ) : <span />}
                  <button
                    onClick={generateWithAI}
                    disabled={aiLoading || (aiStatus && !aiStatus.configured)}
                    className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Create project with AI
                  </button>
                </div>
              </div>
            </div>

            {/* What happens under the hood */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: MessageSquare, colorClass: 'bg-violet-500/10 text-violet-500',
                  title: 'You describe it',
                  desc: 'Plain language, as detailed as you like — domain entities, integrations, background work.'
                },
                {
                  icon: Brain, colorClass: 'bg-indigo-500/10 text-indigo-500',
                  title: 'AI designs, rules verify',
                  desc: 'Gemini proposes the full graph; the connection rectifier drops or flips anything invalid before you see it.'
                },
                {
                  icon: Zap, colorClass: 'bg-blue-500/10 text-blue-500',
                  title: 'You review and export',
                  desc: 'The graph lands as an editable project. Tweak nodes, then generate the production codebase.'
                }
              ].map(({ icon: Icon, colorClass, title, desc }) => (
                <div key={title} className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
                  <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
                    <Icon size={19} />
                  </div>
                  <h3 className="font-display font-bold mb-1.5">{title}</h3>
                  <p className="text-[var(--text-muted)] leading-relaxed text-sm">{desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 text-sm">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <p>
                Prefer the canvas? The same AI lives inside every project — open one and use the{' '}
                <span className="font-bold text-violet-500">AI Architect</span> button to create or refine architectures in place.
              </p>
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



