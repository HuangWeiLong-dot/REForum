import { query } from '../config/database.js';

class Category {
  // 获取所有分类
  static async findAll() {
    const result = await query(
      `SELECT c.*, COALESCE(cs.post_count, 0) as post_count
       FROM categories c
       LEFT JOIN category_stats cs ON c.id = cs.id
       ORDER BY c.id ASC`
    );
    return result.rows.map(this.formatCategory);
  }

  // 根据 ID 查找分类
  static async findById(id) {
    const result = await query(
      `SELECT c.*, COALESCE(cs.post_count, 0) as post_count
       FROM categories c
       LEFT JOIN category_stats cs ON c.id = cs.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] ? this.formatCategory(result.rows[0]) : null;
  }

  // 格式化分类数据
  static formatCategory(category) {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      postCount: parseInt(category.post_count) || 0,
    };
  }
}

export default Category;

