// 每日任务系统（服务端同步 + 测试用户本地模式）
import { userAPI } from '../services/api'
import { TASK_EXP } from './levelSystem'

const EXP_STORAGE_KEY = 'user_exp'
const TASK_STORAGE_PREFIX = 'daily_tasks_'

const getTodayString = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

const isTestUser = () => {
  const token = localStorage.getItem('token')
  const tokenStr = String(token || '')
  return tokenStr.startsWith('test-token-')
}

const getLocalTaskKey = (userId = 'guest') => `${TASK_STORAGE_PREFIX}${userId}`

const getLocalTasks = (user = null) => {
  const today = getTodayString()
  const userId = user?.id || 'test-user'
  const stored = localStorage.getItem(getLocalTaskKey(userId))
  const base = { date: today, post: false, like: false, comment: false, checkin: false }
  if (!stored) return base
  try {
    const parsed = JSON.parse(stored)
    if (parsed.date !== today) return base
    return { ...base, ...parsed }
  } catch {
    return base
  }
}

const saveLocalTasks = (tasks, user = null) => {
  const userId = user?.id || 'test-user'
  localStorage.setItem(getLocalTaskKey(userId), JSON.stringify(tasks))
}

export const getUserExp = (user = null) => {
  if (user && (user.exp !== undefined && user.exp !== null)) {
    const userId = String(user.id || '')
    if (userId.startsWith('test-user-') || userId === 'test-user-001') {
      return user.exp
    }
    return user.exp
  }

  const stored = localStorage.getItem(EXP_STORAGE_KEY)
  const token = localStorage.getItem('token')
  const tokenStr = String(token || '')
  if (tokenStr.startsWith('test-token-')) {
    const testUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (testUser.exp !== undefined && testUser.exp !== null) {
      return testUser.exp
    }
    const exp70 = 15000
    setUserExp(exp70)
    return exp70
  }
  return stored ? parseInt(stored, 10) : 0
}

export const setUserExp = (exp) => {
  localStorage.setItem(EXP_STORAGE_KEY, String(exp))
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser)
      parsed.exp = exp
      localStorage.setItem('user', JSON.stringify(parsed))
    } catch {
      /* ignore */
    }
  }
}

export const getTodayTasks = async (user = null) => {
  const today = getTodayString()

  // 测试用户：本地模式
  if (isTestUser()) {
    const tasks = getLocalTasks(user)
    return { tasks, exp: getUserExp(user), from: 'local' }
  }

  // 正式用户：走后端
  try {
    const res = await userAPI.getDailyTasks()
    const tasks = res.data?.tasks || { date: today, post: false, like: false, comment: false, checkin: false }
    const exp = res.data?.exp ?? getUserExp(user)
    setUserExp(exp)
    return { tasks, exp, from: 'server' }
  } catch (error) {
    console.error('获取每日任务失败，使用本地兜底:', error)
    const fallback = { date: today, post: false, like: false, comment: false, checkin: false }
    return { tasks: fallback, exp: getUserExp(user), from: 'fallback' }
  }
}

// 完成任务（返回 {success, expAdded, alreadyCompleted, tasks, exp}）
export const updateTask = async (taskType, user = null) => {
  const normalized = String(taskType || '').toLowerCase()
  if (!['post', 'like', 'comment', 'checkin'].includes(normalized)) {
    return { success: false, error: 'INVALID_TASK' }
  }

  // 测试用户：本地模拟
  if (isTestUser()) {
    const tasks = getLocalTasks(user)
    if (tasks[normalized]) {
      return { success: true, alreadyCompleted: true, expAdded: 0, tasks, exp: getUserExp(user) }
    }
    const expAdded = TASK_EXP[normalized.toUpperCase()] || 0
    const updated = { ...tasks, [normalized]: true }
    saveLocalTasks(updated, user)
    const newExp = getUserExp(user) + expAdded
    setUserExp(newExp)
    return { success: true, alreadyCompleted: false, expAdded, tasks: updated, exp: newExp }
  }

  // 正式用户：调用后端
  try {
    const res = await userAPI.completeDailyTask({ taskType: normalized })
    const exp = res.data?.exp ?? getUserExp(user)
    setUserExp(exp)
    return {
      success: true,
      alreadyCompleted: !!res.data?.alreadyCompleted,
      expAdded: res.data?.expAdded ?? 0,
      tasks: res.data?.tasks,
      exp,
    }
  } catch (error) {
    console.error('完成任务失败:', error)
    return { success: false, error: error.response?.data?.message || 'COMPLETE_TASK_FAILED' }
  }
}

export const getCompletedTasksCount = (tasks) => {
  if (!tasks) return 0
  let count = 0
  if (tasks.post) count++
  if (tasks.like) count++
  if (tasks.comment) count++
  if (tasks.checkin) count++
  return count
}

