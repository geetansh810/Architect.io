/**
 * aiArchitect.js — AI workflow generation on top of Gemini.
 *
 * Turns a natural-language description of a backend system into a canvas
 * graph (nodes + edges) matching the builder's node schemas. Every AI
 * response is rectified before it reaches the client: unknown node types are
 * dropped, node data is coerced onto known schemas, edges that violate the
 * connection-rule matrix are removed (or flipped when the reverse direction
 * is legal), and positions are computed with a layered auto-layout.
 */

import { generateJson } from './gemini.js';
import { RULES, ANNOTATION_TYPES, validateConnection, validateArchitecture, labelOf } from '../utils/connectionRules.js';

// ── Node data schemas (mirror of the builder's addNode defaults) ─────────────
const NODE_DEFAULTS = {
  entityNode: { name: 'NewEntity', fields: [] },
  apiNode: { route: '/new-api', authEnabled: false },
  authNode: { method: 'JWT', expiry: '24h', secret: '' },
  dbNode: { type: 'mongodb', dbName: 'app_db', uri: '' },
  mailNode: { provider: 'SMTP', fromEmail: 'noreply@app.com' },
  logicNode: { name: 'Process Data', hook: 'before-create', code: '' },
  middlewareNode: { middlewareType: 'Rate Limiter', config: { windowMs: 900000, maxRequests: 100 }, code: '' },
  storageNode: { provider: 'Local (Multer)', maxSizeMB: 5, allowedTypes: ['images'] },
  cronNode: { jobName: 'dailyCleanup', schedule: '0 0 * * *' },
  webhookNode: { direction: 'Incoming', provider: 'Stripe', path: '/stripe-webhooks' },
  cacheNode: { provider: 'Redis', evictionPolicy: 'LRU', ttl: 3600, strategy: 'Cache-Aside' },
  loadBalancerNode: { algorithm: 'Round Robin', healthPath: 'health', intervalSec: 30, sslTermination: true },
  cdnNode: { provider: 'Cloudflare', redirectType: 'HTTP 302', regions: 'Global' },
  queueNode: { broker: 'BullMQ', topic: 'jobs', consumerGroup: 'workers', partitions: 3 },
  counterServiceNode: { strategy: 'Counter + Base62', encoding: 'Base62', batchSize: 1000, codeLength: 7 },
  replicaNode: { replicaCount: 2, strategy: 'Read/Write Split', lagToleranceMs: 100 },
  frontendNode: { name: 'Web App' },
  mobileNode: { name: 'Mobile App' },
  browserNode: { name: 'Browser' },
};

const VALID_HOOKS = ['before-create', 'after-create', 'before-update', 'after-update', 'before-delete', 'after-delete'];
const VALID_FIELD_TYPES = ['string', 'number', 'boolean', 'date'];
const VALID_REL_TYPES = ['1:1', '1:N', 'N:M'];

// Column-based layered layout (mirrors the builder's auto-layout)
const COLUMN_MAPPING = {
  frontendNode: 0, mobileNode: 0, browserNode: 0,
  cdnNode: 1, loadBalancerNode: 1,
  middlewareNode: 2, authNode: 2,
  apiNode: 3,
  logicNode: 4, counterServiceNode: 4,
  entityNode: 5,
  cacheNode: 6, dbNode: 6, replicaNode: 6, storageNode: 6,
  queueNode: 7, cronNode: 7, mailNode: 7, webhookNode: 7,
};

// ── Prompt construction ──────────────────────────────────────────────────────
const ruleLines = Object.entries(RULES)
  .flatMap(([src, targets]) => Object.entries(targets).map(([tgt, label]) => `  - ${src} -> ${tgt} (${label})`))
  .join('\n');

