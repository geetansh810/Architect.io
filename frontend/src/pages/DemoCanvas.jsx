import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { useDemo } from '../context/DemoContext';
import { ArchitectureProvider, useArchitecture } from '../context/ArchitectureContext';
import { DemoBanner } from '../components/demo/DemoBanner';
import { DemoGateModal } from '../components/demo/DemoGateModal';
import { DemoInactivityNudge } from '../components/demo/DemoInactivityNudge';

import NodePalette from '../components/canvas/NodePalette';
import CanvasToolbar from '../components/canvas/CanvasToolbar';
import PropertiesPanel from '../components/PropertiesPanel';
import CodePreview from '../components/CodePreview';
import { DocumentationPanel } from '../components/DocumentationPanel';
import NodeToolbarWrapper from '../components/NodeToolbarWrapper';
import { validateConnection } from '../utils/connectionRules';

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
import FrontendNode from '../components/nodes/FrontendNode';
import ZoneGroup from '../components/nodes/ZoneGroup';
import StickyNote from '../components/nodes/StickyNote';
import TextLabel from '../components/nodes/TextLabel';
import CategoryBox from '../components/nodes/CategoryBox';

import CustomEdge from '../components/edges/CustomEdge';

import {
  Download, Eye, ArrowLeft, Code2, X, BookOpen, Pin, FileText,
} from 'lucide-react';

const wrapNode = (NodeComponent) => (props) => (
  <NodeToolbarWrapper {...props}>
    <NodeComponent {...props} />
  </NodeToolbarWrapper>
);

// Kept in step with Builder's registry on purpose: the sandbox now uses the
// same NodePalette, which offers every category — an unregistered type would
// drop onto the canvas as an unstyled default node.
const nodeTypes = {
  entityNode:         wrapNode(EntityNode),
  apiNode:            wrapNode(ApiNode),
  authNode:           wrapNode(AuthNode),
  dbNode:             wrapNode(DbNode),
  mailNode:           wrapNode(MailNode),
  logicNode:          wrapNode(LogicNode),
  middlewareNode:     wrapNode(MiddlewareNode),
  storageNode:        wrapNode(StorageNode),
  cronNode:           wrapNode(CronNode),
  webhookNode:        wrapNode(WebhookNode),
  cacheNode:          wrapNode(CacheNode),
  loadBalancerNode:   wrapNode(LoadBalancerNode),
  cdnNode:            wrapNode(CdnNode),
  queueNode:          wrapNode(QueueNode),
  counterServiceNode: wrapNode(CounterServiceNode),
  replicaNode:        wrapNode(ReplicaNode),
  frontendNode:       wrapNode(FrontendNode),
  mobileNode:         wrapNode(FrontendNode),
  browserNode:        wrapNode(FrontendNode),
  zoneGroup:          ZoneGroup,
  stickyNote:         StickyNote,
  textLabel:          TextLabel,
  categoryBox:        CategoryBox,
};

const edgeTypes = { custom: CustomEdge };

