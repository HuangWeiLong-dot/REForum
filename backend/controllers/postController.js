import Post from '../models/Post.js';
import Category from '../models/Category.js';

class PostController {
  // 获取帖子列表
  static async getPosts(req, res) {
    try {
      const { page = 1, limit = 20, sort = 'time', category, tag } = req.query;

      const result = await Post.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        category: category ? parseInt(category) : undefined,
        tag,
      });

      // 格式化帖子数据
      const formattedPosts = result.data.map(post => Post.formatPostListItem(post));

      return res.status(200).json({
        data: formattedPosts,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('获取帖子列表错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取帖子列表失败',
      });
    }
  }

  // 获取帖子详情
  static async getPostById(req, res) {
    try {
      const { postId } = req.params;
      const post = await Post.findById(parseInt(postId));

      if (!post) {
        return res.status(404).json({
          error: 'POST_NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 增加浏览量
      await Post.incrementViewCount(parseInt(postId));

      // 获取标签
      const { query } = await import('../config/database.js');
      const tagsResult = await query(
        `SELECT t.id, t.name 
         FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [postId]
      );

      const formattedPost = Post.formatPostDetail({
        ...post,
        tags: tagsResult.rows,
      });

      return res.status(200).json(formattedPost);
    } catch (error) {
      console.error('获取帖子详情错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取帖子详情失败',
      });
    }
  }

  // 创建帖子
  static async createPost(req, res) {
    try {
      const userId = req.userId;
      const { title, content, categoryId, tags } = req.body;

      // 验证分类是否存在
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          error: 'CATEGORY_NOT_FOUND',
          message: '分类不存在',
        });
      }

      // 生成摘要
      const excerpt = Post.generateExcerpt(content);

      // 创建帖子
      const post = await Post.create({
        title,
        content,
        excerpt,
        authorId: userId,
        categoryId,
        tags: tags || [],
      });

      // 获取标签
      const { query } = await import('../config/database.js');
      const tagsResult = await query(
        `SELECT t.id, t.name 
         FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [post.id]
      );

      const formattedPost = Post.formatPostDetail({
        ...post,
        tags: tagsResult.rows,
      });

      return res.status(201).json(formattedPost);
    } catch (error) {
      console.error('创建帖子错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '创建帖子失败',
      });
    }
  }

  // 更新帖子
  static async updatePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      const { title, content, categoryId, tags } = req.body;

      // 检查帖子是否存在
      const post = await Post.findById(parseInt(postId));
      if (!post) {
        return res.status(404).json({
          error: 'POST_NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 检查权限（只有作者可以编辑）
      if (post.author_id !== userId) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: '无权限编辑此帖子',
        });
      }

      // 如果更新了分类，验证分类是否存在
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(400).json({
            error: 'CATEGORY_NOT_FOUND',
            message: '分类不存在',
          });
        }
      }

      // 更新帖子
      const updatedPost = await Post.update(parseInt(postId), {
        title,
        content,
        categoryId,
        tags,
      });

      // 获取标签
      const { query } = await import('../config/database.js');
      const tagsResult = await query(
        `SELECT t.id, t.name 
         FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [postId]
      );

      const formattedPost = Post.formatPostDetail({
        ...updatedPost,
        tags: tagsResult.rows,
      });

      return res.status(200).json(formattedPost);
    } catch (error) {
      console.error('更新帖子错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '更新帖子失败',
      });
    }
  }
}

export default PostController;