const SYSTEM_INSTRUCTION = `You are BackendFlow's AI Solutions Architect. You design production-grade backend system architectures as a graph of typed nodes and directed edges for a visual builder.

## Node types and their exact "data" schemas
- entityNode: { "name": PascalCaseSingular, "fields": [{ "name": camelCase, "type": "string"|"number"|"boolean"|"date", "required": bool, "unique"?: bool }] } — a data model / collection.
- apiNode: { "route": "/plural-kebab", "authEnabled": bool } — a REST CRUD endpoint group for ONE entity.
- authNode: { "method": "JWT", "expiry": "24h" } — authentication guard (at most one).
- dbNode: { "type": "mongodb", "dbName": snake_case } — primary database (exactly one when entities exist).
- replicaNode: { "replicaCount": int, "strategy": "Read/Write Split", "lagToleranceMs": int }
- cacheNode: { "provider": "Redis", "evictionPolicy": "LRU"|"LFU", "ttl": seconds, "strategy": "Cache-Aside"|"Write-Through" }
- logicNode: { "name": "Verb Phrase", "hook": "before-create"|"after-create"|"before-update"|"after-update"|"before-delete"|"after-delete", "code"?: JS function body string receiving (payload) and returning it } — business logic attached to an API's lifecycle. Only include "code" when the user's prompt implies concrete logic (e.g. "hash the password", "send a welcome email"); otherwise omit it.
- middlewareNode: { "middlewareType": "Rate Limiter"|"Logger"|"CORS"|"Validator"|"Custom", "config": { "windowMs"?: int, "maxRequests"?: int }, "code"?: JS function body string receiving (req, res, next), only for "Custom" }
- storageNode: { "provider": "AWS S3"|"Local (Multer)", "maxSizeMB": int, "allowedTypes": ["images"|"documents"|"videos"] }
- cronNode: { "jobName": camelCase, "schedule": standard 5-part cron expression }
- webhookNode: { "direction": "Incoming"|"Outgoing", "provider": string, "path": "/kebab-path" }
- queueNode: { "broker": "BullMQ"|"Kafka"|"RabbitMQ", "topic": kebab-case, "consumerGroup": string, "partitions": int }
- mailNode: { "provider": "SMTP"|"SendGrid", "fromEmail": email }
- loadBalancerNode: { "algorithm": "Round Robin"|"Least Connections", "healthPath": "health", "intervalSec": int, "sslTermination": bool }
- cdnNode: { "provider": "Cloudflare"|"CloudFront", "redirectType": "HTTP 302", "regions": "Global" }
- counterServiceNode: { "strategy": "Counter + Base62", "encoding": "Base62", "batchSize": int, "codeLength": int }
- frontendNode / mobileNode / browserNode: { "name": string } — client apps (visual only).

## Directed connection rules (ONLY these source -> target pairs are legal)
${ruleLines}

## Hard requirements
1. Every apiNode MUST have exactly one incoming edge from an entityNode (entityNode -> apiNode). An apiNode without a driving entity is invalid.
2. Every entityNode that should expose REST endpoints connects entityNode -> apiNode, and entityNode -> dbNode for persistence.
3. Entity relationships are entityNode -> entityNode edges with edge "data": { "type": "1:1"|"1:N"|"N:M", "foreignKey": camelCaseId }.
4. logicNode hooks are triggered by apiNode -> logicNode (or cronNode/queueNode/webhookNode -> logicNode).
5. Give every node a unique short id like "entity-user", "api-users", "db-main".
6. Model REAL production concerns: auth for user-facing systems, cache for read-heavy paths, queues for async work (emails, media processing, analytics), cron for maintenance, webhooks for third-party integrations, rate limiting middleware for public APIs.
7. Field lists must be complete and realistic (8+ fields for core entities where appropriate; include foreign-key-free base fields only — relationships are expressed as edges, not fields).
8. Do NOT invent node types or connection pairs outside the lists above.

## Output — strict JSON, nothing else
{
  "name": "Short project name",
  "summary": "2-3 sentence architectural overview",
  "documentation": "Markdown README describing the architecture, data models, endpoints and async flows",
  "nodes": [{ "id": "...", "type": "...", "data": { ... } }],
  "edges": [{ "source": "...", "target": "...", "label"?: "...", "data"?: { "type": "1:N", "foreignKey": "userId" } }]
}`;

