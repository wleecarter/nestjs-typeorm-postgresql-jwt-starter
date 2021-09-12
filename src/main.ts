import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

const GLOBAL_PREFIX = 'api';
const PORT = process.env.PORT || 3333;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors();
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useLogger(app.get(Logger));
  await app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
  });
}
bootstrap();
