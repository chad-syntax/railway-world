import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { handleRailwayData } from './src/lib/server/handlers/api-railway-data';
import { handleIcon } from './src/lib/server/handlers/api-icon';
import { config } from 'dotenv';
import { WebSocketMessage } from './src/lib/types';
import { handleWSMessage } from './src/lib/server/handlers/ws-handle-message';

config();

// For ES modules in TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Fastify
const server = Fastify({
  logger: true,
});

const setupServer = async () => {
  // Register WebSocket plugin
  await server.register(websocket);

  server.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (socket) => {
      socket.on('message', (message: Buffer) => {
        const messageStr = message.toString();
        let parsedMessage: WebSocketMessage;
        try {
          parsedMessage = JSON.parse(messageStr);
        } catch (error) {
          console.error('Error parsing message:', error);
          console.log('Received message:', messageStr);
          return;
        }

        handleWSMessage(parsedMessage, socket);
      });
    });
  });

  // Railway data endpoint
  server.get('/api/railway-data', handleRailwayData);

  // Icon proxy endpoint to bypass CORS
  server.get('/api/icon', handleIcon);

  // In production, serve the static Vite-built files
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');

    // Check if dist directory exists
    if (fs.existsSync(distPath)) {
      // Register static file serving with custom handling for SPA routes
      await server.register(fastifyStatic, {
        root: distPath,
        prefix: '/',
        decorateReply: true, // Add decorators like sendFile to reply
        wildcard: false, // Disable automatic wildcard handling
      });

      // Handle client-side routing (SPA support) for routes not matching static files
      server.setNotFoundHandler((req, reply) => {
        // Only handle GET requests for HTML navigation
        if (req.method !== 'GET') {
          return reply.status(404).send({ error: 'Not found' });
        }

        // Return index.html for all other paths (that don't match static files)
        return reply.sendFile('index.html');
      });
    } else {
      server.log.warn('Production build directory not found');
    }
  }

  // Start the server
  try {
    const PORT = process.env.PORT || 3000;
    await server.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

setupServer();
