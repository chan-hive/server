import { Request } from "express";
import * as path from "path";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { BullModule } from "@nestjs/bull";
import { ServeStaticModule } from "@nestjs/serve-static";

import { PostModule } from "@post/post.module";
import { PostService } from "@post/post.service";
import { createPostLoader } from "@post/post.loader";

import { FileModule } from "@file/file.module";
import { FileService } from "@file/file.service";
import { createFileLoader } from "@file/file.loader";

import { BoardModule } from "@board/board.module";
import { MonitorModule } from "@monitor/monitor.module";
import { ThreadModule } from "@thread/thread.module";
import { ConfigModule } from "@config/config.module";

import { GraphQLContext } from "@utils/types";

import * as config from "@root/ormconfig";
import { ConfigService } from "@config/config.service";
import { createBoardLoader } from "@board/board.loader";
import { BoardService } from "@board/board.service";

@Module({
    imports: [
        ServeStaticModule.forRootAsync({
            imports: [ConfigModule],
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
                host: "localhost",
                port: 9001,
            },
        }),
        TypeOrmModule.forRoot(config),
        GraphQLModule.forRootAsync({
            imports: [PostModule, FileModule, BoardModule],
            inject: [PostService, FileService, BoardService],
            useFactory: (postService: PostService, fileService: FileService, boardService: BoardService) => ({
                autoSchemaFile: path.join(process.cwd(), "..", "app", "schema.gql"),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                context: async (_: { req: Request }): Promise<GraphQLContext> => {
                    return {
                        postLoader: createPostLoader(postService),
                        fileLoader: createFileLoader(fileService),
                        boardLoader: createBoardLoader(boardService),
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
