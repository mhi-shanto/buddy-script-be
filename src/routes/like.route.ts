import { Router } from 'express';
import {
  getLikeStatus,
  getTargetLikes,
  likeTarget,
  unlikeTarget,
} from '../controllers/like.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/', requireAuth, writeLimiter, likeTarget);
router.get('/status/:targetType/:targetId', requireAuth, getLikeStatus);
router.get('/:targetType/:targetId', requireAuth, getTargetLikes);
router.delete('/:targetType/:targetId', requireAuth, writeLimiter, unlikeTarget);

export default router;
