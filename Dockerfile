FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set working directory
WORKDIR /usr/src/app

# Copy package files as root user
COPY package*.json ./

# Install dependencies as root first (more efficient)
RUN npm ci --only=production

# Install global packages
RUN npm install -g pm2 ngrok

# Copy application files
COPY . .

# Copy and prepare the start script
COPY start_ngrok.sh /usr/src/app/start_ngrok.sh
RUN chmod +x /usr/src/app/start_ngrok.sh

# Set proper ownership for everything
RUN chown -R node:node /usr/src/app

# Configure ngrok (if token is provided at build time)
ARG NGROK_AUTH_TOKEN
RUN if [ -n "$NGROK_AUTH_TOKEN" ]; then \
        su - node -c "ngrok config add-authtoken $NGROK_AUTH_TOKEN"; \
    fi

# Switch to node user
USER node

# Expose the port
EXPOSE 3000

# Use pm2-runtime for container environments
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
# FROM ghcr.io/puppeteer/puppeteer:19.7.2

# # Set environment variable to skip Chromium download
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# # Install necessary packages (tzdata and cronie for timezone and cron)
# WORKDIR /usr/src/app

# # Copy package files
# COPY package*.json ./

# #USER root
# RUN chown -R node:node /usr/src/app
# USER node
# RUN npm install

# # Install ngrok globally
# USER root
# # Install PM2 globally to manage the Node.js app
# RUN npm install -g pm2
# RUN npm install -g ngrok

# RUN mkdir -p /usr/src/app/node_modules && chmod -R 777 /usr/src/app
# RUN npm ci --unsafe-perm=true
# RUN ngrok config add-authtoken $NGROK_AUTH_TOKEN
# COPY --chown=node:node . .


# # Copy the start_ngrok.sh script into the container
# COPY start_ngrok.sh /usr/src/app/start_ngrok.sh

# # Make the script executable
# RUN chmod +x /usr/src/app/start_ngrok.sh


# # Expose the port for the application
# EXPOSE 3000

# # Start cron daemon manually and the container
# CMD pm2 start /usr/src/app/start_ngrok.sh --cron "0 8 * * 1-5" && pm2 start index.js
