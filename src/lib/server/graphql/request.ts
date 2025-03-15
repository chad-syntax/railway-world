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

  return response.json();
};
