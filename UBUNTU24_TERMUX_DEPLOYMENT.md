# Trump Project 1：Ubuntu 24.04 云服务器 + Termux 部署教程

本文用于把 `Ana913153/Trump-Project-1` 部署到 Ubuntu 24.04 云服务器，并使用 Android 手机上的 Termux 通过 SSH 连接和维护。

当前代码仓库：<https://github.com/Ana913153/Trump-Project-1>

本文适用于本项目当前技术栈：React、Vite、Express、tRPC、Drizzle ORM、MySQL/TiDB。项目生产启动方式是 `pnpm run build` 后执行 `pnpm start`，默认监听 `3000` 端口。

> **重要安全说明：** 不要把数据库密码、JWT 密钥、SSH 私钥、API 密钥或 `.env` 文件提交到 GitHub。所有机密只保存在服务器上的 `/var/www/trump-project-1/.env` 中。

## 一、部署前准备

你需要准备以下信息：

| 项目 | 示例 | 说明 |
|---|---|---|
| 云服务器 | Ubuntu Server 24.04 LTS | 建议至少 2 GB RAM，生产环境建议 4 GB RAM |
| 公网 IP | `203.0.113.10` | 在云服务器控制台查看 |
| 域名 | `example.com` | 可选；正式上线建议使用域名 |
| SSH 用户 | `ubuntu` | 云服务器默认用户可能不同 |
| 数据库 | MySQL 8 / TiDB Cloud | 必须能从应用服务器访问 |
| GitHub 仓库 | `Ana913153/Trump-Project-1` | 默认分支为 `main` |

