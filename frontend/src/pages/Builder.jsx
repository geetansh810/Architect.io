import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api.js';
import { templates } from '../utils/templates.js';
import { ARCHITECTURE_TEMPLATES } from '../constants/templates.js';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
  useStoreApi
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { ArchitectureProvider, useArchitecture } from '../context/ArchitectureContext';
import NodePalette from '../components/canvas/NodePalette';
import BuilderHeader from '../components/canvas/BuilderHeader';
import PropertiesPanel from '../components/PropertiesPanel';
import RelationshipModal from '../components/RelationshipModal';
import NodeToolbarWrapper from '../components/NodeToolbarWrapper';
import CodeEditorPanel from '../components/CodeEditorPanel';
import ProjectConfigPanel from '../components/ProjectConfigPanel';
import { buildProjectFiles, getPrimaryFileForNode, getNodeForFile } from '../utils/codeSync';
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

import { Loader2, X, FileText, BookOpen, Pin } from 'lucide-react';

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

// ── Design ↔ Code transition ─────────────────────────────────────────────────
// One duration and one curve, shared by the sliding editor group and the
// canvas's width. They have to match exactly: the editor's right edge and the
// canvas's left edge are the same seam, and any drift between the two curves
// shows up as a gap tearing open mid-animation.
//
// The curve is a decelerating ease — fast to commit, soft to settle — which
// reads as the panel arriving rather than being dragged into place.
const PANE_MS = 340;
const PANE_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

// ── Grid background config by mode ───────────────────────────────────────────
const GRID_CONFIG = {
  dots:  { variant: 'dots',   gap: 24, size: 1.5,  lightColor: '#cbd5e1', darkColor: '#3f3f46' },
  lines: { variant: 'lines',  gap: 24, size: 0.5,  lightColor: '#cbd5e1', darkColor: '#3f3f46' },
  cross: { variant: 'cross',  gap: 24, size: 6,    lightColor: '#cbd5e1', darkColor: '#3f3f46' },
  none:  { variant: null },
};

/**
 * Bounding box of every node, in flow coordinates.
 *
 * Takes React Flow's *internal* nodes (from the store's `nodeLookup`) rather
 * than the plain nodes in context: those carry `measured` sizes and
 * `internals.positionAbsolute`, which is what the renderer actually draws
 * against. Measuring the plain nodes means guessing sizes for anything not
 * yet laid out, and a guess that's wrong by a couple of hundred pixels puts
 * the "centre" visibly off-centre.
 */
function measureNodeBounds(internalNodes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let seen = 0;

  internalNodes.forEach((n) => {
    const pos = n.internals?.positionAbsolute ?? n.position;
    if (!pos) return;
    const w = n.measured?.width ?? n.width ?? n.data?.width;
    const h = n.measured?.height ?? n.height ?? n.data?.height;
    // Unmeasured nodes contribute their origin only — better to under-reach
    // than to pad the box with a made-up size and skew the centre.
    seen += 1;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + (w || 0));
    maxY = Math.max(maxY, pos.y + (h || 0));
  });

  if (!seen) return null;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  return { centerX: minX + width / 2, centerY: minY + height / 2, width, height };
}

