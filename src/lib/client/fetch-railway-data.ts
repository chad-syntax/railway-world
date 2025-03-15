// Define the response type
interface RailwayDataResponse {
  data: any;
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

  console.log(json);

  return json;
};
