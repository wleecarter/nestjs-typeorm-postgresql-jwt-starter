import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private SALT_ROUNDS = 10;

  public async hashPassword(plainTextPassword: string): Promise<string> {
    return await bcrypt.hash(plainTextPassword, this.SALT_ROUNDS);
  }

  public async verifyPassword(params: {
    plainTextPassword: string;
    hashedPassword: string;
  }): Promise<boolean> {
    return await bcrypt.compare(
      params.plainTextPassword,
      params.hashedPassword,
    );
  }
}
