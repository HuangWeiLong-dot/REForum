import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './CookieConsent.css'

const CookieConsent = () => {
  const { t } = useLanguage()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // 检查是否已经验证过年龄
    const ageVerified = localStorage.getItem('age-verified')
    // 检查是否已经同意过Cookie
    const cookieConsent = localStorage.getItem('cookie-consent')
    
    // 只有在年龄验证通过且未同意Cookie时才显示
    if (ageVerified && !cookieConsent) {
      // 延迟显示，让页面先加载
      const timer = setTimeout(() => {
        setShow(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShow(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-content">
          <div className="cookie-consent-icon">🍪</div>
          <div className="cookie-consent-text">
            <h3 className="cookie-consent-title">{t('cookie.title')}</h3>
            <p className="cookie-consent-description">
              {t('cookie.description')}
              <a href="/privacy" className="cookie-consent-link">
                {t('cookie.privacyLink')}
              </a>
            </p>
          </div>
        </div>
        <div className="cookie-consent-actions">
          <button
            onClick={handleDecline}
            className="cookie-consent-button cookie-consent-button-decline"
          >
            {t('cookie.decline')}
          </button>
          <button
            onClick={handleAccept}
            className="cookie-consent-button cookie-consent-button-accept"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent

