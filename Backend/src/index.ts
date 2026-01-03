import { prisma } from "./lib/prisma.js";
import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

process.on('SIGTERM', () => {
  server.close(() => {
    prisma.$disconnect();
  });
});
