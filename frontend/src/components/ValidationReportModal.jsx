import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, X, AlertOctagon, AlertTriangle, Download, Loader2 } from 'lucide-react';

/**
 * Pre-generation validation report. Errors block generation; warnings can be
 * acknowledged with "Generate anyway".
 */
export default function ValidationReportModal({ isOpen, onClose, validation, onProceed, isGenerating }) {
  if (!validation) return null;
  const { errors = [], warnings = [] } = validation;
  const blocked = errors.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
        >
          <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="bg-[var(--bg-surface)] w-full max-w-xl max-h-full rounded-[2rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${blocked ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {blocked ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <h2 className="text-base font-black text-[var(--text-main)]">
                    {blocked ? 'Connections need fixing' : 'Review before generating'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">
                    {blocked
                      ? `${errors.length} blocking issue${errors.length > 1 ? 's' : ''} found — code generation is paused`
                      : `${warnings.length} warning${warnings.length > 1 ? 's' : ''} — you can still generate`}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
              {errors.map((issue, i) => (
                <div key={`e${i}`} className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-500/5 border border-red-500/25">
                  <AlertOctagon size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-main)]">{issue.message}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-red-500/70 mt-1">{issue.code}</p>
                  </div>
                </div>
              ))}
              {warnings.map((issue, i) => (
                <div key={`w${i}`} className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/25">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-main)]">{issue.message}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-amber-500/70 mt-1">{issue.code}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[var(--border-main)] flex items-center justify-end gap-3 shrink-0 bg-[var(--bg-sidebar)]">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold border border-[var(--border-main)] text-[var(--text-muted)] hover:border-brand-500 transition-colors">
                {blocked ? 'Fix issues' : 'Back to canvas'}
              </button>
              {!blocked && (
                <button onClick={onProceed} disabled={isGenerating}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Generate anyway
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
