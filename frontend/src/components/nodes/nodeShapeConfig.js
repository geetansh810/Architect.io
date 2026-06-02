/**
 * nodeShapeConfig.js — Central node visual configuration (v2)
 *
 * shape:        SVG shape renderer to use
 * accentClass:  color accent key (maps to ACCENT palette in ShapeWrapper)
 * label:        display name shown in sidebar
 * category:     grouping in sidebar palette
 * techIcon:     key for TechIcons component (shown inside node)
 * glowColor:    HSL or hex for glassmorphic glow
 * compactLabel: short name for compact/zoom-out mode
 * codeGen:      whether this node participates in code generation
 */
export const NODE_SHAPE_CONFIG = {

  // ── Cylinder: databases ──────────────────────────────────────────────────────
  dbNode: {
    shape: 'cylinder', accentClass: 'slate',
    label: 'Database', category: 'Architecture',
    techIcon: 'mongodb', glowColor: '148,163,184',
    compactLabel: 'DB', codeGen: true,
  },
  replicaNode: {
    shape: 'cylinder', accentClass: 'slate',
    label: 'Read Replica', category: 'Infrastructure',
    techIcon: 'mongodb', glowColor: '148,163,184',
    compactLabel: 'Replica', codeGen: true,
  },

  // ── Hexagon: services / microservices ────────────────────────────────────────
  entityNode: {
    shape: 'hexagon', accentClass: 'emerald',
    label: 'Data Model', category: 'Core',
    techIcon: 'schema', glowColor: '16,185,129',
    compactLabel: 'Entity', codeGen: true,
  },
  logicNode: {
    shape: 'hexagon', accentClass: 'indigo',
    label: 'Logic Hook', category: 'Operations',
    techIcon: 'express', glowColor: '99,102,241',
    compactLabel: 'Logic', codeGen: true,
  },
  middlewareNode: {
    shape: 'hexagon', accentClass: 'cyan',
    label: 'Middleware', category: 'Architecture',
    techIcon: 'express', glowColor: '6,182,212',
    compactLabel: 'Middleware', codeGen: true,
  },
  counterServiceNode: {
    shape: 'hexagon', accentClass: 'violet',
    label: 'ID Generator', category: 'Infrastructure',
    techIcon: 'redis', glowColor: '139,92,246',
    compactLabel: 'ID Gen', codeGen: true,
  },

  // ── Diamond: API gateway / load balancer / auth ──────────────────────────────
  loadBalancerNode: {
    shape: 'diamond', accentClass: 'sky',
    label: 'Load Balancer', category: 'Infrastructure',
    techIcon: 'nginx', glowColor: '14,165,233',
    compactLabel: 'LB', codeGen: true,
  },
  cdnNode: {
    shape: 'diamond', accentClass: 'amber',
    label: 'CDN / Edge', category: 'Infrastructure',
    techIcon: 'cloudflare', glowColor: '245,158,11',
    compactLabel: 'CDN', codeGen: true,
  },
  authNode: {
    shape: 'diamond', accentClass: 'amber',
    label: 'Auth Guard', category: 'Architecture',
    techIcon: 'jwt', glowColor: '245,158,11',
    compactLabel: 'Auth', codeGen: true,
  },

  // ── Parallelogram: queues / async pipelines ──────────────────────────────────
  queueNode: {
    shape: 'parallelogram', accentClass: 'orange',
    label: 'Message Queue', category: 'Infrastructure',
    techIcon: 'kafka', glowColor: '249,115,22',
    compactLabel: 'Queue', codeGen: true,
  },
  cronNode: {
    shape: 'parallelogram', accentClass: 'purple',
    label: 'Scheduler', category: 'Operations',
    techIcon: 'cron', glowColor: '168,85,247',
    compactLabel: 'Cron', codeGen: true,
  },

  // ── Cloud: external / third-party services ───────────────────────────────────
  webhookNode: {
    shape: 'cloud', accentClass: 'fuchsia',
    label: 'Webhook', category: 'Integrations',
    techIcon: 'webhook', glowColor: '217,70,239',
    compactLabel: 'Webhook', codeGen: true,
  },
  mailNode: {
    shape: 'cloud', accentClass: 'rose',
    label: 'Mailer', category: 'Integrations',
    techIcon: 'smtp', glowColor: '244,63,94',
    compactLabel: 'Mail', codeGen: true,
  },
  storageNode: {
    shape: 'cloud', accentClass: 'orange',
    label: 'File Storage', category: 'Integrations',
    techIcon: 'awss3', glowColor: '249,115,22',
    compactLabel: 'Storage', codeGen: true,
  },

  // ── Rect: core API endpoints / cache ────────────────────────────────────────
  apiNode: {
    shape: 'rect', accentClass: 'blue',
    label: 'API Route', category: 'Core',
    techIcon: 'rest', glowColor: '59,130,246',
    compactLabel: 'API', codeGen: true,
  },
  cacheNode: {
    shape: 'rect', accentClass: 'red',
    label: 'Cache Layer', category: 'Infrastructure',
    techIcon: 'redis', glowColor: '239,68,68',
    compactLabel: 'Cache', codeGen: true,
  },

  // ── Frontend nodes ───────────────────────────────────────────────────────────
  frontendNode: {
    shape: 'rect', accentClass: 'cyan',
    label: 'Frontend App', category: 'Frontend',
    techIcon: 'react', glowColor: '6,182,212',
    compactLabel: 'App', codeGen: false,
  },
  mobileNode: {
    shape: 'rect', accentClass: 'sky',
    label: 'Mobile App', category: 'Frontend',
    techIcon: 'mobile', glowColor: '14,165,233',
    compactLabel: 'Mobile', codeGen: false,
  },
  browserNode: {
    shape: 'rect', accentClass: 'slate',
    label: 'Browser Client', category: 'Frontend',
    techIcon: 'browser', glowColor: '148,163,184',
    compactLabel: 'Browser', codeGen: false,
  },

  // ── Annotation nodes (visual-only, no code gen) ──────────────────────────────
  zoneGroup: {
    shape: 'zone', accentClass: 'slate',
    label: 'Zone Group', category: 'Annotations',
    techIcon: null, glowColor: '100,116,139',
    compactLabel: 'Zone', codeGen: false,
  },
  stickyNote: {
    shape: 'sticky', accentClass: 'amber',
    label: 'Sticky Note', category: 'Annotations',
    techIcon: null, glowColor: '251,191,36',
    compactLabel: 'Note', codeGen: false,
  },
  textLabel: {
    shape: 'text', accentClass: 'slate',
    label: 'Text Label', category: 'Annotations',
    techIcon: null, glowColor: '100,116,139',
    compactLabel: 'Text', codeGen: false,
  },
};
