#!/bin/sh
# Fix ownership of mounted volumes so the node user (uid 1000) can write
chown -R node:node /app/uploads 2>/dev/null || true
exec su-exec node node server.js
