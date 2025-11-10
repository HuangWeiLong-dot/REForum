import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT 认证中间件
export const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '未提供认证令牌',
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '用户不存在',
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '无效的认证令牌',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '认证令牌已过期',
      });
    }
    
    console.error('认证错误:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '认证过程出错',
    });
  }
};

// 生成 JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

