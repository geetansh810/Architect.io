# Code Generation & Export

Architect.io is not just a diagramming tool; it's a code generator.

## How it Works
1. The canvas state is serialized into an **Architecture JSON**.
2. Our **Visual Parser** iterates through the nodes and edges.
3. Templates are used to generate:
   - **Mongoose Models**: One per Entity.
   - **Express Controllers**: CRUD logic and custom service hooks.
   - **Express Routes**: REST endpoints.
   - **Middlewares**: Auth, Storage, and custom logic.
   - **Configuration**: `.env`, `package.json`, and `app.js`.

## Exporting
Click the **"Export Code"** button in the builder to download a ZIP file containing the full project structure.

## Structure of Exported Code
```text
/generated-backend
├── /controllers
├── /models
├── /routes
├── /services
├── /middlewares
├── app.js
├── package.json
└── .env.example
```
