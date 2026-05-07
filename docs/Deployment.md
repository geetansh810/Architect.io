# Deployment Guide

How to deploy your generated Architect.io backend.

## Prerequisites
- MongoDB (Local or Atlas)
- Node.js Environment

## Steps

1. **Export Code**: Download the ZIP from the builder.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
4. **Start Production**:
   ```bash
   npm start
   ```

## Platform Specifics
- **Netlify**: Use the included `netlify.toml` and functions setup.
- **Heroku/Railway**: Standard Node.js deployment.
