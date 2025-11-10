import express from 'express';
import CommentController from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCreateComment,
  validatePostId,
  validateCommentId,
  validatePagination,
} from '../middleware/validation.js';

const router = express.Router();

// 获取帖子评论列表（不需要认证）
router.get('/posts/:postId/comments', validatePostId, validatePagination, CommentController.getComments);

// 发表评论（需要认证）
router.post('/posts/:postId/comments', authenticate, validatePostId, validateCreateComment, CommentController.createComment);

// 回复评论（需要认证）
router.post('/comments/:commentId/reply', authenticate, validateCommentId, validateCreateComment, CommentController.replyComment);

export default router;

