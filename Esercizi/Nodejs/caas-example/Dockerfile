###########################################
# Stage 1: Build
###########################################
FROM node:25-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build


###########################################
# Stage 2: Production
###########################################

FROM node:25-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --chown=nodejs:nodejs --from=build /app/dist ./src   


USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', res => { process.exit(res.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1));"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]