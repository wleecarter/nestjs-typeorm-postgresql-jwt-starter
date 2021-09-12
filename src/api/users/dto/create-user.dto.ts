// import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  public email: string;
  public password?: string;
  public hashedPassword?: string;
  public name?: string;
}
