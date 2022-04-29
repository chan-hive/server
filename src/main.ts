import { NestFactory } from "@nestjs/core";

import { AppModule } from "@root/app.module";

import * as dotenv from "dotenv";
import * as path from "path";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({
        path: path.join(process.cwd(), ".development.env"),
    });
}

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
