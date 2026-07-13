import { Router } from 'express';
import {
  createPost,
  deletePost,
  getPostById,
  getPostsByAuthor,
  getPublicPosts,
  updatePost,
} from '../controllers/post.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { writeLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post('/', requireAuth, writeLimiter, createPost);
router.get('/', requireAuth, getPublicPosts);
router.get('/author/:authorId', requireAuth, getPostsByAuthor);
router.get('/:postId', requireAuth, getPostById);
router.patch('/:postId', requireAuth, writeLimiter, updatePost);
router.delete('/:postId', requireAuth, writeLimiter, deletePost);

export default router;
