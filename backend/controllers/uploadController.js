import upload from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  // 处理单个文件上传
  static uploadSingle = upload.single('file');

  // 处理文件上传响应
  static handleUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'NO_FILE',
          message: '请选择要上传的文件',
        });
      }

      // 返回文件URL（相对于uploads目录）
      const fileUrl = `/uploads/${req.file.filename}`;

      return res.status(200).json({
        message: '文件上传成功',
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      });
    } catch (error) {
      console.error('文件上传错误:', error);
      return res.status(500).json({
        error: 'UPLOAD_ERROR',
        message: error.message || '文件上传失败',
      });
    }
  }

  // 处理多个文件上传
  static uploadMultiple = upload.array('files', 1); // 最多1个文件

  // 处理多文件上传响应
  static handleMultipleUpload(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'NO_FILES',
          message: '请选择要上传的文件',
        });
      }

      const files = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        size: file.size,
      }));

      return res.status(200).json({
        message: '文件上传成功',
        files: files,
      });
    } catch (error) {
      console.error('文件上传错误:', error);
      return res.status(500).json({
        error: 'UPLOAD_ERROR',
        message: error.message || '文件上传失败',
      });
    }
  }
}

export default UploadController;

