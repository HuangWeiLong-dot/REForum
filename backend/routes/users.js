import express from 'express';
import UserController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateUpdateProfile, validateUserId } from '../middleware/validation.js';

const router = express.Router();

// 获取当前用户资料（需要认证）
router.get('/profile', authenticate, UserController.getProfile);

// 更新当前用户资料（需要认证）
router.put('/profile', authenticate, validateUpdateProfile, UserController.updateProfile);

// 获取指定用户公开资料（不需要认证）
router.get('/:userId', validateUserId, UserController.getPublicProfile);

export default router;

