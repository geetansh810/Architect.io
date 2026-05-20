# Code Generation & Export

Architect.io is not just a diagramming tool — it's a **full code generator** that produces production-ready backend projects.

## How It Works

1. The canvas state is serialised into an **Architecture JSON** (nodes + edges + properties).
2. The **Visual Parser** iterates through the nodes and edges.
3. Templates are used to generate multiple output formats.

## Generated Output

### Express.js Project
For each node in your architecture, the parser generates:

- **Mongoose Models**: One per Entity node with full schema, timestamps, and validation.
- **Express Controllers**: CRUD logic, custom service hooks, pagination, and error handling.
- **Express Routes**: RESTful endpoints with proper HTTP verb mapping.
- **Middlewares**: Auth guards, rate limiters, CORS, file upload handlers.
- **Services**: Business logic files for Logic nodes and background workers.
- **Configuration**: `app.js` entry point, `package.json` with all dependencies.

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

Redis, Kafka, and other services are added automatically when corresponding nodes exist.

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
├── /controllers
│   ├── productController.js
│   ├── orderController.js
│   └── authController.js
├── /models
│   ├── Product.js
│   ├── Order.js
│   └── User.js
├── /routes
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── authRoutes.js
├── /services
│   └── notificationService.js
├── /middlewares
│   ├── auth.js
│   ├── rateLimiter.js
│   └── upload.js
├── app.js
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
