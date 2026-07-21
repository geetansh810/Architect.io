import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api.js';
import { templates } from '../utils/templates.js';
import { ARCHITECTURE_TEMPLATES } from '../constants/templates.js';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
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
import CanvasToolbar from '../components/canvas/CanvasToolbar';
import CanvasContextMenu from '../components/canvas/CanvasContextMenu';
import KeyboardShortcuts from '../components/canvas/KeyboardShortcuts';
import ShortcutHelpModal from '../components/canvas/ShortcutHelpModal';
import NodeSearchCommand from '../components/canvas/NodeSearchCommand';
import ArchitectureIntelligence from '../components/canvas/ArchitectureIntelligence';
import AIArchitectModal from '../components/AIArchitectModal';
import ValidationReportModal from '../components/ValidationReportModal';
import { validateArchitecture, validateConnection } from '../utils/connectionRules';
import * as htmlToImage from 'html-to-image';

// Node Components — Backend
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
  Download, Eye, ChevronLeft, ChevronRight, ArrowLeft,
  Loader2, Code2, X, FileText, Plus, BookOpen,
  Keyboard, Presentation, Zap, Image, Sun, Moon, Sparkles
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { startBuilderTour } from '../utils/tour';

// ── Node type registrations ───────────────────────────────────────────────────
const wrapNode = (NodeComponent) => (props) => (
  <NodeToolbarWrapper {...props}>
    <NodeComponent {...props} />
  </NodeToolbarWrapper>
);

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
  // Frontend & Annotation nodes (visual-only)
  frontendNode:       wrapNode(FrontendNode),
  mobileNode:         wrapNode(FrontendNode),
  browserNode:        wrapNode(FrontendNode),
  zoneGroup:          ZoneGroup,
  stickyNote:         StickyNote,
  textLabel:          TextLabel,
  categoryBox:        CategoryBox,
};

const edgeTypes = {
  custom: CustomEdge,
};

// ── Grid background config by mode ───────────────────────────────────────────
const GRID_CONFIG = {
  dots:  { variant: 'dots',   gap: 24, size: 1.5,  lightColor: '#cbd5e1', darkColor: '#3f3f46' },
  lines: { variant: 'lines',  gap: 24, size: 0.5,  lightColor: '#cbd5e1', darkColor: '#3f3f46' },
  cross: { variant: 'cross',  gap: 24, size: 6,    lightColor: '#cbd5e1', darkColor: '#3f3f46' },
  none:  { variant: null },
};

