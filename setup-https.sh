#!/bin/bash

# 配置HTTPS脚本
# 使用方法：bash setup-https.sh

DOMAIN="api.fishfairy.com"
EMAIL="your-email@example.com"  # 替换为你的邮箱

echo "=== 开始配置HTTPS ==="

# 1. 更新系统并安装必要软件
echo "1. 安装Nginx和Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# 2. 备份原有Nginx配置
echo "2. 备份Nginx配置..."
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# 3. 创建临时HTTP配置（用于申请证书）
echo "3. 配置临时HTTP服务..."
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 4. 测试并重启Nginx
echo "4. 重启Nginx..."
nginx -t && systemctl restart nginx

# 5. 申请SSL证书
echo "5. 申请SSL证书..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# 6. 配置HTTPS
echo "6. 配置HTTPS..."
cat > /etc/nginx/sites-available/default <<EOF
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 安全headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# 7. 测试并重启Nginx
echo "7. 应用HTTPS配置..."
nginx -t && systemctl restart nginx

# 8. 设置证书自动续期
echo "8. 配置证书自动续期..."
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "=== HTTPS配置完成 ==="
echo "请访问 https://$DOMAIN 测试"
echo ""
echo "下一步："
echo "1. 修改小程序 utils/config.js 中的 apiBaseUrl 为: https://$DOMAIN/api"
echo "2. 在微信公众平台添加服务器域名: https://$DOMAIN"
