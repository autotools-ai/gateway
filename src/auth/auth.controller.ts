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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser, Public } from 'src/common/decorators';

import { CreateUserDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { GetOtpDto, RefreshTokenDto, VerifyDto } from './dtos/verify.dto';
import { AuthService } from './auth.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CaslAbilityFactory, PermissionAction } from 'src/casl/ability.factory';
import { CheckPermissions } from 'src/common/decorators/abilities.decorator';
import { DefaultAuthGuard } from './guards/defaultAuth.guard';
import { LoginMetadata } from 'src/common/interfaces/metadata.interface';
import { User } from 'src/casl/policy/user.policy';
import { I18nLang, I18nService } from 'nestjs-i18n';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private abilityFactory: CaslAbilityFactory,
    private readonly i18n: I18nService,
  ) {}

  async checkUserAbility(user, action, role_level) {
    const ability = await this.abilityFactory.createForUser(user);
    const userAbility = new User();
    userAbility.id = user.id;
    userAbility.role_level = role_level.toString();
    if (!ability.can(action, userAbility)) {
      throw new ForbiddenException(this.i18n.t('errors.forbidden'));
    }
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(DefaultAuthGuard, PermissionsGuard)
  @CheckPermissions([PermissionAction.CREATE, 'User'])
  async me(@CurrentUser() user) {
    // await this.checkUserAbility(user, PermissionAction.CREATE, 99999);
    try {
      return this.authService.me(user.id);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(this.i18n.t('errors.forbidden'));
      }
    }
  }

  @Public()
  @Post('/signup')
  @HttpCode(201)
  signup(@Body() data: CreateUserDto) {
    return this.authService.signup(data);
  }

  @Public()
  @Post('/login')
  @ApiOperation({
    summary: 'Login',
    description: 'Login User ',
  })
  @ApiBody({
    description: 'The user login credentials',
    type: LoginDto,
  })
  @HttpCode(200)
  login(@Body() data: LoginDto, @Req() req, @I18nLang() lang: string) {
    const fingerprint = req.fingerprint;
    const ipAddress = req.headers['x-forwarded-for'];
    const metaData: LoginMetadata = { ipAddress, fingerprint };
    data.metaData = metaData;
    const message = { data, lang };
    return this.authService.login(message);
  }

  @Public()
  @HttpCode(200)
  @Post('refresh-token')
  refreshToken(@Body() data: RefreshTokenDto, @I18nLang() lang: string) {
    const message = { data, lang };
    return this.authService.reIssueAccessToken(message);
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
