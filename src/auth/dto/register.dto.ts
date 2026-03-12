import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Name must be a valid string.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  fullName!: string;

  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  @IsString({ message: 'Password must be a valid string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number.' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one symbol.' })
  password!: string;
}
