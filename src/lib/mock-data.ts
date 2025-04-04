import { DeployLog, HttpLog } from './types';
import { LatestDeploymentsResponse } from './server/graphql/latest-deployments-query';

export const MOCK_RAILWAY_DATA = {
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
                      volumeId: '7c75e120-f85a-4dea-bb13-d445d7c41091',
                      type: 'CLOUD',
                      mountPath: '/var/lib/postgresql/data',
                      currentSizeMB: 199.819264,
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
                      volumeId: '3601150d-6aca-4090-9379-b4e5a657976f',
                      type: 'CLOUD',
                      mountPath: '/bitnami',
                      currentSizeMB: 149.516288,
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
                      volumeId: 'b7cd6597-1112-4fa2-9023-682145a130a0',
                      type: 'CLOUD',
                      mountPath: '/uploads',
                      currentSizeMB: 328.94975999999997,
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

export const MOCK_POSTIZ_LATEST_DEPLOYMENT_ID =
  '3a59d66d-6d41-49f4-a029-8c22d1e011ca';

export const MOCK_PSQL_LATEST_DEPLOYMENT_ID =
  'd5b163b2-3c76-4ae9-b998-6c0c45b75102';

export const MOCK_REDIS_LATEST_DEPLOYMENT_ID =
  'efc8b240-2e0b-40e3-85b4-561640f330fd';

export const MOCK_LATEST_DEPLOYMENTS: LatestDeploymentsResponse = {
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
                      id: MOCK_PSQL_LATEST_DEPLOYMENT_ID,
                      snapshotId: 'dbbd79ae-9607-4eaf-a522-d16a9467966e',
                      status: 'SLEEPING',
                      updatedAt: '2025-03-21T01:02:44.702Z',
                      createdAt: '2025-03-13T16:18:37.075Z',
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
                      id: MOCK_REDIS_LATEST_DEPLOYMENT_ID,
                      snapshotId: 'bdbe3dd8-c892-4501-b9d1-5f8056a59709',
                      status: 'SUCCESS',
                      updatedAt: '2025-03-19T03:24:01.190Z',
                      createdAt: '2025-02-16T04:06:52.253Z',
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
                      id: MOCK_POSTIZ_LATEST_DEPLOYMENT_ID,
                      snapshotId: '80ed9b83-f8ca-456e-837e-77a527a4c3e3',
                      status: 'FAILED',
                      updatedAt: '2025-03-19T18:23:02.133Z',
                      createdAt: '2025-03-23T21:26:57.175Z',
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

export const MOCK_HTTP_LOGS: HttpLog[] = [
  {
    requestId: 'req_abc123',
    timestamp: '2025-03-21T01:52:49.482Z',
    method: 'GET',
    path: '/api/users',
    host: 'postiz.chadsyntax.com',
    httpStatus: 200,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'success',
    totalDuration: 150,
    upstreamAddress: '10.0.0.1:8080',
    clientUa: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    upstreamRqDuration: 120,
    txBytes: 2048,
    rxBytes: 8192,
    srcIp: '192.168.1.100',
    edgeRegion: 'us-east-1',
  },
  {
    requestId: 'req_def456',
    timestamp: '2025-03-21T01:52:50.482Z',
    method: 'POST',
    path: '/api/auth/login',
    host: 'postiz.chadsyntax.com',
    httpStatus: 401,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'unauthorized',
    totalDuration: 75,
    upstreamAddress: '10.0.0.2:8080',
    clientUa: 'PostmanRuntime/7.29.2',
    upstreamRqDuration: 50,
    txBytes: 1024,
    rxBytes: 512,
    srcIp: '192.168.1.101',
    edgeRegion: 'us-west-1',
  },
  {
    requestId: 'req_ghi789',
    timestamp: '2025-03-21T01:52:51.482Z',
    method: 'PUT',
    path: '/api/posts/123',
    host: 'postiz.chadsyntax.com',
    httpStatus: 204,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'no content',
    totalDuration: 200,
    upstreamAddress: '10.0.0.3:8080',
    clientUa: 'curl/7.64.1',
    upstreamRqDuration: 180,
    txBytes: 4096,
    rxBytes: 0,
    srcIp: '192.168.1.102',
    edgeRegion: 'eu-west-1',
  },
  {
    requestId: 'req_jkl012',
    timestamp: '2025-03-21T01:52:52.482Z',
    method: 'DELETE',
    path: '/api/comments/456',
    host: 'postiz.chadsyntax.com',
    httpStatus: 500,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'internal server error',
    totalDuration: 300,
    upstreamAddress: '10.0.0.4:8080',
    clientUa: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    upstreamRqDuration: 280,
    txBytes: 512,
    rxBytes: 1024,
    srcIp: '192.168.1.103',
    edgeRegion: 'ap-southeast-1',
  },
  {
    requestId: 'req_mno345',
    timestamp: '2025-03-21T01:52:53.482Z',
    method: 'GET',
    path: '/api/posts?page=1&limit=10',
    host: 'postiz.chadsyntax.com',
    httpStatus: 200,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'success',
    totalDuration: 180,
    upstreamAddress: '10.0.0.5:8080',
    clientUa: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    upstreamRqDuration: 150,
    txBytes: 3072,
    rxBytes: 12288,
    srcIp: '192.168.1.104',
    edgeRegion: 'eu-central-1',
  },
  {
    requestId: 'req_pqr678',
    timestamp: '2025-03-21T01:52:54.482Z',
    method: 'PATCH',
    path: '/api/users/profile',
    host: 'postiz.chadsyntax.com',
    httpStatus: 403,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'forbidden',
    totalDuration: 90,
    upstreamAddress: '10.0.0.6:8080',
    clientUa: 'Mozilla/5.0 (Android 12; Mobile)',
    upstreamRqDuration: 70,
    txBytes: 1536,
    rxBytes: 768,
    srcIp: '192.168.1.105',
    edgeRegion: 'sa-east-1',
  },
  {
    requestId: 'req_stu901',
    timestamp: '2025-03-21T01:52:55.482Z',
    method: 'POST',
    path: '/api/uploads',
    host: 'postiz.chadsyntax.com',
    httpStatus: 413,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'payload too large',
    totalDuration: 250,
    upstreamAddress: '10.0.0.7:8080',
    clientUa: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/89.0.4389.82',
    upstreamRqDuration: 200,
    txBytes: 15360,
    rxBytes: 1024,
    srcIp: '192.168.1.106',
    edgeRegion: 'us-east-2',
  },
  {
    requestId: 'req_vwx234',
    timestamp: '2025-03-21T01:52:56.482Z',
    method: 'GET',
    path: '/api/health',
    host: 'postiz.chadsyntax.com',
    httpStatus: 200,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'success',
    totalDuration: 50,
    upstreamAddress: '10.0.0.8:8080',
    clientUa: 'Kubernetes-Monitor/1.0',
    upstreamRqDuration: 40,
    txBytes: 512,
    rxBytes: 1024,
    srcIp: '192.168.1.107',
    edgeRegion: 'ap-northeast-1',
  },
  {
    requestId: 'req_yz0567',
    timestamp: '2025-03-21T01:52:57.482Z',
    method: 'OPTIONS',
    path: '/api/posts',
    host: 'postiz.chadsyntax.com',
    httpStatus: 204,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'no content',
    totalDuration: 30,
    upstreamAddress: '10.0.0.9:8080',
    clientUa: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/87.0',
    upstreamRqDuration: 25,
    txBytes: 256,
    rxBytes: 0,
    srcIp: '192.168.1.108',
    edgeRegion: 'ap-south-1',
  },
  {
    requestId: 'req_123abc',
    timestamp: '2025-03-21T01:52:58.482Z',
    method: 'HEAD',
    path: '/api/files/large-document.pdf',
    host: 'postiz.chadsyntax.com',
    httpStatus: 200,
    upstreamProto: 'HTTP/1.1',
    downstreamProto: 'HTTP/2.0',
    responseDetails: 'success',
    totalDuration: 60,
    upstreamAddress: '10.0.0.10:8080',
    clientUa: 'curl/7.68.0',
    upstreamRqDuration: 50,
    txBytes: 0,
    rxBytes: 256,
    srcIp: '192.168.1.109',
    edgeRegion: 'us-west-2',
  },
];

export const MOCK_POSTIZ_DEPLOY_LOGS: DeployLog[] = [
  {
    timestamp: '2025-03-26T21:27:33.538270570Z',
    message: 'cleaning storage unit',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'ts',
        value: '1743024445.91162',
      },
    ],
  },
  {
    timestamp: '2025-03-26T21:27:33.538283349Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743024445.911791',
      },
    ],
  },
  {
    timestamp: '2025-03-27T21:27:27.993356411Z',
    message: 'cleaning storage unit',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'ts',
        value: '1743110845.920112',
      },
    ],
  },
  {
    timestamp: '2025-03-27T21:27:27.993374369Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743110845.920267',
      },
    ],
  },
  {
    timestamp: '2025-03-28T21:27:33.877707838Z',
    message: 'cleaning storage unit',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'ts',
        value: '1743197246.635038',
      },
    ],
  },
  {
    timestamp: '2025-03-28T21:27:33.877726030Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743197246.6715202',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:21.670088414Z',
    message:
      '(node:117) [DEP0106] DeprecationWarning: crypto.createCipher is deprecated.',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:21.670109597Z',
    message:
      '(Use `node --trace-deprecation ...` to show where the warning was created)',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:21.670125502Z',
    message: 'Email sender information not found in environment variables',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:21.670191690Z',
    message:
      '\u001b[33m[Nest] 117  - \u001b[39m03/29/2025, 5:25:16 AM \u001b[33m   WARN\u001b[39m \u001b[33mOpenAI API key not set, chat functionality will not work\u001b[39m',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:51.956880128Z',
    message:
      '\u001b[33m[Nest] 117  - \u001b[39m03/29/2025, 5:25:49 AM \u001b[33m   WARN\u001b[39m \u001b[33mOpenAI API key not set, chat functionality will not work\u001b[39m',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T21:27:35.333813348Z',
    message: 'storage cleaning happened too recently; skipping for now',
    severity: 'warn',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'instance',
        value: '"39993891-93f3-46a5-837b-4151152aeee0"',
      },
      {
        key: 'level',
        value: '"warn"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'try_again',
        value: '1743370046.0391417',
      },
      {
        key: 'try_again_in',
        value: '86399.999999202',
      },
      {
        key: 'ts',
        value: '1743283646.0391457',
      },
    ],
  },
  {
    timestamp: '2025-03-29T21:27:35.333841738Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743283646.0494423',
      },
    ],
  },
  {
    timestamp: '2025-03-30T21:27:34.805433798Z',
    message: 'cleaning storage unit',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'ts',
        value: '1743370045.8900414',
      },
    ],
  },
  {
    timestamp: '2025-03-30T21:27:34.805461112Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743370045.9909189',
      },
    ],
  },
  {
    timestamp: '2025-03-31T21:27:30.177363161Z',
    message: 'storage cleaning happened too recently; skipping for now',
    severity: 'warn',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'instance',
        value: '"39993891-93f3-46a5-837b-4151152aeee0"',
      },
      {
        key: 'level',
        value: '"warn"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'try_again',
        value: '1743542845.8914115',
      },
      {
        key: 'try_again_in',
        value: '86399.99999885',
      },
      {
        key: 'ts',
        value: '1743456445.8914156',
      },
    ],
  },
  {
    timestamp: '2025-03-31T21:27:30.177377501Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743456445.8915472',
      },
    ],
  },
  {
    timestamp: '2025-04-01T20:32:40.544189250Z',
    message:
      '\u001b[33m[Nest] 117  - \u001b[39m04/01/2025, 8:32:34 PM \u001b[33m   WARN\u001b[39m \u001b[33mOpenAI API key not set, chat functionality will not work\u001b[39m',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T20:33:10.728918067Z',
    message:
      '\u001b[33m[Nest] 117  - \u001b[39m04/01/2025, 8:33:02 PM \u001b[33m   WARN\u001b[39m \u001b[33mOpenAI API key not set, chat functionality will not work\u001b[39m',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T21:27:33.793831317Z',
    message: 'cleaning storage unit',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'storage',
        value: '"FileStorage:/root/.local/share/caddy"',
      },
      {
        key: 'ts',
        value: '1743542845.9270246',
      },
    ],
  },
  {
    timestamp: '2025-04-01T21:27:33.793860276Z',
    message: 'finished cleaning storage units',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '67bf96f4-4575-4da8-a373-131996d24fc2',
      deploymentId: 'ec7bd195-dbde-4909-a31f-7966eb449de2',
      deploymentInstanceId: 'c7705229-e77c-4ad2-9dec-849aa0b4ab80',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
      {
        key: 'logger',
        value: '"tls"',
      },
      {
        key: 'ts',
        value: '1743542845.9272745',
      },
    ],
  },
];

