import { Module } from "@nestjs/common";

import { BoardModule } from "@root/board/board.module";
import { TypeOrmModule } from "@nestjs/typeorm";

import * as config from "@root/ormconfig";
import { GraphQLModule } from "@nestjs/graphql";

@Module({
    imports: [
        TypeOrmModule.forRoot(config),
        GraphQLModule.forRoot({
            autoSchemaFile: true,
        }),
        BoardModule,
    ],
})
export class AppModule {}
