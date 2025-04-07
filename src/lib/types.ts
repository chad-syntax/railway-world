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

export interface DeployLog {
  timestamp: string;
  message: string;
  severity: 'info' | 'warn' | 'error';
  tags: {
    projectId: string;
    environmentId: string;
    pluginId: string | null;
    serviceId: string;
    deploymentId: string;
    deploymentInstanceId: string;
    snapshotId: string | null;
  };
  attributes: {
    key: string;
    value: string;
  }[];
}

export type Volume = {
  id: string;
  name: string;
  currentSizeMB: number;
  sizeMB: number;
};

export type Source = {
  image: string | null;
  repo: string | null;
};

export type Team = {
  name: string;
  avatar: string;
};

export const DEPLOYMENT_STATUSES = {
  BUILDING: 'BUILDING',
  CRASHED: 'CRASHED',
  DEPLOYING: 'DEPLOYING',
  FAILED: 'FAILED',
  INITIALIZING: 'INITIALIZING',
  NEEDS_APPROVAL: 'NEEDS_APPROVAL',
  QUEUED: 'QUEUED',
  REMOVED: 'REMOVED',
  REMOVING: 'REMOVING',
  SKIPPED: 'SKIPPED',
  SLEEPING: 'SLEEPING',
  SUCCESS: 'SUCCESS',
  WAITING: 'WAITING',
} as const;

export type DeploymentStatus = keyof typeof DEPLOYMENT_STATUSES;

export type Deployment = {
  id: string;
  snapshotId: string;
  status: DeploymentStatus;
  updatedAt: string;
  createdAt: string;
};

export type Service = {
  id: string;
  name: string;
  icon: string;
  volume?: Volume;
  domains: string[];
  source: Source;
  connections: string[]; // service ids
  latestDeployment: Deployment;
};

// Client-friendly interface for processed railway data
export interface RailwayData {
  projectName: string;
  updatedAt: string;
  services: Service[];
  team: Team;
  projectId: string;
  environmentId: string;
}

export type WebSocketEventName =
  | 'ping'
  | 'pong'
  | 'httpLogs'
  | 'deployLogs'
  | 'latestDeployments';

export type ClientWebSocketEventName = Exclude<WebSocketEventName, 'ping'>;

export type WebSocketPingEvent = {
  eventName: 'ping';
  ts: number;
};

export type WebSocketPongEvent = {
  eventName: 'pong';
  ts: number;
};

export type WebSocketHttpLogsEvent = {
  eventName: 'httpLogs';
  deploymentId: string;
  logs: HttpLog[];
};

export type WebSocketDeployLogsEvent = {
  eventName: 'deployLogs';
  deploymentId: string;
  logs: DeployLog[];
};

export type LatestDeployment = {
  serviceId: string;
  latestDeployment: Deployment;
};

export type WebSocketLatestDeploymentsEvent = {
  eventName: 'latestDeployments';
  nodes: LatestDeployment[];
};

export type WebSocketMessage =
  | WebSocketPingEvent
  | WebSocketPongEvent
  | WebSocketHttpLogsEvent
  | WebSocketDeployLogsEvent
  | WebSocketLatestDeploymentsEvent;

export type ClientWebSocketMessage = Exclude<
  WebSocketMessage,
  WebSocketPingEvent
>;

export type EventNameToMessageMap<T extends ClientWebSocketEventName> = {
  ping: WebSocketPingEvent;
  pong: WebSocketPongEvent;
  httpLogs: WebSocketHttpLogsEvent;
  deployLogs: WebSocketDeployLogsEvent;
  latestDeployments: WebSocketLatestDeploymentsEvent;
}[T];
