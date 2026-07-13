import { Router } from 'express';
import {
  signup,
  signin,
  refreshTokens,
  updateUser,
  logout,
  getCurrentUser,
  getUserById,
} from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authLimiter, writeLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/refresh-token', authLimiter, refreshTokens);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/me', requireAuth, writeLimiter, updateUser);
router.get('/:userId', requireAuth, getUserById);

export default router;
