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

import { Public } from 'src/common/decorators';

import { CreateUserDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { GetOtpDto, RefreshTokenDto, VerifyDto } from './dtos/verify.dto';
import { AuthService } from './auth.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CaslAbilityFactory, PermissionAction } from 'src/auth/ability.factory';
import { CheckPermissions } from 'src/common/decorators/abilities.decorator';
import { DefaultAuthGuard } from './guards/defaultAuth.guard';
import { ForbiddenError, defineAbility } from '@casl/ability';
import { LoginMetadata } from 'src/common/interfaces/metadata.interface';

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
  @CheckPermissions([PermissionAction.READ, 'User'])
  async me(@Req() req) {
    const ability = await this.abilityFactory.createForUser(req.user);
    // const ability = defineAbility((can) => {
    //   can('read', 'Story', { created_by: 1 });
    // });
    // const address = { country: { isoCode: 'UA', name: 'Ukraine', id: 1 } };
    // const story = {
    //   id: 1,
    //   name: 'My Story',
    //   created_by: req.user.id,
    // };
    const story = new Story();
    story.created_by = req.user.id;
    // const address = new Address('UA', 'Ukraine', 1);
    // console.log('address', address);
    // console.log('ability', ability);
    console.log(ability.can(PermissionAction.READ, story)); // true

    // console.log(ability.can('read', address)); // true

    // if (!ability.can(PermissionAction.READ, 'User')) {
    //   throw new ForbiddenException('You dont have access to this resource!');
    // }
    console.log('req.user', req.user);
    try {
      const user = this.authService.me(req.user.id);
      return user;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
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

export class Address {
  country;
  constructor(isoCode, name, id) {
    this.country = {
      isoCode: isoCode,
      name: name,
      id: id,
    };
  }
}

export class Story {
  created_by;
  constructor(created_by?) {
    this.created_by = created_by;
  }
}
