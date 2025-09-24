# Use Coolify helper image as base
FROM ghcr.io/coollabsio/coolify-helper:1.0.11

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install nginx for serving
RUN apk add --no-cache nginx

# Create nginx directory and copy built assets
RUN mkdir -p /usr/share/nginx/html && cp -r dist/* /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
