import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  FaHome,
  FaHistory,
  FaShieldAlt,
  FaBug,
  FaChevronDown,
  FaThList,
  FaLayerGroup,
  FaFileContract,
  FaTimes,
} from 'react-icons/fa'
import { useLanguage } from '../context/LanguageContext'
import { useLoader } from '../context/LoaderContext'
import { categoryAPI } from '../services/api'
import { mockCategoryAPI, mockCategories } from '../data/mockData'
import './Sidebar.css'

// 是否使用假数据（通过 .env 文件中的 VITE_USE_MOCK_DATA 环境变量控制）
// 在 frontend/.env 文件中设置 VITE_USE_MOCK_DATA=true 使用假数据，VITE_USE_MOCK_DATA=false 使用真实API
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, getCategoryName } = useLanguage()
  const { markResourceLoaded } = useLoader()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  // 点击分类后关闭侧边栏
  const handleCategoryClick = (category) => {
    if (location.pathname === '/') {
      const currentCategory = new URLSearchParams(location.search).get('category')
      if (currentCategory === String(category.id)) {
        navigate('/', { replace: true })
      } else {
        navigate(`/?category=${category.id}`, { replace: true })
      }
    } else {
      navigate(`/?category=${category.id}`)
    }
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // 点击导航项后关闭侧边栏
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const fetchCategories = async () => {
    try {
      if (USE_MOCK_DATA) {
        // 使用假数据
        const response = await mockCategoryAPI.getCategories()
        setCategories(response.data.slice(0, 5))
      } else {
        // 使用真实API，添加超时机制
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 3000) // 3秒超时
        })
        
        const response = await Promise.race([
          categoryAPI.getCategories(),
          timeoutPromise
        ])
        setCategories(response.data.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      // 如果API失败，使用假数据作为后备
      if (!USE_MOCK_DATA) {
        setCategories(mockCategories.slice(0, 5))
      }
    } finally {
      setLoading(false)
      // 首次加载完成，标记categories资源已加载
      if (!categoriesLoaded) {
        setCategoriesLoaded(true)
        markResourceLoaded('categories')
      }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return false
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 移除了分类手风琴的折叠逻辑，始终显示完整内容

  // 侧边栏内容组件
  const SidebarContent = () => (
    <aside className={`sidebar ${isMobile ? 'mobile-sidebar' : ''} ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <div className="sidebar-accordion-label">
              {isMobile ? (
                <>
                  <FaFileContract className="accordion-leading-icon" />
                  <span>{t('sidebar.versionHistory')}</span>
                </>
              ) : (
                <>
                  <FaThList className="accordion-leading-icon" />
                  <span>{t('sidebar.navToggle')}</span>
                </>
              )}
            </div>
          </div>
          <nav className="sidebar-nav">
            {/* 桌面端显示首页按钮，移动端不显示 */}
            {!isMobile && (
              <Link
                to="/"
                className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <FaHome className="nav-icon" />
                <span>{t('sidebar.home')}</span>
              </Link>
            )}
            <Link
              to="/changelog"
              className={`nav-item ${location.pathname === '/changelog' ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <FaHistory className="nav-icon" />
              <span>{t('sidebar.changelog')}</span>
            </Link>
            <Link
              to="/fixes"
              className={`nav-item ${location.pathname === '/fixes' ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <FaBug className="nav-icon" />
              <span>{t('sidebar.fixes')}</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <div className="sidebar-accordion-label">
              <FaLayerGroup className="accordion-leading-icon" />
              <span>{t('right.categoriesTitle')}</span>
            </div>
          </div>
          <div className="sidebar-categories">
            {loading ? (
              <div className="categories-skeleton">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="category-skeleton-item">
                    <div className="skeleton-dot"></div>
                    <div className="skeleton-category-info">
                      <div className="skeleton-line skeleton-line-sm" style={{ width: '80px', marginBottom: '0.25rem' }}></div>
                      <div className="skeleton-line skeleton-line-sm" style={{ width: '60px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="categories-empty">{t('right.emptyCategories')}</p>
            ) : (
              <div className="category-list-bubble">
                {categories.map((category) => {
                  const isActive =
                    location.pathname === '/' &&
                    new URLSearchParams(location.search).get('category') === String(category.id)

                  return (
                    <div
                      key={category.id}
                      className={`category-bubble-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div
                        className="category-color-dot"
                        style={{ backgroundColor: category.color || '#6366f1' }}
                      />
                      <div className="category-info">
                        {/* {getCategoryIcon(getCategoryName(category.name))} */}
                        <span className="category-name">{getCategoryName(category.name)}</span>
                        <span className="category-count">
                          {category.postCount || 0} {t('right.postsSuffix')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <div className="sidebar-accordion-label">
              <FaShieldAlt className="accordion-leading-icon" />
              <span>{t('sidebar.policies')}</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <Link
              to="/terms"
              className={`nav-item ${location.pathname === '/terms' ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <FaFileContract className="nav-icon" />
              <span>{t('sidebar.terms')}</span>
            </Link>
            <Link
              to="/privacy"
              className={`nav-item ${location.pathname === '/privacy' ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <FaShieldAlt className="nav-icon" />
              <span>{t('sidebar.privacy')}</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* 桌面端：直接渲染侧边栏内容 */}
      {!isMobile && <SidebarContent />}
      
      {/* 移动端：使用Portal将侧边栏和覆盖层挂载到document.body，使其成为浏览器的直接子集 */}
      {isMobile && createPortal(
        <>
          {/* 移动端侧边栏覆盖层 */}
          <div 
            className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} 
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* 移动端侧边栏内容 */}
          <SidebarContent />
        </>,
        document.body
      )}
    </>
  )
}

export default Sidebar