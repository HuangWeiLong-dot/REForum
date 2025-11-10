import express from 'express';
import PostController from '../controllers/postController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCreatePost,
  validateUpdatePost,
  validatePostId,
  validatePagination,
} from '../middleware/validation.js';

const router = express.Router();

// 获取帖子列表（不需要认证）
router.get('/', validatePagination, PostController.getPosts);

// 获取帖子详情（不需要认证）
router.get('/:postId', validatePostId, PostController.getPostById);

// 创建帖子（需要认证）
router.post('/', authenticate, validateCreatePost, PostController.createPost);

// 更新帖子（需要认证）
router.put('/:postId', authenticate, validatePostId, validateUpdatePost, PostController.updatePost);

export default router;

