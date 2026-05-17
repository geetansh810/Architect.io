export const templates = [
  {
    name: 'URL Shortener (Bitly)',
    slug: 'url-shortener',
    desc: 'Production-grade Bitly clone with CDN, Redis Cache, Load Balancer, Kafka analytics pipeline, Base62 ID generator, and read replicas.',
    architecture: {
      documentation: `# URL Shortener System Design

This template demonstrates a highly scalable URL Shortener architecture similar to Bitly.

## Key Components:
- **CDN & Load Balancer**: Distributes traffic globally and mitigates DDoS attacks.
- **Rate Limiting Middleware**: Prevents abuse and controls usage quotas.
- **Counter + Base62 Node**: A centralized ID generation service to ensure short codes are unique and fast.
- **Cache (Redis)**: Cache-aside strategy to serve hot redirect URLs in milliseconds.
- **Database (PostgreSQL)**: Master-replica setup to handle high read/write ratio.
- **Queue (Kafka)**: Decouples the redirect logic from analytics tracking to maintain low latency.
- **Cron Jobs**: Cleans up expired links asynchronously.

This design is highly robust and easily capable of handling millions of requests.`,
      nodes: [
        { id: 'lb', type: 'loadBalancerNode', position: { x: 300, y: 150 }, data: { algorithm: 'Round Robin', healthPath: 'health', intervalSec: 30, sslTermination: true } },
        { id: 'cdn', type: 'cdnNode', position: { x: 0, y: 150 }, data: { provider: 'Cloudflare', redirectType: 'HTTP 302', regions: 'Global' } },
        { id: 'auth', type: 'authNode', position: { x: 600, y: -100 }, data: { method: 'JWT', expiry: '24h', secret: 'url_shortener_secret' } },
        { id: 'db', type: 'dbNode', position: { x: 1700, y: 250 }, data: { type: 'postgresql', dbName: 'url_shortener_db', uri: '' } },
        { id: 'replica', type: 'replicaNode', position: { x: 2100, y: 250 }, data: { replicaCount: 2, strategy: 'Read/Write Split', lagToleranceMs: 100 } },
        { id: 'cache', type: 'cacheNode', position: { x: 1300, y: 250 }, data: { provider: 'Redis', evictionPolicy: 'LRU', ttl: 3600, strategy: 'Cache-Aside' } },
        { id: 'counter', type: 'counterServiceNode', position: { x: 1700, y: -150 }, data: { strategy: 'Counter + Base62', encoding: 'Base62', batchSize: 1000, codeLength: 7 } },
        { id: 'ratelimit', type: 'middlewareNode', position: { x: 600, y: 150 }, data: { middlewareType: 'Rate Limiter', config: { windowMs: 900000, maxRequests: 100 } } },
        { id: 'url_entity', type: 'entityNode', position: { x: 1300, y: 50 }, data: { name: 'Url', fields: [ { name: 'shortCode', type: 'string', required: true }, { name: 'longUrl', type: 'string', required: true }, { name: 'userId', type: 'string', required: false }, { name: 'customAlias', type: 'string', required: false }, { name: 'expiresAt', type: 'date', required: false }, { name: 'isActive', type: 'boolean', required: false } ] } },
        { id: 'user_entity', type: 'entityNode', position: { x: 1700, y: 50 }, data: { name: 'User', fields: [ { name: 'email', type: 'string', required: true }, { name: 'passwordHash', type: 'string', required: true }, { name: 'plan', type: 'string', required: false } ] } },
        { id: 'click_entity', type: 'entityNode', position: { x: 1300, y: 600 }, data: { name: 'ClickEvent', fields: [ { name: 'shortCode', type: 'string', required: true }, { name: 'ipHash', type: 'string', required: false }, { name: 'country', type: 'string', required: false }, { name: 'userAgent', type: 'string', required: false }, { name: 'timestamp', type: 'date', required: true } ] } },
        { id: 'write_api', type: 'apiNode', position: { x: 900, y: 0 }, data: { route: '/api/urls', authEnabled: false } },
        { id: 'redirect_api', type: 'apiNode', position: { x: 900, y: 200 }, data: { route: '/:shortCode', authEnabled: false } },
        { id: 'stats_api', type: 'apiNode', position: { x: 900, y: 450 }, data: { route: '/api/urls/:code/stats', authEnabled: true } },
        { id: 'hash_logic', type: 'logicNode', position: { x: 1300, y: -150 }, data: { name: 'Generate Short Code', hook: 'before-create' } },
        { id: 'queue', type: 'queueNode', position: { x: 1300, y: 400 }, data: { broker: 'Kafka', topic: 'click-events', consumerGroup: 'analytics-service', partitions: 3 } },
        { id: 'analytics_logic', type: 'logicNode', position: { x: 1700, y: 400 }, data: { name: 'Write Click Analytics', hook: 'after-create' } },
        { id: 'cron', type: 'cronNode', position: { x: 1700, y: 600 }, data: { jobName: 'expiredUrlCleanup', schedule: '0 * * * *' } },
      ],
      edges: [
        { id: 'e-cdn-lb', source: 'cdn', target: 'lb', label: 'Routes Traffic', animated: true },
        { id: 'e-lb-ratelimit', source: 'lb', target: 'ratelimit', label: 'Applies Middleware', animated: true },
        { id: 'e-ratelimit-write', source: 'ratelimit', target: 'write_api', label: 'Applies Middleware', animated: true },
        { id: 'e-ratelimit-read', source: 'ratelimit', target: 'redirect_api', label: 'Applies Middleware', animated: true },
        { id: 'e-auth-write', source: 'auth', target: 'write_api' },
        { id: 'e-auth-stats', source: 'auth', target: 'stats_api' },
        { id: 'e-url-write', source: 'url_entity', target: 'write_api', label: 'Exposes CRUD', animated: true },
        { id: 'e-write-logic', source: 'write_api', target: 'hash_logic', label: 'Triggers before-create', animated: true },
        { id: 'e-logic-counter', source: 'hash_logic', target: 'counter', label: 'Allocates ID', animated: true },
        { id: 'e-url-redirect', source: 'url_entity', target: 'redirect_api', label: 'Exposes Read', animated: true },
        { id: 'e-redirect-cache', source: 'redirect_api', target: 'cache', label: 'Cache-Aside Lookup', animated: true },
        { id: 'e-cache-db', source: 'cache', target: 'db', label: 'Cache Miss → DB', animated: true },
        { id: 'e-db-replica', source: 'db', target: 'replica', label: 'Replicates', animated: false, style: { strokeDasharray: '5 5', stroke: '#64748b' } },
        { id: 'e-redirect-queue', source: 'redirect_api', target: 'queue', label: 'Async Click Event', animated: true },
        { id: 'e-queue-analytics', source: 'queue', target: 'analytics_logic', label: 'Consumes Events', animated: true },
        { id: 'e-click-stats', source: 'click_entity', target: 'stats_api', label: 'Exposes CRUD', animated: true },
        { id: 'e-user-url', source: 'url_entity', target: 'user_entity', label: 'N:1', data: { type: 'N:1', foreignKey: 'userId' }, style: { strokeDasharray: '5 5', stroke: '#10b981' }, animated: true },
        { id: 'e-cron-db', source: 'cron', target: 'db', label: 'Purges Expired', animated: false },
      ]
    }
  },
  {
    name: 'E-Commerce Pro',
    slug: 'ecommerce-pro',
    desc: 'A production-grade setup with Auth, Inventory Logic, Mailers, and complex Relations.',
    architecture: {
      documentation: `# E-Commerce Pro Architecture

This workflow defines a robust E-commerce backend using MongoDB.

## Features:
- JWT Authentication for Users and Admins.
- User, Product, and Order entities properly modeled.
- Order processing logic hook to compute totals and decrement stock.
- Automated Mailer using SendGrid triggered upon order creation.

A complete end-to-end framework for launching scalable storefronts.`,
      nodes: [
        { id: 'auth', type: 'authNode', position: { x: 400, y: 0 }, data: { method: 'JWT', expiry: '24h', secret: 'arch_secret_123' } },
        { id: 'db', type: 'dbNode', position: { x: 0, y: 800 }, data: { type: 'mongodb', dbName: 'architect_ecom' } },
        { id: 'user', type: 'entityNode', position: { x: 0, y: 0 }, data: { name: 'User', fields: [{ name: 'email', type: 'string', required: true }, { name: 'password', type: 'string', required: true }, { name: 'role', type: 'string' }] } },
        { id: 'prod', type: 'entityNode', position: { x: 0, y: 300 }, data: { name: 'Product', fields: [{ name: 'title', type: 'string', required: true }, { name: 'price', type: 'number', required: true }, { name: 'stock', type: 'number', required: true }] } },
        { id: 'order', type: 'entityNode', position: { x: 0, y: 600 }, data: { name: 'Order', fields: [{ name: 'total', type: 'number', required: true }, { name: 'status', type: 'string' }] } },
        { id: 'logic', type: 'logicNode', position: { x: 400, y: 600 }, data: { name: 'Process Order', hook: 'after-create' } },
        { id: 'mailer', type: 'mailNode', position: { x: 800, y: 600 }, data: { provider: 'SendGrid', fromEmail: 'orders@architect.io' } },
        { id: 'auth_api', type: 'apiNode', position: { x: 800, y: 0 }, data: { route: '/api/auth', authEnabled: false } },
        { id: 'prod_api', type: 'apiNode', position: { x: 400, y: 300 }, data: { route: '/api/products', authEnabled: false } },
        { id: 'order_api', type: 'apiNode', position: { x: 400, y: 800 }, data: { route: '/api/orders', authEnabled: true } }
      ],
      edges: [
        { id: 'e1', source: 'user', target: 'auth' },
        { id: 'e2', source: 'auth', target: 'auth_api' },
        { id: 'e3', source: 'prod', target: 'prod_api' },
        { id: 'e4', source: 'order', target: 'order_api' },
        { id: 'e5', source: 'order', target: 'logic' },
        { id: 'e6', source: 'logic', target: 'mailer' }
      ]
    }
  },
  {
    name: 'SaaS Platform',
    slug: 'saas-platform',
    desc: 'Multi-tenant structure with subscription logic.',
    architecture: {
      documentation: `# SaaS Platform Architecture

A foundation for building multi-tenant Software as a Service applications.

## Details:
- Supports OAuth2 integration for social logins.
- Organization Entity representing the core tenancy model.
- Secured APIs where data is strictly isolated per organization.`,
      nodes: [
        { id: 'auth', type: 'authNode', position: { x: 0, y: 200 }, data: { method: 'OAuth2' } },
        { id: 'org', type: 'entityNode', position: { x: 0, y: 0 }, data: { name: 'Organization', fields: [{ name: 'name', type: 'String' }] } },
        { id: 'api', type: 'apiNode', position: { x: 400, y: 0 }, data: { route: '/api/orgs', authEnabled: true } }
      ],
      edges: [
        { id: 'e1', source: 'org', target: 'api' }
      ]
    }
  },
  {
    name: 'Social Media',
    slug: 'social-media',
    desc: 'Feed, Followers, and Real-time notifications.',
    architecture: {
      documentation: `# Social Media Backend

A template illustrating user relationships and dynamic content serving.

- **1:N Relationships**: Links Posts to their Authors seamlessly.
- **RESTful Endpoints**: Automatic exposure of highly-trafficked resources.
- Easy to extend with WebSockets for real-time engagement.`,
      nodes: [
        { id: 'user', type: 'entityNode', position: { x: 0, y: 0 }, data: { name: 'User', fields: [{ name: 'username', type: 'string' }] } },
        { id: 'post', type: 'entityNode', position: { x: 400, y: 0 }, data: { name: 'Post', fields: [{ name: 'content', type: 'String' }] } },
        { id: 'api', type: 'apiNode', position: { x: 800, y: 0 }, data: { route: '/api/posts' } }
      ],
      edges: [
        { id: 'e1', source: 'post', target: 'user', label: '1:N', data: { type: '1:N', foreignKey: 'authorId' }, style: { strokeDasharray: '5 5', stroke: '#10b981' }, animated: true },
        { id: 'e2', source: 'post', target: 'api', label: 'Exposes CRUD', animated: true }
      ]
    }
  },
  {
    name: 'High-Traffic API',
    slug: 'high-traffic-api',
    desc: 'Optimized for scale with Rate Limiting, Request Logging, and Security Middleware.',
    architecture: {
      documentation: `# High-Traffic API Architecture

Designed for APIs serving heavy computational or data-intensive traffic.

## Architectural Highlights:
- Cascading Middleware (Rate Limit -> Logger).
- Protects the underlying database from spikes.
- Easy to integrate monitoring dashboards based on the logger node.`,
      nodes: [
        { id: 'db', type: 'dbNode', position: { x: 0, y: 400 }, data: { type: 'mongodb', dbName: 'high_traffic_db' } },
        { id: 'mw_rate', type: 'middlewareNode', position: { x: 400, y: 0 }, data: { middlewareType: 'Rate Limiter', config: { windowMs: 60000, maxRequests: 100 } } },
        { id: 'mw_log', type: 'middlewareNode', position: { x: 400, y: 200 }, data: { middlewareType: 'Logger' } },
        { id: 'entity', type: 'entityNode', position: { x: 0, y: 150 }, data: { name: 'Metric', fields: [{ name: 'type', type: 'string' }, { name: 'value', type: 'number' }] } },
        { id: 'api', type: 'apiNode', position: { x: 800, y: 100 }, data: { route: '/api/v1/metrics', authEnabled: true } }
      ],
      edges: [
        { id: 'e1', source: 'mw_rate', target: 'api', label: 'Applies Middleware', animated: true },
        { id: 'e2', source: 'mw_log', target: 'api', label: 'Applies Middleware', animated: true },
        { id: 'e3', source: 'entity', target: 'api', label: 'Exposes CRUD', animated: true }
      ]
    }
  },
  {
    name: 'Asset Management SaaS',
    slug: 'asset-management-saas',
    desc: 'File handling and complex entity relations for digital assets.',
    architecture: {
      documentation: `# Asset Management SaaS

Model digital files, uploads, and directories structure logically.

- Connects directly to external storage providers (AWS S3).
- Maintains folder hierarchies using 1:N relations.`,
      nodes: [
        { id: 'storage', type: 'storageNode', position: { x: 0, y: 0 }, data: { provider: 'AWS S3', maxSizeMB: 50 } },
        { id: 'folder', type: 'entityNode', position: { x: 0, y: 200 }, data: { name: 'Folder', fields: [{ name: 'name', type: 'string' }] } },
        { id: 'asset', type: 'entityNode', position: { x: 400, y: 100 }, data: { name: 'Asset', fields: [{ name: 'filename', type: 'string' }, { name: 'url', type: 'string' }] } },
        { id: 'api', type: 'apiNode', position: { x: 800, y: 100 }, data: { route: '/api/assets', authEnabled: true } }
      ],
      edges: [
        { id: 'e1', source: 'asset', target: 'folder', label: '1:N', data: { type: '1:N', foreignKey: 'folderId' }, style: { strokeDasharray: '5 5', stroke: '#10b981' }, animated: true },
        { id: 'e2', source: 'asset', target: 'storage', label: 'Saves to Storage', animated: true },
        { id: 'e3', source: 'asset', target: 'api', label: 'Exposes CRUD', animated: true }
      ]
    }
  },
  {
    name: 'Event Marketing Automation',
    slug: 'event-marketing-automation',
    desc: 'Background jobs and webhook integration for marketing flows.',
    architecture: {
      documentation: `# Event Marketing Automation

A fully event-driven architecture using external triggers.

- Integrated Webhooks (Stripe / Third Party).
- Scheduled Cron jobs for periodic email campaign deliveries.
- Asynchronous Business Logic.`,
      nodes: [
        { id: 'cron', type: 'cronNode', position: { x: 0, y: 0 }, data: { jobName: 'EmailCampaign', schedule: '0 9 * * *' } },
        { id: 'webhook', type: 'webhookNode', position: { x: 0, y: 200 }, data: { direction: 'Incoming', provider: 'Stripe', path: '/webhooks/stripe' } },
        { id: 'logic', type: 'logicNode', position: { x: 400, y: 100 }, data: { name: 'Process Payment', hook: 'after-create' } },
        { id: 'user', type: 'entityNode', position: { x: 0, y: 400 }, data: { name: 'Subscriber', fields: [{ name: 'email', type: 'string' }, { name: 'status', type: 'string' }] } },
        { id: 'api', type: 'apiNode', position: { x: 400, y: 400 }, data: { route: '/api/subscribers', authEnabled: false } }
      ],
      edges: [
        { id: 'e1', source: 'cron', target: 'logic', label: 'Triggers Logic', animated: true },
        { id: 'e2', source: 'webhook', target: 'logic', label: 'Triggers Webhook', animated: true },
        { id: 'e3', source: 'user', target: 'api', label: 'Exposes CRUD', animated: true }
      ]
    }
  }
];
