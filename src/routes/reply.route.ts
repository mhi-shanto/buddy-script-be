import { Router } from 'express';
import {
  createReply,
  deleteReply,
  getRepliesByComment,
  getReplyById,
  updateReply,
} from '../controllers/reply.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
const commentRepliesRouter = Router({ mergeParams: true });

commentRepliesRouter.post('/', requireAuth, writeLimiter, createReply);
commentRepliesRouter.get('/', requireAuth, getRepliesByComment);

router.use('/comments/:commentId/replies', commentRepliesRouter);

router.get('/replies/:replyId', requireAuth, getReplyById);
router.patch('/replies/:replyId', requireAuth, writeLimiter, updateReply);
router.delete('/replies/:replyId', requireAuth, writeLimiter, deleteReply);

export default router;
