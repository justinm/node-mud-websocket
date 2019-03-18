import WebSocket from 'ws';
import Session from "./session"

const wss = new WebSocket.Server({ port: 4000 });

wss.on('connection', (socket) => {
  new Session(socket, 'primaldarkness.com', '5006');
});
