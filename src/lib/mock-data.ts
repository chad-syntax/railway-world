import { LatestDeploymentsResponse } from './server/graphql/latest-deployments-query';

export const mockRailwayData = {
  data: {
    project: {
      name: 'postiz.chadsyntax.com',
      updatedAt: '2025-03-21T01:52:49.482Z',
      team: {
        name: "chad-syntax's Projects",
        avatar: 'https://avatars.githubusercontent.com/u/96320659?v=4',
      },
      services: {
        edges: [
          {
            node: {
              id: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
              icon: 'https://devicons.railway.app/i/postgresql.svg',
            },
          },
          {
            node: {
              id: '67bf96f4-4575-4da8-a373-131996d24fc2',
              icon: 'https://postiz.com/favicon.ico',
            },
          },
          {
            node: {
              id: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
              icon: 'https://devicons.railway.app/i/redis.svg',
            },
          },
        ],
      },
      environments: {
        edges: [
          {
            node: {
              id: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
              name: 'production',
              variables: {
                edges: [
                  {
                    node: {
                      name: 'REDDIT_CLIENT_SECRET',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'DISCORD_CLIENT_SECRET',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'RAILWAY_RUN_AS_ROOT',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'PGDATABASE',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: ['POSTGRES_DB'],
                    },
                  },
                  {
                    node: {
                      name: 'REDIS_RDB_POLICY',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDDIT_CLIENT_ID',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'DATABASE_URL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [
                        '15491bd6-9e85-41f9-af8f-bc87f858fe21.DATABASE_URL',
                      ],
                    },
                  },
                  {
                    node: {
                      name: 'REDISHOST',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: ['RAILWAY_PRIVATE_DOMAIN'],
                    },
                  },
                  {
                    node: {
                      name: 'DATABASE_PUBLIC_URL',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [
                        'PGUSER',
                        'POSTGRES_PASSWORD',
                        'RAILWAY_TCP_PROXY_DOMAIN',
                        'RAILWAY_TCP_PROXY_PORT',
                        'PGDATABASE',
                      ],
                    },
                  },
                  {
                    node: {
                      name: 'POSTGRES_PASSWORD',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDISUSER',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'NEXT_PUBLIC_BACKEND_URL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'PGPORT',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'SSL_CERT_DAYS',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDISPASSWORD',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: ['REDIS_PASSWORD'],
                    },
                  },
                  {
                    node: {
                      name: 'UPLOAD_DIRECTORY',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDISPORT',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'PORT',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDIS_PASSWORD',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'POSTGRES_USER',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDIS_URL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [
                        '7813e25d-ac72-4f87-b4a5-bb16b5390c21.REDIS_URL',
                      ],
                    },
                  },
                  {
                    node: {
                      name: 'STORAGE_PROVIDER',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'POSTGRES_DB',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'BACKEND_INTERNAL_URL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'DATABASE_URL',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [
                        'PGUSER',
                        'POSTGRES_PASSWORD',
                        'RAILWAY_PRIVATE_DOMAIN',
                        'PGDATABASE',
                      ],
                    },
                  },
                  {
                    node: {
                      name: 'IS_GENERAL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'JWT_SECRET',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'DISCORD_CLIENT_ID',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'DISCORD_BOT_TOKEN_ID',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDIS_PUBLIC_URL',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [
                        'REDIS_PASSWORD',
                        'RAILWAY_TCP_PROXY_DOMAIN',
                        'RAILWAY_TCP_PROXY_PORT',
                      ],
                    },
                  },
                  {
                    node: {
                      name: 'REDIS_AOF_ENABLED',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'RAILWAY_RUN_UID',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'REDIS_URL',
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      references: ['REDIS_PASSWORD', 'RAILWAY_PRIVATE_DOMAIN'],
                    },
                  },
                  {
                    node: {
                      name: 'NODE_ENV',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'PGHOST',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: ['RAILWAY_PRIVATE_DOMAIN'],
                    },
                  },
                  {
                    node: {
                      name: 'PGPASSWORD',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: ['POSTGRES_PASSWORD'],
                    },
                  },
                  {
                    node: {
                      name: 'PGUSER',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: ['POSTGRES_USER'],
                    },
                  },
                  {
                    node: {
                      name: 'NEXT_PUBLIC_UPLOAD_DIRECTORY',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'PGDATA',
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'MAIN_URL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                  {
                    node: {
                      name: 'FRONTEND_URL',
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      references: [],
                    },
                  },
                ],
              },
              serviceInstances: {
                edges: [
                  {
                    node: {
                      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      id: '13128bba-0407-4d13-a397-7d3908fd74ef',
                      serviceName: 'Postgres',
                      latestDeployment: {
                        id: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
                        status: 'SLEEPING',
                        updatedAt: '2025-03-21T01:02:44.702Z',
                      },
                      domains: {
                        customDomains: [],
                        serviceDomains: [],
                      },
                      source: {
                        image: 'ghcr.io/railwayapp-templates/postgres-ssl:16',
                        repo: null,
                      },
                    },
                  },
                  {
                    node: {
                      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      id: '60fdce8d-da48-4de0-8d6f-057ba0552249',
                      serviceName: 'Redis',
                      latestDeployment: {
                        id: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
                        status: 'SUCCESS',
                        updatedAt: '2025-03-19T03:24:01.190Z',
                      },
                      domains: {
                        customDomains: [],
                        serviceDomains: [],
                      },
                      source: {
                        image: 'bitnami/redis:7.2.5',
                        repo: null,
                      },
                    },
                  },
                  {
                    node: {
                      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      id: '6254deed-a3b3-486f-b4e4-48caac5f9022',
                      serviceName: 'Postiz',
                      latestDeployment: {
                        id: '3a59d66d-6d41-49f4-a029-8c22d1e011ca',
                        status: 'DEPLOYING',
                        updatedAt: '2025-03-19T18:23:02.133Z',
                      },
                      domains: {
                        customDomains: [
                          {
                            domain: 'postiz.chadsyntax.com',
                          },
                        ],
                        serviceDomains: [],
                      },
                      source: {
                        image: 'ghcr.io/gitroomhq/postiz-app:latest',
                        repo: null,
                      },
                    },
                  },
                ],
              },
              volumeInstances: {
                edges: [
                  {
                    node: {
                      id: 'a66e029b-5172-4b22-a531-092c1e1828cb',
                      type: 'CLOUD',
                      mountPath: '/var/lib/postgresql/data',
                      currentSizeMB: 0,
                      sizeMB: 5000,
                      service: {
                        id: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                      },
                      volume: {
                        name: 'field-volume',
                      },
                      state: 'READY',
                    },
                  },
                  {
                    node: {
                      id: 'a94d9684-4eeb-4385-aeaa-404175af76ef',
                      type: 'CLOUD',
                      mountPath: '/bitnami',
                      currentSizeMB: 0,
                      sizeMB: 5000,
                      service: {
                        id: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                      },
                      volume: {
                        name: 'flight-volume',
                      },
                      state: 'READY',
                    },
                  },
                  {
                    node: {
                      id: 'd1c5b9b4-50c9-4424-aa76-0f63814ff3c7',
                      type: 'CLOUD',
                      mountPath: '/uploads',
                      currentSizeMB: 0,
                      sizeMB: 5000,
                      service: {
                        id: '67bf96f4-4575-4da8-a373-131996d24fc2',
                      },
                      volume: {
                        name: 'jellyfish-volume',
                      },
                      state: 'READY',
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  },
};

export const mockLatestDeployments: LatestDeploymentsResponse = {
  project: {
    environments: {
      edges: [
        {
          node: {
            serviceInstances: {
              edges: [
                {
                  node: {
                    serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
                    domains: {
                      customDomains: [],
                      serviceDomains: [],
                    },
                    latestDeployment: {
                      id: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
                      status: 'SLEEPING',
                      updatedAt: '2025-03-21T01:02:44.702Z',
                    },
                  },
                },
                {
                  node: {
                    serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
                    domains: {
                      customDomains: [],
                      serviceDomains: [],
                    },
                    latestDeployment: {
                      id: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
                      status: 'SUCCESS',
                      updatedAt: '2025-03-19T03:24:01.190Z',
                    },
                  },
                },
                {
                  node: {
                    serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
                    domains: {
                      customDomains: [
                        {
                          domain: 'postiz.chadsyntax.com',
                        },
                      ],
                      serviceDomains: [],
                    },
                    latestDeployment: {
                      id: '3a59d66d-6d41-49f4-a029-8c22d1e011ca',
                      status: 'FAILED',
                      updatedAt: '2025-03-19T18:23:02.133Z',
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
};
