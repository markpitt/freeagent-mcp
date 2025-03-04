FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm install
RUN npm run build

FROM node:20-slim AS release

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

RUN npm ci --ignore-scripts --omit=dev

ENTRYPOINT ["node", "build/index.js"]
