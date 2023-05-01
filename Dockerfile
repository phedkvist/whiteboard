FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
WORKDIR /usr/src/app/server
RUN npm i
RUN npm run build
EXPOSE 8080
CMD [ "node", "dist/server/src/Socket.js" ]