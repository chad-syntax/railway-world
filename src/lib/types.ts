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

export type Deployment = {
  id: string;
  status: string;
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

export type WebSocketLatestDeploymentsEvent = {
  eventName: 'latestDeployments';
  nodes: {
    serviceId: string;
    latestDeployment: Deployment;
  }[];
};

export type WebSocketMessage =
  | WebSocketPingEvent
  | WebSocketPongEvent
  | WebSocketLogsEvent
  | WebSocketLatestDeploymentsEvent;
