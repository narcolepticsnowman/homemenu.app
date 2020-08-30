FROM node:14-alpine3.12

COPY . /app

RUN cd /app && \
    npm install --production && \
    chmod +x /app/www.js
CMD ["/app/www.js"]