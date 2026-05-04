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

app.use('/api/auth', authRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/admin', adminRouter);

// Connect to MongoDB, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Platform backend running on http://localhost:${PORT}`);
  });
});