如果使用 Manus Cloud Computer 且尚未创建服务器，可在 [Cloud Computer 设置](https://manus.im/app#settings/my-computer/create) 创建 Ubuntu 24.04。Basic 计划起价为 **$10/月**；生产网站建议根据流量和内存选择更高配置。创建后，在云电脑管理页面获取公网 IP、用户名、密码和 SSH 命令。

如果你已经有自己的 Ubuntu 24.04 云服务器，直接继续下面步骤即可。

## 二、Termux 安装与连接服务器

### 1. 安装 Termux

建议从 [F-Droid 的 Termux 页面](https://f-droid.org/packages/com.termux/) 安装，不要混用不同来源的 Termux、Termux:API 和插件。

打开 Termux 后执行：

```bash
pkg update -y && pkg upgrade -y
pkg install -y openssh git curl nano vim
```

### 2. 使用密码连接

把下面的 IP 和用户名替换成你的真实信息：

```bash
ssh ubuntu@203.0.113.10
```

首次连接会询问是否信任指纹，确认服务器 IP 无误后输入：

```text
yes
```

然后输入云服务器密码。密码输入时不会显示字符，这是正常现象。

### 3. 推荐：使用 SSH 密钥连接

在 Termux 本地执行：

```bash
ssh-keygen -t ed25519 -C "termux-trump-project"
```

一路按 Enter 使用默认路径；如果需要更高安全性，可以设置密钥密码。

查看公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

复制整行内容，在服务器上执行：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

粘贴公钥，保存后执行：

```bash
chmod 600 ~/.ssh/authorized_keys
```

退出服务器，再从 Termux 测试：

```bash
exit
ssh ubuntu@203.0.113.10
```

确认密钥登录成功后，再关闭密码登录。**不要在密钥登录确认前关闭密码登录。**

## 三、Ubuntu 24.04 初始安全配置

登录服务器后执行：

```bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y ca-certificates curl gnupg git unzip build-essential ufw nginx certbot python3-certbot-nginx mysql-server
```

设置服务器时区为纽约时间，以保持项目业务时间一致：

```bash
sudo timedatectl set-timezone America/New_York
timedatectl
```

开启防火墙。先允许 SSH，再允许网页端口：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

> 不要把 MySQL 的 `3306` 端口开放到公网。应用和数据库在同一台服务器时，使用本机连接；数据库在外部时，只允许服务器 IP 访问数据库。

### 加固 SSH

先确认当前 SSH 密钥登录可用：

```bash
ssh -o PasswordAuthentication=no ubuntu@203.0.113.10
```

确认成功后，在服务器编辑 SSH 配置：

```bash
sudo nano /etc/ssh/sshd_config.d/99-trump-project.conf
```

写入：

```text
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

检查并重启 SSH：

```bash
sudo sshd -t
sudo systemctl restart ssh
```

## 四、安装 Node.js 22 和 pnpm

本项目使用 Node.js 22。推荐使用 NodeSource：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

启用 pnpm：

```bash
sudo corepack enable
sudo corepack prepare pnpm@10.4.1 --activate
pnpm --version
```

如果系统提示 Corepack 不可用，可以使用：

```bash
sudo npm install -g pnpm@10.4.1
pnpm --version
```

## 五、配置 MySQL 数据库

启动并设置开机自动启动：

```bash
sudo systemctl enable --now mysql
sudo systemctl status mysql --no-pager
```

运行基础安全向导：

```bash
sudo mysql_secure_installation
```

创建专用数据库和专用用户。请将密码替换为随机强密码：

```bash
sudo mysql
```

在 MySQL 提示符中执行：

```sql
CREATE DATABASE trump_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trump_app'@'localhost' IDENTIFIED BY '替换为随机强密码';
GRANT ALL PRIVILEGES ON trump_project.* TO 'trump_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

测试数据库登录：

```bash
mysql -u trump_app -p trump_project -e "SELECT 1;"
```

## 六、下载最新 GitHub 源码

建议将生产项目放在 `/var/www/trump-project-1`：

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/Ana913153/Trump-Project-1.git trump-project-1
cd /var/www/trump-project-1
git checkout main
git pull --ff-only origin main
```

检查当前代码：

```bash
git log -1 --oneline
git status --short
```

安装依赖：

```bash
pnpm install --frozen-lockfile
```

## 七、创建生产环境变量

项目读取的关键变量包括：

- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV`
- `PORT`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`

创建权限严格的环境文件：

```bash
cd /var/www/trump-project-1
nano .env
chmod 600 .env
```

基础本地登录部署至少写入：

```dotenv
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://trump_app:替换为随机强密码@127.0.0.1:3306/trump_project
JWT_SECRET=替换为至少64位随机字符串
```

生成 JWT 密钥的方式：

```bash
openssl rand -base64 64
```

将生成结果复制到 `JWT_SECRET=` 后面。

如果你需要 Manus OAuth、对象存储或内置 API，再加入对应的真实值：

```dotenv
VITE_APP_ID=你的真实应用ID
OAUTH_SERVER_URL=你的真实OAuth服务地址
OWNER_OPEN_ID=你的真实Owner Open ID
BUILT_IN_FORGE_API_URL=你的真实内置API地址
BUILT_IN_FORGE_API_KEY=你的真实内置API密钥
```

> 如果没有这些服务的真实配置，不要填写假值。项目的本地邮箱/密码登录可以使用 `JWT_SECRET` 和 MySQL 独立运行；OAuth 和 Manus 内置存储属于额外集成，需要在对应服务中配置生产域名和回调地址。

## 八、初始化数据库并构建项目

先确认环境变量已经加载：

```bash
cd /var/www/trump-project-1
set -a
source .env
set +a
```

执行 Drizzle 迁移：

```bash
pnpm drizzle-kit migrate
```

如果这是全新数据库，也可以执行项目脚本：

```bash
pnpm run db:push
```

生产环境更推荐先在测试环境验证生成的 migration，再执行 `pnpm drizzle-kit migrate`。

运行类型检查、测试和生产构建：

```bash
pnpm run check
pnpm test
pnpm run build
```

启动测试：

```bash
pnpm start
```

另开一个 Termux 会话，测试本机接口：

```bash
curl -I http://127.0.0.1:3000/
```

看到 `HTTP/1.1 200` 或可正常返回页面后，按 `Ctrl+C` 停止测试进程。

## 九、使用 systemd 让网站自动启动

创建服务文件：

```bash
sudo nano /etc/systemd/system/trump-project.service
```

写入：

```ini
[Unit]
Description=Trump Project 1 web application
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/trump-project-1
EnvironmentFile=/var/www/trump-project-1/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

如果你的服务器用户名不是 `ubuntu`，将 `User`、`Group` 和路径权限改成实际用户名。

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now trump-project.service
sudo systemctl status trump-project.service --no-pager
```

查看实时日志：

```bash
sudo journalctl -u trump-project.service -f
```

查看最近 200 行日志：

```bash
sudo journalctl -u trump-project.service -n 200 --no-pager
```

## 十、配置 Nginx 反向代理

先将域名 DNS 的 A 记录指向服务器公网 IP：

```text
example.com      A      203.0.113.10
www.example.com  A      203.0.113.10
```

等待 DNS 生效后测试：

```bash
getent hosts example.com
```

创建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/trump-project
```

写入并替换域名：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }
}
```

启用配置并检查：

```bash
sudo ln -s /etc/nginx/sites-available/trump-project /etc/nginx/sites-enabled/trump-project
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

