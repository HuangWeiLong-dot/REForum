import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// 用户注册
router.post('/register', validateRegister, AuthController.register);

// 用户登录
router.post('/login', validateLogin, AuthController.login);

// 用户登出
router.post('/logout', authenticate, AuthController.logout);

export default router;

