// src/meeting/meeting.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { meetings } from './meeting.service'; // import in-memory meeting store

@WebSocketGateway({ cors: true })
export class MeetingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    // Optional: remove user from rooms
  }

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  // 1. Join request from guest
  @SubscribeMessage('join-request')
  handleJoinRequest(
    @MessageBody()
    data: {
      meetingId: string;
      userId: string;
      username: string;
      email: string;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const meeting = meetings[data.meetingId];
    if (!meeting) return;

    meeting.participants[data.userId] = {
      approved: false,
      socketId: socket.id,
    };

    // Send join request to host
    this.server.to(meeting.hostId).emit('join-request', {
      userId: data.userId,
      username: data.username,
      email: data.email,
      socketId: socket.id,
    });
  }

  // 2. Host approves or denies
  @SubscribeMessage('join-response')
  handleJoinResponse(
    @MessageBody() data: { meetingId: string; userId: string; allow: boolean },
    @ConnectedSocket() hostSocket: Socket,
  ) {
    const meeting = meetings[data.meetingId];
    if (!meeting) return;

    const participant = meeting.participants[data.userId];
    if (!participant) return;

    participant.approved = data.allow;

    if (!participant.socketId) return;
    // Notify guest
    this.server.to(participant.socketId).emit('join-result', {
      approved: data.allow,
    });
  }

  // 3. Relay signaling data (offer/answer/ice)
  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: { to: string; from: string; signal: any },
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(data.to).emit('signal', {
      from: data.from,
      signal: data.signal,
    });
  }
}
