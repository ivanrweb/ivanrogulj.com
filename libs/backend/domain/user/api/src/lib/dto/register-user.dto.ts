import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(8)
  public password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public lastName!: string;
}