// ─── Inner Canvas (needs to be child of ReactFlowProvider) ────────────────
function DemoCanvasInner() {
  const { demoProjectName, hasUnsavedChanges } = useDemo();

  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodesDelete,
    onNodeDragStop, addNode, documentation, setDocumentation, toastMessage,
  } = useArchitecture();

  const { screenToFlowPosition } = useReactFlow();
  const navigate = useNavigate();

  const [inspectorPinned, setInspectorPinned] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [gridMode, setGridMode] = useState('dots');
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateAction, setGateAction] = useState('save your work');
  const [showNudge, setShowNudge] = useState(false);

  // Selection is owned by React Flow, so the inspector's visibility is derived
  // from it rather than tracked in a second piece of state — the same rule the
  // Builder follows, which is what keeps it honest through box-select and undo.
  const hasSelection  = nodes.some((n) => n.selected) || edges.some((e) => e.selected);
  const showInspector = hasSelection || inspectorPinned;

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
    addNode(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }, [addNode, screenToFlowPosition]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleAddNode = useCallback((type) => {
    const { x, y } = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    addNode(type, { x, y });
  }, [addNode, screenToFlowPosition]);

  const isValidConnection = useCallback((connection) => {
    const src = nodes.find((n) => n.id === connection.source);
    const tgt = nodes.find((n) => n.id === connection.target);
    return validateConnection(src, tgt, edges).valid;
  }, [nodes, edges]);

  const openGate = (action) => {
    setGateAction(action);
    setShowGateModal(true);
  };

  const gridCfg = GRID_CONFIG[gridMode];

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg-app)] relative overflow-hidden">
      {/* ── Header ──
          Matches the Builder's workspace chrome (h-14 bar, mode-filtered
          actions) instead of the floating card Panels the sandbox used to
          have — same product, so it should read as the same product. */}
      <header className="h-14 shrink-0 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 px-4 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            title="Back to home"
            className="p-1.5 hover:bg-[var(--bg-app)] rounded-lg transition-colors text-[var(--text-main)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-5 w-px bg-[var(--border-main)]" />
          {/* Badge sits outside the truncating element — inside it, a long
              project name clips the badge itself down to "S…". */}
          <h2 className="font-black text-sm px-1 truncate text-[var(--text-main)]">
            {demoProjectName}
          </h2>
          <span className="shrink-0 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sandbox
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <HeaderButton onClick={() => setShowReadmeModal(true)} title="Project README">
            <BookOpen size={15} />
            <span className="hidden lg:inline">Readme</span>
          </HeaderButton>
          <HeaderButton onClick={() => setShowPreviewModal(true)} title="Preview generated code">
            <Eye size={15} />
            <span className="hidden lg:inline">Preview</span>
          </HeaderButton>

          <div className="h-5 w-px bg-[var(--border-main)] mx-0.5" />

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => openGate('export your code')}
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Download size={15} />
            Generate
          </motion.button>
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette onAddNode={handleAddNode} />

        <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'custom', animated: false }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            deleteKeyCode={['Backspace', 'Delete']}
            snapToGrid={snapEnabled}
            snapGrid={snapEnabled ? [20, 20] : undefined}
            multiSelectionKeyCode="Shift"
            selectionKeyCode="Shift"
            colorMode="system"
            fitView
            minZoom={0.1}
            maxZoom={3}
          >
            {gridCfg.variant && (
              <Background
                key={gridMode}
                color="var(--border-main)"
                variant={gridCfg.variant}
                gap={gridCfg.gap}
                size={gridCfg.size}
              />
            )}
            {showMiniMap && (
              <MiniMap
                pannable zoomable
                className="!bg-[var(--bg-surface)] !border-[var(--border-main)] !shadow-xl !rounded-2xl !mb-20"
                nodeColor={(n) => NODE_COLORS[n.type] || '#64748b'}
                maskColor="rgba(0,0,0,0.06)"
              />
            )}
          </ReactFlow>

          <CanvasToolbar
            gridMode={gridMode}
            onGridModeChange={setGridMode}
            snapEnabled={snapEnabled}
            onSnapToggle={() => setSnapEnabled((v) => !v)}
            miniMapOpen={showMiniMap}
            onMiniMapToggle={() => setShowMiniMap((v) => !v)}
          />
        </div>

        {/* ── Inspector ── */}
        <div
          className="h-full overflow-hidden border-l border-[var(--border-main)] bg-[var(--bg-surface)]
            shrink-0 transition-[width] duration-300 ease-out"
          style={{ width: showInspector ? 320 : 0 }}
          aria-hidden={!showInspector}
        >
          <div className="w-80 h-full flex flex-col">
            <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-[var(--border-main)]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Inspector
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setInspectorPinned((v) => !v)}
                  title={inspectorPinned ? 'Unpin — close when nothing is selected' : 'Keep inspector open'}
                  className={`p-1 rounded-md transition-colors ${
                    inspectorPinned ? 'text-brand-500 bg-brand-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Pin size={12} />
                </button>
                <button
                  onClick={() => {
                    setInspectorPinned(false);
                    onNodesChange(nodes.map((n) => ({ id: n.id, type: 'select', selected: false })));
                  }}
                  title="Close inspector"
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <PropertiesPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Code Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <Modal onClose={() => setShowPreviewModal(false)} maxWidth="max-w-6xl"
            icon={Code2} title="Architecture Preview" subtitle="Preview your backend structure">
            <CodePreview nodes={nodes} edges={edges} />
          </Modal>
        )}
      </AnimatePresence>

      {/* Readme Modal */}
      <AnimatePresence>
        {showReadmeModal && (
          <Modal onClose={() => setShowReadmeModal(false)} maxWidth="max-w-4xl"
            icon={BookOpen} title="Project README" subtitle="Auto-generated · read-only in the sandbox">
            <DocumentationPanel
              nodes={nodes}
              edges={edges}
              projectName={demoProjectName}
              documentation={documentation}
              setDocumentation={setDocumentation}
              isTemplate
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[200] bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-2xl rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${toastMessage.type === 'info' ? 'bg-brand-500/10 text-brand-500' : 'bg-red-500/10 text-red-500'}`}>
              <FileText size={16} />
            </div>
            <span className="text-sm font-bold text-[var(--text-main)]">{toastMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGateModal && (
          <DemoGateModal isOpen={showGateModal} onClose={() => setShowGateModal(false)} action={gateAction} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNudge && <DemoInactivityNudge onDismiss={() => setShowNudge(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────────────

const GRID_CONFIG = {
  dots:  { variant: 'dots',  gap: 24, size: 1.5 },
  lines: { variant: 'lines', gap: 24, size: 0.5 },
  cross: { variant: 'cross', gap: 24, size: 6 },
  none:  { variant: null },
};

const NODE_COLORS = {
  entityNode: '#10b981', apiNode: '#3b82f6', authNode: '#f59e0b',
  dbNode: '#94a3b8', mailNode: '#f43f5e', logicNode: '#6366f1',
  middlewareNode: '#06b6d4', storageNode: '#f97316', cronNode: '#a855f7',
  webhookNode: '#d946ef', cacheNode: '#ef4444', loadBalancerNode: '#0ea5e9',
  cdnNode: '#f59e0b', queueNode: '#f97316', counterServiceNode: '#8b5cf6',
  replicaNode: '#94a3b8', zoneGroup: '#64748b', stickyNote: '#fbbf24',
  categoryBox: '#3b82f6',
};

function HeaderButton({ onClick, title, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={title}
      className="border rounded-lg text-sm font-bold flex items-center gap-2 px-2.5 py-2 transition-colors
        whitespace-nowrap bg-[var(--bg-app)] border-[var(--border-main)] hover:border-brand-500
        text-[var(--text-muted)] hover:text-brand-500"
    >
      {children}
    </motion.button>
  );
}

function Modal({ onClose, maxWidth, icon: Icon, title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`bg-[var(--bg-surface)] w-full ${maxWidth} h-full rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden`}
      >
        <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500"><Icon size={20} /></div>
            <div>
              <h2 className="text-base font-black text-[var(--text-main)]">{title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </motion.div>
    </motion.div>
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
    <div className="h-screen flex flex-col bg-[var(--bg-app)] overflow-hidden pt-20">
      <DemoBanner />
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
