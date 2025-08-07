// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ChatMessage {
  user: string;
  text: string;
  timestamp?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  /**
   * Triggered when a new client connects
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', 'Welcome to the chat server!');

    this.server.emit('notification', {
      message: `User joined the chat.`,
    });
  }

  /**
   * Triggered when a client disconnects
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit('notification', {
      message: `A user has left the chat.`,
    });
  }

  /**
   * Handles incoming messages from clients
   */
  @SubscribeMessage('newMessage')
  handleMessage(
    @MessageBody() payload: ChatMessage,
    @ConnectedSocket() client: Socket,
  ): void {
    const message: ChatMessage = {
      user: payload.user,
      text: payload.text,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`[${message.user}]: ${message.text}`);

    // Emit message to all connected clients
    this.server.emit('newMessage', message);

    // Acknowledge message to sender (optional)
    client.emit('messageSent', {
      status: 'ok',
      receivedAt: message.timestamp,
    });
  }
}
