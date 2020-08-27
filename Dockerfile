FROM node:14-alpine3.12

COPY . /app

RUN apk update && \
    apk add git openssh-client && \
    mkdir ~/.ssh && \
    chmod 700 ~/.ssh && \
    ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts && \
    chmod 600 ~/.ssh/known_hosts && \
    cd /app && \
    npm install --production

CMD ["node", "/app/www.js"]