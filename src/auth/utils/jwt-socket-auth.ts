import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

export function verifySocketToken(token?: string) {
  if (!token) {
    throw new UnauthorizedException('Missing token');
  }

  const Secret_Key = process.env.Secret_Key;
  if (!Secret_Key) {
    throw new Error('Secret_Key is not defined');
  }

  try {
    return jwt.verify(token, Secret_Key);
  } catch (err) {
    throw new UnauthorizedException('Invalid token');
  }
}
