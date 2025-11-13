import React from 'react'
import './Fixes.css'

const fixes = [
  {
    date: '2025-11-13',
    title: '搜索结果无法匹配关键词',
    description: '修复搜索接口统计总数时缺少用户表关联，导致搜索结果始终为空的问题。',
    details: [
      '统一列表查询与总数统计使用的 FROM/JOIN 语句，确保搜索条件引用的作者信息存在',
      '保持搜索条件支持标题、内容、作者用户名的模糊匹配',
    ],
    impact: '现在输入任意关键词都可以正确返回相关帖子，搜索体验恢复正常。',
  },
  {
    date: '2025-11-13',
    title: '图片加载跨域策略导致无法显示',
    description: '修复因安全策略限制导致的图片“NotSameOrigin”报错，图片现在可正常加载。',
    details: [
      '后端调整安全头：允许跨源资源加载（设置 crossOriginResourcePolicy 为 cross-origin，关闭 crossOriginEmbedderPolicy）',
      '规范 Nginx 反向代理写法：为 / 与 /uploads/ 使用带结尾斜杠的 proxy_pass，避免重定向与路径拼接问题'
    ],
    impact: '帖子中的图片在生产环境可稳定显示，不再出现跨域错误。',
  },
  {
    date: '2025-11-13',
    title: '图片地址异常（https://uploads/ 开头）',
    description: '修复生产环境下图片地址拼接错误，导致图片无法加载的问题。',
    details: [
      '统一使用后端域名的 origin 拼接图片路径，避免出现 https://uploads/... 错误地址',
      '适配开发/生产两种环境，开发走 Vite 代理，生产走 API 基址',
    ],
    impact: '现在发帖或预览中的图片都能正常显示了。',
  },
  {
    date: '2025-11-12',
    title: '删除帖子后标签仍显示',
    description: '在删除帖子后，标签列表会自动刷新并过滤掉无帖子标签。',
    details: [
      '在个人主页删除帖子后分发 postDeleted 事件',
      '右侧栏监听事件并重新拉取标签，过滤 postCount=0 的标签',
    ],
    impact: '标签列表与实际帖子数量保持一致。',
  },
]

export default function Fixes() {
  return (
    <div className="fixes-page">
      <h1 className="fixes-title">问题修复</h1>
      <p className="fixes-subtitle">这里汇总近期的缺陷修复，说明修复内容与影响范围。</p>

      <div className="fixes-list">
        {fixes.map((fix, idx) => (
          <article className="fix-card" key={idx}>
            <div className="fix-header">
              <span className="fix-date">{fix.date}</span>
              <h2 className="fix-name">{fix.title}</h2>
            </div>
            <p className="fix-desc">{fix.description}</p>
            {fix.details && fix.details.length > 0 && (
              <ul className="fix-details">
                {fix.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            {fix.impact && (
              <div className="fix-impact">
                <strong>对你的影响：</strong>{' '}
                <span>{fix.impact}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}


