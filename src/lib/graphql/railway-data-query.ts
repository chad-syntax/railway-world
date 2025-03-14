export const railwayDataQuery = `
query RailwayData($id: String!) {
  project(id: $id) {
    services {
      edges {
        node {
          name
          icon
          serviceInstances {
            edges {
              node {
                serviceName
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
        }
      }
    }
  }
}`;
