import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupUserDto } from './dto/signup-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    console.log('JWT Payload:', payload); // Debugging log
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(signupUserDto: SignupUserDto) {
    const hashedPassword = await bcrypt.hash(signupUserDto.password, 10);

    try {
      const createdUser = await this.prisma.user.create({
        data: {
          username: signupUserDto.username,
          email: signupUserDto.email,
          passwordHash: hashedPassword,
        },
      });

      return this.login(createdUser);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new UnauthorizedException('Username or Email already exists');
      }
      throw error;
    }
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
