import { AccessControlModule, RolesBuilder } from 'nest-access-control';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

export const ACLModule = AccessControlModule.forRootAsync({
  imports: [AuthModule],
  inject: [AuthService],
  useFactory: async (authService: AuthService): Promise<RolesBuilder> => {
    return new RolesBuilder(await authService.permissions());
  },
});
