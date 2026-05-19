import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { useDemo } from '../context/DemoContext';
import { ArchitectureProvider, useArchitecture } from '../context/ArchitectureContext';
import { DemoBanner } from '../components/demo/DemoBanner';
import { DemoGateModal } from '../components/demo/DemoGateModal';
import { DemoInactivityNudge } from '../components/demo/DemoInactivityNudge';

import NodeSidebar from '../components/NodeSidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import CodePreview from '../components/CodePreview';
import { DocumentationPanel } from '../components/DocumentationPanel';
import NodeToolbarWrapper from '../components/NodeToolbarWrapper';

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
  Code2,
  X,
  BookOpen,
  FileText,
  Plus,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

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
  cacheNode: wrapNode(CacheNode),
  loadBalancerNode: wrapNode(LoadBalancerNode),
  cdnNode: wrapNode(CdnNode),
  queueNode: wrapNode(QueueNode),
  counterServiceNode: wrapNode(CounterServiceNode),
  replicaNode: wrapNode(ReplicaNode),
};

// ─── Inner Canvas (needs to be child of ReactFlowProvider) ────────────────
function DemoCanvasInner() {
  const {
    demoProjectName,
    hasUnsavedChanges,
  } = useDemo();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    addNode,
    documentation,
    setDocumentation,
  } = useArchitecture();

  const { screenToFlowPosition } = useReactFlow();

  const navigate = useNavigate();
  const { theme } = useTheme();

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateAction, setGateAction] = useState('save your work');
  const [showNudge, setShowNudge] = useState(false);

  // ── beforeunload warning ──────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Your demo progress will be lost on refresh. Create a free account to save your work.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ── 20-minute inactivity nudge ────────────────────────────────────────────
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setShowNudge(true), 20 * 60 * 1000);
    };
    ['mousemove', 'keydown', 'click'].forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      ['mousemove', 'keydown', 'click'].forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newId = addNode(type, position);
    if (newId) {
      setSelectedNodeId(newId);
      setShowRightSidebar(true);
    }
  }, [addNode, screenToFlowPosition, setSelectedNodeId, setShowRightSidebar]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
    setShowRightSidebar(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const openGate = (action) => {
    setGateAction(action);
    setShowGateModal(true);
  };

  return (
    <div className="flex h-full w-full bg-[var(--bg-app)] relative overflow-hidden">
      {/* Left Sidebar */}
      <motion.div
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

          {/* Top-left panel: back + project name */}
          <Panel position="top-left" className="flex items-center gap-4 bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-main)] shadow-xl">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-main)]"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-px bg-[var(--border-main)]" />
            <h2 className="font-black text-sm px-2 truncate max-w-[200px] text-[var(--text-main)]">
              {demoProjectName}
              <span className="ml-2 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">DEMO</span>
            </h2>
          </Panel>

          {/* Top-right panel: actions */}
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
              onClick={() => setShowPreviewModal(true)}
              className="bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all text-[var(--text-main)]"
            >
              <Eye size={16} />
              Preview
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openGate('export your code')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
            >
              <Download size={16} />
              Generate Code
            </motion.button>
          </Panel>
        </ReactFlow>
      </motion.div>

      {/* Right Sidebar — Properties */}
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
      >
        <PropertiesPanel nodeId={selectedNodeId} />
      </motion.div>

      {/* Code Preview Modal */}
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
                    <p className="text-sm text-[var(--text-muted)] font-medium">Preview your backend structure</p>
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

      {/* Readme Modal */}
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
                    <p className="text-xs text-[var(--text-muted)]">Auto-generated · read-only in demo</p>
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
                  projectName={demoProjectName}
                  documentation={documentation}
                  setDocumentation={setDocumentation}
                  isTemplate={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Gate Modal */}
      <AnimatePresence>
        {showGateModal && (
          <DemoGateModal
            isOpen={showGateModal}
            onClose={() => setShowGateModal(false)}
            action={gateAction}
          />
        )}
      </AnimatePresence>

      {/* Inactivity Nudge */}
      <AnimatePresence>
        {showNudge && (
          <DemoInactivityNudge onDismiss={() => setShowNudge(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Public export ─────────────────────────────────────────────────────────
export default function DemoCanvas() {
  const { enterDemoMode, demoNodes, demoEdges, updateDemoNodes, updateDemoEdges, resetCounter } = useDemo();

  useEffect(() => {
    enterDemoMode();
  }, []);

  const handleSave = useCallback((arch) => {
    updateDemoNodes(arch.nodes);
    updateDemoEdges(arch.edges);
  }, [updateDemoNodes, updateDemoEdges]);

  return (
    <div className="h-screen flex flex-col bg-[#0d0d14] overflow-hidden pt-20">
      {/* Persistent demo banner */}
      <DemoBanner />

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <ArchitectureProvider key={resetCounter} initialData={{ nodes: demoNodes, edges: demoEdges }} onSave={handleSave}>
          <ReactFlowProvider>
            <DemoCanvasInner />
          </ReactFlowProvider>
        </ArchitectureProvider>
      </div>
    </div>
  );
}
