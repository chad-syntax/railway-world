import {
  ClientWebSocketEventName,
  ClientWebSocketMessage,
  EventNameToMessageMap,
  WebSocketPingEvent,
} from '../types';

export class WebSocketClient {
  private ws: WebSocket;

  private eventListeners: {
    [K in ClientWebSocketEventName]: ((
      event: EventNameToMessageMap<K>
    ) => void)[];
  } = {
    pong: [],
    logs: [],
    latestDeployments: [],
  };

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);
    this.addEventListener('message', this.handleMessage);
  }

  public addEventListener(
    type: keyof WebSocketEventMap,
    callback: (event: WebSocketEventMap[keyof WebSocketEventMap]) => void
  ) {
    this.ws.addEventListener(type, callback);
  }

  public removeEventListener(
    type: keyof WebSocketEventMap,
    callback: (event: WebSocketEventMap[keyof WebSocketEventMap]) => void
  ) {
    this.ws.removeEventListener(type, callback);
  }

  private handleMessage = (event: WebSocketEventMap['message'] | Event) => {
    if (!(event instanceof MessageEvent)) return;

    let parsedMessage: ClientWebSocketMessage;
    try {
      parsedMessage = JSON.parse(event.data);
    } catch (error) {
      console.error('Error parsing message:', error);
      console.log('Received message:', event.data);
      return;
    }

    const { eventName } = parsedMessage;
    // Type assertion here is safe because we know the event matches the listener type
    (
      this.eventListeners[eventName] as ((
        event: typeof parsedMessage
      ) => void)[]
    ).forEach((callback) => callback(parsedMessage));
  };

  public onMessage<T extends ClientWebSocketEventName>(
    eventName: T,
    callback: (event: EventNameToMessageMap<T>) => void
  ) {
    // Type assertion needed because TypeScript cannot infer that the eventName matches the callback event type
    (
      this.eventListeners[eventName] as ((
        event: EventNameToMessageMap<T>
      ) => void)[]
    ).push(callback);
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
