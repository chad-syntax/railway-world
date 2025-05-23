import { FastifyRequest, FastifyReply } from 'fastify';
import { gqlRequest } from '../graphql/request';
import {
  railwayDataQuery,
  processRailwayData,
} from '../graphql/railway-data-query';
import { RailwayData } from '../../types';
import { MOCK_RAILWAY_DATA } from '../../mock-data';

export async function handleRailwayData(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const railwayToken = process.env.RAILWAY_WORLD_TOKEN;
    const railwayProjectId = process.env.RAILWAY_WORLD_PROJECT_ID;

    // Validate required parameters
    if (!railwayToken || !railwayProjectId) {
      return reply.code(400).send({
        error: 'Missing required environment variables',
        message:
          'railwayToken and railwayProjectId are required environment variables',
      });
    }

    try {
      if (process.env.MOCK_DATA !== 'true') {
        // Fetch data with the new query
        const response = await gqlRequest(
          railwayDataQuery,
          {
            id: railwayProjectId,
          },
          {
            Authorization: `Bearer ${railwayToken}`,
          }
        );
        // Process the data into our client-friendly format
        const processedData: RailwayData = processRailwayData(response);
        return reply.send({ data: processedData });
      }

      const processedData: RailwayData = processRailwayData(MOCK_RAILWAY_DATA);

      // Return the processed data
      return reply.send({ data: processedData });
    } catch (error: any) {
      req.log.error(error);
      return reply.code(500).send({
        error: 'Error processing railway data',
      });
    }
  } catch (error: any) {
    req.log.error(error);
    return reply.code(500).send({
      error: 'Error fetching railway data',
    });
  }
}
