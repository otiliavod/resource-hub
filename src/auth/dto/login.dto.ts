import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  @IsString({ message: 'Password is required.' })
  @MinLength(1, { message: 'Password is required.' })
  password!: string;
}
