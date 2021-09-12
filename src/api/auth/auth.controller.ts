import {
  Body,
  // Body,
  Controller,
  // HttpStatus,
  Post,
  Request,
  // Response,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto';
import { AccessTokenResponse } from './access-token.interface';

// import { CreateUserDto } from "../users/dto";
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AccessTokenResponse> {
    const newUser = await this.authService.register(createUserDto);
    return this.authService.getAccessToken(newUser);
  }

  /**
   * LocalAuthGuard executes the 'local' passport strategy,
   * which validates a user against the username/password sent in
   * the body of the request.
   *
   * if all we wanted was to just return a valid user,
   * and not a jwt, we could just do this:
   *
   * return req.user
   *
   * because Passport attaches the user to the Request
   * object using what's returned from the selected
   * strategy's validate() method
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): AccessTokenResponse {
    return this.authService.login(req.user);
  }
}
