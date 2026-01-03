# -------- 构建阶段 --------
FROM node:lts AS builder

WORKDIR /app

# 只复制依赖定义文件（能最大化缓存利用率）
COPY package-lock.json package.json ./

# 安装依赖（包括 devDependencies 用于构建）
RUN npm ci

# 复制项目源码并构建
COPY . .
RUN npm run build:full

# -------- 运行阶段 --------
FROM node:lts-alpine AS runner

WORKDIR /app

# 复制构建产物（dist 包含所有打包后的代码）
COPY --from=builder /app/dist ./

# 暴露端口（HTTP/HTTPS + WebSocket 共用同一端口）
EXPOSE 8089

# 使用非 root 用户运行
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8089/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# 使用 ENTRYPOINT 启动服务器
ENTRYPOINT ["node", "noname-server.cjs", "--server"]
