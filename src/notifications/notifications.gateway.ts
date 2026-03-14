import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    this.userSockets.forEach((socketId, userId) => {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
      }
    });
  }

  @OnEvent('notification.created')
  handleNotificationCreated(notification: any) {
    this.server
      .to(`user:${notification.userId}`)
      .emit('notification', notification);
  }

  broadcastComplianceAlert(alert: any) {
    this.server.emit('compliance-alert', alert);
  }
}
