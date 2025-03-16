import { WebSocketMessage, WebSocketPingEvent } from '../types';

export class WebSocketClient {
  private ws: WebSocket;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
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

  private handleMessage(event: WebSocketMessage) {
    switch (event.eventName) {
      case 'pong':
        console.log('Received pong from server');
        break;
      case 'logs':
        console.log(
          'Received logs from server',
          event.logs,
          'for deployment',
          event.deploymentId
        );
        break;
      default:
        console.warn('Unhandled message type:', event.eventName);
    }
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

  public subscribeToLogs(deploymentIds: string[]) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({ eventName: 'subscribeToLogs', deploymentIds })
      );
    } else {
      console.warn('WebSocket is not connected, cannot subscribe to logs');
    }
  }

  public close() {
    this.ws.close();
  }
}
