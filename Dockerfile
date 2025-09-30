# Step 1: Build Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js app (static export)
RUN npm run build 

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy exported Next.js files to Nginx html folder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
