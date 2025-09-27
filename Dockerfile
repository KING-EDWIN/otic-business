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

# Inject build-time environment variables for Vite
# (Coolify passes these as --build-arg; declare ARGs and export to ENV so `npm run build` can access them)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_OPENROUTER_API_KEY
ARG VITE_MISTRAL_API_KEY
ARG VITE_FLUTTERWAVE_PUBLIC_KEY
ARG VITE_FLUTTERWAVE_SECRET_KEY
ARG VITE_FLUTTERWAVE_ENCRYPTION_KEY
ARG VITE_FLUTTERWAVE_MERCHANT_ID
ARG VITE_QB_CLIENT_ID
ARG VITE_QB_CLIENT_SECRET
ARG VITE_QB_COMPANY_ID
ARG VITE_QB_ENVIRONMENT
ARG VITE_QB_REDIRECT_URI
ARG VITE_DEMO_MODE

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_OPENROUTER_API_KEY=$VITE_OPENROUTER_API_KEY \
    VITE_MISTRAL_API_KEY=$VITE_MISTRAL_API_KEY \
    VITE_FLUTTERWAVE_PUBLIC_KEY=$VITE_FLUTTERWAVE_PUBLIC_KEY \
    VITE_FLUTTERWAVE_SECRET_KEY=$VITE_FLUTTERWAVE_SECRET_KEY \
    VITE_FLUTTERWAVE_ENCRYPTION_KEY=$VITE_FLUTTERWAVE_ENCRYPTION_KEY \
    VITE_FLUTTERWAVE_MERCHANT_ID=$VITE_FLUTTERWAVE_MERCHANT_ID \
    VITE_QB_CLIENT_ID=$VITE_QB_CLIENT_ID \
    VITE_QB_CLIENT_SECRET=$VITE_QB_CLIENT_SECRET \
    VITE_QB_COMPANY_ID=$VITE_QB_COMPANY_ID \
    VITE_QB_ENVIRONMENT=$VITE_QB_ENVIRONMENT \
    VITE_QB_REDIRECT_URI=$VITE_QB_REDIRECT_URI \
    VITE_DEMO_MODE=$VITE_DEMO_MODE

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
