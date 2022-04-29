import type { Response as ResponseType } from "express";

import {
    Body,
    Controller,
    HttpStatus,
    Inject,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
    Response,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { PluginCompletionMessage } from "@chanhive/core";

import { FileService } from "@file/file.service";
import { ConfigService } from "@config/config.service";

@Controller()
export class FileController {
    public constructor(
        @Inject(FileService) private readonly fileService: FileService,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {}

    @Post("/plugin/callback/:fileId(\\d+)")
    @UseInterceptors(FileInterceptor("data"))
    public async driverCallback(
        @Param("fileId") fileId: number,
        @UploadedFile() data: Express.Multer.File | undefined,
        @Body() body: PluginCompletionMessage,
        @Response() response: ResponseType,
    ) {
        await this.fileService.updateFile(fileId, data, body);
        response.status(HttpStatus.OK).send({ description: "Ok" });
    }
}
