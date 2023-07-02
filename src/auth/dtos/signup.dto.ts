import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  public password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'firstName is required' })
  public firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'lastName is required' })
  public lastName: string;
}
