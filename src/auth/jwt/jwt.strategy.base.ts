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
      console.log(
        'tokenssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
        token,
      );
      const isValidateToken = await this.authService.validateToken(token);
      console.log('isValidateToken', isValidateToken);
      if (!isValidateToken) {
        throw new UnauthorizedException();
      }
      console.log('payload', payload);
      const { userId } = payload;
      console.log('userId', userId);

      const user: any = await this.authService.findUserById(userId);
      console.log('user', user);
      if (!user) {
        throw new UnauthorizedException();
      }
      console.log('payload.roles', user);
      return {
        ...user,
        roles: payload.roles as string,
        role_id: user.roles.id,
        role_level: user.roles.level,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
