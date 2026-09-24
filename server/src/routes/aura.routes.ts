import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { givePoint } from '../services/aura.service';
import { getBudget } from '../services/budget.service';

const router = Router();

router.use(auth);

router.post('/give', async (req: AuthRequest, res) => {
  try {
    const { toUserId, type, reason } = req.body;
    const fromUserId = req.user!.userId;
    const transaction = await givePoint(fromUserId, toUserId, type, reason);
    res.json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/budget', async (req: AuthRequest, res) => {
  try {
    const budget = await getBudget(req.user!.userId);
    res.json({ success: true, data: budget });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
