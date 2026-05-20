# Deployment Guide

How to deploy your generated Architect.io backend to production.

## Prerequisites

- **Node.js** v16+ runtime
- **MongoDB** instance (local, Atlas, or Docker)
- **Optional**: Redis (if using Cache nodes), SMTP service (if using Mail nodes)

## Quick Start

### 1. Export Code

Click **"Export Code"** in the builder to download a ZIP containing your full project.

### 2. Extract & Install

```bash
unzip generated-backend.zip
cd generated-backend
npm install
```

### 3. Environment Variables

Copy the `.env.example` file and configure your values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Optional (if using Cache nodes)
REDIS_URL=redis://localhost:6379

# Optional (if using Mail nodes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Using Docker (Recommended)

If your architecture includes Database, Cache, or Queue nodes, Docker Compose is the easiest way to run everything:

```bash
docker-compose up -d
```

This starts your app along with MongoDB, Redis, and any other services defined in the generated `docker-compose.yml`.

## Platform-Specific Deployment

### Railway / Render
1. Push your generated code to a GitHub repository.
2. Connect the repo to Railway or Render.
3. Set environment variables in the dashboard.
4. Deploy — the platform auto-detects the `npm start` script.

### Heroku
```bash
heroku create my-architect-app
heroku config:set MONGODB_URI=your_uri JWT_SECRET=your_secret
git push heroku main
```

### AWS EC2 / VPS
```bash
# On your server
git clone your-repo.git
cd your-repo
npm install --production
pm2 start app.js --name architect-backend
```

### Vercel (Serverless Functions)
> **Note**: Generated Express.js apps are best suited for long-running server environments. For Vercel, consider wrapping the app with `vercel-node` or using the Serverless API template.

## Health Check

All generated apps include a health check endpoint:

```
GET /health
→ { "status": "ok", "uptime": 12345, "timestamp": "..." }
```

## Post-Deployment Checklist

- [ ] Verify MongoDB connection is active
- [ ] Test authentication endpoints (signup, login, OTP)
- [ ] Check CORS settings for your frontend domain
- [ ] Set `NODE_ENV=production` for production deployments
- [ ] Enable HTTPS (use a reverse proxy like Nginx or Cloudflare)
- [ ] Monitor logs for errors (use `pm2 logs` or platform dashboard)