// ── Canvas Component ──────────────────────────────────────────────────────────
function BuilderCanvas({ workflow, isTemplate }) {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    addNode, parseToBackendPayload, pendingConnection, setPendingConnection,
    confirmConnection, documentation, setDocumentation, onNodesDelete, toastMessage,
    undo, redo, canUndo, canRedo, onNodeDragStop,
  } = useArchitecture();

  const { id, slug } = useParams();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  // Local canvas theme state (decoupled from platform theme)
  const [canvasTheme, setCanvasTheme] = useState(() => {
    const saved = localStorage.getItem('architect_canvas_theme');
    return saved || 'light';
  });

  const toggleCanvasTheme = () => {
    setCanvasTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('architect_canvas_theme', next);
      return next;
    });
  };

  // ── UI state ──
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showIntelligencePanel, setShowIntelligencePanel] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [validationReport, setValidationReport] = useState(null); // { errors, warnings } | null
  const [presentationMode, setPresentationMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [tempName, setTempName] = useState(workflow.name);

  // ── Canvas state ──
  const [gridMode, setGridMode] = useState('dots');
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });

  // ── Node click ──
  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
    setShowRightSidebar(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setContextMenu({ open: false, x: 0, y: 0 });
  }, []);

  // ── Context menu on pane right-click ──
  const onPaneContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ open: true, x: e.clientX, y: e.clientY });
  }, []);

  // ── Shortcut ? key ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) {
        setShowShortcutsModal(v => !v);
      }
      if (e.key === 's' && !e.ctrlKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) {
        setSnapEnabled(v => !v);
      }
      if (e.key === 'Escape' && presentationMode) {
        setPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode]);

  useEffect(() => { startBuilderTour(); }, []);

  // ── Rename ──
  const handleRename = async () => {
    if (!tempName.trim() || tempName === workflow.name) { setIsRenaming(false); return; }
    try {
      const res = await api(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify({ name: tempName }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      window.location.reload();
    } catch (err) { alert('Rename Error: ' + err.message); }
  };

  // ── Code generation (with pre-flight connection rectification) ──
  const doGenerate = async () => {
    setIsGenerating(true);
    try {
      const payload = { ...parseToBackendPayload(), projectName: workflow.name };
      const res = await api('/generate', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) {
        let errorMsg = 'Generation failed';
        try {
          const d = await res.json();
          if (d.validation) {
            // Server-side rectification refused the graph — show the report
            setValidationReport(d.validation);
            return;
          }
          errorMsg = d.error || errorMsg;
        } catch {
          errorMsg = `Server error (${res.status}). Please try again.`;
        }
        throw new Error(errorMsg);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-backend.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      setValidationReport(null);
    } catch (err) { alert('Code Generation Error: ' + err.message); }
    finally { setIsGenerating(false); }
  };

  const handleGenerate = () => {
    // Rectify the graph before any code is generated
    const validation = validateArchitecture(nodes, edges);
    if (validation.errors.length > 0 || validation.warnings.length > 0) {
      setValidationReport(validation);
      return;
    }
    doGenerate();
  };

  // ── Export PNG ──
  const handleExportImage = useCallback(async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.react-flow__viewport');
      if (!element) throw new Error('Canvas not found');
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: canvasTheme === 'dark' ? '#0a0f1e' : '#f1f5f9',
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-architecture.png`;
      a.click();
    } catch (err) { alert('Export failed: ' + err.message); }
    finally { setIsExporting(false); }
  }, [workflow.name, canvasTheme]);

  // ── Drag & drop from sidebar ──
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newId = addNode(type, position);
    if (newId) { setSelectedNodeId(newId); setShowRightSidebar(true); }
  }, [addNode, screenToFlowPosition]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  // ── Add node from context menu at canvas center ──
  const handleContextAddNode = useCallback((type) => {
    const { x, y } = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newId = addNode(type, { x, y });
    if (newId) { setSelectedNodeId(newId); setShowRightSidebar(true); }
  }, [addNode, screenToFlowPosition]);

  // ── Live connection rectification (dims invalid drop targets while dragging) ──
  const isValidConnection = useCallback((connection) => {
    const src = nodes.find(n => n.id === connection.source);
    const tgt = nodes.find(n => n.id === connection.target);
    return validateConnection(src, tgt, edges).valid;
  }, [nodes, edges]);

  const gridCfg = GRID_CONFIG[gridMode];
  const snapGrid = snapEnabled ? [20, 20] : undefined;

  return (
    <div className={`flex flex-col ${isTemplate ? 'h-screen pt-20' : 'h-full w-full'} bg-[var(--bg-app)] relative overflow-hidden`}>
      {/* ── Keyboard Shortcuts Handler ── */}
      <KeyboardShortcuts
        onFitView={() => fitView({ padding: 0.15, duration: 400 })}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenExport={handleExportImage}
        onTogglePresentationMode={() => setPresentationMode(true)}
      />
      
      <NodeSearchCommand 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)}
        onSelect={(nodeType) => handleContextAddNode(nodeType)}
      />

      {/* ── Top Navigation Bar ── */}
      {!presentationMode && (
        <header className="h-14 shrink-0 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 px-4 z-50">
          <div className="flex items-center gap-3 min-w-0 shrink">
            <button
              onClick={() => {
                if (location.state?.from) navigate(location.state.from);
                else navigate(isTemplate ? '/templates' : '/dashboard');
              }}
              className="p-1.5 hover:bg-[var(--bg-app)] rounded-lg transition-colors text-[var(--text-main)]"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-5 w-px bg-[var(--border-main)]" />
            {isRenaming ? (
              <input
                autoFocus type="text" value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="bg-transparent border-none outline-none font-black text-sm px-2 text-brand-500"
              />
            ) : (
              <h2
                className={`font-black text-sm px-1 ${isTemplate ? '' : 'truncate max-w-[200px]'} text-[var(--text-main)] cursor-pointer hover:text-brand-500`}
                onClick={() => !isTemplate && setIsRenaming(true)}
              >
                {workflow.name}
                {isTemplate && <span className="ml-2 text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Template</span>}
              </h2>
            )}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-[75vw] [&>*]:shrink-0 [&_button]:whitespace-nowrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCanvasTheme}
              title={canvasTheme === 'dark' ? 'Switch Canvas to Light Mode' : 'Switch Canvas to Dark Mode'} 
              className="bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 p-2 rounded-lg text-[var(--text-muted)] hover:text-brand-500 transition-colors"
            >
              {canvasTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPresentationMode(true)} title="Presentation Mode" className="bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 p-2 rounded-lg text-[var(--text-muted)] hover:text-brand-500 transition-colors">
              <Presentation size={15} />
            </motion.button>
            {!isTemplate && (
              <>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAIModal(true)} title="AI Architect — generate a workflow from a prompt" className="bg-violet-500/10 border border-violet-500/30 hover:border-violet-500 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 text-violet-500 transition-colors">
                  <Sparkles size={15} /> AI Architect
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportImage} disabled={isExporting} title="Export as PNG" className="bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 p-2 rounded-lg text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                  {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Image size={15} />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowIntelligencePanel(true)} title="Architecture Intelligence" className="bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 p-2 rounded-lg text-amber-500 transition-colors">
                  <Zap size={15} className="fill-amber-500/20" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowShortcutsModal(true)} title="Keyboard Shortcuts" className="bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 p-2 rounded-lg text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                  <Keyboard size={15} />
                </motion.button>
              </>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowReadmeModal(true)} className="bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 text-[var(--text-main)] transition-colors">
              <BookOpen size={15} /> Readme
            </motion.button>
            {!isTemplate && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPreviewModal(true)} className="bg-[var(--bg-app)] border border-[var(--border-main)] hover:border-brand-500 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 text-[var(--text-main)] transition-colors">
                <Eye size={15} /> Preview
              </motion.button>
            )}
            
            <div className="h-5 w-px bg-[var(--border-main)] mx-1" />
            
            {isTemplate ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const isLoggedIn = !!localStorage.getItem('architect_user');
                  if (!isLoggedIn) {
                    sessionStorage.setItem('architect_load_template', JSON.stringify({ name: workflow.name, nodes, edges, documentation: documentation || `# ${workflow.name}\n\n` }));
                    navigate('/login?mode=signup'); return;
                  }
                  setIsGenerating(true);
                  try {
                    const res = await api('/workflows', { method: 'POST', body: JSON.stringify({ name: `${workflow.name} Project`, architecture_json: { nodes, edges, documentation, database: 'mongodb' } }) });
                    const data = await res.json();
                    navigate(data.id ? `/workflow/${data.id}` : '/login');
                  } catch { navigate('/login'); }
                  finally { setIsGenerating(false); }
                }}
                disabled={isGenerating}
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Use Template
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                id="tour-generate-btn"
                className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                Generate
              </motion.button>
            )}
          </div>
        </header>
      )}

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 flex overflow-hidden relative">
      
      {presentationMode && (
        <div className="absolute top-4 right-4 z-50">
          <motion.button
            onClick={() => setPresentationMode(false)}
            className="bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-main)] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all text-[var(--text-main)] hover:bg-[var(--bg-app)]"
          >
            Exit Presentation (Esc)
          </motion.button>
        </div>
      )}

      {/* ── Left Sidebar ── */}
      {!presentationMode && !isTemplate && (
        <>
          <motion.div
            id="tour-node-sidebar"
            animate={{ width: showLeftSidebar ? 288 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full shrink-0 overflow-hidden border-r border-[var(--border-main)]"
          >
            <NodeSidebar onAddNode={handleContextAddNode} />
          </motion.div>

          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className="absolute top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-r-xl shadow-lg hover:text-brand-500 transition-all"
            style={{ left: showLeftSidebar ? 287 : 0 }}
          >
            {showLeftSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </>
      )}

      {/* ── Canvas ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex-1 h-full relative ${canvasTheme}`}
        onDrop={isTemplate ? undefined : onDrop}
        onDragOver={isTemplate ? undefined : onDragOver}
        id="tour-canvas"
      >
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
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          nodesDraggable={!isTemplate}
          nodesConnectable={!isTemplate}
          elementsSelectable={!isTemplate}
          deleteKeyCode={['Backspace', 'Delete']}
          snapToGrid={snapEnabled}
          snapGrid={snapGrid}
          multiSelectionKeyCode="Shift"
          selectionKeyCode="Shift"
          colorMode={canvasTheme}
          fitView
          minZoom={0.1}
          maxZoom={3}
          proOptions={{ hideAttribution: false }}
        >
          {/* Background */}
          {gridCfg.variant && !presentationMode && (
            <Background
              key={`${gridMode}-${canvasTheme}`}
              color={canvasTheme === 'dark' ? gridCfg.darkColor : gridCfg.lightColor}
              variant={gridCfg.variant}
              gap={gridCfg.gap}
              size={gridCfg.size}
            />
          )}

          {!presentationMode && (
            <>
              <Controls
                className="!bg-[var(--bg-surface)] !border-[var(--border-main)] !shadow-xl !rounded-xl overflow-hidden"
              />
              <MiniMap
                className="!bg-[var(--bg-surface)] !border-[var(--border-main)] !shadow-xl !rounded-2xl"
                nodeColor={(n) => {
                  const colorMap = {
                    entityNode: '#10b981', apiNode: '#3b82f6', authNode: '#f59e0b',
                    dbNode: '#94a3b8', mailNode: '#f43f5e', logicNode: '#6366f1',
                    middlewareNode: '#06b6d4', storageNode: '#f97316', cronNode: '#a855f7',
                    webhookNode: '#d946ef', cacheNode: '#ef4444', loadBalancerNode: '#0ea5e9',
                    cdnNode: '#f59e0b', queueNode: '#f97316', counterServiceNode: '#8b5cf6',
                    replicaNode: '#94a3b8', zoneGroup: '#64748b', stickyNote: '#fbbf24',
                    categoryBox: '#3b82f6',
                  };
                  return colorMap[n.type] || '#64748b';
                }}
                maskColor="rgba(0,0,0,0.06)"
              />
            </>
          )}

          {/* Panels removed and moved to the unified header above */}
        </ReactFlow>

        {/* ── Floating Canvas Toolbar (bottom-center) ── */}
        {!isTemplate && !presentationMode && (
          <CanvasToolbar
            gridMode={gridMode}
            onGridModeChange={setGridMode}
            snapEnabled={snapEnabled}
            onSnapToggle={() => setSnapEnabled(v => !v)}
          />
        )}

        {/* ── Canvas Context Menu ── */}
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOpen={contextMenu.open}
          onClose={() => setContextMenu({ open: false, x: 0, y: 0 })}
          onFitView={() => fitView({ padding: 0.15, duration: 400 })}
          onAddNode={handleContextAddNode}
        />
      </motion.div>

      {/* ── Right Sidebar ── */}
      {!presentationMode && !isTemplate && (
        <>
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className="absolute top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-l-xl shadow-lg hover:text-brand-500 transition-all"
            style={{ right: showRightSidebar ? 319 : 0 }}
          >
            {showRightSidebar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <motion.div
            animate={{ width: showRightSidebar ? 320 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full shrink-0 overflow-hidden border-l border-[var(--border-main)] bg-[var(--bg-surface)]"
            id="tour-properties-panel"
          >
            <PropertiesPanel nodeId={selectedNodeId} />
          </motion.div>
        </>
      )}
      </div> {/* End Workspace Area */}

      {/* ── Intelligence Layer Overlay ── */}
      <ArchitectureIntelligence isOpen={showIntelligencePanel} onClose={() => setShowIntelligencePanel(false)} />

      {/* ── AI Architect ── */}
      <AIArchitectModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

      {/* ── Pre-generation validation report ── */}
      <ValidationReportModal
        isOpen={!!validationReport}
        onClose={() => setValidationReport(null)}
        validation={validationReport}
        onProceed={doGenerate}
        isGenerating={isGenerating}
      />

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] w-full max-w-6xl h-full rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500"><Code2 size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text-main)]">Architecture Preview</h2>
                    <p className="text-sm text-[var(--text-muted)] font-medium">Verify your generated backend structure</p>
                  </div>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="p-2.5 hover:bg-[var(--bg-app)] rounded-2xl transition-colors text-[var(--text-muted)] hover:text-red-500">
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

      {/* ── Readme Modal ── */}
      <AnimatePresence>
        {showReadmeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] w-full max-w-4xl h-full rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-500"><BookOpen size={20} /></div>
                  <div>
                    <h2 className="text-base font-black text-[var(--text-main)]">Project README</h2>
                    <p className="text-xs text-[var(--text-muted)]">Auto-generated · editable · saved with your project</p>
                  </div>
                </div>
                <button onClick={() => setShowReadmeModal(false)} className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-colors text-[var(--text-muted)] hover:text-red-500">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <DocumentationPanel nodes={nodes} edges={edges} projectName={workflow.name} documentation={documentation} setDocumentation={setDocumentation} isTemplate={isTemplate} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Shortcut Help Modal ── */}
      <ShortcutHelpModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />

      {/* ── Toast ── */}
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

      {/* ── Relationship Modal ── */}
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

// ── Root Builder ──────────────────────────────────────────────────────────────
export default function Builder({ isTemplate = false }) {
  const { id, slug } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (isTemplate) {
        const template = templates.find(t => t.slug === slug);
        if (template) {
          setWorkflow({ name: template.name, architecture_json: template.architecture });
        } else {
          const custom = ARCHITECTURE_TEMPLATES.find(t => t.id === slug);
          if (custom) {
            setWorkflow({
              name: custom.name,
              architecture_json: {
                nodes: custom.nodes,
                edges: custom.edges,
                categoryBoxes: custom.categoryBoxes || [],
                documentation: custom.documentation || `# ${custom.name}\n\n${custom.description}`
              }
            });
          }
        }
        setLoading(false); return;
      }
      try {
        const res = await api(`/workflows/${id}`);
        setWorkflow(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchWorkflow();
  }, [id, slug, isTemplate]);

  const handleSave = async (architecture) => {
    if (isTemplate) return;
    try {
      await api(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify({ name: workflow.name, architecture_json: architecture }) });
    } catch (err) { console.error('Auto-save failed', err); }
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
