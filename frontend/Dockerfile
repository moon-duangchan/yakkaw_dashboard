FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3100 \
    HOST=0.0.0.0

# Copy the standalone server bundle produced by `next build`.
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

EXPOSE 3100

CMD ["node", "server.js"]
