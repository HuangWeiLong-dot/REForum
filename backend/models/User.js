import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // 根据 ID 查找用户
  static async findById(id) {
    const result = await query(
      'SELECT id, username, email, avatar, bio, join_date, created_at, updated_at FROM users WHERE id = $1',
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
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, avatar, bio, join_date, created_at, updated_at`,
      [username, email, passwordHash]
    );
    return result.rows[0];
  }

  // 更新用户资料
  static async update(id, { avatar, bio }) {
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

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, username, email, avatar, bio, join_date, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  // 验证密码
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  // 获取用户统计信息（帖子数和评论数）
  static async getStats(userId) {
    const result = await query(
      `SELECT post_count, comment_count 
       FROM user_stats 
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || { post_count: 0, comment_count: 0 };
  }

  // 获取用户完整资料（包含统计信息）
  static async getProfile(userId) {
    const user = await this.findById(userId);
    if (!user) return null;

    const stats = await this.getStats(userId);
    return {
      ...user,
      postCount: parseInt(stats.post_count) || 0,
      commentCount: parseInt(stats.comment_count) || 0,
    };
  }

  // 获取公开用户资料（不包含邮箱）
  static async getPublicProfile(userId) {
    const result = await query(
      `SELECT u.id, u.username, u.avatar, u.bio, u.join_date,
              COALESCE(us.post_count, 0) as post_count,
              COALESCE(us.comment_count, 0) as comment_count
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }
}

export default User;

