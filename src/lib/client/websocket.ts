import {
  WebSocketEventName,
  WebSocketMessage,
  WebSocketPingEvent,
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
    logs: [],
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

  public close() {
    this.ws.close();
  }
}
