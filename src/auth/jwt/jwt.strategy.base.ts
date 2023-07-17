import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IAuthStrategy } from '../IAuthStrategy';
import { AuthService } from '../auth.service';
import e from 'express';

export class JwtStrategyBase
  extends PassportStrategy(Strategy)
  implements IAuthStrategy
{
  constructor(
    protected readonly authService: AuthService,

    protected readonly secretOrKey: string,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
      passReqToCallback: true,
    });
  }

  async validate(req: e.Request, payload: any): Promise<any> {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const isValidateToken = await this.authService.validateToken(token);
      if (!isValidateToken) {
        throw new UnauthorizedException();
      }
      const { id } = payload;
      const user: any = await this.authService.findUserById(id);
      if (!user) {
        throw new UnauthorizedException();
      }
      return { ...user, roles: payload.roles as string };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
