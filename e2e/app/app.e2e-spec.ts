import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';

describe('auth', () => {
  let app: INestApplication;
  const NAME: string = `${faker.name.firstName()} ${faker.name.lastName()}`;
  const EMAIL: string = faker.internet.email();
  const PASSWORD: string = faker.internet.password();
  let registerReq, loginReq, currentUserReq;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('when requests are valid', () => {
    beforeAll(async () => {
      registerReq = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: EMAIL, password: PASSWORD, name: NAME })
        .expect(201);

      loginReq = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: EMAIL, password: PASSWORD })
        .expect(201);

      const token = loginReq.body.accessToken;
      currentUserReq = await request(app.getHttpServer())
        .get('/users/current')
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
    });

    describe('POST /auth/register', () => {
      it('should return access token', () => {
        expect(registerReq.body.accessToken).toBeDefined();
      });
    });

    describe('POST /auth/login', () => {
      it('should return access token', () => {
        expect(loginReq.body.accessToken).toBeDefined();
      });
    });

    describe('GET /users/current', () => {
      it('should return return user', () => {
        console.log(currentUserReq.body);
        expect(currentUserReq.body.id).toBeDefined();
        expect(currentUserReq.body.name).toBe(NAME);
        expect(currentUserReq.body.email).toBe(EMAIL);
        expect(currentUserReq.body.avatar).toBeNull();
      });
      it('should not return password', () => {
        expect(currentUserReq.body).not.toHaveProperty('hashedPassword');
      });
    });
  });

  describe('POST /auth/register', () => {
    describe('when registration request does not include email', () => {
      it('should return 400 BadRequestException', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: '', password: PASSWORD, name: NAME })
          .expect(400);
      });
    });
    describe('when registration request does not include password', () => {
      it('should return 400 BadRequestException', async () => {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: EMAIL, password: '', name: NAME })
          .expect(400);
      });
    });
  });

  describe('POST /auth/login', () => {
    describe('when registration request includes incorrect email', () => {
      it('should return 401 Unauthorized', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'doesnot@exist.com', password: PASSWORD })
          .expect(401);
      });
    });
    describe('when registration request includes incorrect password', () => {
      it('should return 401 Unauthorized', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: EMAIL, password: 'bad-password' })
          .expect(401);
      });
    });
    describe('when registration request includes incorrect username and password', () => {
      it('should return 401 Unauthorized', async () => {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'doesnot@exist.com', password: 'bad-password' })
          .expect(401);
      });
    });
  });
});
