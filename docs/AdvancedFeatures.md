# Advanced Features

Architect.io supports complex backend patterns and production infrastructure through specialised nodes.

## Auth Node

- Implements **JWT-based authentication** with configurable secret and expiry.
- Supports **6-digit OTP email verification** with attempt limiting.
- Generates `auth.js` middleware for route protection.
- Includes sign-up, login, profile management, and token refresh.
- Connect to any API node to protect its routes.

## Storage Node

- Handles **file uploads** with configurable maximum sizes and allowed file types.
- Generates middleware for **AWS S3** or **Local filesystem** storage.
- Auto-creates upload endpoints with multipart/form-data support.

## Cron Node

- Schedules **background tasks** using standard cron syntax (e.g., `0 0 * * *`).
- Generates `node-cron` based job runners.
- Triggers logic hooks, cleanup tasks, report generation, or automated notifications.

## Webhook Node

- **External event integration** with services like Stripe, GitHub, and SendGrid.
- Generates dedicated webhook endpoints with payload parsing.
- Supports both **incoming** (receive events) and **outgoing** (call external APIs) configurations.
- Includes request signature validation for security.

## Mail Node

- Automated **transactional emails** via SMTP or SendGrid.
- Connect to lifecycle hooks for welcome emails, OTP delivery, and order confirmations.
- Generates a reusable email service with template support.

## Middleware Node

- Inject custom middleware into any API route group.
- Pre-configured options: **Rate Limiter**, **CORS**, **Request Logger**, **Custom**.
- Configurable window size, max requests, and allowed origins.

## CDN Node

- Configure **edge caching** providers (CloudFront, Cloudflare).
- Set redirect types (HTTP/HTTPS) and caching rules.
- Connects to load balancers and API gateways.

## Cache Node

- **Redis** or **Memcached** configuration with:
  - TTL (Time-to-Live) settings
  - Eviction policies (LRU, LFU, Random)
  - Cache strategies (Cache-Aside, Write-Through, Write-Behind)
- Use for session storage, API response caching, or real-time metrics.

## Queue Node

- Message broker configuration for **Kafka**, **AWS SQS**, or **RabbitMQ**.
- Settings include: topic name, consumer group, partition count, dead-letter queue.
- Connects to Logic nodes for event-driven processing.

## Load Balancer Node

- Algorithms: **Round Robin**, **Least Connections**, **Sticky Sessions**.
- Configurable health check path and interval.
- SSL/TLS termination toggle.

## Counter Service Node

- **Atomic ID generation** for unique short codes or sequential IDs.
- Encoding: Base62 (a-z, A-Z, 0-9) for URL-safe output.
- Batch allocation to prevent single point of failure.
- Configurable code length and batch size.

## Replica Node

- **Read/Write splitting** for database scaling.
- Configurable replica count and replication strategy.
- Lag tolerance settings for eventual consistency handling.

## Database Node

- Connect to external databases: **MongoDB**, **PostgreSQL**, **DynamoDB**.
- Separate from Entity nodes — used for visualising database instances in system design architectures.
- Configurable database name and connection URI.

## Logic Node

- Attach custom business logic at lifecycle events.
- Hooks: `before-create`, `after-create`, `before-update`, `after-delete`.
- Generates service files with clean separation from controllers.
- Perfect for: notification workers, data transformers, validators.

## Frontend App Node

- Model client-side web, mobile, and desktop applications visually.
- Framework presets supported: **React**, **Next.js**, **Vue**, **Angular**, **React Native**, and **Expo**.
- Displays technological badges and allows visual description annotations.
- Perfect for mapping entry points and outlining which user interfaces request backend API endpoints.

## Zone Group Node

- Visual boundary containers acting as group zones or swimlanes on the canvas.
- Dynamically assigns container header icons based on titles (e.g., Client, Edge, Service/Microservice, Data/Database, External/Cloud).
- Visual color palette choices: blue, green, purple, orange, red, and slate.
- Used to logically group, isolate, or categorize multi-tier services or multi-node databases together.

## Sticky Note Node

- Desktop post-it style visual blocks designed for notes, annotations, and system descriptions.
- Supports five high-contrast color themes: yellow, pink, blue, green, and purple.
- Double-click inline text editing.
- Can optionally connect to regular nodes to document architectural details.

## Text Label Node

- Frameless, lightweight text blocks for canvas annotation.
- Supports custom font sizing, bold weight formatting, and custom hex text colors.
- Perfect for canvas section headings or highlighting canvas flow titles.

## Smart Custom Edges

- Dynamic connections with protocol-specific color styling and custom protocol badges.
- Preconfigured protocols: **REST**, **gRPC**, **WebSocket**, **pub/sub**, **DB**, **Redis**, **FK** (Foreign Key), **HTTP**, and **Internal**.
- Real-time animated flow dots travel along the edge path to indicate active routing.
- Asynchronous lines are rendered as dashed edges.
- Interactive hover transitions scale connection handles and glow edge paths.

## Architecture Intelligence Analyzer

- Real-time rule-based static analyzer sidebar calculating an architectural Health Score out of 100.
- Checks canvas configurations and generates reports on:
  - **Security**: Warns if API routes are not auth-protected or if no auth guard node exists in the architecture.
  - **Warnings**: Flags bottlenecks such as executing long transactional SMTP mail/webhook requests synchronously rather than utilizing async message queues.
  - **Insights & Optimizations**: Suggests performance improvements such as adding Redis cache before database nodes or replicas to handle reads.
