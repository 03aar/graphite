import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const PORT = parseInt(process.env.PORT || '1234');

// Store Y docs in memory
const docs = new Map<string, WSSharedDoc>();

interface WSSharedDoc {
  name: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<any, Set<number>>;
}

function getYDoc(docname: string): WSSharedDoc {
  let doc = docs.get(docname);
  if (!doc) {
    const ydoc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(ydoc);
    doc = {
      name: docname,
      doc: ydoc,
      awareness,
      conns: new Map(),
    };
    docs.set(docname, doc);
  }
  return doc;
}

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (conn: any, req) => {
  const docName = req.url?.slice(1) || 'default';
  console.log(`[Y-WS] New connection: ${docName}`);

  const doc = getYDoc(docName);
  doc.conns.set(conn, new Set());

  // Send Sync Step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, 0); // messageSync
  syncProtocol.writeSyncStep1(encoder, doc.doc);
  conn.send(encoding.toUint8Array(encoder));

  // Broadcast awareness state
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, 1); // messageAwareness
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys()))
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }

  conn.on('message', (message: ArrayBuffer) => {
    const uint8Array = new Uint8Array(message);
    const decoder = decoding.createDecoder(uint8Array);
    const messageType = decoding.readVarUint(decoder);

    if (messageType === 0) {
      // Sync message
      encoding.writeVarUint(encoder, 0);
      const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc.doc, conn);
      if (encoding.length(encoder) > 1) {
        conn.send(encoding.toUint8Array(encoder));
      }
    } else if (messageType === 1) {
      // Awareness message
      awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn);
    }
  });

  conn.on('close', () => {
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(doc.conns.keys()), null);
    if (doc.conns.size === 0) {
      docs.delete(docName);
    }
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
