import { query, getClient } from '../config/database.js';

class Post {
  // 根据 ID 查找帖子
  static async findById(id) {
    const result = await query(
      `SELECT p.*, 
              u.id as author_id, u.username as author_username, u.avatar as author_avatar,
              c.id as category_id, c.name as category_name, c.description as category_description, c.color as category_color
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // 创建帖子
  static async create({ title, content, excerpt, authorId, categoryId, tags = [] }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 插入帖子
      const postResult = await client.query(
        `INSERT INTO posts (title, content, excerpt, author_id, category_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [title, content, excerpt || this.generateExcerpt(content), authorId, categoryId]
      );
      const post = postResult.rows[0];

      // 处理标签
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // 查找或创建标签
          let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
          let tagId;

          if (tagResult.rows.length === 0) {
            const newTagResult = await client.query(
              'INSERT INTO tags (name) VALUES ($1) RETURNING id',
              [tagName]
            );
            tagId = newTagResult.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }

          // 关联帖子与标签
          await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [post.id, tagId]
          );
        }
      }

      await client.query('COMMIT');
      return await this.findById(post.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 更新帖子
  static async update(id, { title, content, categoryId, tags }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (content !== undefined) {
        updates.push(`content = $${paramCount++}`);
        values.push(content);
      }
      if (categoryId !== undefined) {
        updates.push(`category_id = $${paramCount++}`);
        values.push(categoryId);
      }

      if (updates.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE posts 
           SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $${paramCount}`,
          values
        );
      }

      // 更新标签
      if (tags !== undefined) {
        // 删除旧标签关联
        await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);

        // 添加新标签
        if (tags.length > 0) {
          for (const tagName of tags) {
            let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
            let tagId;

            if (tagResult.rows.length === 0) {
              const newTagResult = await client.query(
                'INSERT INTO tags (name) VALUES ($1) RETURNING id',
                [tagName]
              );
              tagId = newTagResult.rows[0].id;
            } else {
              tagId = tagResult.rows[0].id;
            }

            await client.query(
              'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [id, tagId]
            );
          }
        }
      }

      await client.query('COMMIT');
      return await this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 删除帖子
  static async delete(id) {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // 获取帖子列表（分页、排序、筛选）
  static async findAll({ page = 1, limit = 20, sort = 'time', category, tag }) {
    const offset = (page - 1) * limit;
    let orderBy = 'p.created_at DESC';
    
    if (sort === 'hot') {
      orderBy = '(p.view_count + p.like_count * 2) DESC, p.created_at DESC';
    }

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      whereClause += ` AND p.category_id = $${paramCount++}`;
      params.push(category);
    }

    if (tag) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM post_tags pt 
        JOIN tags t ON pt.tag_id = t.id 
        WHERE pt.post_id = p.id AND t.name = $${paramCount++}
      )`;
      params.push(tag);
    }

    params.push(limit, offset);

    const result = await query(
      `SELECT p.*,
              u.id as author_id, u.username as author_username, u.avatar as author_avatar,
              c.id as category_id, c.name as category_name, c.description as category_description, c.color as category_color,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      params
    );

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
      params.slice(0, -2)
    );
    const total = parseInt(countResult.rows[0].total);

    // 获取每个帖子的标签
    const posts = await Promise.all(
      result.rows.map(async (post) => {
        const tagsResult = await query(
          `SELECT t.id, t.name 
           FROM tags t
           JOIN post_tags pt ON t.id = pt.tag_id
           WHERE pt.post_id = $1`,
          [post.id]
        );
        return {
          ...post,
          tags: tagsResult.rows,
        };
      })
    );

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 增加浏览量
  static async incrementViewCount(id) {
    await query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);
  }

  // 生成内容摘要
  static generateExcerpt(content, maxLength = 150) {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // 移除 HTML 标签
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // 格式化帖子数据（用于 API 响应）
  static formatPostListItem(post) {
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      author: {
        id: post.author_id,
        username: post.author_username,
        avatar: post.author_avatar,
      },
      category: {
        id: post.category_id,
        name: post.category_name,
        description: post.category_description,
        color: post.category_color,
      },
      tags: post.tags || [],
      viewCount: post.view_count,
      commentCount: parseInt(post.comment_count) || 0,
      likeCount: post.like_count,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };
  }

  // 格式化帖子详情（包含完整内容）
  static formatPostDetail(post) {
    return {
      ...this.formatPostListItem(post),
      content: post.content,
    };
  }
}

export default Post;

