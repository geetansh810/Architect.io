/**
 * architectureAnalyzer.js — Architect.io
 * Analyses the node graph and extracts semantic structure for code generation.
 * Maps to actual node types used in the builder canvas.
 */

// ─── Node type categories (matches actual nodeTypes in the canvas) ───────────
const DB_TYPES = ['dbNode'];
const AUTH_TYPES = ['authNode'];
const API_TYPES = ['apiNode'];
const ENTITY_TYPES = ['entityNode'];
const LOGIC_TYPES = ['logicNode'];
const MIDDLEWARE_TYPES = ['middlewareNode'];
const MAILER_TYPES = ['mailNode'];
const STORAGE_TYPES = ['storageNode'];
const CRON_TYPES = ['cronNode'];
const WEBHOOK_TYPES = ['webhookNode'];
const CACHE_TYPES = ['cacheNode'];
const LOAD_BALANCER_TYPES = ['loadBalancerNode'];
const CDN_TYPES = ['cdnNode'];
const QUEUE_TYPES = ['queueNode'];
const COUNTER_TYPES = ['counterServiceNode'];
const REPLICA_TYPES = ['replicaNode'];

export function analyzeArchitecture(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return createEmptyAnalysis();
  }

  // ── Build adjacency maps ──────────────────────────────────────────────────
  const outgoing = {};
  const incoming = {};

  nodes.forEach((n) => {
    outgoing[n.id] = [];
    incoming[n.id] = [];
  });

  edges.forEach((e) => {
    if (outgoing[e.source]) outgoing[e.source].push(e.target);
    if (incoming[e.target]) incoming[e.target].push(e.source);
  });

  // ── Categorize nodes by type ──────────────────────────────────────────────
  const byType = {};
  nodes.forEach((n) => {
    const type = n.type || 'generic';
    if (!byType[type]) byType[type] = [];
    byType[type].push(n);
  });

  // ── Categorize into semantic groups ──────────────────────────────────────
  const entities = nodes.filter((n) => ENTITY_TYPES.includes(n.type));
  const apiNodes = nodes.filter((n) => API_TYPES.includes(n.type));
  const authNodes = nodes.filter((n) => AUTH_TYPES.includes(n.type));
  const dbNodes = nodes.filter((n) => DB_TYPES.includes(n.type));
  const logicNodes = nodes.filter((n) => LOGIC_TYPES.includes(n.type));
  const middlewareNodes = nodes.filter((n) => MIDDLEWARE_TYPES.includes(n.type));
  const mailerNodes = nodes.filter((n) => MAILER_TYPES.includes(n.type));
  const storageNodes = nodes.filter((n) => STORAGE_TYPES.includes(n.type));
  const cronNodes = nodes.filter((n) => CRON_TYPES.includes(n.type));
  const webhookNodes = nodes.filter((n) => WEBHOOK_TYPES.includes(n.type));
  const cacheNodes = nodes.filter((n) => CACHE_TYPES.includes(n.type));
  const loadBalancerNodes = nodes.filter((n) => LOAD_BALANCER_TYPES.includes(n.type));
  const cdnNodes = nodes.filter((n) => CDN_TYPES.includes(n.type));
  const queueNodes = nodes.filter((n) => QUEUE_TYPES.includes(n.type));
  const counterNodes = nodes.filter((n) => COUNTER_TYPES.includes(n.type));
  const replicaNodes = nodes.filter((n) => REPLICA_TYPES.includes(n.type));

  // ── Find entry points (no incoming edges) ────────────────────────────────
  const entryNodes = nodes.filter((n) => incoming[n.id].length === 0);

  // ── Build entity-to-API connections ──────────────────────────────────────
  const entityApiMap = {}; // entityId -> [apiNodeId]
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (src?.type === 'entityNode' && tgt?.type === 'apiNode') {
      if (!entityApiMap[e.source]) entityApiMap[e.source] = [];
      entityApiMap[e.source].push(e.target);
    }
  });

  // ── Build API-to-Logic connections ───────────────────────────────────────
  const apiLogicMap = {}; // apiNodeId -> [logicNodeId]
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (src?.type === 'apiNode' && tgt?.type === 'logicNode') {
      if (!apiLogicMap[e.source]) apiLogicMap[e.source] = [];
      apiLogicMap[e.source].push(e.target);
    }
  });

  // ── Build entity relationships (entity -> entity) ─────────────────────────
  const relationships = [];
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (src?.type === 'entityNode' && tgt?.type === 'entityNode') {
      relationships.push({
        source: src,
        target: tgt,
        type: e.data?.type || '1:N',
        foreignKey: e.data?.foreignKey || `${src.data?.name?.toLowerCase() || 'ref'}Id`,
      });
    }
  });

  // ── Topological sort ─────────────────────────────────────────────────────
  const flowOrder = topologicalSort(nodes, edges);

  // ── Primary DB type ───────────────────────────────────────────────────────
  const primaryDb = dbNodes[0];
  const dbType = primaryDb?.data?.type || 'mongodb';

  return {
    nodes,
    edges,
    outgoing,
    incoming,
    byType,
    entryNodes,
    entities,
    apiNodes,
    authNodes,
    dbNodes,
    logicNodes,
    middlewareNodes,
    mailerNodes,
    storageNodes,
    cronNodes,
    webhookNodes,
    cacheNodes,
    loadBalancerNodes,
    cdnNodes,
    queueNodes,
    counterNodes,
    replicaNodes,
    entityApiMap,
    apiLogicMap,
    relationships,
    flowOrder,
    dbType,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      entityCount: entities.length,
      apiCount: apiNodes.length,
      dbCount: dbNodes.length,
      hasAuth: authNodes.length > 0,
      hasCaching: cacheNodes.length > 0,
      hasMessaging: queueNodes.length > 0,
      hasMailer: mailerNodes.length > 0,
      hasStorage: storageNodes.length > 0,
      hasCron: cronNodes.length > 0,
      hasWebhook: webhookNodes.length > 0,
      hasLoadBalancer: loadBalancerNodes.length > 0,
      hasCdn: cdnNodes.length > 0,
      hasReplica: replicaNodes.length > 0,
      isPostgres: dbType === 'postgresql',
      isMongo: dbType === 'mongodb',
    },
  };
}

