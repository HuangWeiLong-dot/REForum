-- 每日任务表：记录每个用户每天的任务完成情况，支持多端同步
CREATE TABLE IF NOT EXISTS daily_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_date DATE NOT NULL,
    post_completed BOOLEAN NOT NULL DEFAULT FALSE,
    like_completed BOOLEAN NOT NULL DEFAULT FALSE,
    comment_completed BOOLEAN NOT NULL DEFAULT FALSE,
    checkin_completed BOOLEAN NOT NULL DEFAULT FALSE,
    exp_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_tasks_user_date UNIQUE(user_id, task_date)
);

-- 更新 updated_at
CREATE OR REPLACE FUNCTION update_daily_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_tasks_updated_at ON daily_tasks;
CREATE TRIGGER trg_daily_tasks_updated_at
BEFORE UPDATE ON daily_tasks
FOR EACH ROW
EXECUTE FUNCTION update_daily_tasks_updated_at();

COMMENT ON TABLE daily_tasks IS '记录用户每日任务完成状态，支持多端同步与经验奖励';
COMMENT ON COLUMN daily_tasks.task_date IS '任务日期（按天唯一）';
COMMENT ON COLUMN daily_tasks.post_completed IS '发布帖子任务是否完成';
COMMENT ON COLUMN daily_tasks.like_completed IS '点赞任务是否完成';
COMMENT ON COLUMN daily_tasks.comment_completed IS '评论任务是否完成';
COMMENT ON COLUMN daily_tasks.checkin_completed IS '签到任务是否完成';
COMMENT ON COLUMN daily_tasks.exp_earned IS '当日已发放的经验值总和';

