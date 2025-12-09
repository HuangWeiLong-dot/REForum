import { query, getClient } from '../config/database.js';

const TASK_EXP = {
  post: 30,
  like: 30,
  comment: 30,
  checkin: 30,
};

class DailyTask {
  static async getOrCreateToday(userId) {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const result = await query(
        `SELECT id, user_id, task_date, post_completed, like_completed, comment_completed, checkin_completed, exp_earned
         FROM daily_tasks
         WHERE user_id = $1 AND task_date = $2`,
        [userId, today]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      const insertResult = await query(
        `INSERT INTO daily_tasks (user_id, task_date)
         VALUES ($1, $2)
         ON CONFLICT (user_id, task_date) DO UPDATE SET task_date = EXCLUDED.task_date
         RETURNING id, user_id, task_date, post_completed, like_completed, comment_completed, checkin_completed, exp_earned`,
        [userId, today]
      );

      return insertResult.rows[0];
    } catch (error) {
      // 如果表不存在（未执行迁移），返回基础数据防止接口 500
      if (error.code === '42P01' || error.message?.includes('relation "daily_tasks" does not exist')) {
        return {
          id: null,
          user_id: userId,
          task_date: today,
          post_completed: false,
          like_completed: false,
          comment_completed: false,
          checkin_completed: false,
          exp_earned: 0,
        };
      }
      throw error;
    }
  }

  static async completeTask(userId, taskType) {
    const normalized = String(taskType || '').toLowerCase();
    if (!['post', 'like', 'comment', 'checkin'].includes(normalized)) {
      const err = new Error('INVALID_TASK');
      err.status = 400;
      throw err;
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const today = new Date().toISOString().slice(0, 10);
      const lockRes = await client.query(
        `SELECT id, post_completed, like_completed, comment_completed, checkin_completed, exp_earned
         FROM daily_tasks
         WHERE user_id = $1 AND task_date = $2
         FOR UPDATE`,
        [userId, today]
      );

      let taskRow = lockRes.rows[0];
      if (!taskRow) {
        const insertRes = await client.query(
          `INSERT INTO daily_tasks (user_id, task_date)
           VALUES ($1, $2)
           RETURNING id, post_completed, like_completed, comment_completed, checkin_completed, exp_earned`,
          [userId, today]
        );
        taskRow = insertRes.rows[0];
      }

      const columnMap = {
        post: 'post_completed',
        like: 'like_completed',
        comment: 'comment_completed',
        checkin: 'checkin_completed',
      };
      const column = columnMap[normalized];

      // 已完成则直接返回
      if (taskRow[column]) {
        await client.query('COMMIT');
        return { alreadyCompleted: true, expAdded: 0, tasks: { ...taskRow, task_date: today } };
      }

      const expReward = TASK_EXP[normalized] || 0;

      // 更新任务完成状态
      await client.query(
        `UPDATE daily_tasks
         SET ${column} = TRUE,
             exp_earned = exp_earned + $1,
             updated_at = NOW()
         WHERE user_id = $2 AND task_date = $3`,
        [expReward, userId, today]
      );

      // 更新用户经验
      const userRes = await client.query(
        `UPDATE users
         SET exp = COALESCE(exp, 0) + $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING exp`,
        [expReward, userId]
      );

      const refreshed = await client.query(
        `SELECT id, post_completed, like_completed, comment_completed, checkin_completed, exp_earned
         FROM daily_tasks
         WHERE user_id = $1 AND task_date = $2`,
        [userId, today]
      );

      await client.query('COMMIT');
      return {
        alreadyCompleted: false,
        expAdded: expReward,
        tasks: { ...refreshed.rows[0], task_date: today },
        currentExp: parseInt(userRes.rows[0]?.exp || 0, 10),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      // 如果表不存在（未迁移），返回兜底结果，不阻断前端
      if (error.code === '42P01' || error.message?.includes('daily_tasks')) {
        return {
          alreadyCompleted: false,
          expAdded: 0,
          tasks: {
            task_date: new Date().toISOString().slice(0, 10),
            post_completed: normalized === 'post',
            like_completed: normalized === 'like',
            comment_completed: normalized === 'comment',
            checkin_completed: normalized === 'checkin',
          },
          currentExp: null,
        };
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

export default DailyTask;