function createEmptyAnalysis() {
  return {
    nodes: [],
    edges: [],
    outgoing: {},
    incoming: {},
    byType: {},
    entryNodes: [],
    entities: [],
    apiNodes: [],
    authNodes: [],
    dbNodes: [],
    logicNodes: [],
    middlewareNodes: [],
    mailerNodes: [],
    storageNodes: [],
    cronNodes: [],
    webhookNodes: [],
    cacheNodes: [],
    loadBalancerNodes: [],
    cdnNodes: [],
    queueNodes: [],
    counterNodes: [],
    replicaNodes: [],
    entityApiMap: {},
      apiLogicMap: {},
    relationships: [],
    flowOrder: [],
    dbType: 'mongodb',
    stats: {
      totalNodes: 0,
      totalEdges: 0,
      entityCount: 0,
      apiCount: 0,
      dbCount: 0,
      hasAuth: false,
      hasCaching: false,
      hasMessaging: false,
      hasMailer: false,
      hasStorage: false,
      hasCron: false,
      hasWebhook: false,
      hasLoadBalancer: false,
      hasCdn: false,
      hasReplica: false,
      isPostgres: false,
      isMongo: true,
    },
  };
}

function topologicalSort(nodes, edges) {
  const visited = new Set();
  const order = [];
  const adj = {};

  nodes.forEach((n) => {
    adj[n.id] = [];
  });
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });

  function dfs(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    (adj[nodeId] || []).forEach(dfs);
    order.unshift(nodeId);
  }

  nodes.forEach((n) => dfs(n.id));

  return order.map((id) => nodes.find((n) => n.id === id)).filter(Boolean);
}
