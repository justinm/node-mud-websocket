import WebSocket from 'ws';
import Session from "./session"

const wss = new WebSocket.Server({ port: process.env.PORT });

wss.on('connection', (socket) => {
  new Session(socket, process.env.MUD_ADDRESS, process.env.MUD_PORT);
});
