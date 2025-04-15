import { RailwayData } from '../types';
import retry from 'async-retry';
// Define the response type
interface RailwayDataResponse {
  data?: RailwayData;
  error?: {
    message: string;
    [key: string]: any;
  };
}

// Updated fetch function with proper typing
export const fetchRailwayData = async (): Promise<RailwayDataResponse> => {
  const res = await retry(
    async () => {
      // if anything throws, we retry
      const response = await fetch('/api/railway-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch railway data');
      }

      const data = await response.json();
      return data;
    },
    {
      retries: 3,
    }
  );

  return res;
};
