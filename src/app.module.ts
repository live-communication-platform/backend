import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MeetingModule } from './meeting/meeting.module';
import { MeetingGateway } from './meeting/meeting.gateway';

@Module({
  imports: [AuthModule, PrismaModule, MeetingModule],
  providers: [MeetingGateway],
})
export class AppModule {}
