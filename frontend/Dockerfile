FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3100 \
    HOST=0.0.0.0

# Copy only what is necessary to run an already-built Next.js app.
COPY package.json package-lock.json ./
COPY .next ./.next
COPY public ./public
COPY node_modules ./node_modules

EXPOSE 3100

CMD ["node_modules/.bin/next", "start", "-p", "3100"]
