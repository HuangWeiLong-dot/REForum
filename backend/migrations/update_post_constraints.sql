-- 修改 posts 表的约束，允许标题最少1个字符且内容可选

-- 1. 删除原有的标题长度约束
ALTER TABLE posts DROP CONSTRAINT IF EXISTS title_length;

-- 2. 添加新的标题长度约束（最短1个字符）
ALTER TABLE posts ADD CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200);

-- 3. 修改content列，允许为空
ALTER TABLE posts ALTER COLUMN content DROP NOT NULL;

-- 4. 删除原有的内容长度约束
ALTER TABLE posts DROP CONSTRAINT IF EXISTS content_length;