import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileService } from "@file/file.service";
import { FileResolver } from "@file/file.resolver";
import { FileProcessor } from "@file/file.processor";
import { FileController } from "@file/file.controller";

import { File } from "@file/models/file.model";

@Module({
    imports: [
        TypeOrmModule.forFeature([File]),
        BullModule.registerQueue({
            name: "file",
        }),
    ],
    providers: [FileService, FileResolver, FileProcessor],
    exports: [FileService],
    controllers: [FileController],
})
export class FileModule {}
