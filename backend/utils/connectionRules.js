/**
 * connectionRules.js — Canonical connection-rule matrix + graph validator.
 *
 * This module is the single source of truth for which node types may be
 * connected on the canvas, and for full-graph validation ("rectification")
 * that runs before any code is generated.
 *
 * NOTE: frontend/src/utils/connectionRules.js mirrors this file. If you
 * change the rules here, change them there too.
 */

// Node types that can never participate in edges (visual annotations)
export const ANNOTATION_TYPES = ['categoryBox', 'zoneGroup', 'stickyNote', 'textLabel'];

// Client-side / presentation-only nodes (valid edge participants, no codegen)
export const CLIENT_TYPES = ['frontendNode', 'mobileNode', 'browserNode'];

/**
 * RULES[sourceType][targetType] = human-readable edge label.
 * An edge is valid only if a rule exists for the (source, target) pair.
 */
export const RULES = {
  // ── Clients ──
  frontendNode: { cdnNode: 'Requests assets', loadBalancerNode: 'Routes traffic', apiNode: 'Calls API', authNode: 'Authenticates via' },
  mobileNode:   { cdnNode: 'Requests assets', loadBalancerNode: 'Routes traffic', apiNode: 'Calls API', authNode: 'Authenticates via' },
  browserNode:  { cdnNode: 'Requests assets', loadBalancerNode: 'Routes traffic', apiNode: 'Calls API', authNode: 'Authenticates via' },

  // ── Edge / traffic layer ──
  cdnNode: { loadBalancerNode: 'Forwards to origin', apiNode: 'Origin fetch', storageNode: 'Serves assets from' },
  loadBalancerNode: { apiNode: 'Distributes traffic', middlewareNode: 'Routes through' },

  // ── Data modeling ──
  entityNode: {
    entityNode: 'Relates to',
    apiNode: 'Exposes CRUD',
    dbNode: 'Persists to',
  },

  // ── API layer ──
  apiNode: {
    logicNode: 'Triggers logic',
    cacheNode: 'Reads through cache',
    queueNode: 'Publishes events',
    webhookNode: 'Triggers webhook',
    storageNode: 'Saves to storage',
    mailNode: 'Sends mail',
    dbNode: 'Reads / writes',
    replicaNode: 'Reads from replica',
    counterServiceNode: 'Requests IDs',
  },

  // ── Cross-cutting ──
  authNode: { apiNode: 'Protects' },
  middlewareNode: { apiNode: 'Applies middleware', loadBalancerNode: 'Filters traffic' },

  // ── Business logic ──
  logicNode: {
    dbNode: 'Persists to',
    replicaNode: 'Reads from replica',
    mailNode: 'Sends mail',
    queueNode: 'Enqueues job',
    storageNode: 'Saves to storage',
    webhookNode: 'Calls webhook',
    cacheNode: 'Updates cache',
    entityNode: 'Mutates entity',
    counterServiceNode: 'Requests IDs',
  },

  // ── Data infrastructure ──
  dbNode: { replicaNode: 'Replicates to' },
  cacheNode: { dbNode: 'Falls back to', replicaNode: 'Falls back to' },
  replicaNode: {},
  counterServiceNode: { dbNode: 'Allocates ranges from', cacheNode: 'Caches counters in' },
  storageNode: { cdnNode: 'Served via CDN' },

  // ── Async infrastructure ──
  queueNode: { logicNode: 'Consumed by', mailNode: 'Delivers mail', webhookNode: 'Fans out to', dbNode: 'Sinks to' },
  cronNode: { logicNode: 'Runs logic', queueNode: 'Enqueues job', dbNode: 'Maintains', mailNode: 'Sends digest', apiNode: 'Pings endpoint' },
  webhookNode: { logicNode: 'Handles event', queueNode: 'Buffers event', apiNode: 'Notifies API' },
  mailNode: {},
};

/**
 * Validate a single prospective connection.
 * @returns {{ valid: boolean, reason?: string, label?: string }}
 */
