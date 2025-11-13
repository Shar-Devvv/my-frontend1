# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy only package files first (for caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files into the container
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Run the built app
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy environment file (if needed)
# Make sure not to include secrets in production builds
COPY --from=builder /app/.env.local ./.env.local

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port 3000
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]
