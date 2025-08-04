import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class MeetingService {
  createMeeting(userId: string) {
    const meetingId = randomUUID().split('-')[0]; // short ID like 'abc123'

    // In-memory store: add host + empty participant list
    meetings[meetingId] = {
      hostId: userId,
      participants: {},
    };

    return {
      meetingId,
      link: `https://localhost:3000/meet/${meetingId}`,
    };
  }
}

// Temporary in-memory store
export const meetings: {
  [meetingId: string]: {
    hostId: string;
    participants: {
      [userId: string]: {
        approved: boolean;
        socketId?: string;
      };
    };
  };
} = {};
