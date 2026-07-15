FROM node:22-bookworm-slim AS deps

WORKDIR /app

# Needed to install git-based dependencies.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile --non-interactive


FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

# ffmpeg is required by media-related plugins; git supports runtime plugin dependency installs.
# XPChat -> text2png pulls canvas, which needs native toolchain/libs.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ffmpeg git ca-certificates \
    python3 make g++ pkg-config \
    libcairo2-dev libpango1.0-dev libjpeg62-turbo-dev libgif-dev libpixman-1-dev libpng-dev \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare yarn@1.22.22 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure writable runtime directories for the non-root user.
RUN mkdir -p logs data update config/plugins plugins/cache \
    && chown -R node:node /app

USER node

CMD ["node", "src/main.js"]