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

# Pristine copy of baked-in assets (never shadowed by volume mount)
COPY --from=builder /app/uploads/icons ./seed-assets/icons
COPY --from=builder /app/uploads/recipes ./seed-assets/recipes

# Ensure writable by node user
RUN chown -R node:node ./uploads ./seed-assets

# Entrypoint fixes volume permissions then drops to node user
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && apk add --no-cache su-exec

EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
