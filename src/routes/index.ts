import { Router } from 'express';
import commentRoutes from './comment.route';
import likeRoutes from './like.route';
import postRoutes from './post.route';
import replyRoutes from './reply.route';
import userRoutes from './user.route';
const router = Router();

router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/likes', likeRoutes);
router.use('/', commentRoutes);
router.use('/', replyRoutes);

export default router;
