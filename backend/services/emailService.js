import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  // 发送欢迎邮件
  static async sendWelcomeEmail(email, username, userThemeColor = '#2563eb', recipientLanguage = 'zh-CN') {
    try {
      const { data, error } = await resend.emails.send({
        from: 'REForum <noreply@reforum.space>',
        to: email,
        subject: '欢迎加入 REForum 论坛',
        html: `
          <!DOCTYPE html>
          <html lang="${recipientLanguage}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>欢迎加入 REForum 论坛</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
              <h1 style="color: ${userThemeColor};">Welcome to REForum</h1>
              <p>${username}</p>
              <p>感谢注册 REForum 论坛</p>
              <p>现在你可以</p>
              <div style="margin: 10px 0;">
                <div style="margin: 8px 0;">发布和分享您的想法</div>
                <div style="margin: 8px 0;">参与讨论和评论</div>
                <div style="margin: 8px 0;">与其他用户互动</div>
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">此邮件由 REForum 系统自动发送，请勿回复。</p>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('发送邮件失败:', error);
        return false;
      }

      console.log('欢迎邮件发送成功:', data);
      return true;
    } catch (error) {
      console.error('邮件服务错误:', error);
      return false;
    }
  }

  // 发送注册验证码邮件
  static async sendVerificationCodeEmail(email, code, userThemeColor = '#2563eb', recipientLanguage = 'zh-CN') {
    try {
      // 检查 API Key 是否配置
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY 未配置');
        return false;
      }

      const { data, error } = await resend.emails.send({
        from: 'REForum <noreply@reforum.space>',
        to: email,
        subject: 'REForum 注册验证码',
        html: `
          <!DOCTYPE html>
          <html lang="${recipientLanguage}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>REForum 注册验证码</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
              <h1 style="color: ${userThemeColor};">REForum 注册验证码</h1>
              <p>您好，</p>
              <p>您正在注册 REForum 论坛账号，验证码为：</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 15px 30px; background-color: #f3f4f6; border-radius: 8px; font-size: 32px; font-weight: bold; color: ${userThemeColor}; letter-spacing: 5px;">
                  ${code}
                </div>
              </div>
              <p>验证码有效期为 <strong>5分钟</strong>，请尽快使用。</p>
              <p style="color: ${userThemeColor};">如果您没有注册 REForum 账号，请忽略此邮件。</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px;">此邮件由 REForum 系统自动发送，请勿回复。</p>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('发送验证码邮件失败:', error);
        console.error('Resend API 错误详情:', JSON.stringify(error, null, 2));
        console.error('错误类型:', error.name);
        console.error('错误消息:', error.message);
        return false;
      }

      console.log('验证码邮件发送成功:', data);
      return true;
    } catch (error) {
      console.error('邮件服务错误:', error);
      console.error('错误堆栈:', error.stack);
      console.error('错误类型:', error.name);
      console.error('错误消息:', error.message);
      return false;
    }
  }

  // 发送新密码邮件
  static async sendNewPasswordEmail(email, username, newPassword, userThemeColor = '#2563eb', recipientLanguage = 'zh-CN') {
    try {
      const { data, error } = await resend.emails.send({
        from: 'REForum <noreply@reforum.space>',
        to: email,
        subject: '您的 REForum 新密码',
        html: `
          <!DOCTYPE html>
          <html lang="${recipientLanguage}">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>您的 REForum 新密码</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 20px;">
              <h1 style="color: ${userThemeColor};">您的 REForum 新密码</h1>
              <p>亲爱的 ${username}，</p>
              <p>您的密码重置请求已处理，新密码为：</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 15px 30px; background-color: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: bold; color: ${userThemeColor}; letter-spacing: 2px;">
                  ${newPassword}
                </div>
              </div>
              <p>请使用此新密码登录 REForum 论坛。</p>
              <p style="color: ${userThemeColor};">为了您的账号安全，建议您登录后立即修改密码。</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px;">此邮件由 REForum 系统自动发送，请勿回复。</p>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('发送新密码邮件失败:', error);
        return false;
      }

      console.log('新密码邮件发送成功:', data);
      return true;
    } catch (error) {
      console.error('邮件服务错误:', error);
      return false;
    }
  }

  // 站外新帖通知邮件
  static async sendNewPostNotificationEmails({ recipients, postTitle, postId, authorUsername, excerpt, files = [], images = [], authorThemeColor = '#2563eb' }) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY 未配置，跳过邮件发送');
        return { successCount: 0, failureCount: recipients?.length || 0 };
      }

      if (!Array.isArray(recipients) || recipients.length === 0) {
        console.log('没有需要发送的邮件收件人，跳过邮件发送');
        return { successCount: 0, failureCount: 0 };
      }

      const postUrlBase = process.env.FRONTEND_URL || process.env.APP_URL || '';
      const postUrl = `${postUrlBase}/post/${postId}`;
      
      // 清理预览文本中的Markdown链接，只保留纯文本
      const cleanPreviewText = excerpt ? excerpt.replace(/!?\[(.*?)\]\((.*?)\)/g, '') : '点击查看详情';
      const previewText = cleanPreviewText.slice(0, 160);
      
      // 清理正文摘要中的Markdown链接，只保留纯文本
      const cleanExcerpt = excerpt ? excerpt.replace(/!?\[(.*?)\]\((.*?)\)/g, '') : '';
      
      // 清理帖子标题中的Markdown链接，只保留纯文本
      const cleanPostTitle = postTitle.replace(/!?\[(.*?)\]\((.*?)\)/g, '$1');
      

      // 实现请求节流，确保每秒最多发送2个请求
      const sendEmailWithThrottle = async () => {
        const results = [];
        // 将收件人分成每批2个
        for (let i = 0; i < recipients.length; i += 2) {
          const batch = recipients.slice(i, i + 2);
          // 并行发送当前批次的邮件
          const batchResults = await Promise.allSettled(
            batch.map(async ({ email, username, language = 'zh-CN' }) => {
              const displayName = username || 'REForum 用户';
              
              // 生成图片列表HTML
              let imagesHtml = '';
              if (images && images.length > 0) {
                imagesHtml = `
                  <div style="margin: 16px 0;">
                    <h3 style="color: #374151; font-size: 16px; margin: 0 0 12px;">帖子包含的图片：</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                `;
                
                images.forEach(image => {
                  imagesHtml += `
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; max-width: 100%;">
                      <img src="${image.url}" alt="${image.alt}" style="width: 100%; max-height: 300px; object-fit: cover;" />
                      ${image.alt ? `<div style="padding: 8px; background-color: #f9fafb; font-size: 14px; color: #6b7280;">${image.alt}</div>` : ''}
                    </div>
                  `;
                });
                
                imagesHtml += `
                    </div>
                  </div>
                `;
              }
              
              // 生成文件列表HTML
              let filesHtml = '';
              if (files && files.length > 0) {
                filesHtml = `
                  <div style="margin: 16px 0; text-align: left;">
                    <h3 style="color: #374151; font-size: 16px; margin: 0 0 12px;">帖子包含的文件：</h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                `;
                
                files.forEach(file => {
                  filesHtml += `
                    <li style="margin: 8px 0; padding: 12px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                      <div style="flex: 1;">
                        <a href="${file.url}" style="color: ${authorThemeColor}; text-decoration: none; font-size: 14px;">下载文件</a>
                      </div>
                    </li>
                  `;
                });
                
                filesHtml += `
                    </ul>
                  </div>
                `;
              }
              
              try {
                const { error } = await resend.emails.send({
                  from: 'REForum <noreply@reforum.space>',
                  to: email,
                  subject: `${authorUsername} 发布了新帖子：${cleanPostTitle}`,
                  html: `
                    <!DOCTYPE html>
                    <html lang="${language}">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>${authorUsername} 发布了新帖子：${cleanPostTitle}</title>
                    </head>
                    <body>
                      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; text-align: center;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0 0 12px;">${previewText}</p>
                        <h1 style="color: ${authorThemeColor}; font-size: 22px; margin: 0 0 16px;">${cleanPostTitle}</h1>
                        <p style="color: #374151; margin: 0 0 16px;">您好，${displayName}！</p>
                        <p style="color: #374151; margin: 0 0 16px;">${authorUsername} 刚刚发布了新的帖子，快来看看：</p>
                        <div style="margin: 12px 0 20px;">
                          <a href="${postUrl}" style="display: inline-block; padding: 12px 20px; background-color: ${authorThemeColor}; color: #fff; text-decoration: none; border-radius: 6px;">查看帖子</a>
                        </div>
                        ${cleanExcerpt ? `<p style="color: #4b5563; margin: 0 0 12px;">${cleanExcerpt}</p>` : ''}
                        ${imagesHtml}
                        ${filesHtml}
                        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">如果按钮无法点击，请复制链接到浏览器：<br /><span style="word-break: break-all;">${postUrl}</span></p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="color: #9ca3af; font-size: 12px;">此邮件由 REForum 系统自动发送，请勿回复。</p>
                      </div>
                    </body>
                    </html>
                  `,
                });

                if (error) {
                  throw new Error(error.message || '发送失败');
                }
                return { status: 'fulfilled' };
              } catch (error) {
                return { status: 'rejected', reason: error };
              }
            })
          );
          results.push(...batchResults);
          
          // 如果不是最后一批，等待1秒后再发送下一批
          if (i + 2 < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return results;
      };

      const results = await sendEmailWithThrottle();
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      if (failureCount > 0) {
        const errors = results
          .filter(r => r.status === 'rejected')
          .map(r => r.reason?.message || '未知错误');
        console.error('部分新帖通知邮件发送失败:', errors);
      }

      console.log(`新帖通知邮件发送完成，成功 ${successCount}，失败 ${failureCount}`);
      return { successCount, failureCount };
    } catch (error) {
      console.error('发送新帖通知邮件出现异常:', error);
      return { successCount: 0, failureCount: recipients?.length || 0 };
    }
  }
}

export default EmailService;

