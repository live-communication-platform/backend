import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MeetingGateway } from './meeting/meeting.gateway';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [MeetingGateway],
})
export class AppModule {}
