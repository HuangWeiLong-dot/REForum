import express from 'express';
import TagController from '../controllers/tagController.js';

const router = express.Router();

// 获取热门标签（不需要认证）
router.get('/', TagController.getTags);

export default router;

