FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy package files
COPY services/yjs-server/package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY services/yjs-server/src ./src
COPY services/yjs-server/tsconfig.json ./

# Build
RUN pnpm build

EXPOSE 1234

CMD ["pnpm", "start"]
