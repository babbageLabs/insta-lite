# Stage 1: Development
FROM node:20-alpine AS development

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Set NODE_ENV
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]