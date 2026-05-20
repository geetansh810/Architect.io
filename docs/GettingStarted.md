# Getting Started

Follow these steps to set up and use Architect.io.

## Option 1: Try the Demo (No Setup Required)

Visit the live platform and click **"Try Live Demo"** on the landing page. You'll get:
- A pre-loaded 8-node MERN architecture on a full canvas
- Access to all 16 node types
- Code preview and documentation panels
- No account or installation needed

## Option 2: Local Development Setup

### Prerequisites

- **Node.js** v16+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/geetansh810/Architect.io.git
cd Architect.io

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/architectio
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Optional: Email OTP verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: Geolocation
IPAPI_KEY=your_ip_api_key
```

### 3. Run Development Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 3. Creating Your First Project

1. Open the dashboard after logging in.
2. Click **"New Project"**.
3. Choose **"Blank Canvas"** or select a template.
4. Drag an **Entity Node** from the left sidebar.
5. Drag an **API Node** and connect it to the Entity.
6. Configure fields in the Properties panel (right sidebar).
7. Click **"Preview"** to see generated code.
8. Click **"Export Code"** to download the project ZIP.

## 4. Using Templates

Instead of starting from scratch, you can use one of our 6 production-ready templates:

1. Go to the **Templates** page from the navigation bar.
2. Browse templates by category (Full Stack, SaaS, Real-Time, etc.).
3. Click **"Use Template"** to load it into a new project.
4. Customise the architecture to fit your needs.

## Next Steps

- Read [Visual Builder Basics](VisualBuilderBasics.md) to learn about the canvas.
- Explore [Advanced Features](AdvancedFeatures.md) for Auth, Cache, Queue nodes.
- Check [Code Generation](CodeGeneration.md) to understand what gets exported.
