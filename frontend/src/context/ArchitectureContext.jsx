import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const ArchitectureContext = createContext();

const COLUMN_MAPPING = {
  apiNode: 0, cdnNode: 0, loadBalancerNode: 0, frontendNode: 0, mobileNode: 0, browserNode: 0,
  authNode: 1,
  logicNode: 2, middlewareNode: 2, counterServiceNode: 2,
  dbNode: 3, replicaNode: 3, entityNode: 3,
  storageNode: 3, cacheNode: 3,
  queueNode: 4, cronNode: 4, mailNode: 4, webhookNode: 4
};

export function ArchitectureProvider({ children, initialData, onSave }) {
  const [nodes, setNodes] = useState(initialData?.nodes || []);
  const [edges, setEdges] = useState(initialData?.edges || []);
  const [documentation, setDocumentation] = useState(initialData?.documentation || '');
  const [pendingConnection, setPendingConnection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const takeSnapshot = useCallback((newNodes, newEdges) => {
    setHistory(prev => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, { nodes: newNodes || nodes, edges: newEdges || edges }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);

  useEffect(() => {
    if (history.length === 0 && (nodes.length > 0 || edges.length > 0)) {
      setHistory([{ nodes, edges }]);
      setHistoryIndex(0);
    }
  }, [nodes, edges]);

  // Initialize from old format if nodes don't exist but entities do (migration)
  useEffect(() => {
    if ((!initialData?.nodes || initialData.nodes.length === 0) && initialData?.entities?.length > 0) {
      const generatedNodes = [];
      const generatedEdges = [];
      let yOffset = 50;

      initialData.entities.forEach((ent, idx) => {
        const entityId = `entity-${ent.name}`;
        generatedNodes.push({
          id: entityId,
          type: 'entityNode',
          position: { x: 250, y: yOffset },
          data: { name: ent.name, fields: ent.fields }
        });

        const api = initialData.apis?.find(a => a.entityName === ent.name);
        if (api) {
          const apiId = `api-${ent.name}`;
          generatedNodes.push({
            id: apiId,
            type: 'apiNode',
            position: { x: 600, y: yOffset },
            data: { route: api.route, authEnabled: api.authEnabled }
          });
          generatedEdges.push({
            id: `e-${entityId}-${apiId}`,
            source: entityId,
            target: apiId
          });
        }
        yOffset += 200;
      });

      setNodes(generatedNodes);
      setEdges(generatedEdges);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (onSave) {
      onSave({ nodes, edges, documentation, database: 'mongodb' });
    }
  }, [nodes, edges, documentation]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const showToast = useCallback((message, type = 'info', duration = 2500) => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  const onNodesDelete = useCallback((deletedNodes) => {
    const toDelete = deletedNodes.filter((n) => n.data?.deletable !== false);
    if (toDelete.length === 0) return;
    
    const deletedIds = new Set(toDelete.map((n) => n.id));

    const nextEdges = edges.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target));
    const nextNodes = nodes.filter((n) => !deletedIds.has(n.id));

    setEdges(nextEdges);
    setNodes(nextNodes);
    takeSnapshot(nextNodes, nextEdges);
    
    showToast(`${toDelete.length} node${toDelete.length > 1 ? 's' : ''} deleted`);
  }, [nodes, edges, showToast, takeSnapshot]);

  const onConnect = useCallback(
    (params) => {
      // Find source and target node types
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      let label = '';
      if (sourceNode?.type === 'entityNode' && targetNode?.type === 'apiNode') {
        label = 'Exposes CRUD';
      } else if (sourceNode?.type === 'apiNode' && targetNode?.type === 'logicNode') {
        label = `Triggers ${targetNode.data.hook || 'Logic'}`;
      } else if (targetNode?.type === 'logicNode') {
        label = 'Triggers Logic';
      } else if (sourceNode?.type === 'middlewareNode') {
        label = 'Applies Middleware';
      } else if (targetNode?.type === 'storageNode') {
        label = 'Saves to Storage';
      } else if (targetNode?.type === 'webhookNode') {
        label = 'Triggers Webhook';
      } else if (sourceNode?.type === 'entityNode' && targetNode?.type === 'entityNode') {
        // Intercept entity-entity connection
        setPendingConnection(params);
        return;
      }
      
      const newEdge = { 
        ...params, 
        animated: true,
        label,
        labelStyle: { fill: '#cbd5e1', fontWeight: 500, fontSize: 10 },
        labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4
      };
      
      const nextEdges = addEdge(newEdge, edges);
      setEdges(nextEdges);
      takeSnapshot(nodes, nextEdges);
    },
    [nodes, edges, takeSnapshot]
  );

  const confirmConnection = useCallback((relationshipData) => {
    if (!pendingConnection) return;

    const newEdge = { 
      ...pendingConnection, 
      animated: true,
      label: relationshipData.type,
      data: relationshipData,
      labelStyle: { fill: '#cbd5e1', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      style: { strokeDasharray: '5 5', stroke: '#10b981' }
    };
    const nextEdges = addEdge(newEdge, edges);
    setEdges(nextEdges);
    setPendingConnection(null);
    takeSnapshot(nodes, nextEdges);
  }, [nodes, edges, pendingConnection, takeSnapshot]);

  const updateNodeData = useCallback((nodeId, dataUpdate) => {
    const nextNodes = nodes.map((n) => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, ...dataUpdate } };
      }
      return n;
    });
    
    // Also update edge labels if a logic node's hook changed
    const nextEdges = edges.map(e => {
      if (e.target === nodeId) {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode && targetNode.type === 'logicNode' && dataUpdate.hook) {
          return { ...e, label: `Triggers ${dataUpdate.hook}` };
        }
      }
      return e;
    });

    setNodes(nextNodes);
    setEdges(nextEdges);
    takeSnapshot(nextNodes, nextEdges);
  }, [nodes, edges, takeSnapshot]);

  const addNode = useCallback((type, position) => {
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type,
      position,
      data: type === 'entityNode' 
        ? { name: 'NewEntity', fields: [] }
        : type === 'apiNode'
        ? { route: '/new-api', authEnabled: false }
        : type === 'authNode'
        ? { method: 'JWT', expiry: '24h', secret: '' }
        : type === 'dbNode'
        ? { type: 'mongodb', dbName: 'app_db', uri: '' }
        : type === 'mailNode'
        ? { provider: 'SMTP', fromEmail: 'noreply@app.com' }
        : type === 'logicNode'
        ? { name: 'Process Payment', hook: 'before-create' }
        : type === 'middlewareNode'
        ? { middlewareType: 'Rate Limiter', config: { windowMs: 15 * 60 * 1000, maxRequests: 100 } }
        : type === 'storageNode'
        ? { provider: 'Local (Multer)', maxSizeMB: 5, allowedTypes: ['images'] }
        : type === 'cronNode'
        ? { jobName: 'dailyCleanup', schedule: '0 0 * * *' }
        : type === 'webhookNode'
        ? { direction: 'Incoming', provider: 'Stripe', path: '/stripe-webhooks' }
        : type === 'cacheNode'
        ? { provider: 'Redis', evictionPolicy: 'LRU', ttl: 3600, strategy: 'Cache-Aside' }
        : type === 'loadBalancerNode'
        ? { algorithm: 'Round Robin', healthPath: 'health', intervalSec: 30, sslTermination: true }
        : type === 'cdnNode'
        ? { provider: 'Cloudflare', redirectType: 'HTTP 302', regions: 'Global' }
        : type === 'queueNode'
        ? { broker: 'Kafka', topic: 'click-events', consumerGroup: 'analytics-service', partitions: 3 }
        : type === 'counterServiceNode'
        ? { strategy: 'Counter + Base62', encoding: 'Base62', batchSize: 1000, codeLength: 7 }
        : type === 'replicaNode'
        ? { replicaCount: 2, strategy: 'Read/Write Split', lagToleranceMs: 100 }
        : {}
    };
    const nextNds = [...nodes, newNode];
    setNodes(nextNds);
    takeSnapshot(nextNds, edges);
    return id;
  }, [nodes, edges, takeSnapshot]);

  const updateEdgeData = useCallback((id, data) => {
    const nextEdges = edges.map(e => {
      if (e.id === id) {
        const newLabel = data.label !== undefined ? data.label : e.label;
        const newIsAsync = data.isAsync !== undefined ? data.isAsync : e.data?.isAsync;
        return { ...e, label: newLabel, animated: newIsAsync, data: { ...e.data, ...data } };
      }
      return e;
    });
    setEdges(nextEdges);
    takeSnapshot(nodes, nextEdges);
  }, [nodes, edges, takeSnapshot]);

  const removeElements = useCallback((elementsToRemove) => {
    const nodeIds = elementsToRemove.filter(el => !el.source).map(n => n.id);
    const edgeIds = elementsToRemove.filter(el => el.source).map(e => e.id);
    let nextNodes = nodes;
    let nextEdges = edges;
    if (nodeIds.length > 0) {
      nextNodes = nodes.filter(n => !nodeIds.includes(n.id));
      nextEdges = edges.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target));
    }
    if (edgeIds.length > 0) {
      nextEdges = nextEdges.filter(e => !edgeIds.includes(e.id));
    }
    setNodes(nextNodes);
    setEdges(nextEdges);
    takeSnapshot(nextNodes, nextEdges);
  }, [nodes, edges, takeSnapshot]);

  // History stack implementations
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const snapshot = history[prevIndex];
      if (snapshot) {
        setNodes(snapshot.nodes);
        setEdges(snapshot.edges);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const snapshot = history[nextIndex];
      if (snapshot) {
        setNodes(snapshot.nodes);
        setEdges(snapshot.edges);
      }
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = history.length > 0 && historyIndex < history.length - 1;

  // Clipboard & Layout implementations
  const [clipboard, setClipboard] = useState([]);

  const copyNodes = useCallback((nodeIds) => {
    const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
    setClipboard(selectedNodes.map(n => ({
      type: n.type,
      data: n.data,
      position: { ...n.position }
    })));
    showToast(`${selectedNodes.length} node(s) copied`);
  }, [nodes, showToast]);

  const pasteNodes = useCallback(() => {
    if (clipboard.length === 0) return;
    const newNodes = clipboard.map(item => {
      const id = `${item.type}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      return {
        id,
        type: item.type,
        data: JSON.parse(JSON.stringify(item.data)),
        position: { x: item.position.x + 40, y: item.position.y + 40 },
        selected: true
      };
    });
    const nextNds = nodes.map(n => ({ ...n, selected: false })).concat(newNodes);
    setNodes(nextNds);
    takeSnapshot(nextNds, edges);
    showToast(`${newNodes.length} node(s) pasted`);
  }, [clipboard, nodes, edges, takeSnapshot, showToast]);

  const duplicateNodes = useCallback((nodeIds) => {
    if (nodeIds.length === 0) return;
    const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
    const newNodes = selectedNodes.map(n => {
      const id = `${n.type}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      return {
        id,
        type: n.type,
        data: JSON.parse(JSON.stringify(n.data)),
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        selected: true
      };
    });
    const nextNds = nodes.map(node => ({ ...node, selected: false })).concat(newNodes);
    setNodes(nextNds);
    takeSnapshot(nextNds, edges);
    showToast(`${newNodes.length} node(s) duplicated`);
  }, [nodes, edges, takeSnapshot, showToast]);

  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    const columnCounts = {};
    const nextNodes = nodes.map(node => {
      if (['zoneGroup', 'stickyNote', 'textLabel'].includes(node.type)) {
        return node;
      }
      const col = COLUMN_MAPPING[node.type] !== undefined ? COLUMN_MAPPING[node.type] : 2;
      const count = columnCounts[col] || 0;
      columnCounts[col] = count + 1;
      return {
        ...node,
        position: {
          x: 80 + col * 360,
          y: 80 + count * 160
        }
      };
    });
    setNodes(nextNodes);
    takeSnapshot(nextNodes, edges);
    showToast('Auto-layout applied');
  }, [nodes, edges, takeSnapshot, showToast]);

  const alignNodes = useCallback((dir) => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length < 2) {
      showToast('Select 2 or more nodes to align', 'warning');
      return;
    }
    const coords = selectedNodes.map(n => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      w: 250,
      h: 80
    }));
    let targetValue;
    if (dir === 'left') {
      targetValue = Math.min(...coords.map(c => c.x));
    } else if (dir === 'right') {
      targetValue = Math.max(...coords.map(c => c.x));
    } else if (dir === 'centerV') {
      const centers = coords.map(c => c.x + c.w / 2);
      targetValue = centers.reduce((sum, val) => sum + val, 0) / centers.length;
    } else if (dir === 'top') {
      targetValue = Math.min(...coords.map(c => c.y));
    } else if (dir === 'bottom') {
      targetValue = Math.max(...coords.map(c => c.y));
    } else if (dir === 'centerH') {
      const centers = coords.map(c => c.y + c.h / 2);
      targetValue = centers.reduce((sum, val) => sum + val, 0) / centers.length;
    }
    const nextNodes = nodes.map(node => {
      if (!node.selected) return node;
      const updatedPosition = { ...node.position };
      if (dir === 'left' || dir === 'right') {
        updatedPosition.x = targetValue;
      } else if (dir === 'centerV') {
        updatedPosition.x = targetValue - 250 / 2;
      } else if (dir === 'top' || dir === 'bottom') {
        updatedPosition.y = targetValue;
      } else if (dir === 'centerH') {
        updatedPosition.y = targetValue - 80 / 2;
      }
      return { ...node, position: updatedPosition };
    });
    setNodes(nextNodes);
    takeSnapshot(nextNodes, edges);
    showToast(`Aligned nodes: ${dir}`);
  }, [nodes, edges, takeSnapshot, showToast]);

  const distributeNodes = useCallback((axis) => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length < 3) {
      showToast('Select 3 or more nodes to distribute', 'warning');
      return;
    }
    const sorted = [...selectedNodes].sort((a, b) => {
      if (axis === 'horizontal') return a.position.x - b.position.x;
      return a.position.y - b.position.y;
    });
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    let nextNodes;
    if (axis === 'horizontal') {
      const minX = first.position.x;
      const maxX = last.position.x;
      const totalSpan = maxX - minX;
      const step = totalSpan / (sorted.length - 1);
      nextNodes = nodes.map(node => {
        if (!node.selected) return node;
        const idx = sorted.findIndex(s => s.id === node.id);
        return {
          ...node,
          position: { ...node.position, x: minX + idx * step }
        };
      });
    } else {
      const minY = first.position.y;
      const maxY = last.position.y;
      const totalSpan = maxY - minY;
      const step = totalSpan / (sorted.length - 1);
      nextNodes = nodes.map(node => {
        if (!node.selected) return node;
        const idx = sorted.findIndex(s => s.id === node.id);
        return {
          ...node,
          position: { ...node.position, y: minY + idx * step }
        };
      });
    }
    setNodes(nextNodes);
    takeSnapshot(nextNodes, edges);
    showToast(`Distributed nodes: ${axis}`);
  }, [nodes, edges, takeSnapshot, showToast]);

  const selectAll = useCallback(() => {
    setNodes(nds => nds.map(n => ({ ...n, selected: true })));
  }, []);

  const onNodeDragStop = useCallback(() => {
    takeSnapshot(nodes, edges);
  }, [nodes, edges, takeSnapshot]);

  const parseToBackendPayload = () => {
    const entities = [];
    const apis = [];
    let auth = null;
    let db = null;
    let mailer = null;
    const middlewares = [];
    const storage = [];
    const cronJobs = [];
    const webhooks = [];
    const relationships = [];
    const caches = [];
    const loadBalancers = [];
    const cdns = [];
    const queues = [];
    const counterServices = [];
    const replicas = [];

    nodes.forEach(node => {
      if (node.type === 'entityNode') {
        entities.push({
          name: node.data.name,
          fields: node.data.fields || []
        });

        // Process all connections from this entity
        const connectedEdges = edges.filter(e => e.source === node.id);
        connectedEdges.forEach(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          if (targetNode && targetNode.type === 'apiNode') {
            const apiDef = {
              entityName: node.data.name,
              route: targetNode.data.route,
              authEnabled: targetNode.data.authEnabled,
              logic: []
            };

            // Find logic nodes connected to this API node
            const logicEdges = edges.filter(e => e.source === targetNode.id);
            logicEdges.forEach(le => {
              const logicNode = nodes.find(n => n.id === le.target);
              if (logicNode && logicNode.type === 'logicNode') {
                apiDef.logic.push({
                  name: logicNode.data.name,
                  hook: logicNode.data.hook
                });
              }
            });

            apis.push(apiDef);
          } else if (targetNode && targetNode.type === 'entityNode') {
            // Found a relationship edge
            relationships.push({
              sourceEntity: node.data.name,
              refEntity: targetNode.data.name,
              type: edge.data?.type || '1:N',
              foreignKey: edge.data?.foreignKey || `${node.data.name.toLowerCase()}Id`
            });
          }
        });
      } else if (node.type === 'authNode') {
        auth = node.data;
      } else if (node.type === 'dbNode') {
        db = node.data;
      } else if (node.type === 'mailNode') {
        mailer = node.data;
      } else if (node.type === 'middlewareNode') {
        middlewares.push(node.data);
      } else if (node.type === 'storageNode') {
        storage.push(node.data);
      } else if (node.type === 'cronNode') {
        cronJobs.push(node.data);
      } else if (node.type === 'webhookNode') {
        webhooks.push(node.data);
      } else if (node.type === 'cacheNode') {
        caches.push(node.data);
      } else if (node.type === 'loadBalancerNode') {
        loadBalancers.push(node.data);
      } else if (node.type === 'cdnNode') {
        cdns.push(node.data);
      } else if (node.type === 'queueNode') {
        queues.push(node.data);
      } else if (node.type === 'counterServiceNode') {
        counterServices.push(node.data);
      } else if (node.type === 'replicaNode') {
        replicas.push(node.data);
      }
    });

    return { entities, apis, auth, database: db, mailer, middlewares, storage, cronJobs, webhooks, relationships, caches, loadBalancers, cdns, queues, counterServices, replicas, documentation };
  };

  return (
    <ArchitectureContext.Provider value={{
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      updateNodeData,
      addNode, updateEdgeData, removeElements, setNodes, setEdges,
      parseToBackendPayload, pendingConnection, setPendingConnection, confirmConnection,
      documentation, setDocumentation, onNodesDelete, toastMessage, showToast,
      undo, redo, canUndo, canRedo, clipboard, copyNodes, pasteNodes, duplicateNodes,
      autoLayout, alignNodes, distributeNodes, selectAll, onNodeDragStop
    }}>
      {children}
    </ArchitectureContext.Provider>
  );
}

export const useArchitecture = () => useContext(ArchitectureContext);
