import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Zap, ArrowRight, X } from 'lucide-react';

export function DemoInactivityNudge({ onDismiss }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-4 bg-[#13111f] border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-950/50 relative"
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
        >
          <X size={16} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-5 mx-auto">
          <Clock size={24} className="text-amber-400" />
        </div>

        <h2 className="text-lg font-bold text-white text-center mb-2">
          Still exploring?
        </h2>
        <p className="text-sm text-gray-400 text-center mb-7">
          You've been in demo mode for a while. Create a free account to save your progress and unlock all features.
        </p>

        <div className="flex flex-col gap-3">
          <button
            id="demo-nudge-signup-btn"
            onClick={() => navigate('/login?mode=signup&ref=demo_nudge')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all group text-sm"
          >
            <Zap size={14} />
            Create Free Account
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={onDismiss}
            className="text-xs text-gray-600 hover:text-gray-400 text-center transition-colors"
          >
            Continue exploring
          </button>
        </div>
      </motion.div>
    </div>
  );
}
