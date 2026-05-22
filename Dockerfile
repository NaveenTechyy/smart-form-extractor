# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies required by canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    pixman-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build app
RUN npm run build


# Production stage
FROM nginx:alpine

# Remove default files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:10000 || exit 1

# Expose Render port
EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]