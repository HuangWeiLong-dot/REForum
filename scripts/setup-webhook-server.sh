#!/bin/bash

# 设置 Webhook 服务器脚本
# 在服务器上运行此脚本来设置 webhook 监听器

set -e

echo "🔧 Setting up webhook server..."

# 安装 webhook 工具（如果未安装）
if ! command -v webhook &> /dev/null; then
    echo "📦 Installing webhook..."
    wget https://github.com/adnanh/webhook/releases/latest/download/webhook-linux-amd64.tar.gz
    tar -xzf webhook-linux-amd64.tar.gz
    sudo mv webhook-linux-amd64/webhook /usr/local/bin/
    rm -rf webhook-linux-amd64*
fi

# 创建 webhook 配置目录
sudo mkdir -p /etc/webhook
sudo mkdir -p /var/log/webhook

# 创建 webhook 配置文件
sudo tee /etc/webhook/hooks.json > /dev/null <<EOF
[
  {
    "id": "reforum-deploy",
    "execute-command": "/opt/ReForum/scripts/webhook-deploy.sh",
    "command-working-directory": "/opt/ReForum",
    "pass-arguments-to-command": [
      {
        "source": "payload",
        "name": "ref"
      }
    ],
    "trigger-rule": {
      "match": {
        "type": "payload-hmac-sha256",
        "secret": "YOUR_WEBHOOK_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
EOF

# 创建 systemd 服务
sudo tee /etc/systemd/system/webhook.service > /dev/null <<EOF
[Unit]
Description=Webhook Server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/webhook -hooks /etc/webhook/hooks.json -verbose -logfile /var/log/webhook/webhook.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable webhook
sudo systemctl start webhook

echo "✅ Webhook server setup completed!"
echo "📝 Webhook URL: http://YOUR_SERVER_IP:9000/hooks/reforum-deploy"
echo "🔑 Remember to update the secret in /etc/webhook/hooks.json"
echo "📋 Check logs: sudo journalctl -u webhook -f"

