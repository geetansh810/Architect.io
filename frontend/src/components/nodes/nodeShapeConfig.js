/**
 * nodeShapeConfig.js
 * Central mapping of every node type to its visual shape and accent color.
 *
 * shape values:
 *   'cylinder'      → databases  (DbNode, ReplicaNode)
 *   'hexagon'       → services   (EntityNode, LogicNode, MiddlewareNode, CounterServiceNode)
 *   'diamond'       → gateways   (LoadBalancerNode, CdnNode, AuthNode)
 *   'parallelogram' → queues     (QueueNode, CronNode)
 *   'cloud'         → external   (WebhookNode, MailNode, StorageNode)
 *   'rect'          → default    (ApiNode, CacheNode)
 */
export const NODE_SHAPE_CONFIG = {
  // ── Cylinder: databases ──────────────────────────────────────────────────
  dbNode:             { shape: 'cylinder',      accentClass: 'slate' },
  replicaNode:        { shape: 'cylinder',      accentClass: 'slate' },

  // ── Hexagon: services / microservices ────────────────────────────────────
  entityNode:         { shape: 'hexagon',       accentClass: 'emerald' },
  logicNode:          { shape: 'hexagon',       accentClass: 'indigo' },
  middlewareNode:     { shape: 'hexagon',       accentClass: 'cyan' },
  counterServiceNode: { shape: 'hexagon',       accentClass: 'violet' },

  // ── Diamond: API gateway / load balancer / auth ──────────────────────────
  loadBalancerNode:   { shape: 'diamond',       accentClass: 'sky' },
  cdnNode:            { shape: 'diamond',       accentClass: 'amber' },
  authNode:           { shape: 'diamond',       accentClass: 'amber' },

  // ── Parallelogram: queues / async pipelines ──────────────────────────────
  queueNode:          { shape: 'parallelogram', accentClass: 'orange' },
  cronNode:           { shape: 'parallelogram', accentClass: 'purple' },

  // ── Cloud: external / third-party services ───────────────────────────────
  webhookNode:        { shape: 'cloud',         accentClass: 'fuchsia' },
  mailNode:           { shape: 'cloud',         accentClass: 'rose' },
  storageNode:        { shape: 'cloud',         accentClass: 'orange' },

  // ── Rect: core API endpoints / cache (unchanged look, minor polish) ──────
  apiNode:            { shape: 'rect',          accentClass: 'blue' },
  cacheNode:          { shape: 'rect',          accentClass: 'red' },
};
