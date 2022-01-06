import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";

import { BoardModule } from "@board/board.module";
import { MonitorModule } from "@monitor/monitor.module";

import * as config from "@root/ormconfig";

@Module({
    imports: [
        TypeOrmModule.forRoot(config),
        GraphQLModule.forRoot({
            autoSchemaFile: true,
        }),
        BoardModule,
        MonitorModule,
    ],
})
export class AppModule {}
