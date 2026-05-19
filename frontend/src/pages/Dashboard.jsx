import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Code2, Clock, ChevronRight, Layout as LayoutIcon, Loader2, Settings, Layers, BookOpen, Database, CheckCircle2, Globe, Cpu, Mail, Sparkles, Zap, Brain, MessageSquare, Bot, Lock } from 'lucide-react';
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
          <h1 className="text-4xl font-black tracking-tight mb-2">{activeTab}</h1>
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



