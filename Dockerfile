# ---------- build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-fund --no-audit
COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.d/30-render-env-config.sh
RUN chmod +x /docker-entrypoint.d/30-render-env-config.sh
EXPOSE 80
