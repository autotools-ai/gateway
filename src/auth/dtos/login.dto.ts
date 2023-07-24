import { ApiBody, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'example@gmail.com',
  })
  @IsString({ message: 'validation.is_string' })
  @IsNotEmpty({ message: 'validation.email_required' })
  @IsEmail(
    {
      allow_display_name: true,
    },
    {
      message: 'validation.email_invalid',
    },
  )
  public email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123@',
  })
  @IsString({ message: 'validation.is_string' })
  @IsNotEmpty({ message: 'validation.password_required' })
  public password: string;

  @ApiPropertyOptional({
    description:
      'session_id is used to store in localStorage to verify new or old device. if session_id is null you are logged in on new device.',
    example: 'session_id',
  })
  public session_id?: string;

  metaData?: object;
}
