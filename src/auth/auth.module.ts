import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { jwtSecretFactory } from './jwt/jwtSecretFactory';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => {
    //     const secret = configService.get('JWT_SECRET');
    //     console.log('jwtSecretFactory', secret);
    //     const expiresIn = configService.get('JWT_EXPIRATION');
    //     if (!secret) {
    //       throw new Error("Didn't get a valid jwt secret");
    //     }
    //     if (!expiresIn) {
    //       throw new Error('Jwt expire in value is not valid');
    //     }
    //     return {
    //       secret: secret,
    //       signOptions: { expiresIn },
    //     };
    //   },
    // }),

    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('RABBITMQ_URL')}`],
            queue: `${configService.get('RABBITMQ_AUTH_QUEUE')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, jwtSecretFactory],
  exports: [AuthService],
})
export class AuthModule {}
