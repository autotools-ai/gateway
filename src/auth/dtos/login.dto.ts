import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  public password: string;

  metaData?: object;
}
