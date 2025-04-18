FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH="google-chrome-stable"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js", "render-build.sh"]

