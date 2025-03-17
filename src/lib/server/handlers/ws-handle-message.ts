import WebSocket from 'ws';
import {
  WebSocketMessage,
  WebSocketPongEvent,
  WebSocketLogsEvent,
} from '../../types';
import { subscribeToLogs } from '../graphql/subscribe-to-logs';

export const handleWSMessage = (
  event: WebSocketMessage,
  socket: WebSocket.WebSocket
) => {
  switch (event.eventName) {
    case 'ping':
      const pongEvent: WebSocketPongEvent = {
        eventName: 'pong',
        ts: Date.now(),
      };

      socket.send(JSON.stringify(pongEvent));
      break;
    case 'subscribeToHTTPLogs':
      console.log(
        'received subscribeToHTTPLogs event, subscribing to http logs',
        event.deploymentIds
      );

      event.deploymentIds.forEach((deploymentId) => {
        subscribeToLogs({
          deploymentId,
          beforeLimit: 500,
          beforeDate: new Date().toISOString(),
          onData: (logs) => {
            const logEvent: WebSocketLogsEvent = {
              eventName: 'logs',
              deploymentId,
              logs,
            };

            socket.send(JSON.stringify(logEvent));
          },
        });
      });
      break;
    default:
      break;
  }
};
