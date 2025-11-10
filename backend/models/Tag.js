import { query } from '../config/database.js';

class Tag {
  // 获取热门标签
  static async findPopular(limit = 20) {
    const result = await query(
      `SELECT t.*, COALESCE(ts.post_count, 0) as post_count
       FROM tags t
       LEFT JOIN tag_stats ts ON t.id = ts.id
       ORDER BY post_count DESC, t.name ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(this.formatTag);
  }

  // 根据名称查找标签
  static async findByName(name) {
    const result = await query('SELECT * FROM tags WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  // 格式化标签数据
  static formatTag(tag) {
    return {
      id: tag.id,
      name: tag.name,
      postCount: parseInt(tag.post_count) || 0,
    };
  }
}

export default Tag;

