import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, UserDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { AccessTokenResponse } from './access-token.interface';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  /*
   * TODO: add min/max length validation for email, password
   * TODO: add complexity validation for password
   */
  public async register(createUserDto: CreateUserDto): Promise<UserDto> {
    if (!createUserDto.email || !createUserDto.password) {
      throw new BadRequestException(
        'Please include both an email and password when registering',
      );
    }
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email '${createUserDto.email}' already exists`,
      );
    }

    createUserDto.hashedPassword = await this.cryptoService.hashPassword(
      createUserDto.password,
    );
    await this.usersService.create(createUserDto);
    return await this.validateCredentials(
      createUserDto.email,
      createUserDto.password,
    );
  }

  public login(user: UserDto): AccessTokenResponse {
    return this.getAccessToken(user);
  }

  async validateCredentials(email: string, password: string): Promise<any> {
    const userMatch = await this.usersService.findByEmail(email);
    if (!userMatch) {
      return null;
    }
    const passwordMatch: boolean = await this.cryptoService.verifyPassword({
      plainTextPassword: password,
      hashedPassword: userMatch.hashedPassword,
    });
    if (passwordMatch) {
      return {
        id: userMatch.id,
        email: userMatch.email,
        name: userMatch.name,
        avatar: userMatch.avatar,
      };
    }
  }

  public getAccessToken(user: UserDto): AccessTokenResponse {
    const payload = {
      email: user.email,
      id: user.id,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
