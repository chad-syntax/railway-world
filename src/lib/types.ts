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

export type DeploymentStatus =
  | 'BUILDING'
  | 'CRASHED'
  | 'DEPLOYING'
  | 'FAILED'
  | 'INITIALIZING'
  | 'NEEDS_APPROVAL'
  | 'QUEUED'
  | 'REMOVED'
  | 'REMOVING'
  | 'SKIPPED'
  | 'SLEEPING'
  | 'SUCCESS'
  | 'WAITING';

export type Deployment = {
  id: string;
  status: DeploymentStatus;
  updatedAt: string;
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
}

export type WebSocketEventName = 'ping' | 'pong' | 'logs' | 'latestDeployments';

export type ClientWebSocketEventName = Exclude<WebSocketEventName, 'ping'>;

export type WebSocketPingEvent = {
  eventName: 'ping';
  ts: number;
};

export type WebSocketPongEvent = {
  eventName: 'pong';
  ts: number;
};

export type WebSocketLogsEvent = {
  eventName: 'logs';
  deploymentId: string;
  logs: HttpLog[];
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
  | WebSocketLogsEvent
  | WebSocketLatestDeploymentsEvent;

export type ClientWebSocketMessage = Exclude<
  WebSocketMessage,
  WebSocketPingEvent
>;

export type EventNameToMessageMap<T extends ClientWebSocketEventName> = {
  ping: WebSocketPingEvent;
  pong: WebSocketPongEvent;
  logs: WebSocketLogsEvent;
  latestDeployments: WebSocketLatestDeploymentsEvent;
}[T];
