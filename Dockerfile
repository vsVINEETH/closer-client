# First stage: Build the application
FROM node:alpine3.20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Second stage: Serve with Nginx
FROM nginx:1.23-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy build artifacts from the builder stage
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public

EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