export function validateConnection(sourceNode, targetNode, existingEdges = []) {
  if (!sourceNode || !targetNode) {
    return { valid: false, reason: 'Unknown node.' };
  }
  if (sourceNode.id === targetNode.id) {
    return { valid: false, reason: 'A node cannot connect to itself.' };
  }
  if (ANNOTATION_TYPES.includes(sourceNode.type) || ANNOTATION_TYPES.includes(targetNode.type)) {
    return { valid: false, reason: 'Annotation elements cannot be connected.' };
  }
  const duplicate = existingEdges.some(
    (e) => e.source === sourceNode.id && e.target === targetNode.id
  );
  if (duplicate) {
    return { valid: false, reason: 'These nodes are already connected.' };
  }
  const rule = RULES[sourceNode.type]?.[targetNode.type];
  if (!rule) {
    const reverse = RULES[targetNode.type]?.[sourceNode.type];
    return {
      valid: false,
      reason: reverse
        ? `Invalid direction — connect ${labelOf(targetNode.type)} → ${labelOf(sourceNode.type)} instead.`
        : `${labelOf(sourceNode.type)} cannot connect to ${labelOf(targetNode.type)}.`,
    };
  }
  return { valid: true, label: rule };
}

const TYPE_LABELS = {
  entityNode: 'Data Model', apiNode: 'API Route', authNode: 'Auth Guard', dbNode: 'Database',
  mailNode: 'Mailer', logicNode: 'Logic Hook', middlewareNode: 'Middleware', storageNode: 'File Storage',
  cronNode: 'Scheduler', webhookNode: 'Webhook', cacheNode: 'Cache Layer', loadBalancerNode: 'Load Balancer',
  cdnNode: 'CDN / Edge', queueNode: 'Message Queue', counterServiceNode: 'ID Generator', replicaNode: 'Read Replica',
  frontendNode: 'Frontend App', mobileNode: 'Mobile App', browserNode: 'Browser Client',
};

export function labelOf(type) {
  return TYPE_LABELS[type] || type;
}

const IDENTIFIER_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

/**
 * Full-graph validation. Returns { errors, warnings } where each issue is
 * { code, message, nodeIds?, edgeIds? }. Errors block code generation;
 * warnings do not.
 */
