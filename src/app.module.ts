import { Request } from "express";
import * as path from "path";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { BullModule } from "@nestjs/bull";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ScheduleModule } from "@nestjs/schedule";

import { PostModule } from "@post/post.module";
import { PostService } from "@post/post.service";
import { createPostLoader } from "@post/post.loader";

import { FileModule } from "@file/file.module";
import { FileService } from "@file/file.service";
import { createFileLoader } from "@file/file.loader";

import { ConfigModule } from "@config/config.module";
import { ConfigService } from "@config/config.service";

import { BoardModule } from "@board/board.module";
import { BoardService } from "@board/board.service";
import { createBoardFileCountLoader, createBoardLoader } from "@board/board.loader";

import { ThreadModule } from "@thread/thread.module";
import { ThreadService } from "@thread/thread.service";
import { createFileCountLoader } from "@thread/thread.loader";

import { MonitorModule } from "@monitor/monitor.module";

import { GraphQLContext } from "@utils/types";

import * as config from "@root/ormconfig";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ServeStaticModule.forRootAsync({
            imports: [],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const archivePath = await configService.getArchivePath();
                if (!archivePath) {
                    return [];
                }

                return [
                    {
                        rootPath: archivePath,
                        serveRoot: "/static/",
                    },
                ];
            },
        }),
        BullModule.forRoot({
            redis: {
                host: process.env.CHANHIVE_REDIS_HOST || "localhost",
                port: process.env.CHANHIVE_REDIS_PORT ? parseInt(process.env.CHANHIVE_REDIS_PORT, 10) : 9001,
            },
        }),
        TypeOrmModule.forRoot(config),
        GraphQLModule.forRootAsync({
            imports: [PostModule, FileModule, BoardModule, ThreadModule],
            inject: [PostService, FileService, BoardService, ThreadService],
            useFactory: (
                postService: PostService,
                fileService: FileService,
                boardService: BoardService,
                threadService: ThreadService,
            ) => ({
                autoSchemaFile:
                    process.env.NODE_ENV !== "production"
                        ? path.join(process.cwd(), "..", "app", "schema.gql")
                        : path.join(process.cwd(), "schema.gql"),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                context: async (_: { req: Request }): Promise<GraphQLContext> => {
                    return {
                        postLoader: createPostLoader(postService),
                        fileLoader: createFileLoader(fileService),
                        boardLoader: createBoardLoader(boardService),
                        fileCountLoader: createFileCountLoader(threadService),
                        boardFileCountLoader: createBoardFileCountLoader(boardService),
                    };
                },
                cors: {
                    credentials: true,
                    origin: true,
                },
            }),
        }),
        BoardModule,
        MonitorModule,
        ThreadModule,
        PostModule,
        ConfigModule,
        FileModule,
    ],
})
export class AppModule {}
