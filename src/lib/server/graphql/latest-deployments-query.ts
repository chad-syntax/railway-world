import { gqlRequest } from './request';
import { DeploymentStatus } from '../../types';
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
                domains {
                  customDomains {
                    domain
                  }
                  serviceDomains {
                    domain
                  }
                }
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

export type LatestDeploymentsResponse = {
  project: {
    environments: {
      edges: {
        node: {
          serviceInstances: {
            edges: {
              node: {
                serviceId: string;
                domains: {
                  customDomains: {
                    domain: string;
                  }[];
                  serviceDomains: {
                    domain: string;
                  }[];
                };
                latestDeployment: {
                  id: string;
                  status: DeploymentStatus;
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
