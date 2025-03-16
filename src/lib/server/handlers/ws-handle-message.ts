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
      console.log('received ping event, sending pong');

      const pongEvent: WebSocketPongEvent = {
        eventName: 'pong',
        ts: Date.now(),
      };

      socket.send(JSON.stringify(pongEvent));
      break;
    case 'subscribeToLogs':
      console.log(
        'received subscribeToLogs event, subscribing to logs',
        event.deploymentIds
      );

      event.deploymentIds.forEach((deploymentId) => {
        subscribeToLogs({
          deploymentId,
          beforeLimit: 0, // only get new logs
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
