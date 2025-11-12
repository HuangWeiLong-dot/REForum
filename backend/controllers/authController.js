import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import EmailService from '../services/emailService.js';
import VerificationCodeService from '../services/verificationCodeService.js';

class AuthController {
  // 用户注册
  static async register(req, res) {
    try {
      const { username, email, password, verificationCode } = req.body;

      // 验证必填字段
      if (!verificationCode) {
        return res.status(400).json({
          error: 'MISSING_VERIFICATION_CODE',
          message: '请提供验证码',
        });
      }

      // 验证验证码
      const codeVerification = VerificationCodeService.verifyCode(email, verificationCode);
      if (!codeVerification.valid) {
        return res.status(400).json({
          error: 'INVALID_VERIFICATION_CODE',
          message: codeVerification.message,
        });
      }

      // 检查用户名是否已存在
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({
          error: 'USER_EXISTS',
          message: '用户名已存在',
          details: '该用户名已被使用，请选择其他用户名',
        });
      }

      // 检查邮箱是否已存在
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          error: 'EMAIL_EXISTS',
          message: '邮箱已存在',
          details: '该邮箱已被注册，请使用其他邮箱',
        });
      }

      // 创建用户
      const user = await User.create({ username, email, password });

      // 获取用户统计信息
      const stats = await User.getStats(user.id);
      const userProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.join_date,
        postCount: parseInt(stats.post_count) || 0,
        commentCount: parseInt(stats.comment_count) || 0,
      };

      // 生成 JWT token
      const token = generateToken(user.id);

      // 发送欢迎邮件（异步，不阻塞响应）
      EmailService.sendWelcomeEmail(email, username).catch(err => {
        console.error('发送欢迎邮件失败:', err);
      });

      return res.status(201).json({
        user: userProfile,
        token,
      });
    } catch (error) {
      console.error('注册错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '注册失败，请稍后重试',
      });
    }
  }

  // 用户登录
  static async login(req, res) {
    try {
      const { login, password } = req.body;

      // 查找用户（支持用户名或邮箱登录）
      const user = await User.findByUsernameOrEmail(login);
      if (!user) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误',
        });
      }

      // 验证密码
      const isPasswordValid = await User.verifyPassword(user, password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误',
        });
      }

      // 获取用户统计信息
      const stats = await User.getStats(user.id);
      const userProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.join_date,
        postCount: parseInt(stats.post_count) || 0,
        commentCount: parseInt(stats.comment_count) || 0,
      };

      // 生成 JWT token
      const token = generateToken(user.id);

      return res.status(200).json({
        user: userProfile,
        token,
      });
    } catch (error) {
      console.error('登录错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '登录失败，请稍后重试',
      });
    }
  }

  // 用户登出
  static async logout(req, res) {
    try {
      // JWT 是无状态的，登出主要是客户端删除 token
      // 如果需要服务端控制，可以实现 token 黑名单机制
      return res.status(200).json({
        message: '登出成功',
      });
    } catch (error) {
      console.error('登出错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '登出失败，请稍后重试',
      });
    }
  }
}

export default AuthController;

