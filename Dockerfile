FROM node:14-alpine3.12

COPY . /app

RUN cd /app && \
    npm install --production

CMD ["/app/www.js"]