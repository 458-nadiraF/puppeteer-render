FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install necessary packages (tzdata and cronie for timezone and cron)
RUN yum update -y && \
    yum install -y tzdata cronie && \
    ln -fs /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && \
    echo "Asia/Jakarta" > /etc/timezone

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

# Copy the start_ngrok.sh script into the container
COPY start_ngrok.sh /usr/src/app/start_ngrok.sh

# Make the script executable
RUN chmod +x /usr/src/app/start_ngrok.sh

# Copy the cron job file to start at 8 AM and stop at 4 PM
COPY crontab /etc/cron.d/start-stop-ngrok

# Set the correct permissions for the cron job
RUN chmod 0644 /etc/cron.d/start-stop-ngrok && \
    crontab /etc/cron.d/start-stop-ngrok

# Expose the port for the application
EXPOSE 3000

# Start cron daemon manually and the container
CMD cron && tail -f /var/log/cron.log
