import Category from '../models/Category.js';

class CategoryController {
  // 获取所有分类
  static async getCategories(req, res) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json(categories);
    } catch (error) {
      console.error('获取分类列表错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取分类列表失败',
      });
    }
  }
}

export default CategoryController;

