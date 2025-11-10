import User from '../models/User.js';

class UserController {
  // 获取当前用户资料
  static async getProfile(req, res) {
    try {
      const userId = req.userId;
      const userProfile = await User.getProfile(userId);

      if (!userProfile) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: '用户不存在',
        });
      }

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('获取用户资料错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取用户资料失败',
      });
    }
  }

  // 更新用户资料
  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const { avatar, bio } = req.body;

      const updatedUser = await User.update(userId, { avatar, bio });
      
      if (!updatedUser) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: '用户不存在',
        });
      }

      // 获取用户统计信息
      const stats = await User.getStats(userId);
      const userProfile = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        joinDate: updatedUser.join_date,
        postCount: parseInt(stats.post_count) || 0,
        commentCount: parseInt(stats.comment_count) || 0,
      };

      return res.status(200).json(userProfile);
    } catch (error) {
      console.error('更新用户资料错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '更新用户资料失败',
      });
    }
  }

  // 获取指定用户公开资料
  static async getPublicProfile(req, res) {
    try {
      const { userId } = req.params;
      const publicProfile = await User.getPublicProfile(parseInt(userId));

      if (!publicProfile) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: '用户不存在',
        });
      }

      return res.status(200).json({
        id: publicProfile.id,
        username: publicProfile.username,
        avatar: publicProfile.avatar,
        bio: publicProfile.bio,
        joinDate: publicProfile.join_date,
        postCount: parseInt(publicProfile.post_count) || 0,
        commentCount: parseInt(publicProfile.comment_count) || 0,
      });
    } catch (error) {
      console.error('获取公开用户资料错误:', error);
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: '获取用户资料失败',
      });
    }
  }
}

export default UserController;

