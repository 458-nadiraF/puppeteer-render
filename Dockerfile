FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

USER root
RUN chown -R node:node /usr/src/app
USER node
RUN npm install

# Install ngrok globally
USER root
# Install PM2 globally to manage the Node.js app
RUN npm install -g pm2
RUN npm install -g ngrok


# Configure ngrok
ARG NGROK_AUTH_TOKEN
RUN ngrok config add-authtoken ${NGROK_AUTH_TOKEN}

# Copy application files
COPY . .

# Set ownership
RUN chown -R node:node /usr/src/app

EXPOSE 3000

CMD ["sh", "-c", "pm2 start index.js --name 'puppeteer-app' && ngrok http --url=engaging-purely-rabbit.ngrok-free.app 3000"]
