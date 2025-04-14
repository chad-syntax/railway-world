import WebSocket from 'ws';
import { FastifyRequest } from 'fastify';
import {
  WebSocketMessage,
  RailwayData,
  HttpLog,
  LatestDeployment,
  DeployLog,
} from '../types';
import { GRAPHQL_WS_API_URL } from '../constants';
import { railwayDataQuery } from './graphql/railway-data-query';
import { gqlRequest } from './graphql/request';
import { processRailwayData } from './graphql/railway-data-query';
import { RAILWAY_HTTP_LOGS_SUBSCRIPTION } from './graphql/railway-http-logs-subscription';
import {
  LatestDeploymentsResponse,
  requestLatestDeployments,
} from './graphql/latest-deployments-query';
import { config } from 'dotenv';
import {
  MOCK_HTTP_LOGS,
  MOCK_LATEST_DEPLOYMENTS,
  MOCK_RAILWAY_DATA,
  MOCK_POSTIZ_LATEST_DEPLOYMENT_ID,
  MOCK_LATEST_DEPLOYMENTS_LOGS_MAP,
} from '../mock-data';
import { wait } from '../utils';
import { RAILWAY_DEPLOY_LOGS_SUBSCRIPTION } from './graphql/railway-deploy-logs-subscription';

config();

const railwayToken = process.env.RAILWAY_WORLD_TOKEN!;
const railwayProjectId = process.env.RAILWAY_WORLD_PROJECT_ID!;
const isMockDataMode = process.env.MOCK_DATA === 'true';

const getRailwayData = async (): Promise<RailwayData> => {
  if (isMockDataMode) {
    return processRailwayData(MOCK_RAILWAY_DATA);
  }

  if (!railwayToken || !railwayProjectId) {
    console.error(
      'Missing required environment variables, cannot fetch railway data'
    );
    throw new Error('Missing required environment variables');
  }

  const response = await gqlRequest(
    railwayDataQuery,
    {
      id: railwayProjectId,
    },
    {
      Authorization: `Bearer ${railwayToken}`,
    }
  );

  // Process the data into our client-friendly format
  const processedData: RailwayData = processRailwayData(response);

  return processedData;
};

type SendGqlSubscriptionsCommandOptions = {
  environmentId: string;
  serviceId: string;
  deploymentId: string;
  snapshotId: string;
  isHttpService: boolean;
  createdAt: string;
};

export class LiveDataService {
  // GQL WebSocket state
  private gqlWs: WebSocket | null = null;
  private gqlReSubscribeTimeout: NodeJS.Timeout | null = null;
  private gqlConnectAttempts: number = 0;
  private gqlSubscriptions: Set<string> = new Set();
  private gqlServiceSubscriptions: Map<string, Set<string>> = new Map();

  // Our WebSocket state
  private clientConnections: WebSocket[] = [];
  private isIntentionalClose: boolean = false;

  // Railway data state
  private initialRailwayDataPromise: Promise<RailwayData>;
  private initialRailwayDataAttempts: number = 0;
  private logsCache: Map<string, HttpLog[] | DeployLog[]> = new Map();
  private cachedSubscriptionOptions: SendGqlSubscriptionsCommandOptions[] = [];

  // Latest deployments polling state
  private latestDeployments: LatestDeployment[] | null = null;
  private latestDeploymentsInterval: NodeJS.Timeout | null = null;
  private latestDeploymentsIntervalMs: number = 5 * 1000; // every 5 seconds, more will surpass rate limit

