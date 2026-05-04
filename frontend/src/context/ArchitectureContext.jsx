import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const ArchitectureContext = createContext();

export function ArchitectureProvider({ children, initialData, onSave }) {
  const [nodes, setNodes] = useState(initialData?.nodes || []);
  const [edges, setEdges] = useState(initialData?.edges || []);

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
      onSave({ nodes, edges, database: 'mongodb' });
    }
  }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

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
        : {}
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const parseToBackendPayload = () => {
    const entities = [];
    const apis = [];
    let auth = null;
    let db = null;
    let mailer = null;

    nodes.forEach(node => {
      if (node.type === 'entityNode') {
        entities.push({
          name: node.data.name,
          fields: node.data.fields || []
        });

        // Find connected API node
        const connectedEdge = edges.find(e => e.source === node.id);
        if (connectedEdge) {
          const targetNode = nodes.find(n => n.id === connectedEdge.target);
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
          }
        }
      } else if (node.type === 'authNode') {
        auth = node.data;
      } else if (node.type === 'dbNode') {
        db = node.data;
      } else if (node.type === 'mailNode') {
        mailer = node.data;
      }
    });

    return { entities, apis, auth, database: db, mailer };
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
      parseToBackendPayload
    }}>
      {children}
    </ArchitectureContext.Provider>
  );
}

export const useArchitecture = () => useContext(ArchitectureContext);
