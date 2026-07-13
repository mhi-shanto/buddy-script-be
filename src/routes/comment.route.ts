import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByPost,
  updateComment,
} from '../controllers/comment.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
const postCommentsRouter = Router({ mergeParams: true });

postCommentsRouter.post('/', requireAuth, writeLimiter, createComment);
postCommentsRouter.get('/', requireAuth, getCommentsByPost);

router.use('/posts/:postId/comments', postCommentsRouter);

router.get('/comments/:commentId', requireAuth, getCommentById);
router.patch('/comments/:commentId', requireAuth, writeLimiter, updateComment);
router.delete('/comments/:commentId', requireAuth, writeLimiter, deleteComment);

export default router;
