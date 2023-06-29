import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    this.authClient.connect().catch((error) => {
      console.error('Failed to connect to authClient:', error);
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  public async me(email: string) {
    try {
      const user = await firstValueFrom(this.authClient.send('me', email));
      return user;
    } catch (error) {}
  }
}
