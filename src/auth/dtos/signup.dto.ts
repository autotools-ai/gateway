import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'example@gmail.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'validation.email_required' })
  @IsEmail(
    {
      allow_utf8_local_part: true,
    },
    { message: 'validation.email_invalid' },
  )
  public email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123@',
  })
  @IsString({
    message: 'validation.is_string',
  })
  @IsNotEmpty({ message: 'validation.password_required' })
  @Matches(
    /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=])[a-zA-Z0-9@#$%^&+=]{8,}$/,
    {
      message: 'validation.password',
    },
  )
  public password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString({
    message: 'validation.is_string',
  })
  @IsNotEmpty({ message: 'validation.first_name' })
  public firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString({
    message: 'validation.is_string',
  })
  @IsNotEmpty({ message: 'validation.first_name' })
  public lastName: string;
}