  // Mock data state
  private mockHttpLogsInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialRailwayDataPromise = this.initializeRailwayData();
  }

  private initializeRailwayData = async () => {
    let data: RailwayData | null = null;

    while (!data) {
      try {
        data = await getRailwayData();
      } catch (error) {
        console.error('Error initializing railway data:', error);
        this.initialRailwayDataAttempts++;
        await wait(this.initialRailwayDataAttempts ** 2 * 1000);

        if (this.initialRailwayDataAttempts > 5) {
          console.error('Failed to initialize railway data');
          throw error;
        }
      }
    }

    return data;
  };

  private handleClientMessage(
    socket: WebSocket.WebSocket,
    message: WebSocketMessage
  ) {
    switch (message.eventName) {
      case 'ping':
        this.handlePing(socket);
        break;
    }
  }

  private handlePing(socket: WebSocket.WebSocket) {
    console.log('Received ping, sending pong');
    this.sendClientMessage(socket, {
      eventName: 'pong',
      ts: Date.now(),
    });
  }

  private sendClientMessage(
    socket: WebSocket.WebSocket,
    message: WebSocketMessage
  ) {
    socket.send(JSON.stringify(message));
  }

  private handleRawClientMessage(
    socket: WebSocket.WebSocket,
    message: WebSocket.RawData
  ) {
    let parsedMessage: WebSocketMessage;

    try {
      parsedMessage = JSON.parse(message.toString());
      this.handleClientMessage(socket, parsedMessage);
    } catch (error) {
      console.error('error parsing message', error);
    }
  }

  private handleClientClose = (socket: WebSocket.WebSocket) => {
    this.clientConnections = this.clientConnections.filter(
      (conn) => conn !== socket
    );
    setTimeout(() => {
      // delayed check to stop listening for data, adding delay to allow for 1 client to refresh
      if (this.clientConnections.length === 0) {
        console.log('no clients left, stopping listening for data');
        this.stopListeningForData();
      }
    }, 2000);
  };

  private handleClientError = (_: WebSocket.WebSocket, error: Error) => {
    console.error('client error', error);
  };

  onClientConnection = (socket: WebSocket.WebSocket, _: FastifyRequest) => {
    socket.on('message', (message) =>
      this.handleRawClientMessage(socket, message)
    );
    socket.on('close', () => this.handleClientClose(socket));
    socket.on('error', (error) => this.handleClientError(socket, error));

    this.addConnection(socket);
  };

  private addConnection(socket: WebSocket.WebSocket) {
    if (this.clientConnections.length === 0) {
      this.startListeningForData();
    }

    for (const [id, logs] of this.logsCache.entries()) {
      console.log('sending cached logs for new connection', id);
      const isHttpLogs = id.startsWith('http-');

      const eventName = isHttpLogs ? 'httpLogs' : 'deployLogs';
      const deploymentId = id.replace('http-', '').replace('deploy-', '');

      this.sendClientMessage(socket, {
        eventName,
        deploymentId,
        logs,
      } as WebSocketMessage);
    }

    this.clientConnections.push(socket);
  }

  private startListeningForData() {
    this.startGqlSubscriptionForLogs();
    this.startPollingForLatestDeployments();
  }

  private stopListeningForData() {
    this.stopGqlSubscriptionForLogs();
    this.stopPollingForLatestDeployments();
  }

  private onGqlWsOpen = () => {
    console.log('Connected to Railway GQL WebSocket');

    this.gqlWs!.send(
      JSON.stringify({
        type: 'connection_init',
        payload: {
          Authorization: `Bearer ${railwayToken}`,
        },
      })
    );
  };

  private sendGqlSubscriptionsCommand = (
    options: SendGqlSubscriptionsCommandOptions
  ) => {
    const {
      environmentId,
      serviceId,
      deploymentId,
      snapshotId,
      isHttpService,
      createdAt,
    } = options;

    const subscriptionIds = new Set<string>();

    if (isHttpService) {
      const httpSubscriptionId = `http-${deploymentId}`;
      const httpLogsSubscribeMessage = {
        id: httpSubscriptionId,
        type: 'subscribe',
        payload: {
          query: RAILWAY_HTTP_LOGS_SUBSCRIPTION,
          variables: {
            deploymentId,
            beforeLimit: 500,
            // do not fetch previous logs, only latest because of the real-time nature of the request visualization
            beforeDate: new Date().toISOString(),
          },
        },
      };

      console.log('sending subscribe command', httpSubscriptionId);

      this.gqlWs!.send(JSON.stringify(httpLogsSubscribeMessage));
      this.gqlSubscriptions.add(httpSubscriptionId);
      subscriptionIds.add(httpSubscriptionId);
    }

    const deployLogsSubscriptionId = `deploy-${deploymentId}`;
    const beforeDate = createdAt;
    const filter = `(  ) @deployment:${deploymentId} -@replica:${snapshotId}`;

    const deployLogsSubscribeMessage = {
      id: deployLogsSubscriptionId,
      type: 'subscribe',
      payload: {
        query: RAILWAY_DEPLOY_LOGS_SUBSCRIPTION,
        variables: {
          environmentId,
          beforeLimit: 100,
          beforeDate,
          filter,
        },
      },
    };

    console.log('sending subscribe command', deployLogsSubscriptionId);

    subscriptionIds.add(deployLogsSubscriptionId);

    this.gqlWs!.send(JSON.stringify(deployLogsSubscribeMessage));
    this.gqlSubscriptions.add(deployLogsSubscriptionId);
    this.gqlServiceSubscriptions.set(serviceId, subscriptionIds);
  };

  private unsubscribeFromDeployment = (deploymentId: string) => {
    console.log('Unsubscribing from deployment', deploymentId);
    this.gqlSubscriptions.delete(deploymentId);
    this.gqlWs!.send(JSON.stringify({ id: deploymentId, type: 'unsubscribe' }));
  };

  private onGqlWsMessage = (data: WebSocket.RawData) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'connection_ack':
          console.log('Connection acknowledged');

          this.initialRailwayDataPromise.then((initialRailwayData) => {
            console.log('initializing subscriptions');

            // we overwrite this with the latest deployments and send the commands from there instead of initial data
            if (this.cachedSubscriptionOptions.length !== 0) {
              for (const options of this.cachedSubscriptionOptions) {
                this.sendGqlSubscriptionsCommand(options);
              }

              return;
            }

            // we need to update something here on the class with latest deployments, otherwise this will subscribe to old deployments
            for (const service of initialRailwayData.services) {
              this.sendGqlSubscriptionsCommand({
                environmentId: initialRailwayData.environmentId,
                serviceId: service.id,
                deploymentId: service.latestDeployment.id,
                snapshotId: service.latestDeployment.snapshotId,
                isHttpService: service.domains.length > 0,
                createdAt: service.latestDeployment.createdAt,
              });
            }
          });

          break;
        case 'next':
          const httpLogs = message.payload.data.httpLogs as HttpLog[];

          if (message.id && httpLogs) {
            const cachedLogs = this.logsCache.get(message.id);

            if (cachedLogs) {
              this.logsCache.set(
                message.id,
                (cachedLogs as HttpLog[]).concat(httpLogs).slice(-120)
              );
            }

            if (httpLogs.length > 0) {
              this.clientConnections.forEach((conn) => {
                this.sendClientMessage(conn, {
                  eventName: 'httpLogs',
                  deploymentId: message.id.replace('http-', ''),
                  logs: httpLogs,
                });
              });
            }
          }

          const deployLogs = message?.payload?.data
            ?.environmentLogs as DeployLog[];

          if (message.id && deployLogs) {
            const cachedLogs = this.logsCache.get(message.id);

            if (cachedLogs) {
              this.logsCache.set(
                message.id,
                (cachedLogs as DeployLog[]).concat(deployLogs).slice(-120)
              );
            }

            this.clientConnections.forEach((conn) => {
              this.sendClientMessage(conn, {
                eventName: 'deployLogs',
                deploymentId: message.id.replace('deploy-', ''),
                logs: deployLogs,
              });
            });
          }
          break;
        case 'error':
          console.error(
            'Subscription error:',
            JSON.stringify(message.payload, null, 2)
          );
          this.gqlSubscriptions.delete(message.id);
          break;
        case 'complete':
          console.log('Subscription completed');
          this.gqlSubscriptions.delete(message.id);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  private onGqlWsClose = (code: number, reason: Buffer) => {
    const reasonStr = reason.toString();
    const isDeadlineExceeded = reasonStr === 'deadline_exceeded';

    console.log('WebSocket closed:', {
      code,
      reason: reasonStr,
      intentional: this.isIntentionalClose,
    });

    // if socket closes and there are no clients, stop the gql subscription
    if (this.clientConnections.length === 0) {
      this.stopGqlSubscriptionForLogs();
      return;
    }

    if (this.gqlConnectAttempts < 3) {
      console.log('Attempting to reconnect to Railway GQL WebSocket...');
      if (!this.isIntentionalClose && !isDeadlineExceeded) {
        this.gqlConnectAttempts++;
      }

      const retryTimeoutMs = isDeadlineExceeded
        ? 20 * 1000 // longer timeout for deadline exceeded, want to avoid rate limiting issues
        : (this.gqlConnectAttempts || 1) * 5000;

      this.gqlReSubscribeTimeout = setTimeout(() => {
        this.gqlWs = null;
        this.gqlSubscriptions.clear();
        this.startGqlSubscriptionForLogs();
      }, retryTimeoutMs);
    } else {
      console.error('Failed to connect to Railway GQL WebSocket');
      this.stopGqlSubscriptionForLogs();
    }
  };

  private startGqlSubscriptionForLogs() {
    if (this.gqlWs) return;

    if (isMockDataMode) {
      if (!this.mockHttpLogsInterval) {
        this.mockHttpLogsInterval = setInterval(() => {
          this.clientConnections.forEach((conn) => {
            this.sendClientMessage(conn, {
              eventName: 'httpLogs',
              deploymentId: MOCK_POSTIZ_LATEST_DEPLOYMENT_ID,
              logs: MOCK_HTTP_LOGS,
            });

            const latestDeployments =
              MOCK_LATEST_DEPLOYMENTS.project.environments.edges.flatMap(
                (edge) =>
                  edge.node.serviceInstances.edges.map(
                    (instance) => instance.node
                  )
              );

            for (const deployment of latestDeployments) {
              const mockDeployLogs = MOCK_LATEST_DEPLOYMENTS_LOGS_MAP.get(
                deployment.latestDeployment.id
              );

              if (mockDeployLogs) {
                this.sendClientMessage(conn, {
                  eventName: 'deployLogs',
                  deploymentId: deployment.latestDeployment.id,
                  logs: mockDeployLogs,
                });
              }
            }
          });
        }, 10000);
      }

      return;
    }

    this.gqlWs = new WebSocket(GRAPHQL_WS_API_URL, ['graphql-transport-ws'], {
      headers: {
        Authorization: `Bearer ${railwayToken}`,
      },
    });

    this.gqlWs.on('open', this.onGqlWsOpen);

    this.gqlWs.on('message', this.onGqlWsMessage);

    this.gqlWs.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.gqlWs.on('close', this.onGqlWsClose);
  }

  private startPollingForLatestDeployments() {
    if (this.latestDeploymentsInterval) return;

    this.latestDeploymentsInterval = setInterval(async () => {
      let latestDeploymentsData: LatestDeploymentsResponse;

      if (!isMockDataMode) {
        try {
          latestDeploymentsData = await requestLatestDeployments(
            railwayProjectId
          );
        } catch (error) {
          console.error('Error polling for latest deployments:', error);
          return;
        }
      } else {
        latestDeploymentsData = MOCK_LATEST_DEPLOYMENTS;
      }

      const latestDeployments =
        latestDeploymentsData.project.environments.edges.flatMap((edge) =>
          edge.node.serviceInstances.edges.map((instance) => instance.node)
        );

      if (
        isMockDataMode ||
        JSON.stringify(this.latestDeployments) !==
          JSON.stringify(latestDeployments)
      ) {
        for (const latestDeployment of latestDeployments) {
          const subscriptionIds =
            this.gqlServiceSubscriptions.get(latestDeployment.serviceId) ??
            new Set<string>();

          const isHttpService =
            latestDeployment.domains.serviceDomains.length > 0 ||
            latestDeployment.domains.customDomains.length > 0;

          const isDeployed =
            latestDeployment.latestDeployment.status === 'SUCCESS';

          if (isHttpService) {
            const httpSubscriptionId = `http-${latestDeployment.latestDeployment.id}`;
            if (!subscriptionIds.has(httpSubscriptionId)) {
              const currentServiceHttpSubscription = Array.from(
                subscriptionIds
              ).find((id) => id.startsWith('http-'));

              if (currentServiceHttpSubscription) {
                subscriptionIds.delete(currentServiceHttpSubscription);
                this.logsCache.delete(currentServiceHttpSubscription);
              }
            }
          }

          if (
            !subscriptionIds.has(
              `deploy-${latestDeployment.latestDeployment.id}`
            )
          ) {
            const currentServiceDeploySubscription = Array.from(
              subscriptionIds
            ).find((id) => id.startsWith('deploy-'));

            if (currentServiceDeploySubscription) {
              subscriptionIds.delete(currentServiceDeploySubscription);
              this.logsCache.delete(currentServiceDeploySubscription);
            }

            const environmentId =
              latestDeploymentsData.project.environments.edges[0].node.id;

            const isHttpService =
              latestDeployment.domains.serviceDomains.length > 0 ||
              latestDeployment.domains.customDomains.length > 0;

            if (isDeployed) {
              this.cachedSubscriptionOptions =
                this.cachedSubscriptionOptions.filter(
                  (options) => options.serviceId !== latestDeployment.serviceId
                );

              const newOptions = {
                environmentId,
                serviceId: latestDeployment.serviceId,
                deploymentId: latestDeployment.latestDeployment.id,
                snapshotId: latestDeployment.latestDeployment.snapshotId,
                isHttpService,
                createdAt: latestDeployment.latestDeployment.createdAt,
              };

              this.cachedSubscriptionOptions.push(newOptions);

              this.sendGqlSubscriptionsCommand(newOptions);
            }
          }
        }

        this.latestDeployments = latestDeployments;
        this.clientConnections.forEach((conn) => {
          this.sendClientMessage(conn, {
            eventName: 'latestDeployments',
            nodes: latestDeployments,
          });
        });
      }
    }, this.latestDeploymentsIntervalMs);
  }

  private stopGqlSubscriptionForLogs() {
    if (this.mockHttpLogsInterval) {
      clearInterval(this.mockHttpLogsInterval);
      this.mockHttpLogsInterval = null;
    }

    this.gqlConnectAttempts = 0;
    if (this.gqlWs) {
      this.isIntentionalClose = true;
      this.gqlWs.close();
      this.gqlWs = null;
      this.gqlSubscriptions.clear();
      this.isIntentionalClose = false;
      if (this.gqlReSubscribeTimeout) {
        clearTimeout(this.gqlReSubscribeTimeout);
        this.gqlReSubscribeTimeout = null;
      }
    }
  }

  private stopPollingForLatestDeployments() {
    if (this.latestDeploymentsInterval) {
      clearInterval(this.latestDeploymentsInterval);
      this.latestDeploymentsInterval = null;
    }
  }
}
