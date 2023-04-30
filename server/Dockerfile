FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 8080
CMD [ "node", "dist/server/src/Socket.js" ]