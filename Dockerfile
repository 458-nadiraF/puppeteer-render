FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app
# Create a directory for node_modules with appropriate permissions

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

RUN mkdir -p /usr/src/app/node_modules && chmod -R 777 /usr/src/app
RUN npm ci --unsafe-perm=true
RUN ngrok config add-authtoken 2yUjx2J42VE27np72hJQ8XuvRvo_5r2fhw7h2xtTy323srr7h
COPY --chown=node:node . .
EXPOSE 3000
#CMD [ "node", "pm2 start index.js --name 'puppeteer-app' && ngrok http --subdomain=engaging-purely-rabbit.ngrok-free.app 3000", "render-build.sh"]
CMD ["sh", "-c", "pm2 start index.js --name 'puppeteer-app' && ngrok http --url=engaging-purely-rabbit.ngrok-free.app 3000"]
