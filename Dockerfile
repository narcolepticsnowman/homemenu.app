FROM node:14-alpine3.12

COPY build /app

CMD "node /app/www.js"