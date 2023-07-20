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
  public async me(id: string) {
    try {
      return firstValueFrom(this.authClient.send('me', id));
    } catch (error) {}
  }

  /**
   * get permissions list for RBAC
   * @returns permissions list
   */
  public async permissions(roleName: string) {
    try {
      const permissions = await firstValueFrom(
        this.authClient.send('get_permission_by_role_name', { roleName }),
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

  public async sendOtp(data: GetOtpDto) {
    try {
      const { email } = data;
      console.log('sendOtp', email);
      await firstValueFrom(this.authClient.send('sendOTP', { email }));
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  public async validateToken(token: string) {
    try {
      const response = await firstValueFrom(
        this.authClient.send('validate_token', { token }),
      );
      return response;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  public async findUserById(id: string) {
    try {
      console.log('findUserById', id);
      const response = await firstValueFrom(
        this.authClient.send('get_user_by_id', { id }),
      );
      return response;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
