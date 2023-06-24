FROM node:16-alpine
WORKDIR /usr/src/app/client
COPY client/ .
RUN npm i
WORKDIR /usr/src/app/server
COPY server/ .
RUN npm i
RUN npm run build
EXPOSE 8080
CMD [ "node", "dist/server/src/index.js" ]