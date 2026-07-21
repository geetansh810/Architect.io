export const ARCHITECTURE_TEMPLATES = [
  {
    id: 'mern-ecommerce',
    name: 'E-Commerce Platform',
    category: 'Full Stack',
    description: 'Complete multi-service e-commerce backend with auth, product catalog, orders, payments, and notification pipeline.',
    tags: ['MERN', 'Microservices', 'Queue', 'Cache'],
    complexity: 'advanced',
    nodeCount: 12,
    previewImage: '/templates/mern-ecommerce.png',
    author: 'Architect.io',
    featured: true,
    nodes: [
      { id: 't1-cdn', type: 'cdnNode', position: { x: 560, y: 0 }, data: { provider: 'CloudFront CDN', redirectType: 'HTTPS Redirect', layer: 'gateway' } },
      { id: 't1-lb', type: 'loadBalancerNode', position: { x: 560, y: 240 }, data: { algorithm: 'Round Robin / Sticky', healthPath: 'health', layer: 'gateway' } },
      { id: 't1-gateway', type: 'apiNode', position: { x: 560, y: 480 }, data: { route: 'API Gateway Router', authEnabled: true, layer: 'gateway' } },
      { id: 't1-auth', type: 'authNode', position: { x: -48, y: 768 }, data: { method: 'JWT + OAuth2 / Auth Service', layer: 'application' } },
      { id: 't1-products', type: 'apiNode', position: { x: 368, y: 768 }, data: { route: '/api/v1/products', authEnabled: false, layer: 'application' } },
      { id: 't1-orders', type: 'apiNode', position: { x: 784, y: 768 }, data: { route: '/api/v1/orders', authEnabled: true, layer: 'application' } },
      { id: 't1-payments', type: 'apiNode', position: { x: 1200, y: 768 }, data: { route: '/api/v1/payments', authEnabled: true, layer: 'application' } },
      { id: 't1-mongodb', type: 'dbNode', position: { x: 240, y: 1088 }, data: { type: 'MongoDB Atlas', layer: 'data' } },
      { id: 't1-redis', type: 'cacheNode', position: { x: 720, y: 1088 }, data: { provider: 'Redis Cache Layer', ttl: 3600, layer: 'data' } },
      { id: 't1-s3', type: 'storageNode', position: { x: 1200, y: 1088 }, data: { provider: 'AWS S3 Product Assets', layer: 'data' } },
      { id: 't1-queue', type: 'queueNode', position: { x: 784, y: 1408 }, data: { broker: 'AWS SQS (Order Events)', topic: 'order-events', layer: 'messaging' } },
      { id: 't1-notif', type: 'logicNode', position: { x: 784, y: 1696 }, data: { hook: 'Notification Worker', layer: 'application' } },
    ],
    edges: [
      { id: 'e-cdn-lb', source: 't1-cdn', target: 't1-lb', data: { protocol: 'HTTP', label: 'HTTPS' } },
      { id: 'e-lb-gw', source: 't1-lb', target: 't1-gateway', data: { protocol: 'HTTP', label: 'Route' } },
      { id: 'e-gw-auth', source: 't1-gateway', target: 't1-auth', data: { protocol: 'Internal', label: 'Verify' } },
      { id: 'e-gw-prod', source: 't1-gateway', target: 't1-products', data: { protocol: 'REST', label: 'Proxy' } },
      { id: 'e-gw-ord', source: 't1-gateway', target: 't1-orders', data: { protocol: 'REST', label: 'Proxy' } },
      { id: 'e-gw-pay', source: 't1-gateway', target: 't1-payments', data: { protocol: 'REST', label: 'Proxy' } },
      { id: 'e-prod-mongo', source: 't1-products', target: 't1-mongodb', data: { protocol: 'DB', label: 'CRUD' } },
      { id: 'e-prod-redis', source: 't1-products', target: 't1-redis', data: { protocol: 'Redis', label: 'Cache' } },
      { id: 'e-prod-s3', source: 't1-products', target: 't1-s3', data: { protocol: 'REST', label: 'Store' } },
      { id: 'e-ord-mongo', source: 't1-orders', target: 't1-mongodb', data: { protocol: 'DB', label: 'CRUD' } },
      { id: 'e-ord-queue', source: 't1-orders', target: 't1-queue', data: { protocol: 'pub/sub', isAsync: true, label: 'Publish' } },
      { id: 'e-queue-notif', source: 't1-queue', target: 't1-notif', data: { protocol: 'pub/sub', isAsync: true, label: 'Consume' } },
    ],
    categoryBoxes: [
      {
        id: 'cb-t1-gateway',
        title: 'Gateway Layer',
        color: 'blue',
        position: { x: 420, y: -60 },
        dimensions: { width: 380, height: 620 },
      },
      {
        id: 'cb-t1-application',
        title: 'Application Layer',
        color: 'purple',
        position: { x: -180, y: 700 },
        dimensions: { width: 1580, height: 180 },
      },
      {
        id: 'cb-t1-data',
        title: 'Data Layer',
        color: 'green',
        position: { x: 80, y: 1020 },
        dimensions: { width: 1280, height: 200 },
      },
      {
        id: 'cb-t1-messaging',
        title: 'Messaging & Workers',
        color: 'orange',
        position: { x: 620, y: 1340 },
        dimensions: { width: 380, height: 460 },
      },
    ],
  },

  {
    id: 'saas-multitenant',
    name: 'SaaS Multi-Tenant App',
    category: 'SaaS',
    description: 'Multi-tenant SaaS architecture with tenant isolation, subscription management, and per-tenant data segregation.',
    tags: ['SaaS', 'Multi-tenant', 'Auth', 'Subscriptions'],
    complexity: 'advanced',
    nodeCount: 10,
    previewImage: '/templates/saas-multitenant.png',
    featured: true,
    nodes: [
      { id: 't2-gateway', type: 'apiNode', position: { x: 400, y: 64 }, data: { route: 'API Gateway Tenant Router', authEnabled: true, layer: 'gateway' } },
      { id: 't2-auth', type: 'authNode', position: { x: 0, y: 352 }, data: { method: 'JWT Credentials / Auth Service', layer: 'application' } },
      { id: 't2-tenant', type: 'apiNode', position: { x: 400, y: 352 }, data: { route: '/api/v1/tenants', authEnabled: true, layer: 'application' } },
      { id: 't2-billing', type: 'apiNode', position: { x: 800, y: 352 }, data: { route: '/api/v1/billing', authEnabled: true, layer: 'application' } },
      { id: 't2-app', type: 'apiNode', position: { x: 400, y: 672 }, data: { route: 'Core Application API', authEnabled: true, layer: 'application' } },
      { id: 't2-mongo', type: 'dbNode', position: { x: 80, y: 992 }, data: { type: 'MongoDB (Tenant A Isolation)', layer: 'data' } },
      { id: 't2-mongo2', type: 'dbNode', position: { x: 560, y: 992 }, data: { type: 'MongoDB (Tenant B Isolation)', layer: 'data' } },
      { id: 't2-redis', type: 'cacheNode', position: { x: 1040, y: 672 }, data: { provider: 'Redis Session Store', ttl: 1800, layer: 'data' } },
      { id: 't2-stripe', type: 'webhookNode', position: { x: 1200, y: 352 }, data: { provider: 'Stripe Subscription API', direction: 'Outgoing', layer: 'client' } },
      { id: 't2-email', type: 'webhookNode', position: { x: 0, y: 672 }, data: { provider: 'SendGrid Email API', direction: 'Outgoing', layer: 'client' } },
    ],
    edges: [
      { id: 'e1', source: 't2-gateway', target: 't2-auth', data: { protocol: 'Internal' } },
      { id: 'e2', source: 't2-gateway', target: 't2-tenant', data: { protocol: 'REST' } },
      { id: 'e3', source: 't2-gateway', target: 't2-billing', data: { protocol: 'REST' } },
      { id: 'e4', source: 't2-gateway', target: 't2-app', data: { protocol: 'REST' } },
      { id: 'e5', source: 't2-app', target: 't2-mongo', data: { protocol: 'DB' } },
      { id: 'e6', source: 't2-app', target: 't2-mongo2', data: { protocol: 'DB' } },
      { id: 'e7', source: 't2-auth', target: 't2-redis', data: { protocol: 'Redis', label: 'Sessions' } },
      { id: 'e8', source: 't2-billing', target: 't2-stripe', data: { protocol: 'REST', isAsync: true, label: 'Webhooks' } },
      { id: 'e9', source: 't2-auth', target: 't2-email', data: { protocol: 'REST', isAsync: true, label: 'OTP / Welcome' } },
    ],
    categoryBoxes: [
      {
        id: 'cb-t2-gateway',
        title: 'API Gateway',
        color: 'blue',
        position: { x: 260, y: 0 },
        dimensions: { width: 380, height: 140 },
      },
      {
        id: 'cb-t2-application',
        title: 'Application Layer',
        color: 'purple',
        position: { x: -140, y: 280 },
        dimensions: { width: 1040, height: 220 },
      },
      {
        id: 'cb-t2-external',
        title: 'External Services',
        color: 'orange',
        position: { x: 1060, y: 280 },
        dimensions: { width: 320, height: 500 },
      },
      {
        id: 'cb-t2-data',
        title: 'Data Layer',
        color: 'green',
        position: { x: -80, y: 920 },
        dimensions: { width: 1200, height: 200 },
      },
    ],
  },

  {
    id: 'realtime-chat',
    name: 'Real-Time Chat System',
    category: 'Real-Time',
    description: 'WebSocket-powered chat with message persistence, presence tracking, and horizontal scaling via Redis pub/sub.',
    tags: ['WebSocket', 'Redis Pub/Sub', 'Real-Time', 'MongoDB'],
    complexity: 'intermediate',
    nodeCount: 8,
    previewImage: '/templates/realtime-chat.png',
    featured: false,
    nodes: [
      { id: 't3-lb', type: 'loadBalancerNode', position: { x: 400, y: 64 }, data: { algorithm: 'Sticky Sessions (WS)', healthPath: 'healthz', layer: 'gateway' } },
      { id: 't3-ws1', type: 'apiNode', position: { x: 80, y: 384 }, data: { route: 'WebSocket Server Instance 1', authEnabled: true, layer: 'application' } },
      { id: 't3-ws2', type: 'apiNode', position: { x: 720, y: 384 }, data: { route: 'WebSocket Server Instance 2', authEnabled: true, layer: 'application' } },
      { id: 't3-redis-pubsub', type: 'cacheNode', position: { x: 400, y: 704 }, data: { provider: 'Redis Pub/Sub Message Bus', ttl: 300, layer: 'messaging' } },
      { id: 't3-redis-presence', type: 'cacheNode', position: { x: 880, y: 704 }, data: { provider: 'Redis Presence Tracker', ttl: 600, layer: 'data' } },
      { id: 't3-mongo', type: 'dbNode', position: { x: -80, y: 1024 }, data: { type: 'MongoDB Message History', layer: 'data' } },
      { id: 't3-auth', type: 'authNode', position: { x: 400, y: 1024 }, data: { method: 'JWT Session Token Verification', layer: 'application' } },
      { id: 't3-notif', type: 'logicNode', position: { x: 880, y: 1024 }, data: { hook: 'Push Notification Worker', layer: 'application' } },
    ],
    edges: [
      { id: 'e1', source: 't3-lb', target: 't3-ws1', data: { protocol: 'WebSocket', label: 'WS' } },
      { id: 'e2', source: 't3-lb', target: 't3-ws2', data: { protocol: 'WebSocket', label: 'WS' } },
      { id: 'e3', source: 't3-ws1', target: 't3-redis-pubsub', data: { protocol: 'pub/sub', isAsync: true, label: 'Publish' } },
      { id: 'e4', source: 't3-ws2', target: 't3-redis-pubsub', data: { protocol: 'pub/sub', isAsync: true, label: 'Subscribe' } },
      { id: 'e5', source: 't3-ws1', target: 't3-mongo', data: { protocol: 'DB', label: 'Persist' } },
      { id: 'e6', source: 't3-ws1', target: 't3-redis-presence', data: { protocol: 'Redis', label: 'Presence' } },
      { id: 'e7', source: 't3-ws1', target: 't3-auth', data: { protocol: 'Internal', label: 'Verify JWT' } },
      { id: 'e8', source: 't3-redis-pubsub', target: 't3-notif', data: { protocol: 'pub/sub', isAsync: true, label: 'Offline Push' } },
    ],
    categoryBoxes: [
      {
        id: 'cb-t3-gateway',
        title: 'Load Balancer',
        color: 'blue',
        position: { x: 260, y: 0 },
        dimensions: { width: 380, height: 140 },
      },
      {
        id: 'cb-t3-websockets',
        title: 'WebSocket Servers',
        color: 'purple',
        position: { x: -80, y: 310 },
        dimensions: { width: 880, height: 180 },
      },
      {
        id: 'cb-t3-cache',
        title: 'Redis Cache Layer',
        color: 'red',
        position: { x: 240, y: 630 },
        dimensions: { width: 800, height: 180 },
      },
      {
        id: 'cb-t3-data',
        title: 'Persistence & Auth',
        color: 'green',
        position: { x: -200, y: 950 },
        dimensions: { width: 1260, height: 190 },
      },
    ],
  },

  {
    id: 'data-pipeline',
    name: 'Data Pipeline / ETL',
    category: 'Data Engineering',
    description: 'Event-driven ETL pipeline: ingest raw data, transform via workers, store in warehouse, and expose analytics API.',
    tags: ['ETL', 'Kafka', 'Data Warehouse', 'Analytics'],
    complexity: 'advanced',
    nodeCount: 9,
    previewImage: '/templates/data-pipeline.png',
    featured: false,
    nodes: [
      { id: 't4-ingest', type: 'apiNode', position: { x: 400, y: 64 }, data: { route: 'Data Ingestion API Gateway', authEnabled: false, layer: 'gateway' } },
      { id: 't4-kafka', type: 'queueNode', position: { x: 400, y: 352 }, data: { broker: 'Kafka Broker', topic: 'raw-ingested-events', layer: 'messaging' } },
      { id: 't4-transformer', type: 'logicNode', position: { x: 80, y: 672 }, data: { hook: 'Transform & Normalize ETL', layer: 'application' } },
      { id: 't4-validator', type: 'logicNode', position: { x: 720, y: 672 }, data: { hook: 'Schema Validation Worker', layer: 'application' } },
      { id: 't4-kafka2', type: 'queueNode', position: { x: 400, y: 992 }, data: { broker: 'Kafka Broker', topic: 'processed-events', layer: 'messaging' } },
      { id: 't4-mongo', type: 'dbNode', position: { x: 0, y: 1312 }, data: { type: 'MongoDB Raw Events Store', layer: 'data' } },
      { id: 't4-pg', type: 'dbNode', position: { x: 800, y: 1312 }, data: { type: 'PostgreSQL Analytics DW', layer: 'data' } },
      { id: 't4-redis', type: 'cacheNode', position: { x: 400, y: 1312 }, data: { provider: 'Redis Real-Time Metrics', ttl: 60, layer: 'data' } },
      { id: 't4-analytics', type: 'apiNode', position: { x: 1040, y: 352 }, data: { route: '/api/v1/analytics-query', authEnabled: true, layer: 'application' } },
    ],
    edges: [
      { id: 'e1', source: 't4-ingest', target: 't4-kafka', data: { protocol: 'pub/sub', isAsync: true } },
      { id: 'e2', source: 't4-kafka', target: 't4-transformer', data: { protocol: 'pub/sub', isAsync: true } },
      { id: 'e3', source: 't4-kafka', target: 't4-validator', data: { protocol: 'pub/sub', isAsync: true } },
      { id: 'e4', source: 't4-transformer', target: 't4-kafka2', data: { protocol: 'pub/sub', isAsync: true } },
      { id: 'e5', source: 't4-validator', target: 't4-kafka2', data: { protocol: 'pub/sub', isAsync: true } },
      { id: 'e6', source: 't4-kafka2', target: 't4-mongo', data: { protocol: 'DB', isAsync: true } },
      { id: 'e7', source: 't4-kafka2', target: 't4-pg', data: { protocol: 'DB', isAsync: true } },
      { id: 'e8', source: 't4-kafka2', target: 't4-redis', data: { protocol: 'Redis', isAsync: true } },
      { id: 'e9', source: 't4-analytics', target: 't4-pg', data: { protocol: 'DB' } },
    ],
    categoryBoxes: [
      {
        id: 'cb-t4-ingestion',
        title: 'Data Ingestion',
        color: 'blue',
        position: { x: 260, y: 0 },
        dimensions: { width: 380, height: 140 },
      },
      {
        id: 'cb-t4-streaming',
        title: 'Event Streaming (Kafka)',
        color: 'orange',
        position: { x: 260, y: 280 },
        dimensions: { width: 380, height: 140 },
      },
      {
        id: 'cb-t4-workers',
        title: 'Processing Workers',
        color: 'purple',
        position: { x: -80, y: 600 },
        dimensions: { width: 880, height: 200 },
      },
      {
        id: 'cb-t4-output',
        title: 'Data Warehouse & Cache',
        color: 'green',
        position: { x: -80, y: 1240 },
        dimensions: { width: 1000, height: 200 },
      },
    ],
  },

  {
    id: 'serverless-api',
    name: 'Serverless REST API',
    category: 'Serverless',
    description: 'Lambda-based serverless API with DynamoDB, S3, API Gateway authorizer, and CloudWatch monitoring.',
    tags: ['Serverless', 'Lambda', 'DynamoDB', 'AWS'],
    complexity: 'intermediate',
    nodeCount: 7,
    previewImage: '/templates/serverless-api.png',
    featured: false,
    nodes: [
      { id: 't5-gw', type: 'apiNode', position: { x: 400, y: 64 }, data: { route: 'AWS API Gateway Routing', authEnabled: true, layer: 'gateway' } },
      { id: 't5-auth-lambda', type: 'logicNode', position: { x: 0, y: 384 }, data: { hook: 'Authorizer Lambda Function', layer: 'application' } },
      { id: 't5-api-lambda', type: 'logicNode', position: { x: 560, y: 384 }, data: { hook: 'REST API Handler Lambda', layer: 'application' } },
      { id: 't5-dynamo', type: 'dbNode', position: { x: 240, y: 736 }, data: { type: 'Amazon DynamoDB Store', layer: 'data' } },
      { id: 't5-s3', type: 'storageNode', position: { x: 880, y: 736 }, data: { provider: 'AWS S3 Assets Bucket', layer: 'data' } },
      { id: 't5-cloudwatch', type: 'middlewareNode', position: { x: 1200, y: 384 }, data: { middleware: 'CloudWatch Observability Logging', layer: 'observability' } },
      { id: 't5-sqs', type: 'queueNode', position: { x: 560, y: 1056 }, data: { broker: 'AWS SQS Async Jobs Queue', topic: 'job-queue', layer: 'messaging' } },
    ],
    edges: [
      { id: 'e1', source: 't5-gw', target: 't5-auth-lambda', data: { protocol: 'Internal', label: 'Authorize' } },
      { id: 'e2', source: 't5-gw', target: 't5-api-lambda', data: { protocol: 'REST', label: 'Invoke' } },
      { id: 'e3', source: 't5-api-lambda', target: 't5-dynamo', data: { protocol: 'DB', label: 'CRUD' } },
      { id: 'e4', source: 't5-api-lambda', target: 't5-s3', data: { protocol: 'REST', label: 'Upload' } },
      { id: 'e5', source: 't5-api-lambda', target: 't5-cloudwatch', data: { protocol: 'Internal', isAsync: true, label: 'Logs' } },
      { id: 'e6', source: 't5-api-lambda', target: 't5-sqs', data: { protocol: 'pub/sub', isAsync: true, label: 'Enqueue' } },
    ],
    categoryBoxes: [
      {
        id: 'cb-t5-gateway',
        title: 'AWS API Gateway',
        color: 'blue',
        position: { x: 260, y: 0 },
        dimensions: { width: 380, height: 140 },
      },
      {
        id: 'cb-t5-lambda',
        title: 'Lambda Functions',
        color: 'amber',
        position: { x: -160, y: 310 },
        dimensions: { width: 820, height: 180 },
      },
      {
        id: 'cb-t5-observability',
        title: 'Observability',
        color: 'slate',
        position: { x: 1040, y: 310 },
        dimensions: { width: 320, height: 180 },
      },
      {
        id: 'cb-t5-storage',
        title: 'Storage Layer',
        color: 'green',
        position: { x: 80, y: 660 },
        dimensions: { width: 960, height: 200 },
      },
      {
        id: 'cb-t5-messaging',
        title: 'Async Job Queue',
        color: 'orange',
        position: { x: 400, y: 980 },
        dimensions: { width: 380, height: 160 },
      },
    ],
  },

  {
    id: 'url-shortener',
    name: 'High-Scale URL Shortener',
    category: 'Full Stack',
    description: 'A production-grade, highly scalable URL shortener featuring atomic ID generation, multi-level caching (Redis), write-behind analytics (Kafka), and read replicas.',
    tags: ['System Design', 'Redis', 'Kafka', 'ID Generator', 'Scalable'],
    complexity: 'advanced',
    nodeCount: 18,
    previewImage: '/templates/url-shortener.png',
    featured: true,
    nodes: [
      { id: 't4-cdn', type: 'cdnNode', position: { x: 480, y: 80 }, data: { provider: 'Cloudflare Edge CDN', redirectType: 'HTTP 302 (Found)', regions: 'Global Edge Network', layer: 'gateway' } },
      { id: 't4-lb', type: 'loadBalancerNode', position: { x: 480, y: 272 }, data: { algorithm: 'Round Robin', healthPath: '/health', intervalSec: 10, sslTermination: true, layer: 'gateway' } },
      { id: 't4-gateway', type: 'apiNode', position: { x: 480, y: 464 }, data: { route: 'API Gateway Router', authEnabled: true, layer: 'gateway' } },
      { id: 't4-limiter', type: 'middlewareNode', position: { x: 80, y: 656 }, data: { middlewareType: 'Rate Limiter', config: { windowMs: 60000, maxRequests: 30 }, layer: 'gateway' } },
      { id: 't4-auth', type: 'authNode', position: { x: 880, y: 656 }, data: { method: 'JWT', secret: 'jwt-auth-secret-key-prod', expiry: '24h', layer: 'application' } },
      { id: 't4-api-shorten', type: 'apiNode', position: { x: 80, y: 848 }, data: { route: '/api/v1/shorten', authEnabled: true, layer: 'application' } },
      { id: 't4-api-redirect', type: 'apiNode', position: { x: 480, y: 848 }, data: { route: '/:shortCode', authEnabled: false, layer: 'application' } },
      { id: 't4-api-analytics', type: 'apiNode', position: { x: 880, y: 848 }, data: { route: '/api/v1/analytics/:shortCode', authEnabled: true, layer: 'application' } },
      { id: 't4-entity-user', type: 'entityNode', position: { x: -80, y: 1040 }, data: { name: 'User', fields: [{ name: 'email', type: 'string', required: true }, { name: 'passwordHash', type: 'string', required: true }, { name: 'apiKey', type: 'string', required: true }], layer: 'data' } },
      { id: 't4-entity-url', type: 'entityNode', position: { x: 400, y: 1040 }, data: { name: 'UrlMapping', fields: [{ name: 'shortCode', type: 'string', required: true }, { name: 'originalUrl', type: 'string', required: true }, { name: 'userId', type: 'string', required: false }, { name: 'clicks', type: 'number', required: false }], layer: 'data' } },
      { id: 't4-entity-clicks', type: 'entityNode', position: { x: 880, y: 1040 }, data: { name: 'ClickAnalytics', fields: [{ name: 'shortCode', type: 'string', required: true }, { name: 'referrer', type: 'string', required: false }, { name: 'userAgent', type: 'string', required: false }, { name: 'ipAddress', type: 'string', required: false }, { name: 'country', type: 'string', required: false }, { name: 'clickedAt', type: 'date', required: true }], layer: 'data' } },
      { id: 't4-id-gen', type: 'counterServiceNode', position: { x: 0, y: 1280 }, data: { strategy: 'Counter + Base62', encoding: 'Base62', batchSize: 1000, codeLength: 7, layer: 'infrastructure' } },
      { id: 't4-redis', type: 'cacheNode', position: { x: 480, y: 1280 }, data: { provider: 'Redis', evictionPolicy: 'LRU', ttl: 86400, strategy: 'Cache-Aside', layer: 'data' } },
      { id: 't4-queue', type: 'queueNode', position: { x: 960, y: 1280 }, data: { broker: 'Kafka', topic: 'click-events', consumerGroup: 'analytics-consumers', partitions: 3, layer: 'messaging' } },
      { id: 't4-db-primary', type: 'dbNode', position: { x: 160, y: 1520 }, data: { type: 'postgresql', dbName: 'shortener_primary', uri: 'postgresql://localhost:5432/shortener', layer: 'data' } },
      { id: 't4-db-replica', type: 'replicaNode', position: { x: 480, y: 1520 }, data: { replicaCount: 2, strategy: 'Read/Write Split', lagToleranceMs: 100, layer: 'data' } },
      { id: 't4-worker', type: 'logicNode', position: { x: 960, y: 1760 }, data: { name: 'Analytics Consumer Worker', hook: 'after-create', layer: 'application' } },
      { id: 't4-db-analytics', type: 'dbNode', position: { x: 960, y: 2000 }, data: { type: 'mongodb', dbName: 'analytics_db', uri: 'mongodb://localhost:27017/analytics', layer: 'data' } },
    ],
    edges: [
      { id: 'e-cdn-lb', source: 't4-cdn', target: 't4-lb', data: { protocol: 'HTTP', label: 'HTTPS Routing' } },
      { id: 'e-lb-gw', source: 't4-lb', target: 't4-gateway', data: { protocol: 'HTTP', label: 'Route Connection' } },
      { id: 'e-gw-limit', source: 't4-gateway', target: 't4-limiter', data: { protocol: 'Internal', label: 'Rate Limit Filter' } },
      { id: 'e-gw-auth', source: 't4-gateway', target: 't4-auth', data: { protocol: 'Internal', label: 'Auth Guard' } },
      { id: 'e-gw-shorten', source: 't4-gateway', target: 't4-api-shorten', data: { protocol: 'REST', label: 'Shorten Endpoint' } },
      { id: 'e-gw-redirect', source: 't4-gateway', target: 't4-api-redirect', data: { protocol: 'REST', label: 'Redirect Endpoint' } },
      { id: 'e-gw-analytics', source: 't4-gateway', target: 't4-api-analytics', data: { protocol: 'REST', label: 'Admin Analytics' } },
      { id: 'e-shorten-entity', source: 't4-api-shorten', target: 't4-entity-url', data: { protocol: 'Internal', label: 'Exposes CRUD' } },
      { id: 'e-redirect-entity', source: 't4-api-redirect', target: 't4-entity-url', data: { protocol: 'Internal', label: 'Exposes CRUD' } },
      { id: 'e-analytics-entity', source: 't4-api-analytics', target: 't4-entity-clicks', data: { protocol: 'Internal', label: 'Exposes CRUD' } },
      { id: 'e-url-idgen', source: 't4-entity-url', target: 't4-id-gen', data: { protocol: 'gRPC', label: 'Fetch Unique Key' } },
      { id: 'e-url-cache', source: 't4-entity-url', target: 't4-redis', data: { protocol: 'Redis', label: 'Cache Write-Through' } },
      { id: 'e-url-db', source: 't4-entity-url', target: 't4-db-primary', data: { protocol: 'DB', label: 'Save Mapping' } },
      { id: 'e-redirect-cache', source: 't4-api-redirect', target: 't4-redis', data: { protocol: 'Redis', label: 'Cache Lookups' } },
      { id: 'e-redirect-queue', source: 't4-api-redirect', target: 't4-queue', data: { protocol: 'pub/sub', isAsync: true, label: 'Queue Click Event' } },
      { id: 'e-queue-worker', source: 't4-queue', target: 't4-worker', data: { protocol: 'pub/sub', isAsync: true, label: 'Consume Event' } },
      { id: 'e-worker-db', source: 't4-worker', target: 't4-db-analytics', data: { protocol: 'DB', label: 'Persist Click' } },
      { id: 'e-db-replica', source: 't4-db-primary', target: 't4-db-replica', data: { protocol: 'DB', isAsync: true, label: 'Replicate' } },
      { id: 'e-analytics-db', source: 't4-api-analytics', target: 't4-db-analytics', data: { protocol: 'DB', label: 'Query Clicks' } }
    ],
    categoryBoxes: [
      {
        id: 'cb-url-gateway',
        title: 'Edge & Gateway Layer',
        color: 'blue',
        position: { x: 300, y: 20 },
        dimensions: { width: 400, height: 540 },
      },
      {
        id: 'cb-url-security',
        title: 'Security & Rate Limiting',
        color: 'red',
        position: { x: -100, y: 590 },
        dimensions: { width: 580, height: 170 },
      },
      {
        id: 'cb-url-api',
        title: 'API Endpoints',
        color: 'purple',
        position: { x: -100, y: 780 },
        dimensions: { width: 1100, height: 180 },
      },
      {
        id: 'cb-url-data',
        title: 'Data Models & Cache',
        color: 'green',
        position: { x: -160, y: 980 },
        dimensions: { width: 1300, height: 650 },
      },
      {
        id: 'cb-url-analytics',
        title: 'Analytics Pipeline',
        color: 'orange',
        position: { x: 800, y: 1220 },
        dimensions: { width: 340, height: 900 },
      },
    ],
    documentation: `# System Design: High-Scale URL Shortener (e.g., bit.ly / tinyurl)


This document provides an end-to-end, production-grade architectural guide and study reference for designing a highly scalable, low-latency URL Shortener system. It is designed to handle **10,000+ write requests/second** and **100,000+ read (redirection) requests/second** with under **100ms** latency.

---

## 1. Requirements

### Functional Requirements
1. **URL Shortening**: Given a long URL, the system generates a unique, shorter URL (e.g., \`https://tiny.url/aBc123X\`).
2. **Redirection**: When a user clicks/requests a short URL, the system redirects them to the original long URL (HTTP 302 Found).
3. **Custom Aliases**: Users can optionally specify a custom alias (e.g., \`https://tiny.url/my-custom-name\`).
4. **Link Expiration**: Links should have a default or user-specified expiration time.
5. **Analytics Dashboard**: Users can view detailed metrics (total clicks, geographic location, user-agent, referrers, traffic over time).

### Non-Functional Requirements
1. **Ultra-Low Latency**: Redirection (Read Path) must be extremely fast (< 100ms) to ensure a seamless user experience.
2. **High Availability (HA)**: The redirection service is a critical path and must achieve 99.999% availability.
3. **Scalability**: The system must scale horizontally to handle sudden traffic spikes (viral links).
4. **Uniqueness & Non-guessability**: Short codes must be unique and non-guessable to prevent scraping or security discovery of URLs.

---

## 2. Capacity Estimation & Core Constraints

Let's assume:
- **Write Volume (Shorten)**: 100 million new URLs per month.
- **Read Volume (Redirection)**: 10 billion redirections per month (100:1 read-to-write ratio).

### Traffic Estimates:
- **New URLs / sec (Writes)**:
  $$\\frac{100,000,000}{30 \\times 24 \\times 3600} \\approx 38.5 \\text{ URLs/second}$$
- **Redirections / sec (Reads)**:
  $$\\frac{10,000,000,000}{30 \\times 24 \\times 3600} \\approx 3,858 \\text{ redirections/second}$$

### Storage Estimates:
- Assuming each URL mapping record takes about **500 bytes** (Short code, original URL, user ID, expiration, created timestamp).
- **Total Storage (per month)**:
  $$100,000,000 \\text{ records} \\times 500 \\text{ bytes} = 50 \\text{ GB/month}$$
- **Total Storage (over 5 years)**:
  $$50 \\text{ GB} \\times 12 \\text{ months} \\times 5 \\text{ years} = 3 \\text{ TB}$$

### Memory (Caching) Estimates:
- According to the **80/20 rule** (20% of the hot URLs generate 80% of redirections).
- We want to cache the hot 20% of URLs requested daily.
- **Daily Redirections**:
  $$\\approx 330 \\text{ million clicks/day}$$
- **Memory needed to cache 20% daily URL mappings**:
  $$330,000,000 \\times 0.20 \\times 500 \\text{ bytes} \\approx 33 \\text{ GB}$$

---

## 3. High-Level Architecture & Layer Breakdown

### Layer 1: Edge & Ingress Layer (CDN & Load Balancers)
- **Cloudflare Edge CDN**: Serves as the first point of entry. It caches the redirection lookups near the user's geographic location. It also performs DDoS protection and rate limiting at the edge.
- **Nginx Load Balancer**: Distributes traffic using a Round-Robin or Least Connections algorithm across active API Gateway nodes. Terminates SSL/TLS.

### Layer 2: API & Gateway Layer
- **API Gateway**: Performs request validation, metrics gathering, routing, and applies central rate limits (preventing brute force attempts to guess short codes).
- **Authentication Guard**: Verifies JWT/API keys for requests requesting new shortened URLs.

### Layer 3: The Write Path (Shortening URLs)
When a client requests to shorten a URL:
1. The request goes to \`/api/v1/shorten\`.
2. The **Rate Limiter** checks the IP and API key.
3. The **Unique ID Generator (Counter Service)** allocates a sequential numeric ID.
4. The service encodes the numeric ID into a **Base62 string** (a-z, A-Z, 0-9), resulting in a short code like \`7aKz9X\`.
5. The mapping is persisted to the **PostgreSQL Primary Database**.
6. The mapping is written back to the **Redis Cache** (Cache-Aside strategy).

### Layer 4: The Read Path (Redirection & Caching)
Redirection is the most latency-critical path:
1. A user requests \`GET /:shortCode\`.
2. The system checks **Redis** first.
   - **Cache Hit (90%+)**: The original URL is retrieved instantly, and a redirect response (HTTP 302 Found) is returned.
   - **Cache Miss**: The system queries the **PostgreSQL Read Replica**.
     - If found, the mapping is saved to Redis and the user is redirected.
     - If not found, a 404 is returned.
3. **HTTP Status Code**: We use **HTTP 302 (Found / Temporary Redirect)** instead of HTTP 301 (Moved Permanently). Why?
   - With HTTP 301, browsers cache the redirection locally. Future clicks never reach our server, rendering click analytics impossible.
   - With HTTP 302, every single click is forced to query our servers (or edge CDN), allowing us to record detailed analytics.

### Layer 5: Asynchronous Click Analytics
To ensure redirections are processed under 10ms, we must decouple analytics logging from the redirection path:
1. Upon successful redirection, the Redirect API pushes an analytics event to a **Kafka Topic** (\`click-events\`) and immediately returns the HTTP 302.
2. An asynchronous **Analytics Worker** consumes events from Kafka.
3. The worker parses, geo-locates the IP, checks user-agent, and bulk-inserts the analytics records into **MongoDB** (optimized for write-heavy timeseries data).

---

## 4. Key Design Decisions & Interview Trade-offs

### A. How to Generate Unique IDs?
There are two common approaches to generate short codes:

#### Option 1: Hashing the Original URL (e.g., MD5 + Base62)
- Take MD5 hash of the original URL, which produces a 128-bit hash value.
- Encode it to Base62. We take the first 7 characters (e.g. \`aB9e2K1\`).
- **Trade-off**: Collisions! If two URLs hash to the same first 7 characters, we have a conflict. Resolving collisions requires querying the database on every write, adding latency.

#### Option 2: Unique ID Generator (Counter Service) - *Recommended*
- Maintain a single, atomic counter (e.g. starting at 10,000,000).
- For every new URL, increment the counter and convert the number to Base62.
  - e.g., ID \`568,002,355\` encodes to \`Zk92X\`.
- **To prevent a Single Point of Failure (SPOF)**: We use **Counter Range Batching**. Each API instance connects to a distributed coordinator (like ZooKeeper or Redis) and reserves a batch of 1,000 IDs (e.g., Server A reserves 1,000–1,999, Server B reserves 2,000–2,999).
- Servers increment locally in memory. If a server crashes, those 1,000 IDs are lost, but we prevent any coordination bottlenecks or duplication.

### B. Database Selection
- **Metadata Database (User & URL Mappings)**: Relational DB (**PostgreSQL**) is chosen because URL mappings require strong consistency, transaction safety (preventing duplicate custom aliases), and structured relationships. We use **Read Replicas** to scale read capacity.
- **Analytics Database**: **MongoDB** is preferred because click analytics are write-heavy, non-relational, and grow extremely fast. Document structure allows easy storage of varying user-agent properties and geographic parameters.

### C. Base62 vs. Base64
- Base62 includes \`[a-zA-Z0-9]\` (62 characters).
- Base64 includes \`[a-zA-Z0-9]\` plus \`+\` and \`/\` (or \`-\` and \`_\` in URL-safe Base64).
- Base62 is preferred because it contains no special characters, making it completely safe for URLs and easy to copy-paste without escaping.
- Using length-7 codes in Base62 gives us $62^7 \\approx 3.5 \\text{ trillion}$ unique combinations, which is more than enough for decades of operations.`
  },
];
