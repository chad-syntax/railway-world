import { RailwayData } from '../types';

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
  const response = await fetch(`/api/railway-data`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json = await response.json();

  return json;
};
