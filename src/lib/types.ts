import { HttpLog } from './server/graphql/subscribe-to-logs';

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

export type WebSocketEventName = 'ping' | 'pong';

export type WebSocketPingEvent = {
  eventName: 'ping';
  ts: number;
};

export type WebSocketPongEvent = {
  eventName: 'pong';
  ts: number;
};

export type WebSocketSubscribeToLogsEvent = {
  eventName: 'subscribeToLogs';
  deploymentIds: string[];
};

export type WebSocketLogsEvent = {
  eventName: 'logs';
  deploymentId: string;
  logs: HttpLog[];
};

export type WebSocketMessage =
  | WebSocketPingEvent
  | WebSocketPongEvent
  | WebSocketSubscribeToLogsEvent
  | WebSocketLogsEvent;
