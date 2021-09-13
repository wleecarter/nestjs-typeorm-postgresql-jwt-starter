import {
  BadRequestException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as faker from 'faker';
import { Repository } from 'typeorm';

import { UsersService } from '../users';
import { CreateUserDto, UserDto } from '../users/dto';
import { User } from '../users/entities';
import { UsersServiceStub } from '../users/users.service.stub';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { CryptoService } from '.';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

const NAME: string = `${faker.name.firstName()} ${faker.name.lastName()}`;
const EMAIL: string = faker.internet.email();
const PASSWORD: string = faker.internet.password();

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        AuthService,
        CryptoService,
        UsersService,
        {
          provide: UsersService,
          useClass: UsersServiceStub,
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<MockRepository>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    describe('when request is valid', () => {
      let newUser: UserDto;
      beforeAll(async () => {
        newUser = await service.register({
          email: EMAIL,
          password: PASSWORD,
          name: NAME,
        });
      });
      it('should return user', () => {
        expect(newUser.email).toEqual(EMAIL);
        expect(newUser.name).toEqual(NAME);
      });
      it('should not return password', () => {
        expect(newUser).not.toHaveProperty('password');
      });
      it('should not return hashedPassword', () => {
        expect(newUser).not.toHaveProperty('hashedPassword');
      });
    });
    describe('when user already exists', () => {
      it('should throw ConflictException', async () => {
        await expect(
          service.register({
            email: 'john@test.com',
            password: PASSWORD,
            name: NAME,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });
    describe('when email is empty', () => {
      it('should throw BadRequestException', async () => {
        await expect(
          service.register({
            email: '',
            password: PASSWORD,
            name: NAME,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });
    describe('when password is empty', () => {
      it('should throw BadRequestException', async () => {
        await expect(
          service.register({
            email: EMAIL,
            password: '',
            name: NAME,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
