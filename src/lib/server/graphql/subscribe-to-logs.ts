import WebSocket from 'ws';
import { GRAPHQL_WS_API_URL } from '../../constants';
import { requestLatestDeployments } from './latest-deployments-query';
import { Deployment } from '../../types';

export interface HttpLog {
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  host: string;
  httpStatus: number;
  upstreamProto: string;
  downstreamProto: string;
  responseDetails: string;
  totalDuration: number;
  upstreamAddress: string;
  clientUa: string;
  upstreamRqDuration: number;
  txBytes: number;
  rxBytes: number;
  srcIp: string;
  edgeRegion: string;
}

export interface HttpLogsData {
  httpLogs: HttpLog[];
}

export interface HttpLogsSubscriptionResponse {
  data: HttpLogsData;
}

export interface SubscribeToLogsOptions {
  deploymentId: string;
  filter?: string;
  beforeLimit: number;
  beforeDate?: string;
  anchorDate?: string;
  afterDate?: string;
  onData: (logs: HttpLog[]) => void;
  onError?: (error: Error) => void;
}

type LatestDeploymentsCallback = (
  nodes: {
    serviceId: string;
    latestDeployment: Deployment;
  }[]
) => void;

// Singleton WebSocket connection manager
class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private connectionQueue: (() => void)[] = [];
  private activeSubscriptionIds = new Map<string, string>();
  private latestDeploymentsSubscriptions = new Map<
    string,
    Set<LatestDeploymentsCallback>
  >();
  private latestDeploymentPolls = new Map<string, NodeJS.Timeout>();

  private constructor() {
    this.setupWebSocket();
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private setupWebSocket() {
    if (this.ws) return;

    this.ws = new WebSocket(GRAPHQL_WS_API_URL, ['graphql-transport-ws'], {
      headers: {
        Authorization: `Bearer ${process.env.RAILWAY_WORLD_TOKEN}`,
      },
    });

    this.ws.on('open', () => {
      console.log('Connected to Railway WebSocket');
      this.ws?.send(
        JSON.stringify({
          type: 'connection_init',
          payload: {
            Authorization: `Bearer ${process.env.RAILWAY_WORLD_TOKEN}`,
          },
        })
      );
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'connection_ack':
            console.log('Connection acknowledged');
            this.isConnected = true;
            this.processConnectionQueue();
            break;
          case 'next':
            if (message.id && message.payload?.data?.httpLogs) {
              // Find the deploymentId for this subscription ID
              for (const [
                deploymentId,
                subscriptionId,
              ] of this.activeSubscriptionIds.entries()) {
                if (subscriptionId === message.id) {
                  const callbacks = this.subscriptions.get(deploymentId);
                  if (callbacks) {
                    callbacks.forEach((callback) =>
                      callback(message.payload.data.httpLogs)
                    );
                  }
                  break;
                }
              }
            }
            break;
          case 'error':
            console.error('Subscription error:', message.payload);
            break;
          case 'complete':
            console.log('Subscription completed');
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', (code, reason) => {
      console.log('WebSocket closed:', { code, reason: reason.toString() });
      this.isConnected = false;
      this.ws = null;
      // Attempt to reconnect after a delay
      setTimeout(() => this.setupWebSocket(), 5000);
    });
  }

  private processConnectionQueue() {
    while (this.connectionQueue.length > 0) {
      const callback = this.connectionQueue.shift();
      callback?.();
    }
  }

  async subscribe(options: SubscribeToLogsOptions): Promise<() => void> {
    const deploymentId = options.deploymentId;

    // If we already have a subscription for this deployment, just add the callback
    if (this.subscriptions.has(deploymentId)) {
      const callbacks = this.subscriptions.get(deploymentId)!;
      callbacks.add(options.onData);

      return () => {
        callbacks.delete(options.onData);
        if (callbacks.size === 0) {
          this.unsubscribe(deploymentId);
        }
      };
    }

    // Create new subscription for this deployment
    const subscriptionId = deploymentId; // Use deploymentId as subscriptionId
    this.activeSubscriptionIds.set(deploymentId, subscriptionId);
    this.subscriptions.set(deploymentId, new Set([options.onData]));

    const subscribe = () => {
      if (!this.ws || !this.isConnected) {
        this.connectionQueue.push(() => subscribe());
        return;
      }

      const subscribeMessage = {
        id: subscriptionId,
        type: 'subscribe',
        payload: {
          query: `
            subscription streamHttplogs($deploymentId: String!, $filter: String, $beforeLimit: Int!, $beforeDate: String, $anchorDate: String, $afterDate: String) {
              httpLogs(
                deploymentId: $deploymentId
                filter: $filter
                beforeDate: $beforeDate
                anchorDate: $anchorDate
                afterDate: $afterDate
                beforeLimit: $beforeLimit
              ) {
                requestId
                timestamp
                method
                path
                host
                httpStatus
                upstreamProto
                downstreamProto
                responseDetails
                totalDuration
                upstreamAddress
                clientUa
                upstreamRqDuration
                txBytes
                rxBytes
                srcIp
                edgeRegion
              }
            }
          `,
          variables: {
            deploymentId: options.deploymentId,
            filter: options.filter,
            beforeLimit: options.beforeLimit,
            beforeDate: options.beforeDate,
            anchorDate: options.anchorDate,
            afterDate: options.afterDate,
          },
        },
      };

      this.ws?.send(JSON.stringify(subscribeMessage));
    };

    if (this.isConnected) {
      subscribe();
    } else {
      this.connectionQueue.push(() => subscribe());
      this.setupWebSocket();
    }

    return () => {
      const callbacks = this.subscriptions.get(deploymentId);
      if (callbacks) {
        callbacks.delete(options.onData);
        if (callbacks.size === 0) {
          this.unsubscribe(deploymentId);
        }
      }
    };
  }

  private unsubscribe(deploymentId: string) {
    const subscriptionId = this.activeSubscriptionIds.get(deploymentId);
    if (subscriptionId && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          id: subscriptionId,
          type: 'complete',
        })
      );
    }
    this.activeSubscriptionIds.delete(deploymentId);
    this.subscriptions.delete(deploymentId);
  }

  private pollLatestDeployments(projectId: string) {
    this.latestDeploymentPolls.set(
      projectId,
      setInterval(async () => {
        const response = await requestLatestDeployments(projectId);
        const nodes = response.project.environments.edges.flatMap((edge) =>
          edge.node.serviceInstances.edges.map((edge) => edge.node)
        );
        this.latestDeploymentsSubscriptions
          .get(projectId)
          ?.forEach((callback) => callback(nodes));
      }, 2000)
    );
  }

  public subscribeToLatestDeployments(
    projectId: string,
    callback: LatestDeploymentsCallback
  ): void {
    // check if any subscriptions for latest deployments exist for this projectId
    // if so, add the callback to the existing subscriptions
    // if not create a new subscription and add the callback to it
    if (this.latestDeploymentsSubscriptions.has(projectId)) {
      const callbacks = this.latestDeploymentsSubscriptions.get(projectId)!;
      callbacks.add(callback);
    } else {
      this.latestDeploymentsSubscriptions.set(projectId, new Set([callback]));
      // poll the data from the gql api
      this.pollLatestDeployments(projectId);
    }
  }
}

export function subscribeToLogs(
  options: SubscribeToLogsOptions
): Promise<() => void> {
  return WebSocketManager.getInstance().subscribe(options);
}

export const subscribeToLatestDeployments = async (
  projectId: string,
  callback: LatestDeploymentsCallback
) => {
  return WebSocketManager.getInstance().subscribeToLatestDeployments(
    projectId,
    callback
  );
};
