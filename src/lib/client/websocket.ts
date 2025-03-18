import {
  WebSocketEventName,
  WebSocketMessage,
  WebSocketPingEvent,
  WebSocketSubscribeToHTTPLogsEvent,
  WebSocketSubscribeToLatestDeploymentsEvent,
} from '../types';

export class WebSocketClient {
  private ws: WebSocket;
  private onConnectEventListeners: (() => void)[] = [];
  private messageListeners: Record<
    WebSocketEventName,
    ((event: WebSocketMessage) => void)[]
  > = {
    ping: [],
    pong: [],
    subscribeToHTTPLogs: [],
    logs: [],
    subscribeToLatestDeployments: [],
    latestDeployments: [],
  };

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
      this.onConnectEventListeners.forEach((callback) => callback());
    };

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    this.ws.onmessage = (event) => {
      let parsedMessage: WebSocketMessage;
      try {
        parsedMessage = JSON.parse(event.data);
      } catch (error) {
        console.error('Error parsing message:', error);
        console.log('Received message:', event.data);
        return;
      }

      this.handleMessage(parsedMessage);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public onConnect(callback: () => void) {
    this.onConnectEventListeners.push(callback);
  }

  public onMessage(
    eventName: WebSocketEventName,
    callback: (event: WebSocketMessage) => void
  ) {
    this.messageListeners[eventName].push(callback);
  }

  private handleMessage(event: WebSocketMessage) {
    this.messageListeners[event.eventName].forEach((callback) =>
      callback(event)
    );
  }

  public sendPing() {
    if (this.ws.readyState === WebSocket.OPEN) {
      const pingEvent: WebSocketPingEvent = {
        eventName: 'ping',
        ts: Date.now(),
      };

      this.ws.send(JSON.stringify(pingEvent));
    } else {
      console.warn('WebSocket is not connected, cannot send ping');
    }
  }

  public subscribeToHTTPLogs(deploymentIds: string[]) {
    if (this.ws.readyState === WebSocket.OPEN) {
      const subscribeToHTTPLogsEvent: WebSocketSubscribeToHTTPLogsEvent = {
        eventName: 'subscribeToHTTPLogs',
        deploymentIds,
      };

      this.ws.send(JSON.stringify(subscribeToHTTPLogsEvent));
    } else {
      console.warn('WebSocket is not connected, cannot subscribe to logs');
    }
  }

  public subscribeToLatestDeployments() {
    if (this.ws.readyState === WebSocket.OPEN) {
      const subscribeToLatestDeploymentsEvent: WebSocketSubscribeToLatestDeploymentsEvent =
        {
          eventName: 'subscribeToLatestDeployments',
        };

      this.ws.send(JSON.stringify(subscribeToLatestDeploymentsEvent));
    } else {
      console.warn(
        'WebSocket is not connected, cannot subscribe to latest deployments'
      );
    }
  }

  public close() {
    this.ws.close();
  }
}