// ── Rectification ────────────────────────────────────────────────────────────
function coerceNodeData(type, data = {}) {
  const defaults = NODE_DEFAULTS[type];
  const out = { ...defaults, ...pickKnown(data, defaults) };

  if (type === 'entityNode') {
    out.name = String(out.name || 'Entity').replace(/[^A-Za-z0-9_]/g, '') || 'Entity';
    out.name = out.name[0].toUpperCase() + out.name.slice(1);
    out.fields = (Array.isArray(data.fields) ? data.fields : [])
      .filter((f) => f && f.name)
      .map((f) => ({
        name: String(f.name).replace(/[^A-Za-z0-9_]/g, ''),
        type: VALID_FIELD_TYPES.includes(f.type) ? f.type : 'string',
        required: !!f.required,
        ...(f.unique ? { unique: true } : {}),
      }))
      .filter((f) => f.name);
  }
  if (type === 'apiNode') {
    let route = String(out.route || '/api').trim();
    if (!route.startsWith('/')) route = '/' + route;
    out.route = route.replace(/\s+/g, '-').toLowerCase();
    out.authEnabled = !!out.authEnabled;
  }
  if (type === 'logicNode' && !VALID_HOOKS.includes(out.hook)) {
    out.hook = 'after-create';
  }
  if (type === 'webhookNode') {
    let p = String(out.path || '/webhooks').trim();
    if (!p.startsWith('/')) p = '/' + p;
    out.path = p;
  }
  return out;
}

function pickKnown(data, defaults) {
  if (!defaults) return {};
  const out = {};
  Object.keys(defaults).forEach((k) => {
    if (data[k] !== undefined && data[k] !== null) out[k] = data[k];
  });
  return out;
}

/**
 * Sanitize + rectify a raw AI graph into a canvas-ready one.
 * Returns { nodes, edges, corrections }.
 */
