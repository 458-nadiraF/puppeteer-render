FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install necessary packages (tzdata and cronie for timezone and cron)
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

#USER root
RUN chown -R node:node /usr/src/app
USER node
RUN npm install

# Install ngrok globally
USER root
# Install PM2 globally to manage the Node.js app
RUN npm install -g pm2
RUN npm install -g ngrok

RUN mkdir -p /usr/src/app/node_modules && chmod -R 777 /usr/src/app
RUN npm ci --unsafe-perm=true
RUN ngrok config add-authtoken $NGROK_AUTH_TOKEN
COPY --chown=node:node . .


# Copy the start_ngrok.sh script into the container
COPY start_ngrok.sh /usr/src/app/start_ngrok.sh

# Make the script executable
RUN chmod +x /usr/src/app/start_ngrok.sh


# Expose the port for the application
EXPOSE 3000

# Start cron daemon manually and the container
CMD pm2 start /usr/src/app/start_ngrok.sh --cron "0 8 * * 1-5" && pm2 start index.js
