FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH="google-chrome-stable"

WORKDIR /usr/src/app
# Create a directory for node_modules with appropriate permissions

COPY package*.json ./

RUN mkdir -p /usr/src/app/node_modules && chmod -R 777 /usr/src/app
RUN npm ci --unsafe-perm=true
COPY . .

CMD [ "node", "index.js", "render-build.sh"]

