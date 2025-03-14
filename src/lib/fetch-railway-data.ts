export const fetchRailwayData = async (
  railwayToken: string,
  railwayProjectId: string
) => {
  const response = await fetch(
    `/api/railway-data?railwayToken=${railwayToken}&railwayProjectId=${railwayProjectId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.json();
};
