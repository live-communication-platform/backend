import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { MeetingService } from './meeting.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('meetings')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.meetingService.createMeeting(user.id);
  }
}
