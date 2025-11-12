import React from 'react'
import { format } from 'date-fns'
import zhCN from 'date-fns/locale/zh-CN'
import './Changelog.css'

const Changelog = () => {
  const updates = [
    {
      date: '2025-11-12',
      version: '1.0.0',
      title: '搜索功能上线',
      description: '现在你可以通过搜索框快速找到感兴趣的帖子了！',
      features: [
        '支持搜索帖子标题、内容和作者用户名',
        '搜索结果页面显示匹配的帖子数量',
        '支持按"最新"或"热门"排序搜索结果',
        '搜索结果支持分页加载'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.9.0',
      title: '图片上传功能',
      description: '发帖时可以上传图片，让内容更生动！',
      features: [
        '支持选择和拖拽上传图片',
        '最多可上传10张图片',
        '实时预览上传的图片',
        '可以删除已上传的图片',
        '支持 JPEG、PNG、GIF、WebP 格式',
        '单张图片大小限制 5MB'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.8.0',
      title: '帖子点赞功能',
      description: '为你喜欢的帖子点个赞吧！',
      features: [
        '可以点赞或取消点赞帖子',
        '实时显示点赞数量',
        '已点赞的帖子会显示红色心形图标',
        '防止重复点赞'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.7.0',
      title: '帖子管理功能',
      description: '更好的帖子管理体验',
      features: [
        '可以在个人资料页面删除自己发布的帖子',
        '删除前需要确认，防止误操作',
        '删除后自动更新统计数据'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.6.0',
      title: '邮箱验证注册',
      description: '注册更安全，需要邮箱验证码',
      features: [
        '注册时需要邮箱验证码',
        '验证码有效期5分钟',
        '60秒内只能发送一次验证码',
        '防止恶意注册'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.5.0',
      title: '界面优化',
      description: '更美观、更易用的界面',
      features: [
        '全新的现代化设计风格',
        '更好的响应式布局',
        '优化字体显示，提升可读性',
        '更流畅的交互动画'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.4.0',
      title: '浏览统计优化',
      description: '更准确的浏览量统计',
      features: [
        '同一用户或IP在24小时内只计算一次浏览量',
        '防止浏览量虚高',
        '更真实的数据统计'
      ]
    },
    {
      date: '2025-11-12',
      version: '0.3.0',
      title: '用户协议和隐私政策',
      description: '完善的法律条款',
      features: [
        '新增用户协议页面',
        '新增隐私政策页面',
        '注册时需要同意相关条款'
      ]
    }
  ]

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日', { locale: zhCN })
    } catch {
      return dateString
    }
  }

  return (
    <div className="changelog-page">
      <div className="changelog-header">
        <h1>更新日志</h1>
        <p className="changelog-intro">
          这里记录了 REForum 的所有功能更新和改进。我们会持续优化，为你带来更好的使用体验。
        </p>
      </div>

      <div className="changelog-list">
        {updates.map((update, index) => (
          <div key={index} className="changelog-item">
            <div className="changelog-item-header">
              <div className="changelog-item-title-section">
                <h2 className="changelog-item-title">{update.title}</h2>
                <span className="changelog-item-version">v{update.version}</span>
              </div>
              <span className="changelog-item-date">{formatDate(update.date)}</span>
            </div>
            <p className="changelog-item-description">{update.description}</p>
            <ul className="changelog-item-features">
              {update.features.map((feature, featureIndex) => (
                <li key={featureIndex}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="changelog-footer">
        <p>感谢使用 REForum！如有问题或建议，欢迎通过"联系我们"页面反馈。</p>
      </div>
    </div>
  )
}

export default Changelog

