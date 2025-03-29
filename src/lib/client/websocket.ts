import {
  ClientWebSocketEventName,
  ClientWebSocketMessage,
  EventNameToMessageMap,
  WebSocketPingEvent,
} from '../types';

const $connectionStatus = document.getElementById('connection-status')!;

export class WebSocketClient {
  private ws!: WebSocket;
  private isConnected: boolean = false;
  private disconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private IDLE_TIMEOUT = 15000;
  private eventListeners: {
    [K in ClientWebSocketEventName]: ((
      event: EventNameToMessageMap<K>
    ) => void)[];
  } = {
    pong: [],
    logs: [],
    latestDeployments: [],
  };

  private wsEventListeners: Map<
    keyof WebSocketEventMap,
    Set<(event: WebSocketEventMap[keyof WebSocketEventMap]) => void>
  > = new Map();

  constructor() {
    this.connect();

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('focus', this.handleFocus);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.scheduleDisconnect();
    } else {
      this.cancelDisconnect();
      this.connect();
    }
  };

  private handleBlur = () => {
    this.scheduleDisconnect();
  };

  private handleFocus = () => {
    this.cancelDisconnect();
    if (!document.hidden) {
      this.connect();
    }
  };

  private scheduleDisconnect() {
    this.cancelDisconnect();
    this.disconnectTimeout = setTimeout(() => {
      this.disconnect();
    }, this.IDLE_TIMEOUT);
  }

  private cancelDisconnect() {
    if (this.disconnectTimeout !== null) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }
  }

  private connect() {
    if (this.isConnected) return;

    $connectionStatus.classList.add('hidden');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);
    this.isConnected = true;

    // Reapply all WebSocket event listeners
    this.wsEventListeners.forEach((callbacks, type) => {
      callbacks.forEach((callback) => {
        this.ws.addEventListener(type, callback);
      });
    });

    // Always add the message handler
    this.ws.addEventListener('message', this.handleMessage);
  }

  private disconnect() {
    if (!this.isConnected) return;

    this.ws.close();
    this.isConnected = false;
    $connectionStatus.classList.remove('hidden');
  }

  public addEventListener(
    type: keyof WebSocketEventMap,
    callback: (event: WebSocketEventMap[keyof WebSocketEventMap]) => void
  ) {
    // Store the listener
    if (!this.wsEventListeners.has(type)) {
      this.wsEventListeners.set(type, new Set());
    }
    this.wsEventListeners.get(type)!.add(callback);

    // Add to current WebSocket if connected
    if (this.isConnected) {
      this.ws.addEventListener(type, callback);
    }
  }

  public removeEventListener(
    type: keyof WebSocketEventMap,
    callback: (event: WebSocketEventMap[keyof WebSocketEventMap]) => void
  ) {
    // Remove from stored listeners
    const callbacks = this.wsEventListeners.get(type);
    if (callbacks) {
      callbacks.delete(callback);
    }

    // Remove from current WebSocket if connected
    if (this.isConnected) {
      this.ws.removeEventListener(type, callback);
    }
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
}
