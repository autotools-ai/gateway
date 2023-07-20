import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
import { Story } from 'src/casl/policy/story.policy';
import { User } from 'src/casl/policy/user.policy';
import { defineAbility } from '@casl/ability';

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
  // @CheckPermissions([PermissionAction.CREATE, 'User'])
  async me(@CurrentUser() user) {
    // console.log('user', user);
    // const ability = await this.abilityFactory.createForUser(user);
    // console.log('ability', ability);
    // const userAbility = new User();
    // userAbility.id = user.id;
    // userAbility.role_level = '5';
    // console.log('userAbility', userAbility);
    // console.log(
    //   'ability.can(PermissionAction.READ, userAbility)',
    //   ability.can(PermissionAction.CREATE, userAbility),
    // );
    // if (!ability.can(PermissionAction.CREATE, userAbility)) {
    //   throw new ForbiddenException('You dont have access to this resource!');
    // }
    // try {
    //   return this.authService.me(user.id);
    // } catch (error) {
    //   if (error instanceof ForbiddenException) {
    //     throw new ForbiddenException(error.message);
    //   }
    // }
    const ability = defineAbility((can) => {
      can('read', 'Article', {
        title: { $eq: 'secret' },
        role_level: { $eq: '1' },
      });
    });
    const article = new Article('secret', '1');
    console.log(ability.can('read', article)); // true
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

export class Article {
  role_level;
  title;
  constructor(title, role_level) {
    this.role_level = role_level;
    this.title = title;
  }
}
