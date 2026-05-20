# Visual Builder Basics

The Architect.io canvas is where you design your backend architecture using a drag-and-drop node-based interface.

## The Canvas

- **Powered by React Flow**: High-performance canvas with pan, zoom, minimap, and controls.
- **Dark/Light Mode**: Adapts to your system theme preference.
- **Background**: Dotted grid pattern for visual alignment.

## Nodes

Nodes represent components of your backend architecture. Architect.io provides **16 specialised node types**:

### Core Nodes
| Node          | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| Entity Node   | Database collections with schema definition            |
| API Node      | REST endpoints with CRUD controller generation         |
| Auth Node     | JWT authentication with OTP verification               |
| Database Node | External database connections (MongoDB, PostgreSQL)    |

### Infrastructure Nodes
| Node               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| CDN Node           | Edge caching providers and HTTPS redirect config       |
| Load Balancer Node | Round Robin, Sticky Sessions, health check paths       |
| Cache Node         | Redis/Memcached with TTL and eviction policy           |
| Queue Node         | Kafka, SQS, RabbitMQ message broker configuration      |
| Counter Service    | Atomic ID generation with Base62 encoding              |
| Replica Node       | Read/write splitting with configurable replica count   |

### Logic & Integration Nodes
| Node            | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| Logic Node      | Custom business logic and lifecycle hooks            |
| Middleware Node | Rate limiting, CORS, request logging                 |
| Storage Node    | File uploads to AWS S3 or local storage              |
| Cron Node       | Scheduled background tasks using cron syntax         |
| Webhook Node    | External service integrations (Stripe, GitHub)       |
| Mail Node       | Transactional emails via SMTP or SendGrid            |

## Adding Nodes

1. Open the **Node Sidebar** (left panel).
2. Drag any node type onto the canvas.
3. The node appears with a default configuration.
4. Click the node to select it and open the **Properties Panel** (right panel).

## Edges (Connections)

- Drag from the **output port** (bottom) of one node to the **input port** (top) of another.
- Edges represent data flow, API calls, or logical connections.
- Edge labels show the protocol (REST, AMQP, SQL, WS, etc.) when applicable.
- Edges are animated with directional arrow markers.

## Entity Nodes

Entity nodes are the foundation of your data model:

- Define fields like `name`, `email`, `price`.
- Supported data types: **String, Number, Boolean, Date, ObjectId**.
- Mark fields as **required**, **unique**, or set **default values**.
- Fields are displayed visually on the node card.

## Relationship Modelling

- Drag an edge from one Entity to another to create a relationship.
- Support for **1:1**, **1:N**, and **N:M** relationships.
- Automatically handles foreign keys and population logic in generated code.
- Cascade deletion is handled through edge connections.

## Canvas Layers

The canvas supports a **six-zone swimlane system** for organising nodes by architectural layer:

1. **Client** — Frontend and CDN nodes
2. **Gateway** — Load balancers and API gateways
3. **Application** — Business logic, auth, and API nodes
4. **Data** — Databases, cache, storage, and replicas
5. **Messaging** — Queues and pub/sub brokers
6. **Observability** — Monitoring and logging

New nodes **snap to their default layer** zone when dropped.

## Auto Layout

Click the **Auto Layout** button to automatically arrange nodes using the Dagre top-to-bottom algorithm. Nodes are positioned according to their layer zones.

## Canvas Controls

- **Zoom**: Scroll or use +/- buttons
- **Pan**: Click and drag on the canvas background
- **MiniMap**: Overview of the entire canvas (bottom-right)
- **Controls**: Fit view, zoom in/out, lock (bottom-left)
- **Delete**: Select a node and press `Delete` or `Backspace`

## Properties Panel

Select any node to configure its properties in the right sidebar:

- **Entity**: Field names, types, validation rules
- **API**: Route paths, HTTP methods, auth toggle
- **Auth**: JWT secret, expiry, OTP settings
- **Cache**: Provider, TTL, eviction policy, cache strategy
- **Queue**: Broker type, topic, consumer group, partitions
- **Load Balancer**: Algorithm, health check path, SSL termination
- And more for every node type.
