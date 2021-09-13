import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto';

@Injectable()
export class UsersServiceStub {
  private readonly users: CreateUserDto[];

  constructor() {
    this.users = [
      {
        email: 'john@test.com',
        password: 'changeme',
      },
      {
        email: 'chris@test.com',
        password: 'secret',
      },
      {
        email: 'maria@test.com',
        password: 'guess',
      },
    ];
  }

  async findByEmail(email: string): Promise<CreateUserDto | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async create(userDto: CreateUserDto): Promise<any> {
    return this.users.push(userDto);
  }
}
