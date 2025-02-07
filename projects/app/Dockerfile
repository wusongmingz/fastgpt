# --------- install dependence -----------
  FROM node:20.14.0-alpine AS maindeps
  WORKDIR /app
  
  ARG proxy
  
  RUN [ -z "$proxy" ] || sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
  RUN npm config set registry https://registry.npmmirror.com
  RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.4.0
  
  # Copy project dependency files
  COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./ 
  COPY ./packages ./packages
  COPY ./projects/app/package.json ./projects/app/package.json
  
  RUN [ -f pnpm-lock.yaml ] || (echo "Lockfile not found." && exit 1)
  
  RUN if [ -z "$proxy" ]; then \
          pnpm i; \
      else \
          pnpm i --registry=https://registry.npmmirror.com; \
      fi
  
  # --------- builder -----------
  FROM node:20.14.0-alpine AS builder
  WORKDIR /app
  
  ARG proxy
  ARG base_url
  
  # Copy project files and node_modules
  COPY package.json pnpm-workspace.yaml .npmrc tsconfig.json ./ 
  COPY --from=maindeps /app/node_modules ./node_modules
  COPY --from=maindeps /app/packages ./packages
  COPY ./projects/app ./projects/app
  COPY --from=maindeps /app/projects/app/node_modules ./projects/app/node_modules
  
  RUN [ -z "$proxy" ] || sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
  # 使用淘宝镜像源
  RUN npm config set registry https://registry.npmmirror.com

  RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.4.0
  
  # Copy .env.local for build context
  COPY ./projects/app/.env.local ./projects/app/.env.local
  
  # Set environment variables
  ENV NODE_OPTIONS="--max-old-space-size=4096"
  ENV NEXT_PUBLIC_BASE_URL=$base_url
  
  # Build project
  RUN pnpm --filter=app build
  
  # --------- runner -----------
  FROM node:20.14.0-alpine AS runner
  WORKDIR /app
  
  ARG proxy
  ARG base_url
  
  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs
  
  RUN [ -z "$proxy" ] || sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
  RUN apk add --no-cache curl ca-certificates \
    && update-ca-certificates
  
  # Copy built project and assets
  COPY --from=builder /app/projects/app/public /app/projects/app/public
  COPY --from=builder /app/projects/app/next.config.js /app/projects/app/next.config.js
  COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/standalone /app/
  COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/static /app/projects/app/.next/static
  COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/server/chunks /app/projects/app/.next/server/chunks
  COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/server/worker /app/projects/app/.next/server/worker
  
  # Copy additional dependencies
  COPY --from=maindeps /app/node_modules/tiktoken ./node_modules/tiktoken
  RUN rm -rf ./node_modules/tiktoken/encoders
  COPY --from=maindeps /app/node_modules/@zilliz/milvus2-sdk-node ./node_modules/@zilliz/milvus2-sdk-node
  
  # Copy app data and configs
  COPY ./projects/app/data /app/data
  COPY ./projects/app/.env.local ./projects/app/.env.local
  COPY ./projects/app/data/config.local.json ./app/data/config.local.json
  RUN chown -R nextjs:nodejs /app/data
  
  ENV NODE_ENV=production
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV PORT=3000
  ENV NEXT_PUBLIC_BASE_URL=$base_url
  
  EXPOSE 3000
  
  USER nextjs
  
  ENV serverPath=./projects/app/server.js
  
  ENTRYPOINT ["sh", "-c", "node --max-old-space-size=4096 ${serverPath}"]
  