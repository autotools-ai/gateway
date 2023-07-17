import {
  Body,
  Controller,
  ForbiddenException,
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
import { GetOtpDto, RefreshTokenDto, VerifyDto } from './dtos/verify.dto';
import { AuthService } from './auth.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CaslAbilityFactory, PermissionAction } from 'src/auth/ability.factory';
import { CheckPermissions } from 'src/common/decorators/abilities.decorator';
import { DefaultAuthGuard } from './guards/defaultAuth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private abilityFactory: CaslAbilityFactory,
  ) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(DefaultAuthGuard, PermissionsGuard)
  // @CheckPermissions([PermissionAction.READ, 'User']) // "Invoice" is the value in name column of objects table
  async me(@Req() req) {
    const ability = await this.abilityFactory.createForUser(req.user);
    const condition: any = {};
    console.log('aaaaaaaaaaaaaaaaa', req.user);
    condition.id = req.user.id;
    console.log('condition', condition);
    if (ability.can(PermissionAction.READ, condition)) {
      throw new ForbiddenException('You dont have access to this resource!');
    }
    console.log('req.user', req.user);
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
  @Post('send-otp')
  @HttpCode(201)
  @ApiOperation({ summary: 'Get OTP', description: 'Get OTP Email ' })
  public async sendOtp(@Body() data: GetOtpDto) {
    return this.authService.sendOtp(data);
  }
}

export interface LoginMetadata {
  ipAddress: string;
  fingerprint: object;
}
