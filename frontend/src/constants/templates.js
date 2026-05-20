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
      { id: 't1-cdn', type: 'cdnNode', position: { x: 500, y: 0 }, data: { provider: 'CloudFront CDN', redirectType: 'HTTPS Redirect', layer: 'gateway' } },
      { id: 't1-lb', type: 'loadBalancerNode', position: { x: 500, y: 150 }, data: { algorithm: 'Round Robin / Sticky', healthPath: 'health', layer: 'gateway' } },
      { id: 't1-gateway', type: 'apiNode', position: { x: 500, y: 300 }, data: { route: 'API Gateway Router', authEnabled: true, layer: 'gateway' } },
      { id: 't1-auth', type: 'authNode', position: { x: 120, y: 480 }, data: { method: 'JWT + OAuth2 / Auth Service', layer: 'application' } },
      { id: 't1-products', type: 'apiNode', position: { x: 380, y: 480 }, data: { route: '/api/v1/products', authEnabled: false, layer: 'application' } },
      { id: 't1-orders', type: 'apiNode', position: { x: 640, y: 480 }, data: { route: '/api/v1/orders', authEnabled: true, layer: 'application' } },
      { id: 't1-payments', type: 'apiNode', position: { x: 900, y: 480 }, data: { route: '/api/v1/payments', authEnabled: true, layer: 'application' } },
      { id: 't1-mongodb', type: 'dbNode', position: { x: 300, y: 680 }, data: { type: 'MongoDB Atlas', layer: 'data' } },
      { id: 't1-redis', type: 'cacheNode', position: { x: 600, y: 680 }, data: { provider: 'Redis Cache Layer', ttl: 3600, layer: 'data' } },
      { id: 't1-s3', type: 'storageNode', position: { x: 900, y: 680 }, data: { provider: 'AWS S3 Product Assets', layer: 'data' } },
      { id: 't1-queue', type: 'queueNode', position: { x: 640, y: 880 }, data: { broker: 'AWS SQS (Order Events)', topic: 'order-events', layer: 'messaging' } },
      { id: 't1-notif', type: 'logicNode', position: { x: 640, y: 1060 }, data: { hook: 'Notification Worker', layer: 'application' } },
    ],
    edges: [
      { id: 'e-cdn-lb', source: 't1-cdn', target: 't1-lb', label: 'HTTPS' },
      { id: 'e-lb-gw', source: 't1-lb', target: 't1-gateway', label: 'Route' },
      { id: 'e-gw-auth', source: 't1-gateway', target: 't1-auth', label: 'Auth' },
      { id: 'e-gw-prod', source: 't1-gateway', target: 't1-products', label: 'REST' },
      { id: 'e-gw-ord', source: 't1-gateway', target: 't1-orders', label: 'REST' },
      { id: 'e-gw-pay', source: 't1-gateway', target: 't1-payments', label: 'REST' },
      { id: 'e-prod-mongo', source: 't1-products', target: 't1-mongodb' },
      { id: 'e-prod-redis', source: 't1-products', target: 't1-redis', label: 'Cache' },
      { id: 'e-prod-s3', source: 't1-products', target: 't1-s3', label: 'Store' },
      { id: 'e-ord-mongo', source: 't1-orders', target: 't1-mongodb' },
      { id: 'e-ord-queue', source: 't1-orders', target: 't1-queue', label: 'Publish' },
      { id: 'e-queue-notif', source: 't1-queue', target: 't1-notif', label: 'Consume' },
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
      { id: 't2-gateway', type: 'apiNode', position: { x: 400, y: 40 }, data: { route: 'API Gateway Tenant Router', authEnabled: true, layer: 'gateway' } },
      { id: 't2-auth', type: 'authNode', position: { x: 150, y: 220 }, data: { method: 'JWT Credentials / Auth Service', layer: 'application' } },
      { id: 't2-tenant', type: 'apiNode', position: { x: 400, y: 220 }, data: { route: '/api/v1/tenants', authEnabled: true, layer: 'application' } },
      { id: 't2-billing', type: 'apiNode', position: { x: 650, y: 220 }, data: { route: '/api/v1/billing', authEnabled: true, layer: 'application' } },
      { id: 't2-app', type: 'apiNode', position: { x: 400, y: 420 }, data: { route: 'Core Application API', authEnabled: true, layer: 'application' } },
      { id: 't2-mongo', type: 'dbNode', position: { x: 200, y: 620 }, data: { type: 'MongoDB (Tenant A Isolation)', layer: 'data' } },
      { id: 't2-mongo2', type: 'dbNode', position: { x: 500, y: 620 }, data: { type: 'MongoDB (Tenant B Isolation)', layer: 'data' } },
      { id: 't2-redis', type: 'cacheNode', position: { x: 800, y: 420 }, data: { provider: 'Redis Session Store', ttl: 1800, layer: 'data' } },
      { id: 't2-stripe', type: 'webhookNode', position: { x: 900, y: 220 }, data: { provider: 'Stripe Subscription API', direction: 'Outgoing', layer: 'client' } },
      { id: 't2-email', type: 'webhookNode', position: { x: 150, y: 420 }, data: { provider: 'SendGrid Email API', direction: 'Outgoing', layer: 'client' } },
    ],
    edges: [
      { id: 'e1', source: 't2-gateway', target: 't2-auth' },
      { id: 'e2', source: 't2-gateway', target: 't2-tenant' },
      { id: 'e3', source: 't2-gateway', target: 't2-billing' },
      { id: 'e4', source: 't2-gateway', target: 't2-app' },
      { id: 'e5', source: 't2-app', target: 't2-mongo' },
      { id: 'e6', source: 't2-app', target: 't2-mongo2' },
      { id: 'e7', source: 't2-auth', target: 't2-redis', label: 'Sessions' },
      { id: 'e8', source: 't2-billing', target: 't2-stripe', label: 'Webhooks' },
      { id: 'e9', source: 't2-auth', target: 't2-email', label: 'OTP / Welcome' },
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
      { id: 't3-lb', type: 'loadBalancerNode', position: { x: 400, y: 40 }, data: { algorithm: 'Sticky Sessions (WS)', healthPath: 'healthz', layer: 'gateway' } },
      { id: 't3-ws1', type: 'apiNode', position: { x: 200, y: 240 }, data: { route: 'WebSocket Server Instance 1', authEnabled: true, layer: 'application' } },
      { id: 't3-ws2', type: 'apiNode', position: { x: 600, y: 240 }, data: { route: 'WebSocket Server Instance 2', authEnabled: true, layer: 'application' } },
      { id: 't3-redis-pubsub', type: 'cacheNode', position: { x: 400, y: 440 }, data: { provider: 'Redis Pub/Sub Message Bus', ttl: 300, layer: 'messaging' } },
      { id: 't3-redis-presence', type: 'cacheNode', position: { x: 700, y: 440 }, data: { provider: 'Redis Presence Tracker', ttl: 600, layer: 'data' } },
      { id: 't3-mongo', type: 'dbNode', position: { x: 100, y: 640 }, data: { type: 'MongoDB Message History', layer: 'data' } },
      { id: 't3-auth', type: 'authNode', position: { x: 400, y: 640 }, data: { method: 'JWT Session Token Verification', layer: 'application' } },
      { id: 't3-notif', type: 'logicNode', position: { x: 700, y: 640 }, data: { hook: 'Push Notification Worker', layer: 'application' } },
    ],
    edges: [
      { id: 'e1', source: 't3-lb', target: 't3-ws1', label: 'WS' },
      { id: 'e2', source: 't3-lb', target: 't3-ws2', label: 'WS' },
      { id: 'e3', source: 't3-ws1', target: 't3-redis-pubsub', label: 'Publish' },
      { id: 'e4', source: 't3-ws2', target: 't3-redis-pubsub', label: 'Subscribe' },
      { id: 'e5', source: 't3-ws1', target: 't3-mongo', label: 'Persist' },
      { id: 'e6', source: 't3-ws1', target: 't3-redis-presence', label: 'Presence' },
      { id: 'e7', source: 't3-ws1', target: 't3-auth', label: 'Verify JWT' },
      { id: 'e8', source: 't3-redis-pubsub', target: 't3-notif', label: 'Offline Push' },
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
      { id: 't4-ingest', type: 'apiNode', position: { x: 400, y: 40 }, data: { route: 'Data Ingestion API Gateway', authEnabled: false, layer: 'gateway' } },
      { id: 't4-kafka', type: 'queueNode', position: { x: 400, y: 220 }, data: { broker: 'Kafka Broker', topic: 'raw-ingested-events', layer: 'messaging' } },
      { id: 't4-transformer', type: 'logicNode', position: { x: 200, y: 420 }, data: { hook: 'Transform & Normalize ETL', layer: 'application' } },
      { id: 't4-validator', type: 'logicNode', position: { x: 600, y: 420 }, data: { hook: 'Schema Validation Worker', layer: 'application' } },
      { id: 't4-kafka2', type: 'queueNode', position: { x: 400, y: 620 }, data: { broker: 'Kafka Broker', topic: 'processed-events', layer: 'messaging' } },
      { id: 't4-mongo', type: 'dbNode', position: { x: 150, y: 820 }, data: { type: 'MongoDB Raw Events Store', layer: 'data' } },
      { id: 't4-pg', type: 'dbNode', position: { x: 650, y: 820 }, data: { type: 'PostgreSQL Analytics DW', layer: 'data' } },
      { id: 't4-redis', type: 'cacheNode', position: { x: 400, y: 820 }, data: { provider: 'Redis Real-Time Metrics', ttl: 60, layer: 'data' } },
      { id: 't4-analytics', type: 'apiNode', position: { x: 800, y: 220 }, data: { route: '/api/v1/analytics-query', authEnabled: true, layer: 'application' } },
    ],
    edges: [
      { id: 'e1', source: 't4-ingest', target: 't4-kafka' },
      { id: 'e2', source: 't4-kafka', target: 't4-transformer' },
      { id: 'e3', source: 't4-kafka', target: 't4-validator' },
      { id: 'e4', source: 't4-transformer', target: 't4-kafka2' },
      { id: 'e5', source: 't4-validator', target: 't4-kafka2' },
      { id: 'e6', source: 't4-kafka2', target: 't4-mongo' },
      { id: 'e7', source: 't4-kafka2', target: 't4-pg' },
      { id: 'e8', source: 't4-kafka2', target: 't4-redis' },
      { id: 'e9', source: 't4-analytics', target: 't4-pg' },
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
      { id: 't5-gw', type: 'apiNode', position: { x: 400, y: 40 }, data: { route: 'AWS API Gateway Routing', authEnabled: true, layer: 'gateway' } },
      { id: 't5-auth-lambda', type: 'logicNode', position: { x: 150, y: 240 }, data: { hook: 'Authorizer Lambda Function', layer: 'application' } },
      { id: 't5-api-lambda', type: 'logicNode', position: { x: 500, y: 240 }, data: { hook: 'REST API Handler Lambda', layer: 'application' } },
      { id: 't5-dynamo', type: 'dbNode', position: { x: 300, y: 460 }, data: { type: 'Amazon DynamoDB Store', layer: 'data' } },
      { id: 't5-s3', type: 'storageNode', position: { x: 700, y: 460 }, data: { provider: 'AWS S3 Assets Bucket', layer: 'data' } },
      { id: 't5-cloudwatch', type: 'middlewareNode', position: { x: 900, y: 240 }, data: { middleware: 'CloudWatch Observability Logging', layer: 'observability' } },
      { id: 't5-sqs', type: 'queueNode', position: { x: 500, y: 660 }, data: { broker: 'AWS SQS Async Jobs Queue', topic: 'job-queue', layer: 'messaging' } },
    ],
    edges: [
      { id: 'e1', source: 't5-gw', target: 't5-auth-lambda', label: 'Authorize' },
      { id: 'e2', source: 't5-gw', target: 't5-api-lambda', label: 'Invoke' },
      { id: 'e3', source: 't5-api-lambda', target: 't5-dynamo', label: 'CRUD' },
      { id: 'e4', source: 't5-api-lambda', target: 't5-s3', label: 'Upload' },
      { id: 'e5', source: 't5-api-lambda', target: 't5-cloudwatch', label: 'Logs' },
      { id: 'e6', source: 't5-api-lambda', target: 't5-sqs', label: 'Enqueue' },
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
      { id: 't4-cdn', type: 'cdnNode', position: { x: 450, y: 50 }, data: { provider: 'Cloudflare Edge CDN', redirectType: 'HTTP 302 (Found)', regions: 'Global Edge Network', layer: 'gateway' } },
      { id: 't4-lb', type: 'loadBalancerNode', position: { x: 450, y: 170 }, data: { algorithm: 'Round Robin', healthPath: '/health', intervalSec: 10, sslTermination: true, layer: 'gateway' } },
      { id: 't4-gateway', type: 'apiNode', position: { x: 450, y: 290 }, data: { route: 'API Gateway Router', authEnabled: true, layer: 'gateway' } },
      { id: 't4-limiter', type: 'middlewareNode', position: { x: 200, y: 410 }, data: { middlewareType: 'Rate Limiter', config: { windowMs: 60000, maxRequests: 30 }, layer: 'gateway' } },
      { id: 't4-auth', type: 'authNode', position: { x: 700, y: 410 }, data: { method: 'JWT', secret: 'jwt-auth-secret-key-prod', expiry: '24h', layer: 'application' } },
      { id: 't4-api-shorten', type: 'apiNode', position: { x: 200, y: 530 }, data: { route: '/api/v1/shorten', authEnabled: true, layer: 'application' } },
      { id: 't4-api-redirect', type: 'apiNode', position: { x: 450, y: 530 }, data: { route: '/:shortCode', authEnabled: false, layer: 'application' } },
      { id: 't4-api-analytics', type: 'apiNode', position: { x: 700, y: 530 }, data: { route: '/api/v1/analytics/:shortCode', authEnabled: true, layer: 'application' } },
      { id: 't4-entity-user', type: 'entityNode', position: { x: 100, y: 650 }, data: { name: 'User', fields: [{ name: 'email', type: 'string', required: true }, { name: 'passwordHash', type: 'string', required: true }, { name: 'apiKey', type: 'string', required: true }], layer: 'data' } },
      { id: 't4-entity-url', type: 'entityNode', position: { x: 400, y: 650 }, data: { name: 'UrlMapping', fields: [{ name: 'shortCode', type: 'string', required: true }, { name: 'originalUrl', type: 'string', required: true }, { name: 'userId', type: 'string', required: false }, { name: 'clicks', type: 'number', required: false }], layer: 'data' } },
      { id: 't4-entity-clicks', type: 'entityNode', position: { x: 700, y: 650 }, data: { name: 'ClickAnalytics', fields: [{ name: 'shortCode', type: 'string', required: true }, { name: 'referrer', type: 'string', required: false }, { name: 'userAgent', type: 'string', required: false }, { name: 'ipAddress', type: 'string', required: false }, { name: 'country', type: 'string', required: false }, { name: 'clickedAt', type: 'date', required: true }], layer: 'data' } },
      { id: 't4-id-gen', type: 'counterServiceNode', position: { x: 150, y: 800 }, data: { strategy: 'Counter + Base62', encoding: 'Base62', batchSize: 1000, codeLength: 7, layer: 'infrastructure' } },
      { id: 't4-redis', type: 'cacheNode', position: { x: 450, y: 800 }, data: { provider: 'Redis', evictionPolicy: 'LRU', ttl: 86400, strategy: 'Cache-Aside', layer: 'data' } },
      { id: 't4-queue', type: 'queueNode', position: { x: 750, y: 800 }, data: { broker: 'Kafka', topic: 'click-events', consumerGroup: 'analytics-consumers', partitions: 3, layer: 'messaging' } },
      { id: 't4-db-primary', type: 'dbNode', position: { x: 250, y: 950 }, data: { type: 'postgresql', dbName: 'shortener_primary', uri: 'postgresql://localhost:5432/shortener', layer: 'data' } },
      { id: 't4-db-replica', type: 'replicaNode', position: { x: 450, y: 950 }, data: { replicaCount: 2, strategy: 'Read/Write Split', lagToleranceMs: 100, layer: 'data' } },
      { id: 't4-worker', type: 'logicNode', position: { x: 750, y: 1100 }, data: { name: 'Analytics Consumer Worker', hook: 'after-create', layer: 'application' } },
      { id: 't4-db-analytics', type: 'dbNode', position: { x: 750, y: 1250 }, data: { type: 'mongodb', dbName: 'analytics_db', uri: 'mongodb://localhost:27017/analytics', layer: 'data' } },
    ],
    edges: [
      { id: 'e-cdn-lb', source: 't4-cdn', target: 't4-lb', label: 'HTTPS Routing', animated: true },
      { id: 'e-lb-gw', source: 't4-lb', target: 't4-gateway', label: 'Route Connection', animated: true },
      { id: 'e-gw-limit', source: 't4-gateway', target: 't4-limiter', label: 'Rate Limit Filter', animated: true },
      { id: 'e-gw-auth', source: 't4-gateway', target: 't4-auth', label: 'Auth Guard', animated: true },
      { id: 'e-gw-shorten', source: 't4-gateway', target: 't4-api-shorten', label: 'Shorten Endpoint', animated: true },
      { id: 'e-gw-redirect', source: 't4-gateway', target: 't4-api-redirect', label: 'Redirect Endpoint', animated: true },
      { id: 'e-gw-analytics', source: 't4-gateway', target: 't4-api-analytics', label: 'Admin Analytics', animated: true },
      { id: 'e-shorten-entity', source: 't4-api-shorten', target: 't4-entity-url', label: 'Exposes CRUD', animated: true },
      { id: 'e-redirect-entity', source: 't4-api-redirect', target: 't4-entity-url', label: 'Exposes CRUD', animated: true },
      { id: 'e-analytics-entity', source: 't4-api-analytics', target: 't4-entity-clicks', label: 'Exposes CRUD', animated: true },
      { id: 'e-url-idgen', source: 't4-entity-url', target: 't4-id-gen', label: 'Fetch Unique Key', animated: true },
      { id: 'e-url-cache', source: 't4-entity-url', target: 't4-redis', label: 'Cache Write-Through', animated: true },
      { id: 'e-url-db', source: 't4-entity-url', target: 't4-db-primary', label: 'Save Mapping', animated: true },
      { id: 'e-redirect-cache', source: 't4-api-redirect', target: 't4-redis', label: 'Cache Lookups', animated: true },
      { id: 'e-redirect-queue', source: 't4-api-redirect', target: 't4-queue', label: 'Queue Click Event', animated: true },
      { id: 'e-queue-worker', source: 't4-queue', target: 't4-worker', label: 'Consume Event', animated: true },
      { id: 'e-worker-db', source: 't4-worker', target: 't4-db-analytics', label: 'Persist Click', animated: true },
      { id: 'e-db-replica', source: 't4-db-primary', target: 't4-db-replica', label: 'Replicate', animated: true },
      { id: 'e-analytics-db', source: 't4-api-analytics', target: 't4-db-analytics', label: 'Query Clicks', animated: true }
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
