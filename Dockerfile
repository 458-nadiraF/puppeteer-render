FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies and global packages
RUN npm ci --only=production && \
    npm install -g pm2 ngrok

# Configure ngrok
ARG NGROK_AUTH_TOKEN
RUN ngrok config add-authtoken ${NGROK_AUTH_TOKEN}

# Copy application files
COPY . .

# Set ownership
RUN chown -R node:node /usr/src/app

# Switch to node user
USER node

EXPOSE 3000

# Use PM2 runtime to keep the container running
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
