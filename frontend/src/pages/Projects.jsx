import { useState, useEffect } from 'react';
import { LayoutGrid, List, Search, Copy, Trash2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectCard from '../components/ProjectCard';

export function Projects({ 
  projects, 
  onOpen, 
  onRename, 
  onDelete, 
  onDuplicate,
  onCreateProject,
  creating
}) {
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('projects_view') || 'grid');
  const [search, setSearch] = useState('');

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('projects_view', mode);
  };

  const filtered = projects.filter((project) => {
    const matchSearch = project.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search + View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-surface)] p-4 rounded-[2rem] border border-[var(--border-main)]">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:border-brand-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg shrink-0 transition-colors">
          <button
            onClick={() => handleViewChange('grid')}
            title="Grid View"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-brand-500/20 text-brand-500 font-bold' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => handleViewChange('table')}
            title="Table View"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'table' 
                ? 'bg-brand-500/20 text-brand-500 font-bold' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Projects List/Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-[var(--border-main)] rounded-[2.5rem] bg-[var(--bg-surface)]">
          <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-6">
            <Layers className="w-10 h-10 text-brand-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No projects found</h3>
          <p className="text-[var(--text-muted)] max-w-sm mb-8">
            {search ? "No projects match your search criteria." : "Create your first backend workflow to start generating production-ready MERN stacks."}
          </p>
          {!search && (
            <button
              onClick={onCreateProject}
              disabled={creating}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/25"
            >
              Create Project
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((wf) => (
            <ProjectCard
              key={wf.id}
              project={wf}
              onOpen={onOpen}
              onRename={onRename}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      ) : (
        <ProjectsTable
          projects={filtered}
          onOpen={onOpen}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      )}
    </div>
  );
}

function ProjectsTable({ projects, onOpen, onDelete, onDuplicate }) {
  return (
    <div className="border border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-surface)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[var(--border-main)] bg-[var(--bg-app)]/45 text-[var(--text-muted)]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Nodes</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Last Modified</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const nodeCount = project.architecture_json?.nodes?.length || 0;
              return (
                <tr
                  key={project.id}
                  className="border-b border-[var(--border-main)]/60 hover:bg-[var(--bg-app)]/50 cursor-pointer transition-colors group"
                  onClick={() => onOpen(project.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-brand-500">
                          {project.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-brand-500 transition-colors">
                        {project.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-medium">{project.category || 'General'}</td>
                  <td className="px-6 py-4 text-center text-xs text-[var(--text-muted)] font-bold">{nodeCount}</td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-medium">
                    {formatRelativeTime(project.updated_at || project.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                      project.status === 'published'
                        ? 'text-green-500 bg-green-500/10 border-green-500/20'
                        : 'text-[var(--text-muted)] bg-[var(--bg-app)] border border-[var(--border-main)]'
                    }`}>
                      {project.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDuplicate(project.id)} 
                        title="Duplicate"
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md hover:bg-[var(--bg-app)] transition-all"
                      >
                        <Copy size={13} />
                      </button>
                      <button 
                        onClick={(e) => onDelete(project.id, e)} 
                        title="Delete"
                        className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatRelativeTime(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return `just now`;
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default Projects;
