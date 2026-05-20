# Architecture Templates

Architect.io includes **6 production-ready architecture templates** that you can use as starting points for your projects.

## Using Templates

1. Navigate to the **Templates** page from the navigation bar.
2. Browse by category or search by keyword.
3. Click **"View Details"** to preview the architecture.
4. Click **"Use Template"** to load it into a new project.
5. Customise the architecture to match your requirements.

## Available Templates

### 1. E-Commerce Platform

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Nodes       | 12                                                   |
| Complexity  | Advanced                                             |
| Category    | Full Stack                                           |
| Tags        | MERN, Microservices, Queue, Cache                    |

A complete multi-service e-commerce backend with:
- CloudFront CDN → Load Balancer → API Gateway
- Auth, Products, Orders, and Payments API services
- MongoDB, Redis Cache, and S3 Storage
- SQS Order Events queue with Notification Worker

---

### 2. SaaS Multi-Tenant App

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Nodes       | 10                                                   |
| Complexity  | Advanced                                             |
| Category    | SaaS                                                 |
| Tags        | SaaS, Multi-tenant, Auth, Subscriptions              |

Multi-tenant architecture with:
- API Gateway with tenant routing
- Auth, Tenant Management, and Billing services
- Per-tenant MongoDB isolation (Tenant A / Tenant B)
- Redis session store
- Stripe Webhook integration and SendGrid email

---

### 3. Real-Time Chat System

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Nodes       | 8                                                    |
| Complexity  | Intermediate                                         |
| Category    | Real-Time                                            |
| Tags        | WebSocket, Redis Pub/Sub, Real-Time, MongoDB         |

WebSocket-powered chat with:
- Sticky session load balancer
- Dual WebSocket server instances
- Redis Pub/Sub for horizontal scaling
- Redis Presence Tracker
- MongoDB Message History
- Push Notification Worker

---

### 4. Data Pipeline / ETL

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Nodes       | 9                                                    |
| Complexity  | Advanced                                             |
| Category    | Data Engineering                                     |
| Tags        | ETL, Kafka, Data Warehouse, Analytics                |

Event-driven ETL pipeline with:
- Data Ingestion API Gateway
- Dual Kafka brokers (raw + processed events)
- Transform & Normalise ETL worker
- Schema Validation Worker
- MongoDB raw events + PostgreSQL Analytics DW
- Redis real-time metrics + Analytics API

---

### 5. Serverless REST API

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Nodes       | 7                                                    |
| Complexity  | Intermediate                                         |
| Category    | Serverless                                           |
| Tags        | Serverless, Lambda, DynamoDB, AWS                    |

AWS Lambda-based API with:
- API Gateway with custom authoriser
- Authoriser Lambda + REST Handler Lambda
- DynamoDB data store + S3 assets
- CloudWatch observability logging
- SQS async job queue

---

### 6. High-Scale URL Shortener (System Design)

| Property    | Value                                                |
| ----------- | ---------------------------------------------------- |
| Nodes       | 18                                                   |
| Complexity  | Advanced                                             |
| Category    | Full Stack                                           |
| Tags        | System Design, Redis, Kafka, ID Generator, Scalable  |

A comprehensive system design template with:
- Cloudflare CDN → Load Balancer → API Gateway → Rate Limiter
- Shorten, Redirect, and Analytics API endpoints
- User, UrlMapping, and ClickAnalytics entity models
- Counter Service with Base62 encoding and batch allocation
- Redis Cache-Aside for ultra-low latency redirects
- Kafka click-events pipeline with Analytics Worker
- PostgreSQL Primary + Read Replicas
- MongoDB Analytics Database
- **Full system design study documentation** covering capacity estimation, design decisions, and interview trade-offs

## Template Features

All templates include:
- ✅ Pre-configured nodes with realistic properties
- ✅ Connected edges with protocol labels
- ✅ Proper layer assignments (Gateway, Application, Data, Messaging)
- ✅ Instant code preview
- ✅ Template documentation (URL Shortener includes full study guide)
