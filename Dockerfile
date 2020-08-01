FROM node:14-alpine3.12

COPY . /app

CMD "node /app/www.js"