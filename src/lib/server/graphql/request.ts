import { GRAPHQL_API_URL } from '../../constants';

export const gqlRequest = async (
  query: string,
  variables: any,
  headers: any
) => {
  const response = await fetch(GRAPHQL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GraphQL request failed: ${response.statusText}\n\n${errorText}`
    );
  }

  return response.json();
};
