import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from 'src/app.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Get()
  me() {
    return this.appService.me('devhoangkien@gmail.com');
  }
}
