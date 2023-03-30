FROM node:14
WORKDIR /app
COPY . /app
RUN rm -rf node_modules
RUN npm install
CMD [ "npx", "nodemon", "server.js" ]
