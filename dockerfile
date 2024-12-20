# Stage 0: Base image
FROM packages.aa.com/docker-all/node:18-buster as base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app

COPY package*.json /app/

RUN --mount=type=secret,id=npmrc,dst=/root/.npmrc npm ci

RUN rm -f .npmrc

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN npm run build

# Stage 3: Run the application
FROM base AS runner
WORKDIR /app

COPY --from=builder /app .

# Expose the port the app runs on
EXPOSE 3000
# Set environment variables, if needed
ENV PORT 3000

# Define the command to run the application
CMD ["npm", "start"]
