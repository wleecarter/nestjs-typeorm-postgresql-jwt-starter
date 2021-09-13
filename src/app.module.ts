import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const isProduction = process.env.NODE_ENV === 'production' ? true : false;

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    // ConfigModule.forRoot({
    //   // set to true when deploying to providers like heroku
    //   ignoreEnvFile: false,
    // }),
    LoggerModule.forRoot({
      pinoHttp: {
        prettyPrint: {
          colorize: true,
          levelFirst: true,
          translateTime: 'UTC:mm-dd-yyyy h:MM:ss TT Z',
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: +process.env.DATABASE_PORT || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'pass123',
      database: process.env.DATABASE_NAME || 'nest-starter',
      autoLoadEntities: true, // models will be loaded automatically
      synchronize: !isProduction, // entities will be synced with the database (disable in prod)
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log(
      `======= connected to db @ [ ${process.env.DATABASE_HOST} ${process.env.DATABASE_NAME} ] ========`,
    );
  }
}
