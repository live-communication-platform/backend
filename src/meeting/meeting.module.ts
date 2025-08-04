import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { MeetingGateway } from './meeting.gateway';

@Module({
  controllers: [MeetingController],
  providers: [MeetingService, MeetingGateway],
})
export class MeetingModule {}
