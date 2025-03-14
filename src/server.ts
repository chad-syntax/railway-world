import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { gqlRequest } from './lib/graphql/request';
import { railwayDataQuery } from './lib/graphql/railway-data-query';

// For ES modules in TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Fastify
const server = Fastify({
  logger: true,
});

// Register CORS
const setupServer = async () => {
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  // Railway data endpoint
  server.get('/api/railway-data', async (req, reply) => {
    try {
      // Extract railway token and project ID from query parameters
      const query = req.query as Record<string, string>;
      const railwayToken = query.railwayToken;
      const railwayProjectId = query.railwayProjectId;

      // Validate required parameters
      if (!railwayToken || !railwayProjectId) {
        return reply.code(400).send({
          error: 'Missing required parameters',
          message:
            'railwayToken and railwayProjectId are required query parameters',
        });
      }

      const response = await gqlRequest(
        railwayDataQuery,
        {
          id: railwayProjectId,
        },
        {
          Authorization: `Bearer ${railwayToken}`,
        }
      );

      return reply.send(response);
    } catch (error: any) {
      server.log.error(error);
      return reply.code(500).send({
        error: 'Error fetching railway data',
        details: error.message,
      });
    }
  });

  // Icon proxy endpoint to bypass CORS
  server.get('/api/icon', async (req, reply) => {
    try {
      const query = req.query as Record<string, string>;
      const iconUrl = query.url;

      if (!iconUrl) {
        return reply.code(400).send({
          error: 'Missing required parameter',
          message: 'url is a required query parameter',
        });
      }

      const isDevIcon = iconUrl.includes('devicons.railway.app');

      if (!isDevIcon) {
        // Security check: validate URL is for an image file
        const validImageExtensions = [
          '.png',
          '.jpg',
          '.jpeg',
          '.gif',
          '.svg',
          '.ico',
          '.webp',
        ];
        const hasValidExtension = validImageExtensions.some((ext) =>
          iconUrl.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
          return reply.code(400).send({
            error: 'Invalid file type',
            message:
              'URL must reference a valid image file (png, jpg, jpeg, gif, svg, ico, webp)',
          });
        }
      }

      // Fetch the image
      const response = await fetch(iconUrl);

      if (!response.ok) {
        return reply.code(response.status).send({
          error: 'Failed to fetch icon',
          message: `Server responded with status ${response.status}`,
        });
      }

      // Double-check Content-Type from the response
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        return reply.code(400).send({
          error: 'Invalid content type',
          message: 'The URL must return an image content type',
        });
      }

      // Stream the image data directly to the response
      const buffer = await response.arrayBuffer();

      reply
        .code(200)
        .header('Content-Type', contentType)
        .send(Buffer.from(buffer));
    } catch (error: any) {
      server.log.error(error);
      return reply.code(500).send({
        error: 'Error proxying icon',
        details: error.message,
      });
    }
  });

  // In production, serve the static Vite-built files
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../dist');

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
