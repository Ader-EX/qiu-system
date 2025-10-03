# Build
FROM node:20-alpine AS builder
WORKDIR /app

# Accept the build arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Build with env injected
RUN npm run build

# Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy build output
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "run", "start"]
