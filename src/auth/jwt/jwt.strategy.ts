import { Inject, Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { JwtStrategyBase } from './jwt.strategy.base';
import { JWT_SECRET_KEY } from 'src/common/constants';

@Injectable()
export class JwtStrategy extends JwtStrategyBase {
  constructor(
    protected readonly authService: AuthService,

    @Inject(JWT_SECRET_KEY) secretOrKey: string,
  ) {
    super(authService, secretOrKey);
  }
}
