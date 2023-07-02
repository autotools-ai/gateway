import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IAuthStrategy } from '../IAuthStrategy';
import { AuthService } from '../auth.service';

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
    });
  }

  async validate(payload: any): Promise<any> {
    const { phone } = payload;
    // const user: any = await this.userService.findOneByPhone(phone);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    return { ...payload, roles: 'User' as string };
  }
}
