<<<<<<< HEAD
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks(); // important

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
>>>>>>> 18a6ce5 (Created project, schema, added docker and nest)
