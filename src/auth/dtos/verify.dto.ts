import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyDto {
  @ApiProperty({
    description: 'The otp of the user',
    example: '123456',
  })
  @IsNotEmpty({ message: 'validation.otp_required' })
  public otp: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'example@gmail.com',
  })
  @IsNotEmpty({ message: 'email is required' })
  @IsString({
    message: 'validation.is_string',
  })
  public email: string;
}

export class GetOtpDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'example@gmail.com',
  })
  @IsNotEmpty({ message: 'email is required' })
  @IsString({
    message: 'validation.is_string',
  })
  public email: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh_token of the user',
    example: 'refresh_token',
  })
  @IsNotEmpty({ message: 'validation.refresh_token_required' })
  @IsString({
    message: 'validation.is_string',
  })
  public refresh_token: string;
}
