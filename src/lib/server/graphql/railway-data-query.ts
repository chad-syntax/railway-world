import { RailwayData, Service } from '../../types';

// Railway data query
export const railwayDataQuery = `
query RailwayData($id: String!) {
  project(id: $id) {
    name
    updatedAt
    team {
      name
      avatar
    }
    services {
      edges {
        node {
          id
          icon
        }
      }
    }
    environments {
      edges {
        node {
          id
          name
          serviceInstances {
            edges {
              node {
                id  
                serviceId
                serviceName
                latestDeployment {
                  id
                  snapshotId
                  status
                  updatedAt
                  createdAt
                }
                domains {
                  customDomains {
                    domain
                  }
                  serviceDomains {
                    domain
                  }
                }
                source {
                  image
                  repo
                }
              }
            }
          }
          volumeInstances {
            edges {
              node {
                id
                volumeId
                type
                mountPath
                currentSizeMB
                sizeMB
                service {
                  id
                }
                volume {
                  name
                }
                state
              }
            }
          }
          variables {
            edges {
              node {
                name
                serviceId
                references
              }
            }
          }
        }
      }
    }
  }
}`;

/**
 * Processes raw Railway GraphQL data into a client-friendly format
 */
export function processRailwayData(rawData: any): RailwayData {
  const processedData: RailwayData = {
    projectName: rawData.data?.project?.name || '',
    projectId: process.env.RAILWAY_WORLD_PROJECT_ID || '',
    updatedAt: rawData.data?.project?.updatedAt || '',
    team: rawData.data?.project?.team || { name: '', avatar: '' },
    services: [],
    environmentId: '',
  };

  // Get the production environment (or first environment if no production found)
  const environments = rawData.data?.project?.environments?.edges || [];
  const productionEnvEdge =
    environments.find((edge: any) => edge.node.name === 'production') ||
    environments[0];

  if (!productionEnvEdge) {
    return processedData;
  }

  const environment = productionEnvEdge.node;

  processedData.environmentId = environment.id;

  // Create a map of service IDs to icons
  const serviceIconMap = new Map<string, string>();
  const services = rawData.data?.project?.services?.edges || [];
  for (const serviceEdge of services) {
    const service = serviceEdge.node;
    serviceIconMap.set(service.id, service.icon || '');
  }

  // Create a map to collect service information
  const serviceMap = new Map<string, Service>();

  // Process service instances
  const serviceInstances = environment.serviceInstances?.edges || [];
  for (const instanceEdge of serviceInstances) {
    const instance = instanceEdge.node;
    const serviceId = instance.serviceId;

    // Collect domains

    const service: Service = {
      id: serviceId,
      name: instance.serviceName,
      icon: serviceIconMap.get(serviceId) || '', // Get icon from map
      domains: [],
      source: instance.source || { image: null, repo: null },
      connections: [],
      latestDeployment: instance.latestDeployment,
    };

    const allDomains: string[] = [];

    if (instance.domains?.customDomains?.length > 0) {
      allDomains.push(
        ...instance.domains.customDomains.map((d: any) => d.domain)
      );
    }

    if (instance.domains?.serviceDomains?.length > 0) {
      allDomains.push(
        ...instance.domains.serviceDomains.map((d: any) => d.domain)
      );
    }

    service.domains = [...service.domains, ...allDomains];

    serviceMap.set(serviceId, service);
  }

  // Process volumes
  const volumeInstances = environment.volumeInstances?.edges || [];
  for (const volumeEdge of volumeInstances) {
    const volume = volumeEdge.node;
    const serviceId = volume.service.id;

    const service = serviceMap.get(serviceId);

    if (service) {
      service.volume = {
        id: volume.volumeId,
        name: volume.volume.name,
        currentSizeMB: volume.currentSizeMB,
        sizeMB: volume.sizeMB,
      };
    }
  }

  // Process variables to determine connections between services
  const variables = environment.variables?.edges || [];
  for (const variableEdge of variables) {
    const variable = variableEdge.node;
    const sourceServiceId = variable.serviceId;

    // If this variable references another service, create a connection
    for (const reference of variable.references || []) {
      // Check if reference is in the format "serviceId.VARIABLE_NAME"
      const serviceIdMatch = reference.match(/^([^.]+)\./);
      if (serviceIdMatch && serviceIdMatch[1]) {
        const targetServiceId = serviceIdMatch[1];

        const service = serviceMap.get(sourceServiceId);

        // Add connection if both services exist
        if (
          serviceMap.has(sourceServiceId) &&
          serviceMap.has(targetServiceId) &&
          service
        ) {
          if (!service.connections.includes(targetServiceId)) {
            service.connections.push(targetServiceId);
          }
        }
      }
    }
  }

  // Convert map to array for output
  processedData.services = Array.from(serviceMap.values()) as Service[];

  return processedData;
}
