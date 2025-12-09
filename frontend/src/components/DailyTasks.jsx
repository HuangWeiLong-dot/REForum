import React, { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { getTodayTasks, getCompletedTasksCount, updateTask } from '../utils/dailyTasks'
import { TASK_EXP } from '../utils/levelSystem'
import './DailyTasks.css'

const DailyTasks = () => {
  const { t } = useLanguage()
  const { user, updateUser } = useAuth()
  const [tasks, setTasks] = useState({ date: '', post: false, like: false, comment: false, checkin: false })
  const [exp, setExp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const completedCount = getCompletedTasksCount(tasks)

  const taskList = [
    { key: 'post', label: t('tasks.post'), completed: tasks.post, exp: TASK_EXP.POST },
    { key: 'like', label: t('tasks.like'), completed: tasks.like, exp: TASK_EXP.LIKE },
    { key: 'comment', label: t('tasks.comment'), completed: tasks.comment, exp: TASK_EXP.COMMENT },
    { key: 'checkin', label: t('tasks.checkin'), completed: tasks.checkin, exp: TASK_EXP.CHECKIN, actionable: true },
  ]

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    const res = await getTodayTasks(user)
    setTasks(res.tasks)
    setExp(res.exp)
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleComplete = async (taskKey) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    const result = await updateTask(taskKey, user)
    if (result.success) {
      if (result.tasks) setTasks(result.tasks)
      if (typeof result.exp === 'number') {
        setExp(result.exp)
        if (user) {
          updateUser({ ...user, exp: result.exp })
        }
      }
    } else {
      setError(result.error || t('tasks.error'))
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="daily-tasks">
        <div className="tasks-header">
          <h3 className="tasks-title">{t('tasks.title')}</h3>
          <span className="tasks-progress">...</span>
        </div>
        <div className="tasks-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="task-item skeleton-task"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="daily-tasks">
      <div className="tasks-header">
        <h3 className="tasks-title">{t('tasks.title')}</h3>
        <span className="tasks-progress">
          {completedCount}/4 {t('tasks.completed')}
        </span>
      </div>
      <div className="tasks-list">
        {taskList.map((task) => (
          <div
            key={task.key}
            className={`task-item ${task.completed ? 'completed' : ''}`}
          >
            <div className="task-content">
              {task.completed && (
                <span className="task-checkmark">✓</span>
              )}
              <span className="task-label">{task.label}</span>
            </div>
            <div className="task-actions">
              <span className="task-exp">+{task.exp} {t('tasks.exp')}</span>
              {task.actionable && !task.completed && (
                <button
                  className="task-action-button"
                  onClick={() => handleComplete(task.key)}
                  disabled={submitting}
                >
                  {submitting ? t('tasks.completing') : t('tasks.doCheckin')}
                </button>
              )}
              {task.actionable && task.completed && (
                <span className="task-done-label">{t('tasks.done')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {completedCount === 4 && (
        <div className="tasks-completed-message">
          {t('tasks.allCompleted')}
        </div>
      )}
      {error && <div className="task-error">{error}</div>}
    </div>
  )
}

export default DailyTasks

