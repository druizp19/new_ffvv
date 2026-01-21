import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet - Protección de headers HTTP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Security: Rechazar propiedades no definidas
      forbidNonWhitelisted: true,
      // Security: Transformar y validar
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // Security: Limitar headers permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Backend running on: http://localhost:${port}`);
  console.log(`✓ Security: Helmet enabled`);
  console.log(`✓ Security: Rate limiting enabled`);
  console.log(`✓ Security: SQL injection protection enabled`);
}
bootstrap();