先访问：

```text
http://example.com
```

## 十一、配置 HTTPS

确认 HTTP 域名已经能访问后执行：

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

按提示输入邮箱并同意协议。测试自动续期：

```bash
sudo certbot renew --dry-run
```

验证 HTTPS：

```bash
curl -I https://example.com/
```

## 十二、首次登录与管理员账户

应用启动时会调用默认管理员初始化逻辑。当前默认管理员为：

```text
Username: admin
Password: Zz123123
```

首次登录后建议立即修改管理员密码，并确认：

1. `/admin` 可以打开后台。
2. 用户注册和登录正常。
3. FAQ、轮播、底部链接、文章可以管理。
4. `/donate` 的 USDC 交易哈希、金额和邮箱可以提交。
5. 后台可以看到 BTC/USDC 捐款记录。
6. 管理员发送站内消息后，用户铃铛可以看到消息。

> 如果公开部署，默认密码只用于首次进入后台。完成初始化后必须修改，并限制后台访问权限。

## 十三、以后从 GitHub 更新代码

每次更新前先备份数据库，然后在服务器执行：

```bash
cd /var/www/trump-project-1
sudo systemctl stop trump-project.service
mysqldump -u trump_app -p trump_project | gzip > "$HOME/trump_project_$(date +%F_%H%M%S).sql.gz"
git fetch origin
git checkout main
git pull --ff-only origin main
pnpm install --frozen-lockfile
set -a
source .env
set +a
pnpm drizzle-kit migrate
pnpm run check
pnpm test
pnpm run build
sudo systemctl start trump-project.service
sudo systemctl status trump-project.service --no-pager
```

如果构建或测试失败，不要启动新版本：

```bash
sudo systemctl start trump-project.service
```

若需要回滚代码：

```bash
git log --oneline -10
git checkout <已验证的提交哈希>
pnpm install --frozen-lockfile
pnpm run build
sudo systemctl restart trump-project.service
```

## 十四、数据库备份与恢复

创建备份目录：

```bash
mkdir -p "$HOME/backups"
```

手动备份：

```bash
mysqldump -u trump_app -p trump_project | gzip > "$HOME/backups/trump_project_$(date +%F_%H%M%S).sql.gz"
```

查看备份：

```bash
ls -lh "$HOME/backups"
```

恢复前先停止应用：

```bash
sudo systemctl stop trump-project.service
```

恢复：

```bash
gunzip -c "$HOME/backups/your_backup.sql.gz" | mysql -u trump_app -p trump_project
sudo systemctl start trump-project.service
```