export const MOCK_PSQL_DEPLOY_LOGS: DeployLog[] = [
  {
    timestamp: '2025-03-29T05:25:04.000000000Z',
    message:
      'Mounting volume on: /var/lib/containers/railwayapp/bind-mounts/13a54d2c-8496-45bc-9ed3-eec66edc3c33/vol_dr93zgy91vzoh94u',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:06.000000000Z',
    message: 'Starting Container',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077176153Z',
    message: 'Certificate will not expire',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077189731Z',
    message: '',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077205678Z',
    message:
      'PostgreSQL Database directory appears to contain a database; Skipping initialization',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077218756Z',
    message: '',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077239661Z',
    message:
      '2025-03-29 05:25:06.692 UTC [5] LOG:  starting PostgreSQL 16.8 (Debian 16.8-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077258646Z',
    message:
      '2025-03-29 05:25:06.692 UTC [5] LOG:  listening on IPv4 address "0.0.0.0", port 5432',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077364758Z',
    message:
      '2025-03-29 05:25:06.692 UTC [5] LOG:  listening on IPv6 address "::", port 5432',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077386801Z',
    message:
      '2025-03-29 05:25:06.729 UTC [5] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077422333Z',
    message:
      '2025-03-29 05:25:06.740 UTC [28] LOG:  database system was interrupted; last known up at 2025-03-23 21:27:22 UTC',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077440682Z',
    message:
      '2025-03-29 05:25:06.804 UTC [28] LOG:  database system was not properly shut down; automatic recovery in progress',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077456276Z',
    message: '2025-03-29 05:25:06.809 UTC [28] LOG:  redo starts at 0/1B5F5E0',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077472042Z',
    message:
      '2025-03-29 05:25:06.809 UTC [28] LOG:  invalid record length at 0/1B5F618: expected at least 24, got 0',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077491496Z',
    message:
      '2025-03-29 05:25:06.809 UTC [28] LOG:  redo done at 0/1B5F5E0 system usage: CPU: user: 0.00 s, system: 0.00 s, elapsed: 0.00 s',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077530502Z',
    message:
      '2025-03-29 05:25:06.815 UTC [26] LOG:  checkpoint starting: end-of-recovery immediate wait',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077568722Z',
    message:
      '2025-03-29 05:25:06.826 UTC [26] LOG:  checkpoint complete: wrote 3 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.004 s, sync=0.002 s, total=0.014 s; sync files=2, longest=0.001 s, average=0.001 s; distance=0 kB, estimate=0 kB; lsn=0/1B5F618, redo lsn=0/1B5F618',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:09.077883520Z',
    message:
      '2025-03-29 05:25:06.833 UTC [5] LOG:  database system is ready to accept connections',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:12.975080293Z',
    message:
      '2025-03-29 05:25:12.960 UTC [32] LOG:  execute s0: SELECT "public"."User"."id", "public"."User"."email", "public"."User"."password", "public"."User"."providerName"::text, "public"."User"."name", "public"."User"."lastName", "public"."User"."isSuperAdmin", "public"."User"."bio", "public"."User"."audience", "public"."User"."pictureId", "public"."User"."providerId", "public"."User"."timezone", "public"."User"."createdAt", "public"."User"."updatedAt", "public"."User"."lastReadNotifications", "public"."User"."inviteId", "public"."User"."activated", "public"."User"."marketplace", "public"."User"."account", "public"."User"."connectedAccount", "public"."User"."lastOnline", "public"."User"."ip", "public"."User"."agent" FROM "public"."User" WHERE ("public"."User"."email" = $1 AND "public"."User"."providerName" = CAST($2::text AS "public"."Provider")) LIMIT $3 OFFSET $4',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:12.975108064Z',
    message:
      "2025-03-29 05:25:12.960 UTC [32] DETAIL:  parameters: $1 = 'daveraj0077@gmail.com', $2 = 'LOCAL', $3 = '1', $4 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.262763125Z',
    message: '2025-03-29 05:25:13.258 UTC [32] LOG:  statement: BEGIN',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.281634775Z',
    message:
      '2025-03-29 05:25:13.268 UTC [32] LOG:  execute s1: INSERT INTO "public"."Organization" ("id","name","apiKey","createdAt","updatedAt","allowTrial") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "public"."Organization"."id"',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.281683103Z',
    message:
      "2025-03-29 05:25:13.268 UTC [32] DETAIL:  parameters: $1 = '2e3c03ab-c519-47a6-9970-256a08e47603', $2 = 'raj', $3 = '3a78911b711b19b218ef48138df7c9b25fe14e78fbd573d5bdff3cb28855552b', $4 = '2025-03-29 05:25:13.257', $5 = '2025-03-29 05:25:13.257', $6 = 't'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.281745281Z',
    message:
      '2025-03-29 05:25:13.276 UTC [32] LOG:  execute s2: INSERT INTO "public"."User" ("id","email","password","providerName","isSuperAdmin","audience","providerId","timezone","createdAt","updatedAt","lastReadNotifications","activated","marketplace","connectedAccount","lastOnline","ip","agent") VALUES ($1,$2,$3,CAST($4::text AS "public"."Provider"),$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING "public"."User"."id"',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.281812376Z',
    message:
      "2025-03-29 05:25:13.276 UTC [32] DETAIL:  parameters: $1 = '5400858a-dc1a-476a-bf56-5bb97a24fb4f', $2 = 'daveraj0077@gmail.com', $3 = '$2b$10$XNthiwMMuivVHIeMt7oN.OMr/w/cRa/CX91XFUFp69zUTjIsssmDW', $4 = 'LOCAL', $5 = 'f', $6 = '0', $7 = '', $8 = '0', $9 = '2025-03-29 05:25:13.257', $10 = '2025-03-29 05:25:13.257', $11 = '2025-03-29 05:25:13.257', $12 = 't', $13 = 't', $14 = 'f', $15 = '2025-03-29 05:25:13.257', $16 = '100.64.0.18', $17 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.289242816Z',
    message:
      '2025-03-29 05:25:13.286 UTC [32] LOG:  execute s3: INSERT INTO "public"."UserOrganization" ("id","userId","organizationId","disabled","role","createdAt","updatedAt") VALUES ($1,$2,$3,$4,CAST($5::text AS "public"."Role"),$6,$7) RETURNING "public"."UserOrganization"."id"',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.289294344Z',
    message:
      "2025-03-29 05:25:13.286 UTC [32] DETAIL:  parameters: $1 = '346b044c-e714-4403-b21e-25f76cc4e8e4', $2 = '5400858a-dc1a-476a-bf56-5bb97a24fb4f', $3 = '2e3c03ab-c519-47a6-9970-256a08e47603', $4 = 'f', $5 = 'SUPERADMIN', $6 = '2025-03-29 05:25:13.257', $7 = '2025-03-29 05:25:13.257'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.298184535Z',
    message:
      '2025-03-29 05:25:13.297 UTC [32] LOG:  execute s4: SELECT "public"."Organization"."id" FROM "public"."Organization" WHERE "public"."Organization"."id" = $1 LIMIT $2 OFFSET $3',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.298238571Z',
    message:
      "2025-03-29 05:25:13.297 UTC [32] DETAIL:  parameters: $1 = '2e3c03ab-c519-47a6-9970-256a08e47603', $2 = '1', $3 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.307664788Z',
    message:
      '2025-03-29 05:25:13.304 UTC [32] LOG:  execute s5: SELECT "public"."UserOrganization"."id", "public"."UserOrganization"."userId", "public"."UserOrganization"."organizationId" FROM "public"."UserOrganization" WHERE "public"."UserOrganization"."organizationId" IN ($1) OFFSET $2',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.307697031Z',
    message:
      "2025-03-29 05:25:13.304 UTC [32] DETAIL:  parameters: $1 = '2e3c03ab-c519-47a6-9970-256a08e47603', $2 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.311140218Z',
    message:
      '2025-03-29 05:25:13.310 UTC [32] LOG:  execute s6: SELECT "public"."User"."id", "public"."User"."email", "public"."User"."password", "public"."User"."providerName"::text, "public"."User"."name", "public"."User"."lastName", "public"."User"."isSuperAdmin", "public"."User"."bio", "public"."User"."audience", "public"."User"."pictureId", "public"."User"."providerId", "public"."User"."timezone", "public"."User"."createdAt", "public"."User"."updatedAt", "public"."User"."lastReadNotifications", "public"."User"."inviteId", "public"."User"."activated", "public"."User"."marketplace", "public"."User"."account", "public"."User"."connectedAccount", "public"."User"."lastOnline", "public"."User"."ip", "public"."User"."agent" FROM "public"."User" WHERE "public"."User"."id" IN ($1) OFFSET $2',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.311168445Z',
    message:
      "2025-03-29 05:25:13.310 UTC [32] DETAIL:  parameters: $1 = '5400858a-dc1a-476a-bf56-5bb97a24fb4f', $2 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:13.320756339Z',
    message: '2025-03-29 05:25:13.316 UTC [32] LOG:  statement: COMMIT',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:17.181816032Z',
    message:
      '2025-03-29 05:25:16.610 UTC [32] LOG:  execute s7: SELECT "public"."Organization"."id", "public"."Organization"."name", "public"."Organization"."description", "public"."Organization"."apiKey", "public"."Organization"."paymentId", "public"."Organization"."createdAt", "public"."Organization"."updatedAt", "public"."Organization"."allowTrial" FROM "public"."Organization" WHERE ("public"."Organization"."id") IN (SELECT "t1"."organizationId" FROM "public"."UserOrganization" AS "t1" WHERE ("t1"."userId" = $1 AND "t1"."organizationId" IS NOT NULL)) OFFSET $2',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:17.181844484Z',
    message:
      "2025-03-29 05:25:16.610 UTC [32] DETAIL:  parameters: $1 = '5400858a-dc1a-476a-bf56-5bb97a24fb4f', $2 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:17.181882851Z',
    message:
      '2025-03-29 05:25:16.612 UTC [32] LOG:  execute s8: SELECT "public"."UserOrganization"."id", "public"."UserOrganization"."disabled", "public"."UserOrganization"."role"::text, "public"."UserOrganization"."organizationId" FROM "public"."UserOrganization" WHERE ("public"."UserOrganization"."userId" = $1 AND "public"."UserOrganization"."organizationId" IN ($2)) OFFSET $3',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:17.181906954Z',
    message:
      "2025-03-29 05:25:16.612 UTC [32] DETAIL:  parameters: $1 = '5400858a-dc1a-476a-bf56-5bb97a24fb4f', $2 = '2e3c03ab-c519-47a6-9970-256a08e47603', $3 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:17.181941729Z',
    message:
      '2025-03-29 05:25:16.620 UTC [32] LOG:  execute s9: SELECT "public"."Subscription"."id", "public"."Subscription"."subscriptionTier"::text, "public"."Subscription"."totalChannels", "public"."Subscription"."isLifetime", "public"."Subscription"."createdAt", "public"."Subscription"."organizationId" FROM "public"."Subscription" WHERE "public"."Subscription"."organizationId" IN ($1) OFFSET $2',
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
  {
    timestamp: '2025-03-29T05:25:17.181962886Z',
    message:
      "2025-03-29 05:25:16.620 UTC [32] DETAIL:  parameters: $1 = '2e3c03ab-c519-47a6-9970-256a08e47603', $2 = '0'",
    severity: 'error',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '15491bd6-9e85-41f9-af8f-bc87f858fe21',
      deploymentId: 'd5b163b2-3c76-4ae9-b998-6c0c45b75102',
      deploymentInstanceId: '13a54d2c-8496-45bc-9ed3-eec66edc3c33',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"error"',
      },
    ],
  },
];

