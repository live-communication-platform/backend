import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MeetingModule } from './meeting/meeting.module';

@Module({
  imports: [AuthModule, PrismaModule, MeetingModule],
})
export class AppModule {}
