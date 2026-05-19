import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Zap, ArrowRight } from 'lucide-react';

const FEATURES = [
  'Save unlimited projects',
  'Export production-ready code',
  'Access all templates',
  'Generate architecture docs',
  'Share with your team',
];

export function DemoGateModal({ isOpen, onClose, action = 'save your work' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md mx-4 bg-[#13111f] border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-950/50"
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6 mx-auto">
          <Lock size={24} className="text-indigo-400" />
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-2">
          Create a free account to {action}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          You're in demo mode. Sign up for free to save projects, export code, access templates, and more.
        </p>

        {/* Features list */}
        <ul className="space-y-2 mb-8">
          {FEATURES.map((feat) => (
            <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-300">
              <div className="w-4 h-4 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>
              {feat}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <button
            id="demo-gate-signup-btn"
            onClick={() => navigate('/login?mode=signup&ref=demo_gate')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all group"
          >
            <Zap size={16} />
            Create Free Account
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/login?ref=demo_gate')}
            className="w-full px-4 py-3 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
          >
            Already have an account? Sign in
          </button>
          <button
            onClick={onClose}
            className="text-xs text-gray-600 hover:text-gray-400 text-center mt-1 transition-colors"
          >
            Continue exploring demo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
