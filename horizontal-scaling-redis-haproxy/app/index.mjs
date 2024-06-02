import http from "http";
import ws from "websocket";
import redis from "redis";
const APPID = process.env.APPID;
let connections = [];
const WebSocketServer = ws.server;

const retryStrategy = options => {
  return Math.max(options.attempt * 100, 3000); // Reconnect after
};

const subscriber = redis.createClient({
  port: 6379,
  host: 'rds',
  retry_strategy: retryStrategy
});

const publisher = redis.createClient({
  port: 6379,
  host: 'rds',
  retry_strategy: retryStrategy
});

subscriber.on("subscribe", function (channel, count) {
  console.log(`Server ${APPID} subscribed successfully to livechat`);
  publisher.publish("livechat", "a message");
});

subscriber.on("message", function (channel, message) {
  try {
    console.log(`Server ${APPID} received message in channel ${channel} msg: ${message}`);
    connections.forEach(c => c.send(APPID + ":" + message));
  }
  catch (ex) {
    console.log("ERR::" + ex);
  }
});

subscriber.subscribe("livechat");

const httpserver = http.createServer((req, res) => {
  res.setHeader("Content-Security-Policy", "connect-src 'self' ws://localhost:8080");
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('CSP headers set');
});

const websocket = new WebSocketServer({
  "httpServer": httpserver
});

httpserver.listen(8080, () => console.log("My server is listening on port 8080"));

websocket.on("request", request => {
  const con = request.accept(null, request.origin);
  con.on("open", () => console.log("opened"));
  con.on("close", () => console.log("CLOSED!!!"));
  con.on("message", message => {
    console.log(`${APPID} Received message ${message.utf8Data}`);
    publisher.publish("livechat", message.utf8Data);
  });

  setTimeout(() => con.send(`Connected successfully to server ${APPID}`), 5000);
  connections.push(con);
});

// Code clean up after closing connection
process.on('exit', () => {
  subscriber.unsubscribe();
  subscriber.quit();
  publisher.quit();
});


//client code 
//let ws = new WebSocket("ws://localhost:8080");
//ws.onmessage = message => console.log(`Received: ${message.data}`);
//ws.send("Hello! I'm client")


/*
    //code clean up after closing connection
    subscriber.unsubscribe();
    subscriber.quit();
    publisher.quit();
    */