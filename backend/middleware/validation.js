import { body, param, query, validationResult } from 'express-validator';

// 处理验证错误
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: '请求参数验证失败',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// 用户注册验证
export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符'),
  handleValidationErrors,
];

// 用户登录验证
export const validateLogin = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('用户名或邮箱不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  handleValidationErrors,
];

// 更新用户资料验证
export const validateUpdateProfile = [
  body('avatar')
    .optional()
    .isURL()
    .withMessage('头像必须是有效的URL'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('个人简介不能超过200个字符'),
  handleValidationErrors,
];

// 创建帖子验证
export const validateCreatePost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('标题长度必须在5-200个字符之间'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('内容长度至少为10个字符'),
  body('categoryId')
    .custom((value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) {
        throw new Error('分类ID必须是有效的正整数');
      }
      return true;
    })
    .toInt(),
  body('tags')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (Array.isArray(value)) return true;
      return false;
    })
    .withMessage('标签必须是数组'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('标签名称长度必须在1-50个字符之间'),
  handleValidationErrors,
];

// 更新帖子验证
export const validateUpdatePost = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('标题长度必须在5-200个字符之间'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('内容长度至少为10个字符'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('分类ID必须是有效的整数'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('标签名称长度必须在1-50个字符之间'),
  handleValidationErrors,
];

// 创建评论验证
export const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('评论内容长度必须在1-1000个字符之间'),
  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('父评论ID必须是有效的整数'),
  handleValidationErrors,
];

// 路径参数验证
export const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('用户ID必须是有效的整数'),
  handleValidationErrors,
];

export const validatePostId = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('帖子ID必须是有效的整数'),
  handleValidationErrors,
];

export const validateCommentId = [
  param('commentId')
    .isInt({ min: 1 })
    .withMessage('评论ID必须是有效的整数'),
  handleValidationErrors,
];

// 分页参数验证
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  handleValidationErrors,
];

