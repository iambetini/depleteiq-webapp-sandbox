# --- Build Stage ---
FROM node:18-bullseye AS builder
WORKDIR /app
# Accept the full .env file contents
ARG ENV_FILE_CONTENT

# Write the file so Next.js can read env during build
RUN echo "$ENV_FILE_CONTENT" > .env.production

# Copy package files
COPY package.json package-lock.json ./

# Install dependencie
RUN npm ci

# Copy source files
COPY . .

# Build Next.js file
RUN npm run build

# --- Production Stage ---
FROM node:18-bullseye AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary build + runtime file
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install only production dep
COPY package-lock.json ./
RUN npm ci --omit=dev

# Create non-root user for apps
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
