import { FastifyRequest, FastifyReply } from 'fastify';
import { gqlRequest } from '../graphql/request';
import {
  railwayDataQuery,
  processRailwayData,
} from '../graphql/railway-data-query';
import { RailwayData } from '../../types';

interface RailwayDataQueryParams {
  railwayToken?: string;
  railwayProjectId?: string;
  [key: string]: string | undefined;
}

export async function handleRailwayData(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extract railway token and project ID from query parameters
    const query = req.query as RailwayDataQueryParams;
    const railwayToken = process.env.RAILWAY_TOKEN;
    const railwayProjectId = process.env.RAILWAY_PROJECT_ID;

    // Validate required parameters
    if (!railwayToken || !railwayProjectId) {
      return reply.code(400).send({
        error: 'Missing required environment variables',
        message:
          'railwayToken and railwayProjectId are required environment variables',
      });
    }

    try {
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