export function rectifyGraph(rawNodes = [], rawEdges = []) {
  const corrections = [];
  const seenIds = new Set();
  const nodes = [];

  for (const raw of rawNodes) {
    if (!raw || typeof raw !== 'object') continue;
    const type = raw.type;
    if (!NODE_DEFAULTS[type]) {
      if (!ANNOTATION_TYPES.includes(type)) {
        corrections.push(`Dropped node of unknown type "${type}".`);
      }
      continue;
    }
    let id = String(raw.id || `${type}-${nodes.length}`);
    while (seenIds.has(id)) id = `${id}-x`;
    seenIds.add(id);
    nodes.push({ id, type, position: { x: 0, y: 0 }, data: coerceNodeData(type, raw.data) });
  }

  // Deduplicate entity names
  const nameCount = {};
  nodes.filter((n) => n.type === 'entityNode').forEach((n) => {
    const key = n.data.name.toLowerCase();
    nameCount[key] = (nameCount[key] || 0) + 1;
    if (nameCount[key] > 1) {
      const newName = `${n.data.name}${nameCount[key]}`;
      corrections.push(`Renamed duplicate entity "${n.data.name}" to "${newName}".`);
      n.data.name = newName;
    }
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = [];
  const edgeKeys = new Set();

  for (const raw of rawEdges) {
    if (!raw || !raw.source || !raw.target) continue;
    let src = byId.get(String(raw.source));
    let tgt = byId.get(String(raw.target));
    if (!src || !tgt) {
      corrections.push(`Removed edge referencing unknown node (${raw.source} → ${raw.target}).`);
      continue;
    }

    let check = validateConnection(src, tgt, []);
    if (!check.valid) {
      // Try flipping the direction if the reverse pairing is legal
      const flipped = validateConnection(tgt, src, []);
      if (flipped.valid) {
        corrections.push(`Reversed edge ${labelOf(src.type)} → ${labelOf(tgt.type)} (direction was invalid).`);
        [src, tgt] = [tgt, src];
        check = flipped;
      } else {
        corrections.push(`Removed invalid connection: ${labelOf(src.type)} → ${labelOf(tgt.type)}.`);
        continue;
      }
    }

    const key = `${src.id}->${tgt.id}`;
    if (edgeKeys.has(key)) continue;
    edgeKeys.add(key);

    const isRelationship = src.type === 'entityNode' && tgt.type === 'entityNode';
    const relData = isRelationship
      ? {
          type: VALID_REL_TYPES.includes(raw.data?.type) ? raw.data.type : '1:N',
          foreignKey: raw.data?.foreignKey || `${src.data.name.toLowerCase()}Id`,
        }
      : undefined;

    edges.push({
      id: `e-${src.id}-${tgt.id}`,
      source: src.id,
      target: tgt.id,
      animated: true,
      label: isRelationship ? relData.type : (raw.label || check.label || ''),
      ...(relData ? { data: relData } : {}),
      labelStyle: { fill: '#cbd5e1', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      ...(isRelationship ? { style: { strokeDasharray: '5 5', stroke: '#10b981' } } : {}),
    });
  }

  // Guarantee hard invariants: drop apiNodes with no driving entity
  const validNodes = nodes.filter((n) => {
    if (n.type !== 'apiNode') return true;
    const driven = edges.some((e) => e.target === n.id && byId.get(e.source)?.type === 'entityNode');
    if (!driven) corrections.push(`Removed API Route "${n.data.route}" — no entity drives it.`);
    return driven;
  });
  const validIds = new Set(validNodes.map((n) => n.id));
  const validEdges = edges.filter((e) => validIds.has(e.source) && validIds.has(e.target));

  layoutGraph(validNodes);
  return { nodes: validNodes, edges: validEdges, corrections };
}

/** Layered left-to-right layout using COLUMN_MAPPING. */
function layoutGraph(nodes) {
  const columns = {};
  nodes.forEach((n) => {
    const col = COLUMN_MAPPING[n.type] ?? 4;
    (columns[col] = columns[col] || []).push(n);
  });
  Object.entries(columns).forEach(([col, colNodes]) => {
    const colNum = Number(col);
    const totalH = colNodes.length * 190;
    colNodes.forEach((n, i) => {
      n.position = {
        x: 80 + colNum * 340,
        y: Math.max(60, 400 - totalH / 2) + i * 190,
      };
    });
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function generateWorkflowFromPrompt(prompt) {
  const raw = await generateJson({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: `Design a complete, production-grade backend architecture for the following requirement. Be thorough — cover data modeling, API surface, auth, caching, async processing and third-party integrations where they make sense.\n\nREQUIREMENT:\n${prompt}`,
  });
  return finalizeAiGraph(raw);
}

export async function refineWorkflowFromPrompt(prompt, existingNodes = [], existingEdges = []) {
  const slimNodes = existingNodes
    .filter((n) => !ANNOTATION_TYPES.includes(n.type))
    .map((n) => ({ id: n.id, type: n.type, data: n.data }));
  const slimEdges = existingEdges.map((e) => ({ source: e.source, target: e.target, label: e.label, data: e.data }));

  const raw = await generateJson({
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: `Below is an EXISTING architecture graph. Apply the requested change and return the COMPLETE updated graph (all nodes and edges, not a diff). Keep existing node ids stable wherever the node survives.\n\nEXISTING NODES:\n${JSON.stringify(slimNodes, null, 2)}\n\nEXISTING EDGES:\n${JSON.stringify(slimEdges, null, 2)}\n\nREQUESTED CHANGE:\n${prompt}`,
  });
  return finalizeAiGraph(raw);
}

function finalizeAiGraph(raw) {
  if (!raw || !Array.isArray(raw.nodes)) {
    throw new Error('AI response did not contain a node graph. Try rephrasing your prompt.');
  }
  const { nodes, edges, corrections } = rectifyGraph(raw.nodes, raw.edges || []);
  if (nodes.length === 0) {
    throw new Error('AI produced no usable nodes. Try a more specific prompt.');
  }
  const validation = validateArchitecture(nodes, edges);
  return {
    name: typeof raw.name === 'string' ? raw.name : 'AI Generated Architecture',
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    documentation: typeof raw.documentation === 'string' ? raw.documentation : '',
    nodes,
    edges,
    corrections,
    validation,
  };
}