建议同时使用云服务器提供商的每日磁盘快照。快照和数据库备份用途不同：快照用于整机恢复，`mysqldump` 用于数据库级恢复。

## 十五、常见问题排查

### 1. `502 Bad Gateway`

检查应用是否运行：

```bash
sudo systemctl status trump-project.service --no-pager
sudo journalctl -u trump-project.service -n 100 --no-pager
```

确认 3000 端口是否监听：

```bash
sudo ss -lntp | grep 3000
```

### 2. `DATABASE_URL is required`

检查 systemd 是否读取环境文件：

```bash
sudo systemctl cat trump-project.service
test -r /var/www/trump-project-1/.env && echo OK
```

确认 `.env` 中存在 `DATABASE_URL`，并重启：

```bash
sudo systemctl daemon-reload
sudo systemctl restart trump-project.service
```

### 3. 数据库连接失败

测试 MySQL：

```bash
sudo systemctl status mysql --no-pager
mysql -u trump_app -p trump_project -e "SELECT NOW();"
```

检查连接字符串格式：

```text
mysql://用户名:密码@主机:端口/数据库名
```

密码中如果包含特殊字符，建议 URL 编码，或重新生成只含字母、数字和安全符号的数据库密码。

### 4. Nginx 配置错误

```bash
sudo nginx -t
sudo journalctl -u nginx -n 100 --no-pager
```

### 5. Termux 断开后网站停止

正常情况下，Termux 只是 SSH 管理工具；网站由服务器上的 systemd 运行，不依赖 Termux 是否在线。确认：

```bash
sudo systemctl is-enabled trump-project.service
sudo systemctl is-active trump-project.service
```

### 6. 端口被占用

项目会从 `PORT` 开始寻找可用端口，但 Nginx 应代理到固定端口。因此建议确保 3000 未被其他程序占用：

```bash
sudo ss -lntp | grep 3000
```

### 7. 上传图片或 Manus 内置服务不可用

本项目部分存储/API 能力依赖 `BUILT_IN_FORGE_API_URL` 和 `BUILT_IN_FORGE_API_KEY`。独立 Ubuntu 部署时，如果没有这些真实配置，基础页面、MySQL、邮箱密码登录和本地业务功能可以运行，但依赖 Manus 内置存储/API 的功能需要单独替换为 S3、Cloudflare R2 或其他对象存储服务。

## 十六、Termux 常用维护命令

```bash
# 连接
ssh ubuntu@203.0.113.10

# 查看网站状态
sudo systemctl status trump-project.service --no-pager

# 重启网站
sudo systemctl restart trump-project.service

# 查看日志
sudo journalctl -u trump-project.service -f

# 查看 Nginx 状态
sudo systemctl status nginx --no-pager

# 查看磁盘
 df -h

# 查看内存
 free -h

# 查看端口
 sudo ss -lntp

# 更新系统
 sudo apt update && sudo apt upgrade -y
```

## 十七、推荐上线检查清单

- [ ] SSH 密钥登录成功，密码登录已关闭。
- [ ] UFW 只开放 22、80、443。
- [ ] MySQL 没有开放公网 3306。
- [ ] `.env` 权限为 `600`，没有提交到 GitHub。
- [ ] `JWT_SECRET` 已替换为随机密钥。
- [ ] `pnpm run check` 通过。
- [ ] `pnpm test` 通过。
- [ ] `pnpm run build` 通过。
- [ ] systemd 已启用并能开机自动启动。
- [ ] Nginx 配置检查通过。
- [ ] HTTPS 证书已签发并通过自动续期测试。
- [ ] 已完成数据库备份和恢复演练。
- [ ] 已修改默认管理员密码。
- [ ] 已测试注册、登录、后台、FAQ、轮播、底部页面和 BTC/USDC 捐款记录。

完成上述步骤后，用户可以用浏览器访问 `https://你的域名/`，管理员访问 `https://你的域名/admin`，Termux 继续用于 SSH 运维。 
