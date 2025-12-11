FROM node:20-alpine

# Install Docker CLI to run LaTeX containers
RUN apk add --no-cache docker-cli

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY services/compile/package.json ./services/compile/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY services/compile ./services/compile
COPY packages/shared ./packages/shared

# Build packages
RUN cd packages/shared && pnpm build
RUN cd services/compile && pnpm build

WORKDIR /app/services/compile

# Generate Prisma Client
RUN pnpm prisma generate --schema=../../apps/web/prisma/schema.prisma

CMD ["pnpm", "start"]
