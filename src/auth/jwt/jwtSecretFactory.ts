import { ConfigService } from '@nestjs/config';
import { JWT_SECRET_KEY } from 'src/common/constants';

export const jwtSecretFactory = {
  provide: JWT_SECRET_KEY,
  useFactory: async (configService: ConfigService): Promise<string> => {
    const secret = configService.get<string>(JWT_SECRET_KEY);
    if (secret) {
      return secret;
    }
    throw new Error('jwtSecretFactory missing secret');
  },
  inject: [ConfigService],
};
