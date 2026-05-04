import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db.js';
import authRouter from './routes/auth.js';
import workflowsRouter from './routes/workflows.js';
import generateRouter from './routes/generate.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const getRouter = (r) => (r && r.default) ? r.default : r;

app.use('/api/auth', getRouter(authRouter));
app.use('/api/workflows', getRouter(workflowsRouter));
app.use('/api/generate', getRouter(generateRouter));
app.use('/api/admin', getRouter(adminRouter));

app.get('/', (req, res) => {
  res.send('🚀 Architect.io Backend is running smoothly!');
});

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Platform backend running on http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

startServer();

export default app;
