import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import auraRoutes from './routes/aura.routes';
import rankingRoutes from './routes/ranking.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/aura', auraRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
