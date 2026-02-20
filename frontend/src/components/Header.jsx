import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaSearch, FaPlus, FaUserCircle, FaMoon, FaSun, FaGlobeAsia, FaHome, FaInbox, FaCompass, FaEllipsisV, FaEllipsisH } from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import Inbox from './Inbox'
import ThemeColorPicker from './ThemeColorPicker'
import './Header.css'

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isAuthenticated, logout, testLogin } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  
  // 检查是否启用测试登录
  // 只有在开发/测试环境中，且 VITE_ENABLE_TEST_LOGIN 明确设置为 'true' 时才启用
  // 生产环境中无论设置什么值都禁用测试登录
  const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test'
  const enableTestLogin = isDevOrTest && import.meta.env.VITE_ENABLE_TEST_LOGIN === 'true'
  
  // 调试信息（仅在开发环境）
  useEffect(() => {
    if (isDevOrTest) {
      console.log('Test Login Debug:', {
        DEV: import.meta.env.DEV,
        MODE: import.meta.env.MODE,
        VITE_ENABLE_TEST_LOGIN: import.meta.env.VITE_ENABLE_TEST_LOGIN,
        isDevOrTest,
        enableTestLogin,
        isAuthenticated,
      })
    }
  }, [isDevOrTest, enableTestLogin, isAuthenticated])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [isClosingActions, setIsClosingActions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('theme') || 'light'
  })
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const languageMenuRef = useRef(null)

  const languages = [
    { code: 'en', label: 'English', symbol: 'A' },
    { code: 'ja', label: '日本語', symbol: 'あ' },
  ]

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setShowActionsMenu(false)
      setIsClosingActions(false)
    }
  }, [isMobile])

  // 点击外部区域时关闭语言菜单（桌面端）
  useEffect(() => {
    if (!showLanguageMenu || isMobile) return
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false)
      }
    }

      document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageMenu, isMobile])

  // 移动端打开语言菜单时禁用滚动
  useEffect(() => {
    if (!showLanguageMenu || !isMobile) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showLanguageMenu, isMobile])

  // 移动端打开菜单时禁用滚动
  useEffect(() => {
    if (!showActionsMenu || !isMobile) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showActionsMenu, isMobile])

  // 移动端打开头像菜单时禁用滚动
  useEffect(() => {
    if (!showUserMenu || !isMobile) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showUserMenu, isMobile])

  const localeMap = {
    zh: 'zh-CN',
    en: 'en-US',
    ja: 'ja-JP',
  }

  const currentLocale = localeMap[language] || 'en-US'

  // 搜索弹窗组件 - 采用更稳定的实现方式，避免闪烁
  // 将搜索弹窗实现为独立的DOM元素，而非React组件内部函数
  useEffect(() => {
    if (!showSearchModal) return
    
    // 创建搜索弹窗DOM元素
    const overlay = document.createElement('div')
    overlay.className = 'search-overlay'
    overlay.onclick = () => setShowSearchModal(false)
    
    const modal = document.createElement('div')
    modal.className = 'search-modal'
    modal.onclick = (e) => e.stopPropagation()
    
    const form = document.createElement('form')
    form.className = 'search-modal-form'
    form.onsubmit = (e) => {
      e.preventDefault()
      const input = form.querySelector('.search-modal-input')
      if (input?.value.trim()) {
        navigate(`/search?q=${encodeURIComponent(input.value.trim())}`)
        setShowSearchModal(false)
      }
    }
    
    // 搜索图标
    const icon = document.createElement('i')
    icon.className = 'search-modal-icon'
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path></svg>'
    
    // 搜索输入框
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = t('header.searchPlaceholder')
    input.className = 'search-modal-input'
    input.autofocus = true
    input.value = searchQuery
    
    // 关闭按钮
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.className = 'search-modal-close'
    closeBtn.ariaLabel = 'Close'
    closeBtn.innerHTML = '×'
    closeBtn.onclick = () => setShowSearchModal(false)
    
    // 组装DOM结构
    form.appendChild(icon)
    form.appendChild(input)
    form.appendChild(closeBtn)
    modal.appendChild(form)
    overlay.appendChild(modal)
    
    // 添加到文档
    document.body.appendChild(overlay)
    
    // 移除DOM元素
    return () => {
      document.body.removeChild(overlay)
    }
  }, [showSearchModal, t, navigate])
  
  // 移除原来的SearchModal组件定义
  // const SearchModal = () => { ... }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('theme-dark')
    } else {
      root.classList.remove('theme-dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 统一日期显示格式：YYYY-MM-DD（与语言无关，始终同一样式）
  const formattedDate = [
    currentTime.getFullYear(),
    String(currentTime.getMonth() + 1).padStart(2, '0'),
    String(currentTime.getDate()).padStart(2, '0'),
  ].join('-')
  const timeString = currentTime.toLocaleTimeString(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const languageMenuContent = (
    <div className="language-menu-list">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`language-option ${language === lang.code ? 'active' : ''}`}
          onClick={() => {
            setLanguage(lang.code)
            setShowLanguageMenu(false)
          }}
        >
          <span className="language-symbol">{lang.symbol}</span>
          <span className="language-label">{lang.label}</span>
        </button>
      ))}
    </div>
  )

  const languageOverlay = showLanguageMenu && isMobile
    ? createPortal(
        <div className="language-overlay" onClick={() => setShowLanguageMenu(false)}>
          <div className="language-modal" onClick={(e) => e.stopPropagation()}>
            <div className="language-modal-header">
              <span>{t('header.languageTitle')}</span>
              <button
                type="button"
                className="language-modal-close"
                onClick={() => setShowLanguageMenu(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {languageMenuContent}
          </div>
        </div>,
        document.body
      )
    : null

  const closeActionsMenu = () => {
    if (!showActionsMenu) return
    setIsClosingActions(true)
    setTimeout(() => {
      setShowActionsMenu(false)
      setIsClosingActions(false)
    }, 200)
  }

  const renderToolsGroup = (variant = 'inline') => {
    const showLabels = variant !== 'inline'
    return (
      <div
        className={`header-actions-group header-actions-group-tools ${showLabels ? 'header-actions-group-mobile' : ''}`}
      >
        <ThemeColorPicker showLabel={showLabels} />
        <button
          type="button"
          className={`header-button theme-toggle-button ${showLabels ? 'with-label' : ''}`}
          onClick={toggleTheme}
          aria-pressed={theme === 'dark'}
          title={theme === 'dark' ? t('header.toLight') : t('header.toDark')}
        >
          {showLabels && <span className="action-button-label">{theme === 'dark' ? t('header.lightLabel') : t('header.darkLabel')}</span>}
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
        {/* 桌面端将搜索按钮放在主题切换和语言切换之间 */}
        {!isMobile && (
          <button 
            className="header-button search-button"
            onClick={() => setShowSearchModal(true)}
            title={t('header.searchPlaceholder')}
          >
            <FaSearch />
          </button>
        )}
        <div
          className={`language-switcher-header ${showLabels ? 'with-label' : ''}`}
          ref={!isMobile ? languageMenuRef : null}
        >
          <button
            type="button"
            className={`header-button language-toggle-button ${showLabels ? 'with-label' : ''}`}
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            title={t('header.languageTitle')}
          >
            {showLabels && <span className="action-button-label">{t('header.languageTitle')}</span>}
            <FaGlobeAsia />
          </button>
          {!isMobile && showLanguageMenu && <div className="language-menu">{languageMenuContent}</div>}
        </div>
        {isAuthenticated && <Inbox showLabel={showLabels} />}
      </div>
    )
  }

  const renderPrimaryGroup = (variant = 'inline') => {
    const showLabels = variant !== 'inline'
    return (
      <div
        className={`header-actions-group header-actions-group-primary ${showLabels ? 'header-actions-group-mobile' : ''}`}
      >
        {isAuthenticated ? (
          <>
            <button 
            className={`header-button create-button ${showLabels ? 'with-label' : ''}`}
            onClick={() => {
              navigate('/create-post')
              if (isMobile) closeActionsMenu()
            }}
            title={t('header.createTitle')}
          >
            <FaPlus />
            {showLabels ? 
              <span className="action-button-label">{t('header.create')}</span> 
              : <span className="create-button-label">{t('header.create')}</span>}
          </button>
            {/* 点击头像直接跳转到用户资料页面 */}
            <button 
              className={`user-avatar-button ${showLabels ? 'with-label' : ''}`}
              title={t('header.userMenu')}
              onClick={() => {
                navigate(`/user/${user.id}`)
                if (isMobile) closeActionsMenu()
              }}
            >
              {showLabels && <span className="action-button-label">{t('header.userMenu')}</span>}
              <FaUserCircle className="user-avatar" />
            </button>
          </>
        ) : (
          <>
            {enableTestLogin && (
              <button
                className="header-button test-login-button"
                onClick={() => {
                  testLogin()
                  if (isMobile) closeActionsMenu()
                }}
                title="Test Login (Dev Only)"
              >
                🧪
              </button>
            )}
            <button
              className="header-button login-button"
              onClick={() => {
                setShowLoginModal(true)
                if (isMobile) closeActionsMenu()
              }}
              title={t('header.login')}
            >
              {!isMobile && <span className="login-button-label">{t('header.login')}</span>}
              <FaUserCircle />
            </button>
            <button
              className="header-button register-button"
              onClick={() => {
                setShowRegisterModal(true)
                if (isMobile) closeActionsMenu()
              }}
              title={t('header.register')}
            >
              {!isMobile && <span className="register-button-label">{t('header.register')}</span>}
              <FaUserCircle />
            </button>
          </>
        )}
      </div>
    )
  }

  const renderActionsLayout = (variant = 'inline') => {
    const showLabels = variant !== 'inline'
    return (
      <div className={`header-actions-row ${variant === 'modal' ? 'stacked' : ''}`}>
        {renderToolsGroup(variant)}
        {renderPrimaryGroup(variant)}
      </div>
    );
  }

  // 底部导航栏配置
  const bottomNavItems = [
    {
      path: '/inbox',
      icon: <FaInbox />,
      label: t('bottomNav.inbox')
    },
    {
      path: '/',
      icon: <FaHome />,
      label: t('bottomNav.home'),
      exact: true
    },
    {
      path: isAuthenticated ? `/user/${user.id}` : '/',
      icon: <FaUserCircle />,
      label: t('bottomNav.profile')
    }
  ]

  // 简化底部导航栏实现，确保所有按钮结构一致
  const actionsToggle =
    isMobile &&
    createPortal(
      <div className="actions-toggle-wrapper">
        {/* Inbox按钮 - 直接使用Inbox组件的根元素作为按钮 */}
        <Inbox showLabel={false} />
        
        {/* Home按钮 */}
        <button
          type="button"
          className={`actions-toggle-button ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
          title={t('bottomNav.home')}
        >
          <FaHome />
          <span className="actions-toggle-label">{t('bottomNav.home')}</span>
        </button>
        
        {/* Profile按钮 */}
        <button
          type="button"
          className={`actions-toggle-button ${location.pathname.startsWith('/user/') ? 'active' : ''}`}
          onClick={() => {
            if (isAuthenticated) {
              navigate(`/user/${user.id}`)
            } else {
              setShowLoginModal(true)
            }
          }}
          title={t('bottomNav.profile')}
        >
          <FaUserCircle />
          <span className="actions-toggle-label">{t('bottomNav.profile')}</span>
        </button>
      </div>,
      document.body
    )

  // 用户菜单模态框已移除，点击头像直接跳转到用户资料页面

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="header-logo">
              <span className="logo-text">
                <span className="logo-re">RE</span>
                <span className="logo-forum">Forum</span>
              </span>
            </Link>
          </div>

          <div className="header-center">
          {/* 移动端不显示搜索框，只通过按钮触发搜索模态框 */}
        </div>

          <div className="header-right">
            {/* 桌面端显示完整操作按钮 */}
            {!isMobile ? (
              <div className="header-actions-row">
                {renderToolsGroup()}
                {renderPrimaryGroup()}
              </div>
            ) : (
              <>
                {/* 移动端搜索按钮 */}
                <button 
                  className="header-button search-toggle-button" 
                  onClick={() => setShowSearchModal(true)}
                  title={t('header.searchPlaceholder')}
                >
                  <FaSearch />
                </button>
                
                {/* 移动端创建帖子按钮 */}
                <button 
                  className="header-button create-toggle-button" 
                  onClick={() => navigate('/create-post')}
                  title={t('header.create')}
                >
                  <FaPlus />
                </button>
                
                {/* 移动端更多选项按钮 */}
                <button 
                  className={`header-button more-toggle-button ${showMoreMenu ? 'active' : ''}`} 
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  title={t('header.moreOptions')}
                >
                  <FaEllipsisV className="ellipsis-icon vertical" />
                  <FaEllipsisH className="ellipsis-icon horizontal" />
                </button>
                
                {/* 更多选项菜单 */}
                {showMoreMenu && (
                  <div className="more-menu">
                    {/* 夜间模式切换按钮 */}
                    <button
                      className="more-menu-item"
                      onClick={() => {
                        toggleTheme()
                        setShowMoreMenu(false)
                      }}
                      title={theme === 'dark' ? t('header.toLight') : t('header.toDark')}
                    >
                      {theme === 'dark' ? <FaSun /> : <FaMoon />}
                      <span>{theme === 'dark' ? t('header.lightLabel') : t('header.darkLabel')}</span>
                    </button>
                    
                    {/* 选择语言按钮 */}
                    <button
                      className="more-menu-item"
                      onClick={() => {
                        setShowLanguageMenu(!showLanguageMenu)
                        setShowMoreMenu(false)
                      }}
                      title={t('header.languageTitle')}
                    >
                      <FaGlobeAsia />
                      <span>{t('header.languageTitle')}</span>
                    </button>
                    
                    {/* 主题切换按钮 */}
                    <ThemeColorPicker showLabel={false} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* 语言菜单覆盖层 */}
      {languageOverlay}
      
      {/* 移动端底部导航栏 */}
      {actionsToggle}
      
      {/* 用户菜单模态框已移除，点击头像直接跳转到用户资料页面 */}

      {/* 搜索弹窗通过useEffect直接渲染到DOM中，避免React组件闪烁问题 */}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false)
            setShowRegisterModal(true)
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false)
            setShowLoginModal(true)
          }}
        />
      )}
    </>
  )
}

export default Header

