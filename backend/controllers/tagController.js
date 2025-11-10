import Tag from '../models/Tag.js';

class TagController {
  // 获取热门标签
  static async getTags(req, res) {
    try {
      const { limit = 20 } = req.query;
      const tags = await Tag.findPopular(parseInt(limit));
      return res.status(200).json(tags);
    } catch (error) {
      console.error('获取标签列表错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取标签列表失败',
      });
    }
  }
}

export default TagController;

