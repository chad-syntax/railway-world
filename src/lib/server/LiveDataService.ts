import WebSocket from 'ws';
import { FastifyRequest } from 'fastify';
import {
  WebSocketMessage,
  RailwayData,
  HttpLog,
  LatestDeployment,
} from '../types';
import { GRAPHQL_WS_API_URL } from '../constants';
import { railwayDataQuery } from './graphql/railway-data-query';
import { gqlRequest } from './graphql/request';
import { processRailwayData } from './graphql/railway-data-query';
import { railwayHttpLogsSubscription } from './graphql/railway-http-logs-subscription';
import {
  LatestDeploymentsResponse,
  requestLatestDeployments,
} from './graphql/latest-deployments-query';
import { config } from 'dotenv';

config();

const railwayToken = process.env.RAILWAY_WORLD_TOKEN!;
const railwayProjectId = process.env.RAILWAY_WORLD_PROJECT_ID!;

const getRailwayData = async (): Promise<RailwayData> => {
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

export class LiveDataService {
  private gqlWs: WebSocket | null = null;
  private clientConnections: WebSocket[] = [];
  private gqlSubscriptionTimeout: NodeJS.Timeout | null = null;
  private isIntentionalClose: boolean = false;
  private railwayDataPromise: Promise<RailwayData>;
  private httpDeploymentIds: string[] = [];
  private latestDeployments: LatestDeployment[] | null = null;
  private latestDeploymentsInterval: NodeJS.Timeout | null = null;
  private gqlDeploymentSubscriptions: Set<string> = new Set();
  private attempts: number = 0;
  private latestDeploymentsIntervalMs: number = 20 * 1000; // every 20 seconds, more will surpass rate limit

  constructor() {
    this.railwayDataPromise = getRailwayData().then((data) => {
      this.httpDeploymentIds = data.services
        .filter((service) => service.domains.length > 0)
        .map((service) => service.latestDeployment.id);
      return data;
    });
  }

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

  private sendGqlSubscriptionsCommand = (deploymentId: string) => {
    if (this.gqlDeploymentSubscriptions.has(deploymentId)) {
      return;
    }

    console.log('Subscribing to deployment', deploymentId);

    const subscribeMessage = {
      id: deploymentId,
      type: 'subscribe',
      payload: {
        query: railwayHttpLogsSubscription,
        variables: {
          deploymentId,
          beforeLimit: 500,
          beforeDate: new Date().toISOString(),
        },
      },
    };

    this.gqlWs!.send(JSON.stringify(subscribeMessage));
    this.gqlDeploymentSubscriptions.add(deploymentId);
  };

  private unsubscribeFromDeployment = (deploymentId: string) => {
    console.log('Unsubscribing from deployment', deploymentId);
    this.gqlDeploymentSubscriptions.delete(deploymentId);
    this.gqlWs!.send(JSON.stringify({ id: deploymentId, type: 'unsubscribe' }));
  };

  private onGqlWsMessage = (data: WebSocket.RawData) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'connection_ack':
          console.log('Connection acknowledged');

          this.railwayDataPromise.then(() => {
            for (const deploymentId of this.httpDeploymentIds) {
              this.sendGqlSubscriptionsCommand(deploymentId);
            }
          });

          break;
        case 'next':
          if (message.id && message.payload?.data?.httpLogs) {
            const httpLogs = message.payload.data.httpLogs as HttpLog[];
            if (httpLogs.length > 0) {
              this.clientConnections.forEach((conn) => {
                this.sendClientMessage(conn, {
                  eventName: 'logs',
                  deploymentId: message.id,
                  logs: httpLogs,
                });
              });
            }
          }
          break;
        case 'error':
          console.error(
            'Subscription error:',
            JSON.stringify(message.payload, null, 2)
          );
          this.gqlDeploymentSubscriptions.delete(message.id);
          break;
        case 'complete':
          console.log('Subscription completed');
          this.gqlDeploymentSubscriptions.delete(message.id);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  private onGqlWsClose = (code: number, reason: Buffer) => {
    console.log('WebSocket closed:', {
      code,
      reason: reason.toString(),
      intentional: this.isIntentionalClose,
    });

    if (this.attempts < 3) {
      console.log('Attempting to reconnect to Railway GQL WebSocket...');
      this.attempts++;
      this.gqlSubscriptionTimeout = setTimeout(() => {
        this.gqlWs = null;
        this.gqlDeploymentSubscriptions.clear();
        this.startGqlSubscriptionForLogs();
      }, 5000);
    } else {
      console.error('Failed to connect to Railway GQL WebSocket');
      this.stopGqlSubscriptionForLogs();
    }
  };

  private startGqlSubscriptionForLogs() {
    if (this.gqlWs) return;

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
    this.latestDeploymentsInterval = setInterval(async () => {
      let latestDeploymentsData: LatestDeploymentsResponse;
      try {
        latestDeploymentsData = await requestLatestDeployments(
          railwayProjectId
        );
      } catch (error) {
        console.error('Error polling for latest deployments:', error);
        return;
      }

      const latestDeployments =
        latestDeploymentsData.project.environments.edges.flatMap((edge) =>
          edge.node.serviceInstances.edges.map((instance) => instance.node)
        );

      if (
        JSON.stringify(this.latestDeployments) !==
        JSON.stringify(latestDeployments)
      ) {
        const newHttpDeploymentIds = latestDeployments
          .filter(
            (deployment) =>
              deployment.domains.serviceDomains.length > 0 ||
              deployment.domains.customDomains.length > 0
          )
          .map((deployment) => deployment.latestDeployment.id);

        // if any deployments have been removed, unsubscribe from them
        this.httpDeploymentIds.forEach((deploymentId) => {
          if (!newHttpDeploymentIds.includes(deploymentId)) {
            this.unsubscribeFromDeployment(deploymentId);
          }
        });

        // if any new deployments have been added, subscribe to them
        newHttpDeploymentIds.forEach((deploymentId) => {
          if (!this.httpDeploymentIds.includes(deploymentId)) {
            this.sendGqlSubscriptionsCommand(deploymentId);
          }
        });

        this.httpDeploymentIds = newHttpDeploymentIds;

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
    this.attempts = 0;
    if (this.gqlWs) {
      this.isIntentionalClose = true;
      this.gqlWs.close();
      this.gqlWs = null;
      this.gqlDeploymentSubscriptions.clear();
      if (this.gqlSubscriptionTimeout) {
        clearTimeout(this.gqlSubscriptionTimeout);
        this.gqlSubscriptionTimeout = null;
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
