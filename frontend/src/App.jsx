import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { useLoader } from './context/LoaderContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CookieConsent from './components/CookieConsent'
import AgeVerification from './components/AgeVerification'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import Home from './pages/Home'
import Search from './pages/Search'
import PostDetail from './pages/PostDetail'
import UserProfile from './pages/UserProfile'
import CreatePost from './pages/CreatePost'

import Changelog from './pages/Changelog'
import Fixes from './pages/Fixes'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import IntroLoader from './components/IntroLoader'
import './App.css'

function App() {
  const { loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { isLoading, progress } = useLoader()
  const [appReady, setAppReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        setAppReady(true)
      }, 350)
      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  return (
      <>
        {/* 始终渲染IntroLoader，根据isLoading状态控制显示/隐藏 */}
        {isLoading || authLoading ? (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', zIndex: 9999 }}>
            <IntroLoader label="LOADING" progress={progress} />
          </div>
        ) : null}
        
        {/* 始终渲染主应用内容，但在加载时隐藏 */}
        <div className={`app ${appReady ? 'app-enter' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`} style={{
          opacity: isLoading || authLoading ? 0 : 1,
          pointerEvents: isLoading || authLoading ? 'none' : 'auto'
        }}>
          <AgeVerification />
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="app-container">
          {/* 将Sidebar重新放回app-container中，恢复原来的HTML结构 */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="app-main">
            <div className="page-transition-wrapper">
              <div key={location.pathname} className="page-transition page-transition-enter">
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/post/:postId/:slug?" element={<PostDetail />} />
                  <Route path="/user/:userId" element={<UserProfile />} />
                  <Route path="/create-post" element={<CreatePost />} />
                  
                  <Route path="/changelog" element={<Changelog />} />
                  <Route path="/fixes" element={<Fixes />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  
                  {/* 重定向/profile到首页，避免404 */}
                  <Route path="/profile" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
          <CookieConsent />
          <PWAInstallPrompt />
        </div>
        
        {/* 使用Portal将触发器直接挂载到body，避免被app的transform影响 */}
        {createPortal(
          <button 
            className="sidebar-trigger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {/* 根据侧边栏状态显示不同的箭头图标 */}
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </button>,
          document.body
        )}
      </>
  )
}

export default App

