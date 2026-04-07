# Stage 1: Install dependencies
FROM node:current-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --loglevel=error

# Stage 2: Build
FROM node:current-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:current-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Standalone output + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/sql ./sql

# Default icons and recipe photos baked into the image (all themes)
COPY --from=builder /app/uploads/icons ./uploads/icons
COPY --from=builder /app/uploads/recipes ./uploads/recipes

# Ensure writable by node user
RUN chown -R node:node ./uploads

USER node
EXPOSE 3000
CMD ["node", "server.js"]
