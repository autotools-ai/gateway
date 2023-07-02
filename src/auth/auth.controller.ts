import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import * as nestAccessControl from 'nest-access-control';

import { AclValidateRequestInterceptor } from 'src/common/interceptors/aclValidateRequest.interceptor';
import { Public } from 'src/common/decorators';

import { CreateUserDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { DefaultAuthGuard } from './guards/defaultAuth.guard';
import { GetOtpDto, RefreshTokenDto, VerifyDto } from './dtos/verify.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseInterceptors(AclValidateRequestInterceptor)
  @UseGuards(DefaultAuthGuard, nestAccessControl.ACGuard)
  @nestAccessControl.UseRoles({
    resource: 'user',
    action: 'read',
    possession: 'any',
  })
  @ApiBearerAuth()
  me(@Req() req) {
    return this.authService.me(req.user.email);
  }

  @Public()
  @Post('/signup')
  @HttpCode(201)
  signup(@Body() data: CreateUserDto) {
    return this.authService.signup(data);
  }

  @Public()
  @Post('/login')
  @HttpCode(200)
  login(@Body() data: LoginDto, @Req() req) {
    const fingerprint = req.fingerprint;

    const ipAddress = req.headers['x-forwarded-for'];

    const metaData: LoginMetadata = { ipAddress, fingerprint };
    data.metaData = metaData;
    return this.authService.login(data);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh-token')
  refreshToken(@Body() data: RefreshTokenDto) {
    return this.authService.reIssueAccessToken(data.access_token);
  }

  @Public()
  @Post('/verify')
  @ApiOperation({ summary: 'Verify User', description: 'Verify User Signup' })
  @HttpCode(200)
  verifyUser(@Body() data: VerifyDto) {
    return this.authService.verifySignup(data);
  }

  @Public()
  @Post('/otp')
  @HttpCode(201)
  @ApiOperation({ summary: 'Get OTP', description: 'Get OTP Email ' })
  public async getOtp(@Body() data: GetOtpDto) {
    return this.authService.getOtp(data);
  }
}

export interface LoginMetadata {
  ipAddress: string;
  fingerprint: object;
}
