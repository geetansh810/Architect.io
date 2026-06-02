import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, CheckCircle2, ShieldAlert, X, Zap } from 'lucide-react';
import { useArchitecture } from '../../context/ArchitectureContext';

export default function ArchitectureIntelligence({ isOpen, onClose }) {
  const { nodes, edges } = useArchitecture();
  const [activeTab, setActiveTab] = useState('insights');

  // Architecture analysis logic
  const analysis = useMemo(() => {
    const insights = [];
    const warnings = [];
    const security = [];
    let score = 100;

    const apiNodes = nodes.filter(n => n.type === 'apiNode');
    const dbNodes = nodes.filter(n => n.type === 'dbNode');
    const authNodes = nodes.filter(n => n.type === 'authNode');
    const loadBalancers = nodes.filter(n => n.type === 'loadBalancerNode');
    const caches = nodes.filter(n => n.type === 'cacheNode');

    // Security Checks
    if (apiNodes.length > 0 && authNodes.length === 0) {
      security.push({ id: 'no-auth', text: 'No Auth Guard detected protecting your API routes.' });
      score -= 20;
    }
    apiNodes.forEach(api => {
      if (!api.data?.authEnabled) {
        warnings.push({ id: `api-${api.id}`, text: `API Route '${api.data?.route || 'Unknown'}' does not have authentication enabled.` });
        score -= 5;
      }
    });

    // Infrastructure Checks
    if (dbNodes.length > 0 && nodes.filter(n => n.type === 'replicaNode').length === 0) {
      insights.push({ id: 'no-replica', text: 'Consider adding a Read Replica to offload database read queries.' });
    }
    if (apiNodes.length > 2 && loadBalancers.length === 0) {
      insights.push({ id: 'no-lb', text: 'Multiple APIs detected. Adding a Load Balancer could improve distribution.' });
    }
    if (dbNodes.length > 0 && caches.length === 0) {
      insights.push({ id: 'no-cache', text: 'Adding a Cache Layer (e.g. Redis) before your Database can drastically reduce latency.' });
    }

    // Best practices
    const hasQueue = nodes.some(n => n.type === 'queueNode');
    if (!hasQueue && nodes.some(n => n.type === 'mailNode' || n.type === 'webhookNode')) {
      warnings.push({ id: 'sync-external', text: 'External services (Mail/Webhook) are being called. Consider using a Message Queue for async processing to avoid blocking the main thread.' });
      score -= 10;
    }

    return { insights, warnings, security, score: Math.max(0, score) };
  }, [nodes, edges]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex justify-end">
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-96 h-full bg-[var(--bg-surface)] border-l border-[var(--border-main)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500"><Zap size={20} /></div>
                <div>
                  <h2 className="text-base font-black text-[var(--text-main)]">Arch Intelligence</h2>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Automated Analysis</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X size={20} />
              </button>
            </div>

            {/* Score Card */}
            <div className="p-5 border-b border-[var(--border-main)] shrink-0">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-main)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Health Score</p>
                  <p className={`text-3xl font-black ${analysis.score >= 90 ? 'text-emerald-500' : analysis.score >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                    {analysis.score}/100
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center border-4 border-[var(--bg-surface)] shadow-sm" style={{ background: analysis.score >= 90 ? '#10b981' : analysis.score >= 70 ? '#f59e0b' : '#ef4444' }}>
                  <CheckCircle2 size={24} className="text-white" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex p-3 gap-2 shrink-0">
              <button onClick={() => setActiveTab('insights')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'insights' ? 'bg-brand-500 text-white shadow-md' : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                Insights ({analysis.insights.length})
              </button>
              <button onClick={() => setActiveTab('warnings')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'warnings' ? 'bg-amber-500 text-white shadow-md' : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                Warnings ({analysis.warnings.length})
              </button>
              <button onClick={() => setActiveTab('security')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-red-500 text-white shadow-md' : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                Security ({analysis.security.length})
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {activeTab === 'insights' && (
                analysis.insights.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6">No new insights. Your architecture looks optimal!</p>
                ) : (
                  analysis.insights.map(item => (
                    <div key={item.id} className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl flex items-start gap-3">
                      <Lightbulb size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-[var(--text-main)] leading-relaxed">{item.text}</p>
                    </div>
                  ))
                )
              )}

              {activeTab === 'warnings' && (
                analysis.warnings.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6">No warnings. Great job!</p>
                ) : (
                  analysis.warnings.map(item => (
                    <div key={item.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-[var(--text-main)] leading-relaxed">{item.text}</p>
                    </div>
                  ))
                )
              )}

              {activeTab === 'security' && (
                analysis.security.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6">No security vulnerabilities detected.</p>
                ) : (
                  analysis.security.map(item => (
                    <div key={item.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
                      <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-[var(--text-main)] leading-relaxed">{item.text}</p>
                    </div>
                  ))
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
