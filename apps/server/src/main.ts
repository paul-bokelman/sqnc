import type { UnionToIntersection, ClientToServerEvents, ExtWebSocket } from "sqnc-common";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import WebSocket, { Instance } from "express-ws";
import { services } from "./services/router";
import { socketEvents } from "./services/socket/socket-events";
import { env, preflightENV } from "./lib/env";
import { wsUtils } from "./lib/utils";

preflightENV();

export const instance: Instance = WebSocket(express());
const app = instance.app;

app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

app.use("/api", services);

// dummy route
app.get("/", (req, res) => {
  res.json({ Hello: "World" });
});

instance.getWss().on("connection", async (ws: ExtWebSocket, req) => {
  const { success, error, broadcast } = wsUtils(ws);
  (ws.success = success), (ws.error = error), (ws.broadcast = broadcast);

  ws.on("pong", () => (ws.alive = true));
  ws.on("close", (e) => {});
});

const heartbeat = setInterval(function ping() {
  (instance.getWss().clients as Set<ExtWebSocket>).forEach((client) => {
    if (client.alive === false) return client.terminate();
    client.alive = false;
    client.ping();
  });
}, 1000); // change time depending on desired response time

instance.getWss().on("close", () => clearInterval(heartbeat));

app.ws("/ws", (websocket, req) => {
  let ws: ExtWebSocket = websocket as ExtWebSocket;
  const { success, error, broadcast } = wsUtils(ws);
  (ws.success = success), (ws.error = error), (ws.broadcast = broadcast);
  ws.on("message", async (msg, isBinary) => {
    if (isBinary) return ws.error("Binary messages are not supported");
    const [event, data] = JSON.parse(msg.toString()) as [
      keyof ClientToServerEvents,
      UnionToIntersection<Parameters<ClientToServerEvents[keyof ClientToServerEvents]>[number]>
    ];
    if (!Object.keys(socketEvents).includes(event)) return ws.error("Invalid event");
    // @ts-ignore
    await socketEvents[event]({ ws, req }, data);
  });
});

const port = env("PORT") || 8000;

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
