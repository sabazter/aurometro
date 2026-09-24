import { Router } from 'express';
import { register, login, verifyEmail } from '../services/auth.service';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const data = req.body;
    const user = await register(data);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await verifyEmail(token);
    res.json({ success: true, data: { message: 'Email verificado con éxito' } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
