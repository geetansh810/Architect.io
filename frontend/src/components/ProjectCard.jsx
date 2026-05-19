import { Code2, Settings, Trash2, Copy, Clock, ChevronRight, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProjectCard({ project, onOpen, onRename, onDelete, onDuplicate }) {
  const nodeCount = project.architecture_json?.nodes?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpen(project.id)}
      className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 p-6 rounded-3xl transition-all hover:shadow-xl hover:shadow-brand-500/5 group relative flex flex-col min-h-[200px] h-full cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
          <Code2 className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(project.id);
            }}
            title="Duplicate Project"
            className="p-2 text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(project);
            }}
            title="Rename Project"
            className="p-2 text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id, e);
            }}
            title="Delete Project"
            className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-xl mb-1 line-clamp-1 group-hover:text-brand-500 transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mb-4">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            project.status === 'published'
              ? 'text-green-400 bg-green-400/10 border-green-400/20'
              : 'text-gray-500 bg-white/5 border-white/10'
          }`}>
            {project.status || 'Draft'}
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <Layers size={11} /> {nodeCount} nodes
          </span>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest border-t border-[var(--border-main)]/50 pt-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date(project.updated_at || project.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-500">
          Open <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectCard;
