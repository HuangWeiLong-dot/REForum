import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

class CommentController {
  // 获取帖子评论列表
  static async getComments(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1 } = req.query;

      // 验证帖子是否存在
      const post = await Post.findById(parseInt(postId));
      if (!post) {
        return res.status(404).json({
          error: 'POST_NOT_FOUND',
          message: '帖子不存在',
        });
      }

      const comments = await Comment.findByPostId(parseInt(postId), {
        page: parseInt(page),
        limit: 20,
      });

      // 格式化评论数据
      const formattedComments = comments.map(comment => {
        const formatComment = (c) => ({
          id: c.id,
          content: c.content,
          author: {
            id: c.author_id,
            username: c.author_username,
            avatar: c.author_avatar,
          },
          postId: c.post_id,
          parentId: c.parent_id,
          replies: c.replies ? c.replies.map(formatComment) : [],
          likeCount: c.like_count,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        });
        return formatComment(comment);
      });

      return res.status(200).json(formattedComments);
    } catch (error) {
      console.error('获取评论列表错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取评论列表失败',
      });
    }
  }

  // 创建评论
  static async createComment(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.userId;
      const { content, parentId } = req.body;

      // 验证帖子是否存在
      const post = await Post.findById(parseInt(postId));
      if (!post) {
        return res.status(404).json({
          error: 'POST_NOT_FOUND',
          message: '帖子不存在',
        });
      }

      // 如果 parentId 存在，验证父评论是否存在
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
          return res.status(404).json({
            error: 'COMMENT_NOT_FOUND',
            message: '父评论不存在',
          });
        }
        // 确保父评论属于同一个帖子
        if (parentComment.post_id !== parseInt(postId)) {
          return res.status(400).json({
            error: 'INVALID_PARENT',
            message: '父评论不属于该帖子',
          });
        }
      }

      // 创建评论
      const comment = await Comment.create({
        content,
        authorId: userId,
        postId: parseInt(postId),
        parentId: parentId ? parseInt(parentId) : null,
      });

      const formattedComment = Comment.formatComment(comment);

      return res.status(201).json(formattedComment);
    } catch (error) {
      console.error('创建评论错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '创建评论失败',
      });
    }
  }

  // 回复评论
  static async replyComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
      const { content } = req.body;

      // 验证父评论是否存在
      const parentComment = await Comment.findById(parseInt(commentId));
      if (!parentComment) {
        return res.status(404).json({
          error: 'COMMENT_NOT_FOUND',
          message: '评论不存在',
        });
      }

      // 创建回复
      const comment = await Comment.create({
        content,
        authorId: userId,
        postId: parentComment.post_id,
        parentId: parseInt(commentId),
      });

      const formattedComment = Comment.formatComment(comment);

      return res.status(201).json(formattedComment);
    } catch (error) {
      console.error('回复评论错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '回复评论失败',
      });
    }
  }
}

export default CommentController;