export const MOCK_REDIS_DEPLOY_LOGS: DeployLog[] = [
  {
    timestamp: '2025-04-01T14:05:50.306810756Z',
    message:
      '1:M 01 Apr 2025 14:05:43.263 * Background saving terminated with success',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:13:14.905652869Z',
    message:
      '1:M 01 Apr 2025 14:13:13.238 * 100 changes in 300 seconds. Saving...',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:13:14.905671160Z',
    message:
      '1:M 01 Apr 2025 14:13:13.239 * Background saving started by pid 1655',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:13:14.905689989Z',
    message: '1655:C 01 Apr 2025 14:13:13.245 * DB saved on disk',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:13:14.905706586Z',
    message:
      '1655:C 01 Apr 2025 14:13:13.245 * Fork CoW for RDB: current 1 MB, peak 1 MB, average 0 MB',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:13:14.905722202Z',
    message:
      '1:M 01 Apr 2025 14:13:13.339 * Background saving terminated with success',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:21:19.572005406Z',
    message:
      '1:M 01 Apr 2025 14:21:13.261 * 100 changes in 300 seconds. Saving...',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:21:19.572028734Z',
    message:
      '1:M 01 Apr 2025 14:21:13.261 * Background saving started by pid 1656',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:21:19.572044999Z',
    message: '1656:C 01 Apr 2025 14:21:13.268 * DB saved on disk',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:21:19.572061798Z',
    message:
      '1656:C 01 Apr 2025 14:21:13.268 * Fork CoW for RDB: current 1 MB, peak 1 MB, average 1 MB',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:21:19.572077485Z',
    message:
      '1:M 01 Apr 2025 14:21:13.363 * Background saving terminated with success',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:28:52.775905141Z',
    message:
      '1:M 01 Apr 2025 14:28:43.249 * 100 changes in 300 seconds. Saving...',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:28:52.775944650Z',
    message:
      '1:M 01 Apr 2025 14:28:43.249 * Background saving started by pid 1657',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:28:52.775964872Z',
    message: '1657:C 01 Apr 2025 14:28:43.255 * DB saved on disk',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:28:52.775983620Z',
    message:
      '1657:C 01 Apr 2025 14:28:43.255 * Fork CoW for RDB: current 1 MB, peak 1 MB, average 0 MB',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:28:52.776000251Z',
    message:
      '1:M 01 Apr 2025 14:28:43.350 * Background saving terminated with success',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:36:15.663710541Z',
    message:
      '1:M 01 Apr 2025 14:36:13.321 * 100 changes in 300 seconds. Saving...',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:36:15.663743983Z',
    message:
      '1:M 01 Apr 2025 14:36:13.322 * Background saving started by pid 1658',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:36:15.663770423Z',
    message: '1658:C 01 Apr 2025 14:36:13.330 * DB saved on disk',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:36:15.663794005Z',
    message:
      '1658:C 01 Apr 2025 14:36:13.330 * Fork CoW for RDB: current 1 MB, peak 1 MB, average 0 MB',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:36:15.663809795Z',
    message:
      '1:M 01 Apr 2025 14:36:13.423 * Background saving terminated with success',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:44:19.399795255Z',
    message:
      '1:M 01 Apr 2025 14:44:13.380 * 100 changes in 300 seconds. Saving...',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:44:19.399824206Z',
    message:
      '1:M 01 Apr 2025 14:44:13.381 * Background saving started by pid 1659',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:44:19.399842166Z',
    message: '1659:C 01 Apr 2025 14:44:13.387 * DB saved on disk',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:44:19.399860252Z',
    message:
      '1659:C 01 Apr 2025 14:44:13.387 * Fork CoW for RDB: current 1 MB, peak 1 MB, average 1 MB',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:44:19.399876511Z',
    message:
      '1:M 01 Apr 2025 14:44:13.481 * Background saving terminated with success',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:51:51.591163101Z',
    message:
      '1:M 01 Apr 2025 14:51:43.447 * 100 changes in 300 seconds. Saving...',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:51:51.591186556Z',
    message:
      '1:M 01 Apr 2025 14:51:43.447 * Background saving started by pid 1660',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:51:51.591204386Z',
    message: '1660:C 01 Apr 2025 14:51:43.453 * DB saved on disk',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
  {
    timestamp: '2025-04-01T14:51:51.591223877Z',
    message:
      '1660:C 01 Apr 2025 14:51:43.453 * Fork CoW for RDB: current 1 MB, peak 1 MB, average 0 MB',
    severity: 'info',
    tags: {
      projectId: '2f46fed7-bb3b-4cc3-a34e-82773c92799a',
      environmentId: '46e21bf7-f12b-4995-ae51-9969d2113ed7',
      pluginId: null,
      serviceId: '7813e25d-ac72-4f87-b4a5-bb16b5390c21',
      deploymentId: 'efc8b240-2e0b-40e3-85b4-561640f330fd',
      deploymentInstanceId: '494ceffa-0e42-4a83-bae0-47729db3033d',
      snapshotId: null,
    },
    attributes: [
      {
        key: 'level',
        value: '"info"',
      },
    ],
  },
];

export const MOCK_LATEST_DEPLOYMENTS_LOGS_MAP = new Map<string, DeployLog[]>([
  [MOCK_POSTIZ_LATEST_DEPLOYMENT_ID, MOCK_POSTIZ_DEPLOY_LOGS],
  [MOCK_PSQL_LATEST_DEPLOYMENT_ID, MOCK_PSQL_DEPLOY_LOGS],
  [MOCK_REDIS_LATEST_DEPLOYMENT_ID, MOCK_REDIS_DEPLOY_LOGS],
]);
