import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, AlignLeft, Link2, AlertCircle, Trash2 } from 'lucide-react';
import { useArchitecture } from '../context/ArchitectureContext';
import { NODE_SHAPE_CONFIG } from './nodes/nodeShapeConfig';

export default function PropertiesPanel() {
  const { nodes, edges, updateNodeData, updateEdgeData, removeElements } = useArchitecture();
  const [activeTab, setActiveTab] = useState('properties');

  const selectedNodes = nodes.filter(n => n.selected);
  const selectedEdges = edges.filter(e => e.selected);

  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null;

  // Reset tab when selection changes
  useEffect(() => {
    setActiveTab('properties');
  }, [selectedNode?.id, selectedEdge?.id]);

  if (selectedNodes.length === 0 && selectedEdges.length === 0) {
    return (
      <div className="w-80 h-full bg-[var(--bg-sidebar)] border-l border-[var(--border-main)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-app)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
          <Settings size={24} />
        </div>
        <h3 className="text-sm font-black text-[var(--text-main)] mb-1">Properties Panel</h3>
        <p className="text-[10px] text-[var(--text-muted)] font-medium">Select a node or edge to edit its properties, configurations, and notes.</p>
      </div>
    );
  }

  if (selectedNodes.length > 1 || selectedEdges.length > 1 || (selectedNodes.length > 0 && selectedEdges.length > 0)) {
    return (
      <div className="w-80 h-full bg-[var(--bg-sidebar)] border-l border-[var(--border-main)] flex flex-col p-4">
        <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          <span className="text-xs font-bold">Multiple items selected</span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-4">
          Selected: {selectedNodes.length} nodes, {selectedEdges.length} edges
        </div>
        <button
          onClick={() => removeElements(selectedNodes, selectedEdges)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors text-xs font-bold"
        >
          <Trash2 size={14} /> Delete Selection
        </button>
      </div>
    );
  }

  // Handle Edge properties
  if (selectedEdge) {
    const data = selectedEdge.data || {};
    return (
      <div className="w-80 h-full bg-[var(--bg-sidebar)] border-l border-[var(--border-main)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-main)] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-[var(--text-main)] flex items-center gap-2">
              <Link2 size={16} className="text-indigo-400" /> Edge Connection
            </h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Protocol</label>
            <select
              value={data.protocol || 'REST'}
              onChange={e => updateEdgeData(selectedEdge.id, { protocol: e.target.value })}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500 transition-colors"
            >
              <option value="REST">REST</option>
              <option value="gRPC">gRPC</option>
              <option value="WebSocket">WebSocket</option>
              <option value="pub/sub">Pub/Sub</option>
              <option value="DB">Database Link</option>
              <option value="Redis">Redis Link</option>
              <option value="Internal">Internal Call</option>
              <option value="HTTP">HTTP</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Label (Optional)</label>
            <input
              type="text"
              value={data.label || ''}
              onChange={e => updateEdgeData(selectedEdge.id, { label: e.target.value })}
              placeholder="e.g. Fetches User Profile"
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={data.isAsync || false}
              onChange={e => updateEdgeData(selectedEdge.id, { isAsync: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--border-main)] text-brand-500 focus:ring-brand-500/30"
            />
            <span className="text-xs font-bold text-[var(--text-main)]">Asynchronous (Animated)</span>
          </label>
          <div className="pt-4 border-t border-[var(--border-main)]">
            <button
              onClick={() => removeElements([], [selectedEdge])}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors text-xs font-bold"
            >
              <Trash2 size={14} /> Delete Edge
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Node properties
  const node = selectedNode;
  const config = NODE_SHAPE_CONFIG[node.type] || {};
  const data = node.data || {};
  
  // Custom property fields based on node type
  const renderFields = () => {
    switch(node.type) {
      case 'entityNode':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Model Name</label>
              <input type="text" value={data.name || ''} onChange={e => updateNodeData(node.id, { name: e.target.value })} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500" />
            </div>
            {/* Very basic field editor for now */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Fields (JSON)</label>
              <textarea 
                value={JSON.stringify(data.fields || [], null, 2)} 
                onChange={e => {
                  try { updateNodeData(node.id, { fields: JSON.parse(e.target.value) }); } catch(err) { /* ignore parse errors while typing */ }
                }}
                rows={6}
                className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] font-mono text-[9px] rounded-lg px-3 py-2 text-[var(--text-main)] outline-none focus:border-brand-500" 
              />
            </div>
          </>
        );
      case 'apiNode':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Route Path</label>
              <input type="text" value={data.route || ''} onChange={e => updateNodeData(node.id, { route: e.target.value })} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-brand-500" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={data.authEnabled || false} onChange={e => updateNodeData(node.id, { authEnabled: e.target.checked })} className="w-4 h-4 rounded text-brand-500" />
              <span className="text-xs font-bold text-[var(--text-main)]">Requires Authentication</span>
            </label>
          </>
        );
      case 'dbNode':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Database Name</label>
              <input type="text" value={data.dbName || ''} onChange={e => updateNodeData(node.id, { dbName: e.target.value })} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Type</label>
              <select value={data.type || 'mongodb'} onChange={e => updateNodeData(node.id, { type: e.target.value })} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500">
                <option value="mongodb">MongoDB</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">URI (Connection String)</label>
              <input type="text" value={data.uri || ''} onChange={e => updateNodeData(node.id, { uri: e.target.value })} className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-brand-500" />
            </div>
          </>
        );
      default:
        // Basic fallback for other nodes
        return (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Data (JSON)</label>
            <textarea 
              value={JSON.stringify(data, null, 2)} 
              onChange={e => {
                try { updateNodeData(node.id, JSON.parse(e.target.value)); } catch(err) { /* ignore */ }
              }}
              rows={8}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] font-mono text-[9px] rounded-lg px-3 py-2 text-[var(--text-main)] outline-none focus:border-brand-500" 
            />
          </div>
        );
    }
  };

  return (
    <div className="w-80 h-full bg-[var(--bg-sidebar)] border-l border-[var(--border-main)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-main)] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-[var(--text-main)]">{config.label || node.type}</h3>
            {config.category && <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{config.category}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[var(--bg-app)] rounded-lg border border-[var(--border-main)]">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'properties' ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <Settings size={12} /> Config
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'notes' ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            <AlignLeft size={12} /> Notes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'properties' ? (
            <motion.div
              key="props"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Common properties */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Description</label>
                <input
                  type="text"
                  value={data.description || ''}
                  onChange={e => updateNodeData(node.id, { description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              
              {/* Type-specific fields */}
              {renderFields()}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-2 h-full flex flex-col"
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Implementation Notes</label>
              <textarea
                value={data.notes || ''}
                onChange={e => updateNodeData(node.id, { notes: e.target.value })}
                placeholder="Add implementation details, to-dos, or links here..."
                className="flex-1 w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-main)] shrink-0">
        <button
          onClick={() => removeElements([node], [])}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors text-xs font-bold"
        >
          <Trash2 size={14} /> Delete Node
        </button>
      </div>
    </div>
  );
}
