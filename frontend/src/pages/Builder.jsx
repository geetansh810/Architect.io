import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { ArchitectureProvider, useArchitecture } from '../context/ArchitectureContext';
import NodeSidebar from '../components/NodeSidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import RelationshipModal from '../components/RelationshipModal';

// Node Components
import EntityNode from '../components/nodes/EntityNode';
import ApiNode from '../components/nodes/ApiNode';
import AuthNode from '../components/nodes/AuthNode';
import DbNode from '../components/nodes/DbNode';
import MailNode from '../components/nodes/MailNode';
import LogicNode from '../components/nodes/LogicNode';
import MiddlewareNode from '../components/nodes/MiddlewareNode';
import StorageNode from '../components/nodes/StorageNode';
import CronNode from '../components/nodes/CronNode';
import WebhookNode from '../components/nodes/WebhookNode';

import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  Loader2,
  Code2,
  X,
  FileCode
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { shadesOfPurple, vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import { startBuilderTour } from '../utils/tour';

const nodeTypes = {
  entityNode: EntityNode,
  apiNode: ApiNode,
  authNode: AuthNode,
  dbNode: DbNode,
  mailNode: MailNode,
  logicNode: LogicNode,
  middlewareNode: MiddlewareNode,
  storageNode: StorageNode,
  cronNode: CronNode,
  webhookNode: WebhookNode,
};

function BuilderCanvas({ workflow }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    parseToBackendPayload,
    pendingConnection,
    setPendingConnection,
    confirmConnection
  } = useArchitecture();
  const { id } = useParams();
  const { theme } = useTheme();

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(workflow.name);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
    setShowRightSidebar(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  useEffect(() => {
    startBuilderTour();
  }, []);

  const handleRename = async () => {
    if (!tempName.trim() || tempName === workflow.name) {
      setIsRenaming(false);
      return;
    }
    try {
      const res = await api(`/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: tempName })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to rename project');
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Rename Error: ' + err.message);
    }
  };

  const handlePreview = async () => {
    try {
      const payload = parseToBackendPayload();
      const res = await api('/generate/preview', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setPreviewData(data);
      setActivePreviewFile(Object.keys(data)[0]);
    } catch (err) {
      alert('Failed to generate preview');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const payload = parseToBackendPayload();
      const res = await api('/generate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Generation failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-backend.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Code Generation Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = { x: event.clientX - 400, y: event.clientY - 200 };
      addNode(type, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="flex h-full w-full bg-[var(--bg-app)] relative overflow-hidden">
      {/* Left Sidebar - Nodes */}
      <motion.div
        id="tour-node-sidebar"
        animate={{ width: showLeftSidebar ? 288 : 0 }}
        className="h-full shrink-0 overflow-hidden border-r border-[var(--border-main)]"
      >
        <NodeSidebar />
      </motion.div>

      <button
        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
        className="absolute top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-r-xl shadow-lg hover:text-brand-500 transition-all"
        style={{ left: showLeftSidebar ? 287 : 0 }}
      >
        {showLeftSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Canvas Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 h-full relative"
        onDrop={onDrop}
        onDragOver={onDragOver}
        id="tour-canvas"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          colorMode="system"
          fitView
        >
          <Background color="var(--border-main)" variant="dots" gap={24} size={1} />
          <Controls className="!bg-[var(--bg-surface)] !border-[var(--border-main)] !shadow-xl !rounded-xl overflow-hidden" />
          <MiniMap
            className="!bg-[var(--bg-surface)] !border-[var(--border-main)] !shadow-xl !rounded-2xl"
            nodeColor="#4f46e5"
            maskColor="rgba(0,0,0,0.05)"
          />

          <Panel position="top-left" className="flex items-center gap-4 bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-main)] shadow-xl">
            <Link to="/dashboard" className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-main)]">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-6 w-px bg-[var(--border-main)]" />
            {isRenaming ? (
              <input
                autoFocus
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="bg-transparent border-none outline-none font-black text-sm px-2 text-brand-500"
              />
            ) : (
              <h2
                className="font-black text-sm px-2 truncate max-w-[200px] text-[var(--text-main)] cursor-pointer hover:text-brand-500"
                onClick={() => setIsRenaming(true)}
              >
                {workflow.name}
              </h2>
            )}
          </Panel>

          <Panel position="top-right" className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreview}
              className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all text-[var(--text-main)]"
            >
              <Eye size={16} />
              Preview
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
              id="tour-generate-btn"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isGenerating ? 'Building...' : 'Generate Code'}
            </motion.button>
          </Panel>
        </ReactFlow>
      </motion.div>

      {/* Right Sidebar - Properties */}
      <button
        onClick={() => setShowRightSidebar(!showRightSidebar)}
        className="absolute top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-l-xl shadow-lg hover:text-brand-500 transition-all"
        style={{ right: showRightSidebar ? 319 : 0 }}
      >
        {showRightSidebar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <motion.div
        animate={{ width: showRightSidebar ? 320 : 0 }}
        className="h-full shrink-0 overflow-hidden border-l border-[var(--border-main)] bg-[var(--bg-surface)]"
        id="tour-properties-panel"
      >
        <PropertiesPanel nodeId={selectedNodeId} />
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] w-full max-w-6xl h-full rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--border-main)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-brand-500/10 rounded-2xl text-brand-500">
                    <Code2 size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--text-main)]">Architecture Preview</h2>
                    <p className="text-sm text-[var(--text-muted)] font-medium">Verify your generated backend structure</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewData(null)}
                  className="p-3 hover:bg-[var(--bg-app)] rounded-2xl transition-colors text-[var(--text-muted)] hover:text-red-500"
                >
                  <X size={28} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-72 border-r border-[var(--border-main)] overflow-y-auto p-6 space-y-1 bg-[var(--bg-sidebar)]">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 block">Generated Files</label>
                  {Object.keys(previewData).map(file => (
                    <button
                      key={file}
                      onClick={() => setActivePreviewFile(file)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors truncate flex items-center gap-2 ${activePreviewFile === file ? 'bg-brand-500 text-white' : 'hover:bg-brand-500/5 text-[var(--text-main)]'}`}
                      title={file}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${activePreviewFile === file ? 'bg-white' : 'bg-brand-500'}`} />
                      {file.split('/').pop()}
                    </button>
                  ))}
                </div>
                <div className="flex-1 bg-[var(--bg-app)] overflow-auto relative">
                  <SyntaxHighlighter
                    language="javascript"
                    style={theme === 'dark' ? vscDarkPlus : prism}
                    customStyle={{
                      margin: 0,
                      padding: '2.5rem',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      backgroundColor: 'transparent',
                      height: '100%',
                      fontFamily: '"JetBrains Mono", "Fira Code", monospace'
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: 'var(--text-muted)', opacity: 0.5 }}
                  >
                    {previewData[activePreviewFile] || ''}
                  </SyntaxHighlighter>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RelationshipModal 
        isOpen={!!pendingConnection}
        onClose={() => setPendingConnection(null)}
        onConfirm={confirmConnection}
        sourceName={nodes.find(n => n.id === pendingConnection?.source)?.data.name || 'Source'}
        targetName={nodes.find(n => n.id === pendingConnection?.target)?.data.name || 'Target'}
      />
    </div>
  );
}


export default function Builder() {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await api(`/workflows/${id}`);
        const data = await res.json();
        setWorkflow(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [id]);

  const handleSave = async (architecture) => {
    try {
      await api(`/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: workflow.name, architecture_json: architecture })
      });
    } catch (err) {
      console.error('Auto-save failed', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-[var(--bg-app)]">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );

  if (!workflow) return <div className="p-8 text-center text-red-500">Project not found</div>;

  const parsedArch = typeof workflow.architecture_json === 'string'
    ? JSON.parse(workflow.architecture_json)
    : workflow.architecture_json;

  return (
    <ArchitectureProvider initialData={parsedArch} onSave={handleSave}>
      <ReactFlowProvider>
        <BuilderCanvas workflow={workflow} />
      </ReactFlowProvider>
    </ArchitectureProvider>
  );
}
