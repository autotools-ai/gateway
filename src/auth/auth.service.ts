import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    this.authClient.connect().catch((error) => {
      console.error('Failed to connect to authClient:', error);
    });
  }
  public async me(email: string) {
    try {
      const user = await firstValueFrom(this.authClient.send('me', email));
      console.log('user', user);
      return user;
    } catch (error) {}
  }

  public async permissions() {
    try {
      const permissions = await firstValueFrom(
        this.authClient.send('permissions', {}),
      );
      console.log('permissions', permissions);
      return permissions;
    } catch (error) {}
  }

  public async login(data: any) {
    try {
      const user = await firstValueFrom(this.authClient.send('login', data));
      return user;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error, 400);
    }
  }

  public async signup(data: any) {
    try {
      const user = await firstValueFrom(this.authClient.send('signup', data));
      return user;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error, 400);
    }
  }

  public async getSecretKey(access_token: string) {
    console.log('access_token', access_token);
    try {
      const secretKey = await firstValueFrom(
        this.authClient.send('getSecretKey', access_token),
      );
      console.log('secretKey', secretKey);
      return secretKey;
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error, 400);
    }
  }
}