// ── Canvas Component ──────────────────────────────────────────────────────────
function BuilderCanvas({ workflow, isTemplate }) {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    addNode, parseToBackendPayload, pendingConnection, setPendingConnection,
    confirmConnection, documentation, setDocumentation, onNodesDelete, toastMessage,
    onNodeDragStop, updateNodeData, projectConfig, showToast,
  } = useArchitecture();

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { screenToFlowPosition, fitView, zoomIn, zoomOut, setCenter, setViewport } = useReactFlow();

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
  // Selection lives on the nodes/edges themselves (React Flow owns it), so the
  // inspector's visibility is derived rather than tracked in a second place —
  // that's what keeps it in sync with box-select, delete, and undo.
  const [pendingSelectId, setPendingSelectId] = useState(null);
  const [inspectorPinned, setInspectorPinned] = useState(
    () => localStorage.getItem('architect_inspector_pinned') === '1'
  );
  const [showMiniMap, setShowMiniMap] = useState(
    () => localStorage.getItem('architect_minimap') !== '0'
  );
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showIntelligencePanel, setShowIntelligencePanel] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
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

  // ── Editor ↔ Canvas split view ──
  // Two modes only. 'code' *is* the split: code left, canvas right. There is
  // no code-only mode — hiding the canvas hid the thing the code describes.
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'code'
  // The *code* pane's share of the split — it's the left pane, so this is
  // measured from the left edge and the divider maths reads directly.
  // Even by default: at 60/40 on a 1280px screen the code column lands under
  // 300px, which is narrower than the lines in it.
  // Key is versioned because the stored number used to mean the canvas share;
  // reading an old value under the new meaning would silently flip a user's
  // saved layout.
  const [splitRatio, setSplitRatio] = useState(() => {
    const saved = parseFloat(localStorage.getItem('architect_split_ratio_v2'));
    return Number.isFinite(saved) && saved >= 0.2 && saved <= 0.8 ? saved : 0.5;
  });
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const workspaceRef = useRef(null);
  const canvasPaneRef = useRef(null);
  const editingNode = editingNodeId ? nodes.find((n) => n.id === editingNodeId) : null;

  // ── Derived layout ──
  // Each mode decides what's mounted around the workspace, so the code editor
  // no longer sits squeezed between a node palette and an inspector that have
  // nothing to act on.
  const isSplit          = viewMode === 'code';
  const showPalette      = !isTemplate && !presentationMode;
  const inspectorMounted = !isTemplate && !presentationMode;
  const hasSelection     = nodes.some((n) => n.selected) || edges.some((e) => e.selected);
  const showInspector    = inspectorMounted && (hasSelection || inspectorPinned);
  // Split has no room for a 320px dock, so the inspector floats over the
  // canvas — which is the right-hand pane, the same edge it docks to.
  const inspectorFloats = isSplit;

  useEffect(() => {
    localStorage.setItem('architect_inspector_pinned', inspectorPinned ? '1' : '0');
  }, [inspectorPinned]);

  useEffect(() => {
    localStorage.setItem('architect_minimap', showMiniMap ? '1' : '0');
  }, [showMiniMap]);

  useEffect(() => {
    localStorage.setItem('architect_split_ratio_v2', String(splitRatio));
  }, [splitRatio]);

  // Newly added nodes aren't selected by addNode, and their id isn't in `nodes`
  // until the next render — so selection is deferred a tick rather than fired
  // against a stale list.
  const appliedSelectRef = useRef(null);
  useEffect(() => {
    if (!pendingSelectId || appliedSelectRef.current === pendingSelectId) return;
    if (!nodes.some((n) => n.id === pendingSelectId)) return;
    appliedSelectRef.current = pendingSelectId;
    onNodesChange(nodes.map((n) => ({ id: n.id, type: 'select', selected: n.id === pendingSelectId })));
  }, [pendingSelectId, nodes, onNodesChange]);

  // The editor is mounted once and then kept — sliding it out rather than
  // unmounting it. Remounting meant re-booting Monaco (and re-creating every
  // file model) on each switch, which is most of what made the transition feel
  // laggy; keeping it also lets it stay rendered while it animates away.
  const [editorMounted, setEditorMounted] = useState(false);

  // Generating the project is deliberately kept warm once the editor exists,
  // so switching into Code costs nothing but the animation. Until then — the
  // common case of someone who only ever uses the canvas — it's never run.
  const { files, nodeFileMap, fileNodeMap } = useMemo(() => {
    if (!isSplit && !editorMounted) return { files: [], nodeFileMap: new Map(), fileNodeMap: new Map() };
    try {
      return buildProjectFiles(nodes, edges, projectConfig);
    } catch {
      return { files: [], nodeFileMap: new Map(), fileNodeMap: new Map() };
    }
  }, [nodes, edges, isSplit, editorMounted, projectConfig]);

  // Every route into Code goes through here, so the editor's one-time mount is
  // recorded at the point of intent rather than inferred from state later.
  const changeViewMode = useCallback((mode) => {
    if (mode === 'code') setEditorMounted(true);
    setViewMode(mode);
  }, []);

  const cycleViewMode = useCallback(() => {
    setViewMode((v) => {
      const next = v === 'canvas' ? 'code' : 'canvas';
      if (next === 'code') setEditorMounted(true);
      return next;
    });
  }, []);

  // ── Keep the diagram centred in whatever width the canvas pane has ──
  //
  // Opening the code pane halves the canvas, which would otherwise leave the
  // diagram hanging off the right edge. This re-centres it and zooms to fit.
  //
  // The transform is computed from the pane's *own* measured box and applied
  // with `setViewport`, deliberately avoiding both of React Flow's convenience
  // helpers:
  //   - `fitView` only queues a fit, and the queue isn't drained again after
  //     the initial mount, so post-resize calls silently do nothing.
  //   - `setCenter` derives the transform from React Flow's stored width,
  //     which still holds the pre-transition size when the pane has just been
  //     halved — it centres the diagram against 1680px inside an 840px pane,
  //     i.e. hard against the right edge.
  // Measuring here sidesteps that race entirely.
  //
  // Node state is read from the store at call time rather than through a
  // dependency, so this doesn't re-run on every node change — that would yank
  // the viewport out from under a node being dragged.
  const storeApi = useStoreApi();

  // Re-frames onto an explicit pane size. Split out so the mode switch can
  // pass its *target* size before the pane has actually got there.
  const recentreOn = useCallback((w, h, duration) => {
    const bounds = measureNodeBounds([...storeApi.getState().nodeLookup.values()]);
    if (!w || !h || !bounds) return;
    // 1.2 leaves ~10% breathing room on each side.
    const zoom = Math.max(
      0.1,
      Math.min(w / (bounds.width * 1.2), h / (bounds.height * 1.2), 1.2)
    );
    setViewport(
      { x: w / 2 - bounds.centerX * zoom, y: h / 2 - bounds.centerY * zoom, zoom },
      { duration }
    );
  }, [storeApi, setViewport]);

  // On a mode switch the target width is known before the pane reaches it, so
  // the diagram is sent on its way immediately, on the same clock as the
  // panels. Waiting for the resize to settle first read as two separate
  // animations: the panel slides, then the diagram belatedly jumps after it.
  useEffect(() => {
    if (presentationMode) return;
    const row = workspaceRef.current;
    if (!row) return;
    const { width: rowW, height: rowH } = row.getBoundingClientRect();
    const targetW = isSplit ? rowW * (1 - splitRatio) : rowW;
    // A frame's grace so the new layout is committed before we measure nodes.
    const frame = requestAnimationFrame(() => recentreOn(targetW, rowH, PANE_MS));
    return () => cancelAnimationFrame(frame);
    // Deliberately not keyed on splitRatio: dragging the divider is handled by
    // the observer below, and re-framing on every drag frame would fight it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSplit, presentationMode, recentreOn]);

  useEffect(() => {
    const pane = canvasPaneRef.current;
    if (!pane || presentationMode || typeof ResizeObserver === 'undefined') return;

    let timer;
    const recentre = () => {
      const { width: w, height: h } = pane.getBoundingClientRect();
      recentreOn(w, h, 300);
    };

    // Debounced, and longer than the pane transition so it acts purely as a
    // correction (window resize, divider drag) rather than racing the switch
    // animation the effect above already owns.
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(recentre, PANE_MS + 60);
    });
    observer.observe(pane);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [presentationMode, recentreOn]);

  const highlightNodeFromFile = useCallback((filePath) => {
    const nodeId = getNodeForFile(fileNodeMap, filePath);
    if (!nodeId) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    onNodesChange(nodes.map((n) => ({ id: n.id, type: 'select', selected: n.id === nodeId })));
    setCenter(node.position.x + 125, node.position.y + 60, { zoom: 1, duration: 400 });
  }, [fileNodeMap, nodes, onNodesChange, setCenter]);

  const handleSelectFile = useCallback((path) => {
    setEditingNodeId(null);
    setActiveFilePath(path);
    highlightNodeFromFile(path);
  }, [highlightNodeFromFile]);

  const handleEditNodeCode = useCallback((nodeId, code) => {
    updateNodeData(nodeId, { code });
  }, [updateNodeData]);

  // Both code-bearing node types now resolve to a real generated file — a
  // Custom middleware owns its own, and a Logic Hook is tracked onto its
  // entity's hooks file — so "view generated" always has somewhere to land.
  const handleStopEditingNode = useCallback(() => {
    const primary = editingNode ? getPrimaryFileForNode(nodeFileMap, editingNode.id) : null;
    if (primary) setActiveFilePath(primary);
    setEditingNodeId(null);
  }, [editingNode, nodeFileMap]);

  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingDivider(true);
    // Without these the drag selects text across both panes and the cursor
    // flickers back to the default every time it crosses the editor.
    const { body } = document;
    const prevSelect = body.style.userSelect;
    const prevCursor = body.style.cursor;
    body.style.userSelect = 'none';
    body.style.cursor = 'col-resize';

    const onMove = (moveEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const ratio = (moveEvent.clientX - rect.left) / rect.width;
      setSplitRatio(Math.min(0.8, Math.max(0.2, ratio)));
    };
    const onUp = () => {
      setIsDraggingDivider(false);
      body.style.userSelect = prevSelect;
      body.style.cursor = prevCursor;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // ── Node click ──
  // Only meaningful while the editor is visible: in Design mode there's no
  // pane to drive, and latching editingNodeId there meant a later switch to
  // Code opened a node editor the user never asked for.
  const onNodeClick = useCallback((_, node) => {
    if (viewMode === 'canvas') return;

    const isCodeBearing = node.type === 'logicNode'
      || (node.type === 'middlewareNode' && node.data?.middlewareType === 'Custom');
    setEditingNodeId(isCodeBearing ? node.id : null);

    const primary = getPrimaryFileForNode(nodeFileMap, node.id);
    if (primary) setActiveFilePath(primary);
  }, [viewMode, nodeFileMap]);

  // Deselecting is what closes the inspector — no separate dismiss needed.
  const onPaneClick = useCallback(() => {
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        cycleViewMode();
      }
      if (e.key === 'Escape' && presentationMode) {
        setPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presentationMode, cycleViewMode]);

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

  // ── Copy the file currently open in the editor ──
  const handleCopyActiveFile = useCallback(async () => {
    const file = editingNode
      ? { path: editingNode.data?.name || editingNode.id, content: editingNode.data?.code || '' }
      : files.find((f) => f.path === activeFilePath) || files[0];
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content || '');
      showToast?.(`Copied ${file.path}`, 'info');
    } catch {
      // Clipboard access is permission-gated (and blocked outside a secure
      // context) — say so rather than reporting a copy that never happened.
      showToast?.('Clipboard blocked by the browser', 'error');
    }
  }, [files, activeFilePath, editingNode, showToast]);

  // ── Use this template (creates a real project from it) ──
  const handleUseTemplate = useCallback(async () => {
    const isLoggedIn = !!localStorage.getItem('architect_user');
    if (!isLoggedIn) {
      sessionStorage.setItem('architect_load_template', JSON.stringify({
        name: workflow.name, nodes, edges, documentation: documentation || `# ${workflow.name}\n\n`,
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
          architecture_json: { nodes, edges, documentation, database: 'mongodb' },
        }),
      });
      const data = await res.json();
      navigate(data.id ? `/workflow/${data.id}` : '/login');
    } catch { navigate('/login'); }
    finally { setIsGenerating(false); }
  }, [workflow.name, nodes, edges, documentation, navigate]);

  // ── Drag & drop from sidebar ──
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newId = addNode(type, position);
    if (newId) setPendingSelectId(newId);
  }, [addNode, screenToFlowPosition]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  // ── Add node from context menu at canvas center ──
  const handleContextAddNode = useCallback((type) => {
    const { x, y } = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newId = addNode(type, { x, y });
    if (newId) setPendingSelectId(newId);
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
        <BuilderHeader
          workflow={workflow}
          isTemplate={isTemplate}
          viewMode={viewMode}
          onViewModeChange={changeViewMode}
          isRenaming={isRenaming}
          tempName={tempName}
          onTempNameChange={setTempName}
          onStartRename={() => setIsRenaming(true)}
          onCommitRename={handleRename}
          onBack={() => {
            if (location.state?.from) navigate(location.state.from);
            else navigate(isTemplate ? '/templates' : '/dashboard');
          }}
          canvasTheme={canvasTheme}
          onToggleCanvasTheme={toggleCanvasTheme}
          onOpenAI={() => setShowAIModal(true)}
          onOpenIntelligence={() => setShowIntelligencePanel(true)}
          onOpenConfig={() => setShowConfigModal(true)}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          onOpenReadme={() => setShowReadmeModal(true)}
          onExportImage={handleExportImage}
          onPresent={() => setPresentationMode(true)}
          isExporting={isExporting}
          onGenerate={handleGenerate}
          onUseTemplate={handleUseTemplate}
          isGenerating={isGenerating}
          activeFilePath={activeFilePath}
          onCopyActiveFile={handleCopyActiveFile}
        />
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

      {/* ── Node palette: icon rail, flyout on demand ── */}
      {showPalette && (
        <NodePalette onAddNode={handleContextAddNode} compactRail={isSplit} />
      )}

      {/* ── Editor ↔ Canvas workspace row ──
          Panes are absolutely positioned rather than flexed so the switch can
          be choreographed: the editor group slides in from the left on
          `transform` while the canvas gives up the width it slides into. The
          row's own background matches the editor surface, so there's never a
          bare strip behind the incoming panel. */}
      <div ref={workspaceRef} className="flex-1 h-full relative overflow-hidden bg-[var(--bg-sidebar)]">

      {/* ── Canvas (right) ──
          Anchored to the right and giving up width from the left, so its left
          edge tracks the incoming editor's right edge exactly — same duration,
          same easing, no gap opening between them.

          Width is a plain CSS transition, not a framer-motion `animate`:
          framer resolves a percentage target to pixels against the layout as
          it was when the tween started, so switching modes left the canvas at
          30% when 60% was asked for. CSS interpolates percentages correctly
          and keeps both panes on the same timing curve. */}
      <div
        ref={canvasPaneRef}
        className={`absolute inset-y-0 right-0 overflow-hidden ${canvasTheme}`}
        style={{
          width: isSplit ? `${(1 - splitRatio) * 100}%` : '100%',
          transition: isDraggingDivider ? 'none' : `width ${PANE_MS}ms ${PANE_EASE}`,
          willChange: 'width',
        }}
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

          {/* React Flow's own <Controls> is gone — CanvasToolbar already carries
              zoom in/out/fit, and three floating clusters was two too many.
              The minimap is suppressed in Split: at half width it covers the
              nodes it's supposed to be summarising. */}
          {!presentationMode && showMiniMap && !isSplit && (
              <MiniMap
                pannable zoomable
                className="!bg-[var(--bg-surface)] !border-[var(--border-main)] !shadow-xl !rounded-2xl !mb-20"
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
          )}
        </ReactFlow>

        {/* ── Floating Canvas Toolbar (bottom-center) ── */}
        {!isTemplate && !presentationMode && (
          <CanvasToolbar
            gridMode={gridMode}
            onGridModeChange={setGridMode}
            snapEnabled={snapEnabled}
            onSnapToggle={() => setSnapEnabled(v => !v)}
            miniMapOpen={showMiniMap}
            onMiniMapToggle={() => setShowMiniMap(v => !v)}
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
      </div>

      {/* ── Editor group (left): panel + divider ──
          Editor and divider travel together as one block so the seam stays
          welded to the panel's edge. It slides on `transform` alone — Monaco's
          width never changes, so it doesn't re-layout on every frame of the
          animation, which is what made the old width-tween stutter.

          Mounted for good after the first open (see `editorMounted`) so the
          panel is still rendered while it animates out, and so re-entering
          Code doesn't pay to boot Monaco again. */}
      {editorMounted && (
        <div
          className="absolute inset-y-0 left-0 z-20 flex"
          style={{
            width: `${splitRatio * 100}%`,
            transform: isSplit ? 'translateX(0)' : 'translateX(-100%)',
            transition: isDraggingDivider ? 'none' : `transform ${PANE_MS}ms ${PANE_EASE}`,
            willChange: 'transform',
            // Off-screen it must not be clickable or reachable by tab.
            pointerEvents: isSplit ? 'auto' : 'none',
          }}
          aria-hidden={!isSplit}
          inert={!isSplit}
        >
          <div className="flex-1 min-w-0 h-full">
            <CodeEditorPanel
              files={files}
              activeFilePath={activeFilePath}
              onSelectFile={handleSelectFile}
              editingNode={editingNode}
              onEditNodeCode={handleEditNodeCode}
              onStopEditingNode={handleStopEditingNode}
              onRevealNode={highlightNodeFromFile}
            />
          </div>

          {/* ── Split divider ──
              8px of hit area around a 1px rule: a 1px target is a miss most of
              the time, but an 8px visible bar is a seam down the middle. */}
          <div
            onMouseDown={handleDividerMouseDown}
            onDoubleClick={() => setSplitRatio(0.5)}
            title="Drag to resize · double-click to even out"
            role="separator"
            aria-orientation="vertical"
            className="w-2 shrink-0 cursor-col-resize relative group flex items-center justify-center"
          >
            <span className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors ${
              isDraggingDivider ? 'bg-brand-500' : 'bg-[var(--border-main)] group-hover:bg-brand-500'
            }`} />
            <span className={`relative h-8 w-1 rounded-full transition-all ${
              isDraggingDivider ? 'bg-brand-500' : 'bg-transparent group-hover:bg-brand-500/60'
            }`} />
          </div>
        </div>
      )}

      </div> {/* End Editor ↔ Canvas workspace row */}

      {/* ── Inspector ──
          Opens on selection, closes on deselect. Docked in Design mode; in
          Split it floats over the canvas so neither pane gets squeezed. */}
      {/* Stays mounted while the mode allows it so the panel keeps its own tab
          state between selections; open/closed is a CSS transition for the same
          reason the canvas uses one. */}
      {inspectorMounted && (
          <div
            className={`h-full overflow-hidden border-l border-[var(--border-main)] bg-[var(--bg-surface)]
              transition-[width,opacity,transform] duration-300 ease-out ${
              inspectorFloats
                ? `absolute right-0 top-0 bottom-0 w-80 z-30 shadow-2xl shadow-black/30 ${
                    showInspector ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
                  }`
                : 'shrink-0'
            }`}
            style={inspectorFloats ? undefined : { width: showInspector ? 320 : 0 }}
            aria-hidden={!showInspector}
            id="tour-properties-panel"
          >
            <div className="w-80 h-full flex flex-col">
              <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-[var(--border-main)]">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Inspector
                </span>
                <div className="flex items-center gap-0.5">
                  {!inspectorFloats && (
                    <button
                      onClick={() => setInspectorPinned(v => !v)}
                      title={inspectorPinned ? 'Unpin — close when nothing is selected' : 'Keep inspector open'}
                      className={`p-1 rounded-md transition-colors ${
                        inspectorPinned ? 'text-brand-500 bg-brand-500/10' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Pin size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setInspectorPinned(false);
                      onNodesChange(nodes.map(n => ({ id: n.id, type: 'select', selected: false })));
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
      )}
      </div> {/* End Workspace Area */}

      {/* ── Intelligence Layer Overlay ── */}
      <ArchitectureIntelligence isOpen={showIntelligencePanel} onClose={() => setShowIntelligencePanel(false)} />

      {/* ── AI Architect ── */}
      <AIArchitectModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />

      {/* ── Project Config ── */}
      <ProjectConfigPanel isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />

      {/* ── Pre-generation validation report ── */}
      <ValidationReportModal
        isOpen={!!validationReport}
        onClose={() => setValidationReport(null)}
        validation={validationReport}
        onProceed={doGenerate}
        isGenerating={isGenerating}
      />

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
