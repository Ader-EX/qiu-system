# ---------- build stage ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps (use npm, pnpm, or yarn — pick one)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy rest and build
COPY . .

# If you're on Next 13/14 app router and want a static export, add in next.config.js:  output: 'export'
# Build with any public envs passed as --build-arg (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN npm run build

# Export static files (for classic pages router use `next export`; for app router with output: 'export', this copies .next/export)
# Try export; if not configured, fall back to using .next/static+pages
RUN npm run export || (echo "No 'export' script; trying to copy .next/static build" && mkdir -p out && cp -r public/* out/ 2>/dev/null || true && cp -r .next/static out/_next/static)

# ---------- run stage ----------
FROM nginx:1.27-alpine AS runner

# Remove default site and add our config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the exported site into Nginx html root
COPY --from=builder /app/out /usr/share/nginx/html

# (Optional) basic healthcheck
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
