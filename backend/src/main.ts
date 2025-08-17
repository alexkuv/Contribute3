import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://contribution3.local',
      'http://contribute3.bstl.online',
      'https://contribute3.bstl.online',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
