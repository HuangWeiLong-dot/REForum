import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { categoryAPI } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import { mockTagAPI, mockTags } from '../data/mockData'
import './RightSidebar.css'

// 是否使用假数据（通过 .env 文件中的 VITE_USE_MOCK_DATA 环境变量控制）
// 在 frontend/.env 文件中设置 VITE_USE_MOCK_DATA=true 使用假数据，VITE_USE_MOCK_DATA=false 使用真实API
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const RightSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      if (USE_MOCK_DATA) {
        // 使用假数据
        const response = await mockTagAPI.getTags({ limit: 15 })
        // 过滤掉postCount为0的标签
        setTags(response.data.filter(tag => tag.postCount > 0))
      } else {
        // 使用真实API
        const tagsRes = await categoryAPI.getTags({ limit: 15 })
        // 过滤掉postCount为0的标签
        setTags(tagsRes.data.filter(tag => tag.postCount > 0))
      }
    } catch (error) {
      console.error('Failed to fetch sidebar data:', error)
      // 如果API失败，使用假数据作为后备
      if (!USE_MOCK_DATA) {
        setTags(mockTags.filter(tag => tag.postCount > 0))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // 监听自定义事件，当帖子被删除时刷新标签
    const handlePostDeleted = () => {
      fetchData()
    }
    
    window.addEventListener('postDeleted', handlePostDeleted)
    
    return () => {
      window.removeEventListener('postDeleted', handlePostDeleted)
    }
  }, [location.pathname])

  // 生成标签签名，用于判断标签数据是否真正改变
  const tagsSignature = useMemo(() => {
    if (tags.length === 0) return ''
    return tags
      .map(tag => `${tag.id}-${tag.postCount || 0}`)
      .sort()
      .join('|')
  }, [tags])

  // 使用 useRef 存储位置和动画参数，避免路由切换时重置
  const positionsCacheRef = useRef({ signature: '', positions: [], animations: {} })
  const tagItemsCacheRef = useRef([])

  // 根据标签次数生成重复数组，每个标签根据postCount（累加数量）重复显示
  const generateTagItems = useMemo(() => {
    const items = []
    tags.forEach(tag => {
      const count = Math.max(tag.postCount || 1, 1)
      // 每个标签根据累加的数量完整重复显示
      const repeatCount = Math.min(count, 50) // 最多50次，避免过多
      for (let i = 0; i < repeatCount; i++) {
        items.push({ 
          ...tag, 
          uniqueId: `${tag.id}-${i}`,
        })
      }
    })
    return items
  }, [tags])

  // 生成随机但有序的位置，确保不重叠（只在标签数据真正改变时重新生成）
  const tagPositions = useMemo(() => {
    // 如果标签为空，返回空数组
    if (tags.length === 0) {
      positionsCacheRef.current = { signature: '', positions: [], animations: {} }
      tagItemsCacheRef.current = []
      return []
    }

    // 如果签名相同，返回缓存的位置
    if (positionsCacheRef.current.signature === tagsSignature && positionsCacheRef.current.positions.length > 0) {
      return positionsCacheRef.current.positions
    }

    // 生成新的位置
    const generateRandomPositions = (items) => {
      const containerWidth = 300 // 右侧栏宽度（留出边距）
      const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 70 : 600
      const minGap = 70 // 最小间距，确保不重叠
      const positions = []
      const usedPositions = [] // 记录已使用的位置
      const animations = {} // 存储每个标签的动画参数
      
      items.forEach((item, index) => {
        let attempts = 0
        let x, y
        let validPosition = false
        
        // 尝试找到一个不重叠的位置
        while (!validPosition && attempts < 150) {
          x = Math.random() * (containerWidth - 80) + 10 // 留出边距
          y = Math.random() * (containerHeight - 50) + 10 // 留出边距
          
          // 检查是否与已有位置重叠
          validPosition = usedPositions.every(pos => {
            const distance = Math.sqrt(
              Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
            )
            return distance >= minGap
          })
          
          attempts++
        }
        
        // 如果找不到合适位置，使用网格布局作为后备
        if (!validPosition) {
          const cols = Math.floor(containerWidth / minGap)
          const row = Math.floor(index / cols)
          const col = index % cols
          x = col * minGap + 20
          y = row * minGap + 20
        }
        
        positions.push({ x, y })
        usedPositions.push({ x, y })
        
        // 为每个标签生成并缓存动画参数
        animations[item.uniqueId] = {
          duration: 15 + Math.random() * 20, // 15-35秒
          delay: Math.random() * 5, // 0-5秒延迟
          direction: Math.random() > 0.5 ? 1 : -1 // 随机方向
        }
      })
      
      // 更新缓存
      positionsCacheRef.current = {
        signature: tagsSignature,
        positions,
        animations
      }
      tagItemsCacheRef.current = items
      
      return positions
    }

    return generateRandomPositions(generateTagItems)
  }, [tagsSignature, generateTagItems])

  const tagItems = tagItemsCacheRef.current.length > 0 ? tagItemsCacheRef.current : generateTagItems

  return (
    <aside className="right-sidebar">
      {loading ? (
        <div className="tags-loading-container">
          <p className="tags-loading">{t('right.loading')}</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="tags-empty-container">
          <p className="tags-empty">{t('right.emptyTags')}</p>
        </div>
      ) : (
        <div className="tag-random-container">
          {tagItems.map((tag, index) => {
            const position = tagPositions[index] || { x: 0, y: 0 }
            // 从缓存中获取动画参数，如果不存在则生成新的
            const animation = positionsCacheRef.current.animations[tag.uniqueId] || {
              duration: 15 + Math.random() * 20,
              delay: Math.random() * 5,
              direction: Math.random() > 0.5 ? 1 : -1
            }
            
            return (
              <div
                key={tag.uniqueId}
                className="tag-random-item"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  '--animation-duration': `${animation.duration}s`,
                  '--animation-delay': `${animation.delay}s`,
                  '--direction': animation.direction,
                }}
              >
                <span className="tag-item-text">{tag.name}</span>
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}

export default RightSidebar

