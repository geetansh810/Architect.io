import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X, Lock } from 'lucide-react';
import { useProjectConfig } from '../context/ProjectConfigContext';

const OPTION_GROUPS = [
  {
    key: 'language',
    label: 'Language',
    description: 'Emit the whole project as plain JavaScript or as TypeScript.',
    options: [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
    ],
  },
  {
    key: 'validation',
    label: 'Validation',
    description: 'Request validation library used in every module.',
    options: [
      { value: 'zod', label: 'Zod' },
      { value: 'joi', label: 'Joi' },
    ],
  },
  {
    key: 'auth',
    label: 'Auth',
    description: 'Strategy used by generated auth middleware.',
    options: [
      { value: 'jwt', label: 'JWT' },
      { value: 'passport', label: 'Passport', disabled: true, badge: 'Phase 2' },
    ],
  },
  {
    key: 'docs',
    label: 'API Docs',
    description: 'Generate an OpenAPI document served at /api-docs.',
    options: [
      { value: 'swagger', label: 'Swagger' },
      { value: 'none', label: 'None' },
    ],
  },
];

export default function ProjectConfigPanel({ isOpen, onClose }) {
  const { config, updateConfig } = useProjectConfig();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[var(--bg-surface)] w-full max-w-lg rounded-[2rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
          >
            <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500"><Settings2 size={20} /></div>
                <div>
                  <h2 className="text-base font-black text-[var(--text-main)]">Project Config</h2>
                  <p className="text-xs text-[var(--text-muted)]">Controls how the generated backend is written — saved with your project.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {OPTION_GROUPS.map((group) => (
                <div key={group.key} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{group.label}</label>
                  <p className="text-[11px] text-[var(--text-muted)]">{group.description}</p>
                  <div className="flex gap-2 pt-1">
                    {group.options.map((opt) => (
                      <button
                        key={opt.value}
                        disabled={opt.disabled}
                        onClick={() => updateConfig({ [group.key]: opt.value })}
                        title={opt.disabled ? opt.badge : undefined}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          config[group.key] === opt.value
                            ? 'bg-brand-500 text-white border-brand-500'
                            : opt.disabled
                            ? 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-main)] opacity-50 cursor-not-allowed'
                            : 'bg-[var(--bg-app)] text-[var(--text-main)] border-[var(--border-main)] hover:border-brand-500'
                        }`}
                      >
                        {opt.disabled && <Lock size={11} />}
                        {opt.label}
                        {opt.badge && <span className="text-[9px] font-medium opacity-75">({opt.badge})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 pt-2 border-t border-[var(--border-main)]">
                <label className="flex items-center justify-between cursor-pointer pt-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] block">API Versioning</span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Mount routes under {config.apiVersioning === false ? <code className="text-brand-500">/api</code> : <code className="text-brand-500">/api/v1</code>}.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.apiVersioning !== false}
                    onChange={(e) => updateConfig({ apiVersioning: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-500 shrink-0 ml-3"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
