import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

const PORT = parseInt(process.env.PORT || '1234');

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws, req) => {
  const url = req.url || '/';
  console.log(`[Y-WS] New connection: ${url}`);

  setupWSConnection(ws as any, req as any, {
    docName: url.slice(1), // Remove leading slash
  });
});

wss.on('error', (error) => {
  console.error('[Y-WS] Error:', error);
});

console.log(`[Y-WS] Y-WebSocket server listening on port ${PORT}`);

process.on('SIGTERM', () => {
  console.log('[Y-WS] SIGTERM received, closing server');
  wss.close(() => {
    process.exit(0);
  });
});
