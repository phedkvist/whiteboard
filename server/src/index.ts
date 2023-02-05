import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080, host: "localhost" });

wss.on("connection", function connection(ws) {
  console.log("ON CONNECTION");

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
