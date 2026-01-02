import express from 'express';
import UploadController from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 上传单个文件（需要认证）
router.post(
  '/file',
  authenticate,
  UploadController.uploadSingle,
  UploadController.handleUpload
);

// 上传多个文件（需要认证）
router.post(
  '/files',
  authenticate,
  UploadController.uploadMultiple,
  UploadController.handleMultipleUpload
);

export default router;

