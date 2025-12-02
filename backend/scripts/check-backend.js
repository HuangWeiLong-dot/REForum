#!/usr/bin/env node

/**
 * 后端服务诊断脚本
 * 用于检查后端服务状态、数据库连接等
 */

import dotenv from 'dotenv';
import pg from 'pg';
import http from 'http';

dotenv.config();

const { Pool } = pg;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50));
}

// 检查环境变量
function checkEnvironmentVariables() {
  logSection('📋 检查环境变量');
  
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
  ];
  
  const optionalVars = [
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL',
    'RESEND_API_KEY',
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName}: 已设置`, 'green');
    } else {
      log(`❌ ${varName}: 未设置（必需）`, 'red');
      allPresent = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName}: ${process.env[varName]}`, 'green');
    } else {
      log(`⚠️  ${varName}: 未设置（可选）`, 'yellow');
    }
  });
  
  return allPresent;
}

// 检查数据库连接
async function checkDatabaseConnection() {
  logSection('🗄️  检查数据库连接');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'reforum',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    log('正在连接数据库...', 'blue');
    const result = await pool.query('SELECT NOW(), version()');
    log('✅ 数据库连接成功！', 'green');
    log(`   时间: ${result.rows[0].now}`, 'blue');
    log(`   版本: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`, 'blue');
    
    // 检查必要的表是否存在
    log('\n检查数据库表...', 'blue');
    const tables = ['users', 'posts', 'comments', 'categories', 'tags', 'notifications'];
    for (const table of tables) {
      try {
        const tableCheck = await pool.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table]
        );
        if (tableCheck.rows[0].exists) {
          log(`✅ 表 ${table} 存在`, 'green');
        } else {
          log(`❌ 表 ${table} 不存在`, 'red');
        }
      } catch (err) {
        log(`❌ 检查表 ${table} 时出错: ${err.message}`, 'red');
      }
    }
    
    // 检查帖子数量
    try {
      const postCount = await pool.query('SELECT COUNT(*) FROM posts');
      log(`\n📊 当前帖子数量: ${postCount.rows[0].count}`, 'blue');
    } catch (err) {
      log(`⚠️  无法查询帖子数量: ${err.message}`, 'yellow');
    }
    
    await pool.end();
    return true;
  } catch (error) {
    log('❌ 数据库连接失败！', 'red');
    log(`   错误: ${error.message}`, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('\n💡 提示:', 'yellow');
      log('   1. 确认 PostgreSQL 服务正在运行', 'yellow');
      log('   2. 检查 DB_HOST 和 DB_PORT 配置是否正确', 'yellow');
      log('   3. 如果使用 Docker，确认容器已启动', 'yellow');
    } else if (error.code === '28P01') {
      log('\n💡 提示: 用户名或密码错误', 'yellow');
    } else if (error.code === '3D000') {
      log('\n💡 提示: 数据库不存在，请先创建数据库', 'yellow');
    }
    
    await pool.end().catch(() => {});
    return false;
  }
}

// 检查后端服务
function checkBackendService() {
  return new Promise((resolve) => {
    logSection('🚀 检查后端服务');
    
    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}/health`;
    
    log(`正在检查服务: ${url}`, 'blue');
    
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'ok') {
            log('✅ 后端服务运行正常！', 'green');
            log(`   状态: ${result.status}`, 'blue');
            log(`   数据库: ${result.database}`, result.database === 'connected' ? 'green' : 'red');
            resolve(true);
          } else {
            log('⚠️  后端服务响应异常', 'yellow');
            log(`   状态: ${result.status}`, 'yellow');
            log(`   数据库: ${result.database}`, 'yellow');
            resolve(false);
          }
        } catch (err) {
          log('⚠️  无法解析服务响应', 'yellow');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      log('❌ 无法连接到后端服务！', 'red');
      log(`   错误: ${error.message}`, 'red');
      log('\n💡 提示:', 'yellow');
      log('   1. 确认后端服务已启动（运行 npm run dev）', 'yellow');
      log(`   2. 检查服务是否在端口 ${port} 上运行`, 'yellow');
      log('   3. 查看后端控制台是否有错误信息', 'yellow');
      resolve(false);
    });
    
    req.on('timeout', () => {
      log('❌ 连接超时！', 'red');
      req.destroy();
      resolve(false);
    });
  });
}

// 主函数
async function main() {
  log('\n🔍 REForum 后端诊断工具\n', 'cyan');
  
  const envOk = checkEnvironmentVariables();
  if (!envOk) {
    log('\n⚠️  警告: 部分必需的环境变量未设置', 'yellow');
    log('   请检查 backend/.env 文件是否存在并配置正确', 'yellow');
  }
  
  const dbOk = await checkDatabaseConnection();
  const serviceOk = await checkBackendService();
  
  // 总结
  logSection('📊 诊断总结');
  
  if (envOk && dbOk && serviceOk) {
    log('✅ 所有检查通过！后端服务应该可以正常工作。', 'green');
    process.exit(0);
  } else {
    log('❌ 发现问题，请根据上述提示进行修复。', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ 诊断过程中发生错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

