# Code Generation & Export

Architect.io is not just a diagramming tool — it's a **full code generator** that produces production-ready backend projects.

## How It Works

1. The canvas state is serialised into an **Architecture JSON** (nodes + edges + properties).
2. Before generation, the graph is run through the **Connection Rectification & Validation** engine — see [Advanced Features](./AdvancedFeatures.md). Blocking errors must be fixed; warnings can be acknowledged in the Validation Report modal.
3. The **Visual Parser** iterates through the validated nodes and edges.
4. Templates are used to generate a layered, production-grade project.

## Generated Output

### Express.js Project
The generator produces a layered enterprise structure, not a flat MVC dump:

- `src/config` — env-driven configuration, MongoDB + Redis bootstrap.
- `src/models` — one Mongoose model per Entity node, with indexes, relationship refs, and clean JSON output.
- `src/validations` — `express-validator` rule sets derived from each entity's field constraints.
- `src/services` — business layer: pagination, filtering, lifecycle hooks, and cache-aware reads.
- `src/controllers` — thin HTTP layer built on `asyncHandler` + `ApiError`.
- `src/routes` — one router per entity, plus a versioned route index and a health endpoint.
- `src/hooks` — lifecycle business-logic hooks for Logic nodes.
- `src/queues` — BullMQ or Kafka consumer workers for Queue nodes.
- `src/jobs` — `node-cron` scheduled jobs for Cron nodes.
- `src/webhooks` — signed webhook receivers for Webhook nodes.
- **Configuration**: `app.js`/`server.js` entry points, `package.json` with all detected dependencies.

### Docker Compose
A `docker-compose.yml` is generated based on your architecture:

```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/app
    depends_on:
      - mongo
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
```

Mongo and Redis services are provisioned automatically whenever the architecture uses a Database, Cache, or (non-Kafka) Queue node; Kafka-backed queues are documented in the generated README instead.

### Environment Template
A `.env.example` file is generated with all required environment variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Architecture README
A `README.md` is auto-generated documenting:
- Architecture overview and component descriptions
- Request lifecycle flow narrative
- Setup and installation instructions
- Environment variable reference
- API endpoint reference

### Mermaid Diagram
A Mermaid flowchart diagram is generated from your edges, showing the complete data flow.

## Exporting

1. Click the **"Preview"** button in the builder to review generated code in a modal.
2. Navigate the file tree in the sidebar to view individual files.
3. Click **"Export Code"** to download a ZIP file containing the full project.
4. Use the **Copy** button to copy individual file contents.

## Structure of Exported Code

```text
/generated-backend
├── /src
│   ├── /config
│   │   └── index.js
│   ├── /models
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── /validations
│   │   ├── productValidation.js
│   │   └── orderValidation.js
│   ├── /services
│   │   ├── productService.js
│   │   └── notificationService.js
│   ├── /controllers
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── /routes
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── index.js
│   ├── /hooks
│   │   └── processPayment.js
│   ├── /queues
│   │   └── analyticsWorker.js
│   ├── /jobs
│   │   └── dailyCleanup.js
│   └── /webhooks
│       └── stripeWebhook.js
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── package.json
├── README.md
└── .env.example
```

## Code Quality

Generated code follows these principles:
- **MVC Architecture**: Models, controllers, routes, and services are separated.
- **Error Handling**: Try/catch blocks with proper HTTP status codes.
- **Validation**: Request validation using field constraints from Entity nodes.
- **Security**: Helmet, CORS, rate limiting, and JWT middleware included by default.
- **Environment Variables**: No hardcoded secrets — all sensitive values use `process.env`.
