import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-auth-token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: {
    id: string;
    customerId: string;
    lawyerId: string;
    email: string;
    roles: string;
    twilioIdentitySid: string;
  }) {
    return {
      id: payload.id,
      customerId: payload.customerId,
      lawyerId: payload.lawyerId,
      email: payload.email,
      roles: payload.roles,
      twilioIdentitySid: payload.twilioIdentitySid,
    };
  }
}
