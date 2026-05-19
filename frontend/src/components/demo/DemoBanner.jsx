import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

export function DemoBanner() {
  const { hasUnsavedChanges, resetDemo } = useDemo();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full h-11 flex items-center justify-between px-4 bg-gradient-to-r from-indigo-950 via-[#1a1060] to-violet-950 border-b border-indigo-500/30 z-50 shrink-0"
    >
      {/* Left — warning */}
      <div className="flex items-center gap-2.5 text-xs text-indigo-300/80">
        <AlertTriangle size={13} className="text-amber-400 shrink-0" />
        <span>
          <span className="font-semibold text-white">Demo Mode</span>
          {' '}— Changes are temporary.
          {hasUnsavedChanges && (
            <span className="text-amber-300 ml-1">Refresh will reset your canvas.</span>
          )}
        </span>
        {hasUnsavedChanges && (
          <button
            onClick={resetDemo}
            className="flex items-center gap-1 ml-2 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>

      {/* Right — CTA */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-indigo-300/70">
          Like what you see?
        </span>
        <button
          id="demo-banner-signup-btn"
          onClick={() => navigate('/login?mode=signup&ref=demo_banner')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all group"
        >
          <Zap size={11} />
          Create Free Account
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