export function validateArchitecture(nodes = [], edges = []) {
  const errors = [];
  const warnings = [];
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // 1. Every edge must satisfy the rule matrix
  edges.forEach((e) => {
    const src = byId.get(e.source);
    const tgt = byId.get(e.target);
    if (!src || !tgt) {
      errors.push({ code: 'edge/dangling', message: 'An edge references a node that no longer exists.', edgeIds: [e.id] });
      return;
    }
    const check = validateConnection(src, tgt, []);
    if (!check.valid) {
      errors.push({
        code: 'edge/invalid',
        message: `Invalid connection: ${nameOf(src)} → ${nameOf(tgt)}. ${check.reason}`,
        edgeIds: [e.id],
        nodeIds: [src.id, tgt.id],
      });
    }
  });

  const entities = nodes.filter((n) => n.type === 'entityNode');
  const apiNodes = nodes.filter((n) => n.type === 'apiNode');
  const dbNodes = nodes.filter((n) => n.type === 'dbNode');
  const authNodes = nodes.filter((n) => n.type === 'authNode');

  // 2. Entities
  if (entities.length === 0) {
    errors.push({ code: 'graph/no-entity', message: 'Add at least one Data Model (entity) node — nothing to generate without one.' });
  }
  const seenNames = new Map();
  entities.forEach((n) => {
    const name = n.data?.name || '';
    if (!IDENTIFIER_RE.test(name)) {
      errors.push({ code: 'entity/bad-name', message: `Entity name "${name}" is not a valid identifier (letters, digits, underscore; must start with a letter).`, nodeIds: [n.id] });
    }
    const key = name.toLowerCase();
    if (seenNames.has(key)) {
      errors.push({ code: 'entity/duplicate', message: `Duplicate entity name "${name}".`, nodeIds: [n.id, seenNames.get(key)] });
    } else {
      seenNames.set(key, n.id);
    }
    if (!n.data?.fields || n.data.fields.length === 0) {
      warnings.push({ code: 'entity/no-fields', message: `Entity "${name}" has no fields — its model will only contain timestamps.`, nodeIds: [n.id] });
    }
  });

  // 3. API routes must be driven by an entity, and routes must not collide
  const routeSeen = new Map();
  apiNodes.forEach((n) => {
    const feeds = edges.some((e) => e.target === n.id && byId.get(e.source)?.type === 'entityNode');
    if (!feeds) {
      errors.push({ code: 'api/orphan', message: `API Route "${n.data?.route || n.id}" has no Data Model connected to it (entity → API). It cannot generate CRUD endpoints.`, nodeIds: [n.id] });
    }
    const route = (n.data?.route || '').trim();
    if (!route.startsWith('/')) {
      errors.push({ code: 'api/bad-route', message: `API route "${route}" must start with "/".`, nodeIds: [n.id] });
    }
    if (routeSeen.has(route)) {
      errors.push({ code: 'api/route-collision', message: `Two API nodes share the route "${route}".`, nodeIds: [n.id, routeSeen.get(route)] });
    } else {
      routeSeen.set(route, n.id);
    }
  });

  // 4. Entities that expose nothing
  entities.forEach((n) => {
    const exposed = edges.some((e) => e.source === n.id && byId.get(e.target)?.type === 'apiNode');
    if (!exposed) {
      warnings.push({ code: 'entity/no-api', message: `Entity "${n.data?.name}" is not connected to any API Route — a model will be generated but no endpoints.`, nodeIds: [n.id] });
    }
  });

  // 5. Logic hooks must be triggered by something
  nodes.filter((n) => n.type === 'logicNode').forEach((n) => {
    const triggered = edges.some((e) => e.target === n.id);
    if (!triggered) {
      warnings.push({ code: 'logic/orphan', message: `Logic Hook "${n.data?.name}" is not triggered by any API, cron, queue or webhook.`, nodeIds: [n.id] });
    }
  });

  // 6. Database sanity
  if (dbNodes.length === 0 && entities.length > 0) {
    warnings.push({ code: 'graph/no-db', message: 'No Database node on the canvas — generation will default to MongoDB.' });
  }
  if (dbNodes.length > 1) {
    warnings.push({ code: 'graph/multi-db', message: 'Multiple Database nodes found — the first one is used as the primary datastore.', nodeIds: dbNodes.map((n) => n.id) });
  }

  // 7. Auth sanity
  if (authNodes.length > 0) {
    const anyProtected = apiNodes.some((n) => n.data?.authEnabled) ||
      edges.some((e) => byId.get(e.source)?.type === 'authNode');
    if (!anyProtected) {
      warnings.push({ code: 'auth/unused', message: 'An Auth Guard exists but no API route is protected. Enable auth on a route or connect Auth → API.', nodeIds: authNodes.map((n) => n.id) });
    }
  }

  // 8. Entity-relationship cycles (A→B→A via relationship edges)
  const relCycle = findEntityCycle(entities, edges);
  if (relCycle) {
    warnings.push({ code: 'relationship/cycle', message: `Circular entity relationship detected (${relCycle.join(' → ')}). Make sure this is intentional.` });
  }

  // 9. Fully disconnected codegen nodes
  nodes.forEach((n) => {
    if (ANNOTATION_TYPES.includes(n.type) || CLIENT_TYPES.includes(n.type)) return;
    if (['authNode', 'dbNode', 'middlewareNode', 'storageNode', 'cronNode', 'mailNode', 'entityNode', 'cacheNode'].includes(n.type)) return; // standalone-meaningful nodes
    const connected = edges.some((e) => e.source === n.id || e.target === n.id);
    if (!connected) {
      warnings.push({ code: 'node/disconnected', message: `${labelOf(n.type)} "${nameOf(n)}" is not connected to anything.`, nodeIds: [n.id] });
    }
  });

  return { errors, warnings, valid: errors.length === 0 };
}

function nameOf(n) {
  return n.data?.name || n.data?.route || n.data?.jobName || n.data?.title || labelOf(n.type);
}

function findEntityCycle(entities, edges) {
  const adj = new Map(entities.map((n) => [n.id, []]));
  edges.forEach((e) => {
    if (adj.has(e.source) && adj.has(e.target)) adj.get(e.source).push(e.target);
  });
  const byId = new Map(entities.map((n) => [n.id, n]));
  const state = new Map(); // 0 = unvisited, 1 = in-stack, 2 = done
  const stack = [];
  let cycle = null;

  const dfs = (id) => {
    if (cycle) return;
    state.set(id, 1);
    stack.push(id);
    for (const next of adj.get(id) || []) {
      if (state.get(next) === 1) {
        const start = stack.indexOf(next);
        cycle = stack.slice(start).concat(next).map((i) => byId.get(i)?.data?.name || i);
        return;
      }
      if (!state.get(next)) dfs(next);
    }
    stack.pop();
    state.set(id, 2);
  };

  entities.forEach((n) => { if (!state.get(n.id)) dfs(n.id); });
  return cycle;
}
