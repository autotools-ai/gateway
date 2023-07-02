import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TransactionController } from './controllers/transaction.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ACLModule } from './auth/acl.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ACLModule,
    ClientsModule.registerAsync([
      {
        name: 'MAIL_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('RABBITMQ_URL')}`],
            queue: `${configService.get('RABBITMQ_MAILER_QUEUE')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'FILES_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('RABBITMQ_URL')}`],
            queue: `${configService.get('RABBITMQ_FILES_QUEUE')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('RABBITMQ_URL')}`],
            queue: `${configService.get('RABBITMQ_NOTIFICATION_QUEUE')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'POST_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('RABBITMQ_URL')}`],
            queue: `${configService.get('RABBITMQ_POST_QUEUE')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'TRANSLATE_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('RABBITMQ_URL')}`],
            queue: `${configService.get('RABBITMQ_TRANSLATE_QUEUE')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController, TransactionController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
