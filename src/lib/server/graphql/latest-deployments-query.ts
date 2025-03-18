import { gqlRequest } from './request';

const latestDeploymentsQuery = `
query LatestDeployments($id: String!) {
  project(id: $id) {
    environments {
      edges {
        node {
          serviceInstances {
            edges {
              node {
                serviceId
                latestDeployment {
                  id
                  status
                  updatedAt
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

type LatestDeploymentsResponse = {
  project: {
    environments: {
      edges: {
        node: {
          serviceInstances: {
            edges: {
              node: {
                serviceId: string;
                latestDeployment: {
                  id: string;
                  status: string;
                  updatedAt: string;
                };
              };
            }[];
          };
        };
      }[];
    };
  };
};

export const requestLatestDeployments = async (projectId: string) => {
  const response = await gqlRequest(
    latestDeploymentsQuery,
    { id: projectId },
    {
      Authorization: `Bearer ${process.env.RAILWAY_WORLD_TOKEN}`,
    }
  );

  return response.data as LatestDeploymentsResponse;
};
