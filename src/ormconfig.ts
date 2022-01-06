import { TypeOrmModule } from "@nestjs/typeorm";

const config: Parameters<typeof TypeOrmModule["forRoot"]>[0] = {
    type: "mysql",
    host: process.env.DB_HOST ? process.env.DB_HOST : "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 9002,
    username: process.env.DB_USER ? process.env.DB_USER : "chanhive",
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : "chanhive",
    database: "chanhive",
    autoLoadEntities: true,
    dropSchema: false,
    entities: ["./dist/**/*.model{.ts,.js}"],
    synchronize: false,
    migrationsRun: true,
    logging: false,
    logger: process.env.NODE_ENV !== "production" ? undefined : "file",
    migrations: ["dist/migrations/**/*{.ts,.js}"],
    cli: {
        migrationsDir: "src/migrations",
    },
};

export = config;
