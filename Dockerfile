# Use Coolify helper image which has Node.js and npm
FROM ghcr.io/coollabsio/coolify-helper:1.0.11

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

# Copy built assets to nginx directory
RUN cp -r dist/* /var/www/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
