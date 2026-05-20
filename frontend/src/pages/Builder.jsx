import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api.js';
import { templates } from '../utils/templates.js';
import { ARCHITECTURE_TEMPLATES } from '../constants/templates.js';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { ArchitectureProvider, useArchitecture } from '../context/ArchitectureContext';
import NodeSidebar from '../components/NodeSidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import RelationshipModal from '../components/RelationshipModal';
import NodeToolbarWrapper from '../components/NodeToolbarWrapper';
import CodePreview from '../components/CodePreview';
import { DocumentationPanel } from '../components/DocumentationPanel';

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
// Infrastructure Nodes
import CacheNode from '../components/nodes/CacheNode';
import LoadBalancerNode from '../components/nodes/LoadBalancerNode';
import CdnNode from '../components/nodes/CdnNode';
import QueueNode from '../components/nodes/QueueNode';
import CounterServiceNode from '../components/nodes/CounterServiceNode';
import ReplicaNode from '../components/nodes/ReplicaNode';

import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Code2,
  X,
  FileText,
  Plus,
  BookOpen
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { startBuilderTour } from '../utils/tour';

const wrapNode = (NodeComponent) => (props) => (
  <NodeToolbarWrapper {...props}>
    <NodeComponent {...props} />
  </NodeToolbarWrapper>
);

const nodeTypes = {
  entityNode: wrapNode(EntityNode),
  apiNode: wrapNode(ApiNode),
  authNode: wrapNode(AuthNode),
  dbNode: wrapNode(DbNode),
  mailNode: wrapNode(MailNode),
  logicNode: wrapNode(LogicNode),
  middlewareNode: wrapNode(MiddlewareNode),
  storageNode: wrapNode(StorageNode),
  cronNode: wrapNode(CronNode),
  webhookNode: wrapNode(WebhookNode),
  // Infrastructure nodes
  cacheNode: wrapNode(CacheNode),
  loadBalancerNode: wrapNode(LoadBalancerNode),
  cdnNode: wrapNode(CdnNode),
  queueNode: wrapNode(QueueNode),
  counterServiceNode: wrapNode(CounterServiceNode),
  replicaNode: wrapNode(ReplicaNode),
};

function BuilderCanvas({ workflow, isTemplate }) {
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
    confirmConnection,
    documentation,
    setDocumentation,
    onNodesDelete,
    toastMessage
  } = useArchitecture();
  const { id, slug } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { screenToFlowPosition } = useReactFlow();

  const [showReadmeModal, setShowReadmeModal] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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

  const handlePreview = () => {
    setShowPreviewModal(true);
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

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newId = addNode(type, position);
      if (newId) {
        setSelectedNodeId(newId);
        setShowRightSidebar(true);
      }
    },
    [addNode, screenToFlowPosition, setSelectedNodeId, setShowRightSidebar]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className={`flex h-full w-full bg-[var(--bg-app)] relative overflow-hidden ${isTemplate ? 'pt-20' : ''}`}>
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
        onDrop={isTemplate ? undefined : onDrop}
        onDragOver={isTemplate ? undefined : onDragOver}
        id="tour-canvas"
      >

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          nodesDraggable={!isTemplate}
          nodesConnectable={!isTemplate}
          elementsSelectable={!isTemplate}
          deleteKeyCode={['Backspace', 'Delete']}
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
            <button onClick={() => {
              if (location.state?.from) {
                navigate(location.state.from);
              } else {
                navigate(isTemplate ? '/templates' : '/dashboard');
              }
            }} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-main)]">
              <ArrowLeft size={18} />
            </button>
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
                onClick={() => !isTemplate && setIsRenaming(true)}
              >
                {workflow.name} {isTemplate && <span className="ml-2 text-xs font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">TEMPLATE</span>}
              </h2>
            )}
          </Panel>

          <Panel position="top-right" className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReadmeModal(true)}
              className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all text-[var(--text-main)]"
            >
              <BookOpen size={16} />
              Readme
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreview}
              className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all text-[var(--text-main)]"
            >
              <Eye size={16} />
              Preview
            </motion.button>
            {isTemplate ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const isLoggedIn = !!localStorage.getItem('architect_user');
                  if (!isLoggedIn) {
                    sessionStorage.setItem('architect_load_template', JSON.stringify({
                      name: workflow.name,
                      nodes: nodes,
                      edges: edges,
                      documentation: documentation || `# ${workflow.name}\n\n`
                    }));
                    navigate('/login?mode=signup');
                    return;
                  }

                  setIsGenerating(true);
                  try {
                    const res = await api('/workflows', {
                      method: 'POST',
                      body: JSON.stringify({
                        name: `${workflow.name} Project`,
                        architecture_json: {
                          nodes: nodes,
                          edges: edges,
                          documentation: documentation,
                          database: 'mongodb'
                        }
                      })
                    });
                    const data = await res.json();
                    if (data.id) {
                      navigate(`/workflow/${data.id}`);
                    } else {
                      navigate('/login');
                    }
                  } catch (e) {
                    navigate('/login');
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating}
                className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isGenerating ? 'Forking...' : 'Use Template'}
              </motion.button>
            ) : (
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
            )}
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
        {showPreviewModal && (
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
              <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                    <Code2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text-main)]">Architecture Preview</h2>
                    <p className="text-sm text-[var(--text-muted)] font-medium">Verify your generated backend structure</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2.5 hover:bg-[var(--bg-app)] rounded-2xl transition-colors text-[var(--text-muted)] hover:text-red-500"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodePreview nodes={nodes} edges={edges} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Readme Modal — unified editable documentation */}
      <AnimatePresence>
        {showReadmeModal && (
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
              className="bg-[var(--bg-surface)] w-full max-w-4xl h-full rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[var(--text-main)]">Project README</h2>
                    <p className="text-xs text-[var(--text-muted)]">Auto-generated · editable · saved with your project</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReadmeModal(false)}
                  className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <DocumentationPanel
                  nodes={nodes}
                  edges={edges}
                  projectName={workflow.name}
                  documentation={documentation}
                  setDocumentation={setDocumentation}
                  isTemplate={isTemplate}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[200] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-2xl rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${toastMessage.type === 'info' ? 'bg-brand-500/10 text-brand-500' : 'bg-red-500/10 text-red-500'}`}>
              <FileText size={16} />
            </div>
            <span className="text-sm font-bold text-[var(--text-main)]">
              {toastMessage.message}
            </span>
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


export default function Builder({ isTemplate = false }) {
  const { id, slug } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (isTemplate) {
        const template = templates.find(t => t.slug === slug);
        if (template) {
          setWorkflow({
            name: template.name,
            architecture_json: template.architecture
          });
        } else {
          const customTemplate = ARCHITECTURE_TEMPLATES.find(t => t.id === slug);
          if (customTemplate) {
            setWorkflow({
              name: customTemplate.name,
              architecture_json: {
                nodes: customTemplate.nodes,
                edges: customTemplate.edges,
                documentation: customTemplate.documentation || `# ${customTemplate.name}\n\n${customTemplate.description}`
              }
            });
          }
        }
        setLoading(false);
        return;
      }

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
  }, [id, slug, isTemplate]);

  const handleSave = async (architecture) => {
    if (isTemplate) return;
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
        <BuilderCanvas workflow={workflow} isTemplate={isTemplate} />
      </ReactFlowProvider>
    </ArchitectureProvider>
  );
}
