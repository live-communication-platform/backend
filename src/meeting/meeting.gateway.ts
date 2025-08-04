import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verifySocketToken } from '../auth/utils/jwt-socket-auth';

@WebSocketGateway({ cors: true })
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // meetingId -> Set of socket IDs in the meeting
  private rooms = new Map<string, Set<string>>();

  // Handle socket connection + authentication
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    try {
      const user = verifySocketToken(token);
      (client as any).user = user; // Attach user info to socket
    } catch (err) {
      client.emit('unauthorized', { message: 'Invalid or missing token' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join-meeting')
  handleJoinRequest(
    @MessageBody() data: { meetingId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) {
      client.emit('unauthorized', { message: 'Not authenticated' });
      return;
    }

    const { meetingId } = data;

    if (!this.rooms.has(meetingId)) {
      this.rooms.set(meetingId, new Set());
    }

    // Notify host that someone wants to join
    this.server.to(meetingId).emit('join-request', {
      socketId: client.id,
      user, // Optional: send user info to host
    });
  }

  @SubscribeMessage('approve-join')
  handleApproval(
    @MessageBody() data: { meetingId: string; guestSocketId: string },
    @ConnectedSocket() host: Socket,
  ) {
    const user = (host as any).user;
    if (!user) {
      host.emit('unauthorized', { message: 'Not authenticated' });
      return;
    }

    const { meetingId, guestSocketId } = data;

    if (!this.rooms.has(meetingId)) {
      this.rooms.set(meetingId, new Set());
    }

    this.rooms.get(meetingId)?.add(host.id);
    this.rooms.get(meetingId)?.add(guestSocketId);

    host.join(meetingId);
    this.server.sockets.sockets.get(guestSocketId)?.join(meetingId);

    this.server.to(guestSocketId).emit('join-approved', {
      meetingId,
    });
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody()
    data: {
      to: string;
      from: string;
      signal: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) {
      client.emit('unauthorized', { message: 'Not authenticated' });
      return;
    }

    const { to, from, signal } = data;
    this.server.to(to).emit('signal', { from, signal });
  }

  handleDisconnect(client: Socket) {
    for (const [meetingId, participants] of this.rooms.entries()) {
      if (participants.has(client.id)) {
        participants.delete(client.id);

        this.server.to(meetingId).emit('user-disconnected', {
          socketId: client.id,
        });

        if (participants.size === 0) {
          this.rooms.delete(meetingId);
        }
      }
    }
  }
}
