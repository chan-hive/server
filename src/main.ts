import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });
    await app.listen(9000);
}

bootstrap();
