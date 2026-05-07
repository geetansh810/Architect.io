import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Info } from 'lucide-react';

export default function RelationshipModal({ isOpen, onClose, onConfirm, sourceName, targetName }) {
  const [type, setType] = useState('1:N');
  const [foreignKey, setForeignKey] = useState(`${sourceName.toLowerCase()}Id`);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-xl">
                <Link2 className="w-5 h-5 text-brand-500" />
              </div>
              <h2 className="text-xl font-black">Define Relationship</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)]">
              <div className="text-center flex-1">
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1">Source</p>
                <p className="font-bold text-emerald-500">{sourceName}</p>
              </div>
              <div className="px-4">
                <Link2 className="w-4 h-4 text-[var(--text-muted)] opacity-30" />
              </div>
              <div className="text-center flex-1">
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-1">Target</p>
                <p className="font-bold text-blue-500">{targetName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Relationship Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '1:1', label: 'One-to-One', desc: '1:1' },
                  { id: '1:N', label: 'One-to-Many', desc: '1:N' },
                  { id: 'N:M', label: 'Many-to-Many', desc: 'N:M' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${type === t.id ? 'border-brand-500 bg-brand-500/5 ring-4 ring-brand-500/10' : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-brand-500/30'}`}
                  >
                    <span className="text-lg font-black">{t.desc}</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] whitespace-nowrap">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Foreign Key Name</label>
                <div className="group relative">
                  <Info className="w-3 h-3 text-[var(--text-muted)] cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    The field name that will store the reference in the database.
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={foreignKey}
                onChange={(e) => setForeignKey(e.target.value)}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl py-3 px-4 outline-none font-bold text-[var(--text-main)]"
                placeholder="user_id"
              />
            </div>

            <button
              onClick={() => onConfirm({ type, foreignKey })}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 transition-all active:scale-95"
            >
              Establish Link
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
