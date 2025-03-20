# First stage: Build the Next.js application
FROM node:alpine3.20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Second stage: Run the Next.js server
FROM node:alpine3.20

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copy built application from previous stage
COPY --from=builder /app /app

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
