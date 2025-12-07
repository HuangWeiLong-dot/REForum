import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // 根据 ID 查找用户
  static async findById(id) {
    const result = await query(
      'SELECT id, username, email, avatar, bio, tag, exp, join_date, created_at, updated_at, username_updated_at, tag_updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // 根据用户名或邮箱查找用户（用于登录）
  static async findByUsernameOrEmail(login) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [login]
    );
    return result.rows[0] || null;
  }

  // 创建新用户
  static async create({ username, email, password }) {
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, exp) 
       VALUES ($1, $2, $3, 0) 
       RETURNING id, username, email, avatar, bio, tag, exp, join_date, created_at, updated_at`,
      [username, email, passwordHash]
    );
    return result.rows[0];
  }

  // 检查是否可以修改用户名或称号（30天限制）
  static canModifyUsernameOrTag(updatedAt) {
    if (!updatedAt) {
      // 如果从未修改过，可以修改
      return { canModify: true, daysRemaining: null };
    }
    
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    const daysRemaining = 30 - daysSinceUpdate;
    
    return {
      canModify: daysRemaining <= 0,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    };
  }

  // 更新用户资料
  static async update(id, { avatar, bio, username, tag }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (avatar !== undefined) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(avatar);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      updates.push(`username_updated_at = CURRENT_TIMESTAMP`);
      values.push(username);
    }
    if (tag !== undefined) {
      updates.push(`tag = $${paramCount++}`);
      updates.push(`tag_updated_at = CURRENT_TIMESTAMP`);
      values.push(tag);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, username, email, avatar, bio, tag, exp, join_date, created_at, updated_at, username_updated_at, tag_updated_at`,
      values
    );
    return result.rows[0];
  }

  // 验证密码
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  // 获取用户统计信息（帖子数、评论数和获赞数）
  static async getStats(userId) {
    const result = await query(
      `SELECT 
        COALESCE(us.post_count, 0) as post_count,
        COALESCE(us.comment_count, 0) as comment_count,
        COALESCE(url.received_likes, 0) as received_likes
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.id
       LEFT JOIN user_received_likes url ON u.id = url.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || { post_count: 0, comment_count: 0, received_likes: 0 };
  }

  // 获取用户完整资料（包含统计信息）
  static async getProfile(userId) {
    const user = await this.findById(userId);
    if (!user) return null;

    const stats = await this.getStats(userId);
    return {
      ...user,
      exp: parseInt(user.exp) || 0,
      postCount: parseInt(stats.post_count) || 0,
      commentCount: parseInt(stats.comment_count) || 0,
      receivedLikes: parseInt(stats.received_likes) || 0,
      usernameUpdatedAt: user.username_updated_at,
      tagUpdatedAt: user.tag_updated_at,
    };
  }

  // 获取公开用户资料（不包含邮箱）
  static async getPublicProfile(userId) {
    const result = await query(
      `SELECT u.id, u.username, u.avatar, u.bio, u.tag, u.exp, u.join_date,
              COALESCE(us.post_count, 0) as post_count,
              COALESCE(us.comment_count, 0) as comment_count,
              COALESCE(url.received_likes, 0) as received_likes
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.id
       LEFT JOIN user_received_likes url ON u.id = url.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }
}

export default User;

