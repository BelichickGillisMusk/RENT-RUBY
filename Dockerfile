FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/data/rentroll_v3.db

EXPOSE 8080

CMD ["npm", "start"]
