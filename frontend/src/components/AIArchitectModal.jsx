import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Wand2, PencilRuler, AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../utils/api';
import { useArchitecture } from '../context/ArchitectureContext';
import { useReactFlow } from '@xyflow/react';

const EXAMPLE_PROMPTS = [
  'A multi-tenant SaaS invoicing platform with organizations, subscriptions, Stripe webhooks and PDF invoice emails',
  'An e-commerce backend with products, carts, orders, payments, inventory sync and abandoned-cart emails',
  'A ride-hailing backend: riders, drivers, trips, real-time pricing, driver payouts and trip receipts',
  'An internal HR system with employees, leave requests, approval workflows and monthly payroll cron',
];

const LOADING_STEPS = [
  'Analyzing your requirements…',
  'Designing data models…',
  'Wiring APIs, auth and caching…',
  'Rectifying connections…',
  'Laying out the canvas…',
];

export default function AIArchitectModal({ isOpen, onClose }) {
  const { nodes, edges, applyAIWorkflow, showToast } = useArchitecture();
  const { fitView } = useReactFlow();

  const [mode, setMode] = useState('create'); // 'create' | 'refine'
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // pending AI graph awaiting apply
  const [aiStatus, setAiStatus] = useState(null);

  const hasCanvas = nodes.some((n) => !['categoryBox', 'zoneGroup', 'stickyNote', 'textLabel'].includes(n.type));

  useEffect(() => {
    if (!isOpen) return;
    api('/ai/status').then((r) => r.json()).then(setAiStatus).catch(() => setAiStatus({ configured: false }));
  }, [isOpen]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 2800);
    return () => clearInterval(t);
  }, [loading]);

  const handleClose = () => {
    setError(null);
    setResult(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      setError('Describe your backend in at least a sentence.');
      return;
    }
    setLoadingStep(0);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const isRefine = mode === 'refine' && hasCanvas;
      const res = await api(isRefine ? '/ai/refine-workflow' : '/ai/generate-workflow', {
        method: 'POST',
        body: JSON.stringify(
          isRefine
            ? { prompt, nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })), edges: edges.map((e) => ({ source: e.source, target: e.target, label: e.label, data: e.data })) }
            : { prompt }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    applyAIWorkflow(result, 'replace');
    setResult(null);
    setPrompt('');
    handleClose();
    setTimeout(() => fitView({ padding: 0.15, duration: 500 }), 120);
    showToast('AI architecture is on the canvas — review and generate code when ready', 'info', 4500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
        >
          <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="bg-[var(--bg-surface)] w-full max-w-2xl max-h-full rounded-[2rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500"><Sparkles size={20} /></div>
                <div>
                  <h2 className="text-base font-black text-[var(--text-main)]">AI Architect</h2>
                  <p className="text-xs text-[var(--text-muted)]">Describe your backend — Gemini designs the full workflow</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Not configured warning */}
              {aiStatus && !aiStatus.configured && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm">
                  <KeyRound size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-[var(--text-main)]">
                    <p className="font-bold">Gemini API key not configured</p>
                    <p className="text-[var(--text-muted)] mt-1">
                      Create a free key at{' '}
                      <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-brand-500 underline">aistudio.google.com/api-keys</a>{' '}
                      and set <code className="px-1 rounded bg-[var(--bg-app)]">GEMINI_API_KEY</code> in <code className="px-1 rounded bg-[var(--bg-app)]">backend/.env</code>, then restart the backend.
                    </p>
                  </div>
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button onClick={() => setMode('create')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors ${mode === 'create' ? 'bg-violet-500/10 border-violet-500 text-violet-500' : 'border-[var(--border-main)] text-[var(--text-muted)] hover:border-violet-500/50'}`}>
                  <Wand2 size={15} /> Create new workflow
                </button>
                <button onClick={() => setMode('refine')} disabled={!hasCanvas}
                  title={hasCanvas ? 'Modify what is currently on the canvas' : 'Canvas is empty — nothing to refine'}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors disabled:opacity-40 ${mode === 'refine' ? 'bg-violet-500/10 border-violet-500 text-violet-500' : 'border-[var(--border-main)] text-[var(--text-muted)] hover:border-violet-500/50'}`}>
                  <PencilRuler size={15} /> Refine current canvas
                </button>
              </div>

              {mode === 'create' && hasCanvas && (
                <p className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Creating a new workflow replaces the current canvas (annotations are kept).
                </p>
              )}

              {/* Prompt */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder={mode === 'create'
                  ? 'e.g. A logistics platform backend with shipments, warehouses, drivers, real-time tracking events, SLA breach alerts and nightly reconciliation jobs…'
                  : 'e.g. Add Redis caching to the product APIs and an outgoing webhook that notifies the ERP on every order status change…'}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-violet-500 outline-none rounded-2xl p-4 text-sm text-[var(--text-main)] resize-none transition-colors"
              />

              {/* Example chips */}
              {mode === 'create' && (
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((p) => (
                    <button key={p} onClick={() => setPrompt(p)}
                      className="text-left text-[11px] font-medium px-3 py-1.5 rounded-full border border-[var(--border-main)] text-[var(--text-muted)] hover:border-violet-500 hover:text-violet-500 transition-colors max-w-full truncate"
                      style={{ maxWidth: '100%' }}
                    >
                      {p.length > 72 ? p.slice(0, 72) + '…' : p}
                    </button>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-medium">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* Result review */}
              {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30 space-y-3"
                >
                  <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                    <CheckCircle2 size={16} /> {result.name}
                  </div>
                  {result.summary && <p className="text-xs text-[var(--text-muted)] leading-relaxed">{result.summary}</p>}
                  <div className="flex gap-4 text-xs font-bold text-[var(--text-main)]">
                    <span>{result.nodes.length} nodes</span>
                    <span>{result.edges.length} connections</span>
                    {result.validation && <span className={result.validation.valid ? 'text-emerald-500' : 'text-red-500'}>
                      {result.validation.valid ? 'graph verified ✓' : `${result.validation.errors.length} issues`}
                    </span>}
                  </div>
                  {result.corrections?.length > 0 && (
                    <details className="text-xs text-[var(--text-muted)]">
                      <summary className="cursor-pointer font-bold text-amber-500">{result.corrections.length} auto-correction{result.corrections.length > 1 ? 's' : ''} applied</summary>
                      <ul className="mt-2 space-y-1 list-disc pl-4">
                        {result.corrections.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </details>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[var(--border-main)] flex items-center justify-end gap-3 shrink-0 bg-[var(--bg-sidebar)]">
              {loading && (
                <span className="mr-auto text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-violet-500" /> {LOADING_STEPS[loadingStep]}
                </span>
              )}
              {result ? (
                <>
                  <button onClick={() => setResult(null)} className="px-4 py-2 rounded-xl text-sm font-bold border border-[var(--border-main)] text-[var(--text-muted)] hover:border-violet-500 transition-colors">
                    Discard
                  </button>
                  <button onClick={handleApply} className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2">
                    <CheckCircle2 size={15} /> Apply to canvas
                  </button>
                </>
              ) : (
                <button onClick={handleGenerate} disabled={loading || (aiStatus && !aiStatus.configured)}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-violet-500 hover:bg-violet-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {mode === 'refine' ? 'Refine with AI' : 'Generate with AI'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
