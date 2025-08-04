import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.Secret_Key!, // Added '!' to assert it's not undefined
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
