import { FastifyRequest, FastifyReply } from 'fastify';

interface IconQueryParams {
  url?: string;
  [key: string]: string | undefined;
}

export async function handleIcon(req: FastifyRequest, reply: FastifyReply) {
  try {
    const query = req.query as IconQueryParams;
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
    req.log.error(error);
    return reply.code(500).send({
      error: 'Error proxying icon',
      details: error.message,
    });
  }
}
