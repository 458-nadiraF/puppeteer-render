FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm install -g pm2 ngrok

# Configure ngrok
ARG NGROK_AUTH_TOKEN
RUN ngrok config add-authtoken ${NGROK_AUTH_TOKEN}

# Copy app files
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Change ownership
RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

# Run the start script
CMD ["./start_ngrok.sh"]
