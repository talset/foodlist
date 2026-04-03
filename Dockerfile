# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Standalone output + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Default icons baked into the image
COPY --from=builder /app/uploads/icons/default ./uploads/icons/default

# Mount point for user-uploaded icons (custom only)
RUN mkdir -p ./uploads/icons/custom && chown node:node ./uploads/icons/custom

USER node
EXPOSE 3000
CMD ["node", "server.js"]
