FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Switch to root user to install dependencies
USER root

# Install dependencies in one step
RUN npm install && \
    npm install ngrok pm2 && \
    ngrok config add-authtoken $NGROK_AUTH_TOKEN && \
    mkdir -p /usr/src/app/node_modules && \
    chown -R node:node /usr/src/app && \
    chmod -R 755 /usr/src/app

# Switch to node user
USER node

# Clean install to ensure the correct node_modules
RUN npm ci --unsafe-perm=true

# Copy the rest of the application files with correct ownership
COPY --chown=node:node . .

# Expose the port for the application
EXPOSE 3000

# Use a shell script to run the commands (recommended for better flexibility)
CMD [ "sh", "-c", "pm2 start index.js && ngrok http --url=engaging-purely-rabbit.ngrok-free.app 3000"]
