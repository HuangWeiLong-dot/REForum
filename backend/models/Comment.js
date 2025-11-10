import { query } from '../config/database.js';

class Comment {
  // 根据 ID 查找评论
  static async findById(id) {
    const result = await query(
      `SELECT c.*,
              u.id as author_id, u.username as author_username, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // 创建评论
  static async create({ content, authorId, postId, parentId = null }) {
    const result = await query(
      `INSERT INTO comments (content, author_id, post_id, parent_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [content, authorId, postId, parentId]
    );
    return await this.findById(result.rows[0].id);
  }

  // 更新评论
  static async update(id, { content }) {
    const result = await query(
      `UPDATE comments 
       SET content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [content, id]
    );
    return result.rows[0] ? await this.findById(id) : null;
  }

  // 删除评论
  static async delete(id) {
    const result = await query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // 获取帖子的评论列表（支持分页）
  static async findByPostId(postId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    // 获取顶级评论（parent_id 为 NULL）
    const result = await query(
      `SELECT c.*,
              u.id as author_id, u.username as author_username, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.post_id = $1 AND c.parent_id IS NULL
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    // 获取总数
    const countResult = await query(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = $1 AND parent_id IS NULL',
      [postId]
    );
    const total = parseInt(countResult.rows[0].total);

    // 为每个顶级评论获取回复
    const comments = await Promise.all(
      result.rows.map(async (comment) => {
        const replies = await this.getReplies(comment.id);
        const formattedComment = this.formatComment(comment);
        return {
          ...formattedComment,
          replies: replies,
        };
      })
    );

    return comments;
  }

  // 获取评论的回复（限制最大深度为3层）
  static async getReplies(parentId, currentDepth = 0, maxDepth = 3) {
    // 如果达到最大深度，不再递归获取
    if (currentDepth >= maxDepth) {
      return [];
    }

    const result = await query(
      `SELECT c.*,
              u.id as author_id, u.username as author_username, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.parent_id = $1
       ORDER BY c.created_at ASC`,
      [parentId]
    );

    // 递归获取嵌套回复
    const replies = await Promise.all(
      result.rows.map(async (reply) => {
        const nestedReplies = await this.getReplies(reply.id, currentDepth + 1, maxDepth);
        return {
          ...this.formatComment(reply),
          replies: nestedReplies,
        };
      })
    );

    return replies;
  }

  // 格式化评论数据
  static formatComment(comment) {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author_id,
        username: comment.author_username,
        avatar: comment.author_avatar,
      },
      postId: comment.post_id,
      parentId: comment.parent_id,
      likeCount: comment.like_count,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };
  }
}

export default Comment;

