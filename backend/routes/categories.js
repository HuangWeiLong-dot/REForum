import express from 'express';
import CategoryController from '../controllers/categoryController.js';

const router = express.Router();

// 获取所有分类（不需要认证）
router.get('/', CategoryController.getCategories);

export default router;

