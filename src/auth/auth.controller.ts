import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import * as nestAccessControl from 'nest-access-control';
import { AclValidateRequestInterceptor } from 'src/common/interceptors/aclValidateRequest.interceptor';
import { Public } from 'src/common/decorators';
import { CreateUserDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { DefaultAuthGuard } from './guards/defaultAuth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(AclValidateRequestInterceptor)
  @Get('me')
  @UseGuards(DefaultAuthGuard, nestAccessControl.ACGuard)
  @nestAccessControl.UseRoles({
    resource: 'user',
    action: 'read',
    possession: 'any',
  })
  @ApiBearerAuth()
  me() {
    return this.authService.me('devhoangkien@gmail.com');
  }

  @Public()
  @Post('/signup')
  signup(@Body() data: CreateUserDto) {
    return this.authService.signup(data);
  }

  @Public()
  @Post('/login')
  login(@Body() data: LoginDto, @Req() req) {
    const fingerprint = req.fingerprint;

    const ipAddress = req.headers['x-forwarded-for'];

    const metaData: LoginMetadata = { ipAddress, fingerprint };
    data.metaData = metaData;
    return this.authService.login(data);
  }
}

export interface LoginMetadata {
  ipAddress: string;
  fingerprint: object;
}
