# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full source code
COPY . .

# Build Vite client assets and bundle server.ts with esbuild
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy package definition for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

# Expose server port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
