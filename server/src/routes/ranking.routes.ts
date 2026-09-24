import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getRanking } from '../services/ranking.service';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { year, section, sort } = req.query;
    const filters = {
      year: year ? parseInt(year as string, 10) : undefined,
      section: section as string | undefined,
      sortOrder: (sort as 'asc' | 'desc') || 'desc',
    };
    const ranking = await getRanking(filters);
    res.json({ success: true, data: ranking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
