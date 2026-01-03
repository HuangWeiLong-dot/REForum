import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'

const LoaderContext = createContext()

export const useLoader = () => {
  const context = useContext(LoaderContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }
  return context
}

export const LoaderProvider = ({ children }) => {
  const [resources, setResources] = useState({
    auth: { loaded: false, weight: 0.2 },
    posts: { loaded: false, weight: 0.5 },
    categories: { loaded: false, weight: 0.15 },
    user: { loaded: false, weight: 0.15 }
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // 超时保护：如果10秒后还有资源未加载，自动标记为已加载
  // 在所有环境中启用，避免生产环境下应用卡在加载状态
  useEffect(() => {
    const timeout = setTimeout(() => {
      // 检查哪些资源未加载
      const unloadedResources = Object.keys(resources).filter(key => !resources[key].loaded)
      if (unloadedResources.length > 0) {
        console.warn(`超时保护：自动标记以下资源为已加载：${unloadedResources.join(', ')}`)
        // 标记所有未加载的资源为已加载
        setResources(prev => {
          const updated = { ...prev }
          unloadedResources.forEach(key => {
            updated[key].loaded = true
          })
          return updated
        })
      }
    }, 10000) // 10秒超时
    
    return () => clearTimeout(timeout)
  }, [resources])

  // 计算当前进度
  const calculateProgress = useCallback(() => {
    const totalWeight = Object.values(resources).reduce((sum, resource) => sum + resource.weight, 0)
    const loadedWeight = Object.values(resources).reduce((sum, resource) => {
      return sum + (resource.loaded ? resource.weight : 0)
    }, 0)
    
    return Math.round((loadedWeight / totalWeight) * 100)
  }, [resources])

  // 标记资源已加载
  const markResourceLoaded = useCallback((resourceName) => {
    setResources(prev => {
      const updated = {
        ...prev,
        [resourceName]: { ...prev[resourceName], loaded: true }
      }
      return updated
    })
  }, [])

  // 重置加载状态
  const resetLoader = useCallback(() => {
    setResources({
      auth: { loaded: false, weight: 0.2 },
      posts: { loaded: false, weight: 0.5 },
      categories: { loaded: false, weight: 0.15 },
      user: { loaded: false, weight: 0.15 }
    })
    setIsLoading(true)
  }, [])

  // 检查是否所有资源都已加载
  React.useEffect(() => {
    const allLoaded = Object.values(resources).every(resource => resource.loaded)
    setIsLoading(!allLoaded)
  }, [resources])

  const value = {
    resources,
    isLoading,
    progress: calculateProgress(),
    markResourceLoaded,
    resetLoader
  }

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  )
}
