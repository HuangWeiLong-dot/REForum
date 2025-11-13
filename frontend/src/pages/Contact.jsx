import React from 'react'
import { FaRegEnvelope, FaRegUser, FaRegComment, FaRegComments } from 'react-icons/fa'
import { RiQqLine } from 'react-icons/ri'
import './Contact.css'

// 统一使用空心图标
const QqIcon = RiQqLine

const Contact = () => {
  const contributors = [
    {
      name: '黄伟隆',
      role: '项目负责人',
      email: '3571676852@qq.com',
      qq: '3571676852',
      wechat: 'X15021373202',
      avatar: '/avatars/admin1.jpg', // 占位符路径，请将实际照片放在 frontend/public/avatars/admin1.jpg
    },
    {
      name: '江海鹏',
      role: '开发工程师',
      bio: '目前主要参与需求评审，暂未负责具体的开发工作。',
      email: '3242772908@qq.com',
      qq: '3242772908',
      wechat: 'jhp061224',
      avatar: '/avatars/admin2.jpg', // 占位符路径，请将实际照片放在 frontend/public/avatars/admin2.jpg
    },
  ]

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <FaRegEnvelope className="contact-icon" />
          <h1>联系我们</h1>
        </div>

        <div className="contact-content">
          <div className="contributors-section">
            <h2>项目贡献者</h2>
            <p className="section-description">
              如果您有任何问题或建议，欢迎通过以下方式联系我们。
            </p>
            
            <div className="contributors-grid">
              {contributors.map((contributor, index) => (
                <div key={index} className="contributor-card">
                  <div className="contributor-avatar">
                    {contributor.avatar ? (
                      <img 
                        src={contributor.avatar} 
                        alt={contributor.name}
                        className="avatar-image"
                        onError={(e) => {
                          // 如果图片加载失败，隐藏图片，显示默认图标
                          e.target.style.display = 'none'
                          const icon = e.target.parentElement.querySelector('.avatar-icon')
                          if (icon) {
                            icon.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <FaRegUser 
                      className="avatar-icon" 
                      style={{ display: contributor.avatar ? 'none' : 'flex' }}
                    />
                  </div>
                  <div className="contributor-info">
                    <h3 className="contributor-name">{contributor.name}</h3>
                    <p className="contributor-role">{contributor.role}</p>
                  {contributor.bio && (
                    <p className="contributor-bio">{contributor.bio}</p>
                  )}
                  </div>
                  <div className="contributor-contacts">
                    <a
                      href={`mailto:${contributor.email}`}
                      className="contact-link"
                      title="发送邮件"
                    >
                      <FaRegEnvelope className="contact-link-icon" />
                      <span>{contributor.email}</span>
                    </a>
                    {contributor.qq && (
                      <div
                        className="contact-link"
                        title="QQ"
                        onClick={() => {
                          navigator.clipboard.writeText(contributor.qq)
                          alert(`QQ号 ${contributor.qq} 已复制到剪贴板`)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <QqIcon className="contact-link-icon" />
                        <span>QQ: {contributor.qq}</span>
                      </div>
                    )}
                    {contributor.wechat && (
                      <div
                        className="contact-link"
                        title="微信"
                        onClick={() => {
                          navigator.clipboard.writeText(contributor.wechat)
                          alert(`微信号 ${contributor.wechat} 已复制到剪贴板`)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <FaRegComments className="contact-link-icon" />
                        <span>微信: {contributor.wechat}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
