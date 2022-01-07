import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileService } from "@file/file.service";
import { FileResolver } from "@file/file.resolver";

import { File } from "@file/models/file.model";

@Module({
    imports: [TypeOrmModule.forFeature([File])],
    providers: [FileService, FileResolver],
    exports: [FileService],
})
export class FileModule {}
