import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const ArchitectureContext = createContext();

export function ArchitectureProvider({ children, initialData, onSave }) {
  const [nodes, setNodes] = useState(initialData?.nodes || []);
  const [edges, setEdges] = useState(initialData?.edges || []);
  const [documentation, setDocumentation] = useState(initialData?.documentation || '');
  const [pendingConnection, setPendingConnection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

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

    // Cascade delete edges
    setEdges((eds) =>
      eds.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target))
    );
    
    // Remove nodes
    setNodes((nds) => nds.filter((n) => !deletedIds.has(n.id)));
    
    showToast(`${toDelete.length} node${toDelete.length > 1 ? 's' : ''} deleted`);
  }, [showToast]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => {
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
        return eds;
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
      return addEdge(newEdge, eds);
    }),
    [nodes]
  );

  const confirmConnection = (relationshipData) => {
    if (!pendingConnection) return;

    setEdges((eds) => {
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
      return addEdge(newEdge, eds);
    });
    setPendingConnection(null);
  };

  const updateNodeData = (nodeId, dataUpdate) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, ...dataUpdate } };
        }
        return n;
      });
      return updatedNodes;
    });
    
    // Also update edge labels if a logic node's hook changed
    setEdges((eds) => eds.map(e => {
      if (e.target === nodeId) {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode && targetNode.type === 'logicNode' && dataUpdate.hook) {
          return { ...e, label: `Triggers ${dataUpdate.hook}` };
        }
      }
      return e;
    }));
  };

  const addNode = (type, position) => {
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
    setNodes((nds) => [...nds, newNode]);
    return id;
  };

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
      addNode,
      setNodes,
      parseToBackendPayload,
      pendingConnection,
      setPendingConnection,
      confirmConnection,
      documentation,
      setDocumentation,
      onNodesDelete,
      toastMessage,
      showToast
    }}>
      {children}
    </ArchitectureContext.Provider>
  );
}

export const useArchitecture = () => useContext(ArchitectureContext);
