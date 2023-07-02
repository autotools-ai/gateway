import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { GetOtpDto, VerifyDto } from './dtos/verify.dto';

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
      return firstValueFrom(this.authClient.send('me', email));
    } catch (error) {}
  }

  /**
   * get permissions list for RBAC
   * @returns permissions list
   */
  public async permissions() {
    try {
      const permissions = await firstValueFrom(
        this.authClient.send('permissions', {}),
      );
      return permissions;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  public async login(data: any) {
    try {
      const user = await firstValueFrom(this.authClient.send('login', data));
      return user;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  public async signup(data: any) {
    try {
      const user = await firstValueFrom(this.authClient.send('signup', data));
      return user;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  /**
   * re issue access token from refresh token
   * @param refresh_token
   * @returns access_token
   */
  public async reIssueAccessToken(refresh_token: string) {
    try {
      const access_token = await firstValueFrom(
        this.authClient.send('refresh-token', refresh_token),
      );
      return access_token;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  public async verifySignup(data: VerifyDto) {
    try {
      const { email, otp } = data;
      const response = await firstValueFrom(
        this.authClient.send('verifySignup', { email, otp }),
      );
      return response;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  public async getOtp(data: GetOtpDto) {
    try {
      const { email } = data;
      await firstValueFrom(this.authClient.send('getOtp', { email }));
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
