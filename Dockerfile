FROM oven/bun:1 AS base
WORKDIR /usr/src/app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3010

CMD ["sh", "-c", "bun drizzle-kit migrate && bun run src/index.ts"]