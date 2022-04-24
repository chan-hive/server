import { Job } from "bull";
import * as fileSize from "filesize";

import { Inject, Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { ConfigService } from "@config/config.service";
import { FileService } from "@file/file.service";

import { File } from "@file/models/file.model";
import { BaseDriver } from "@file/drivers/base.driver";

@Processor("file")
export class FileProcessor {
    private readonly logger = new Logger(FileProcessor.name);

    public constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(FileService) private readonly fileService: FileService,
    ) {}

    private driver: BaseDriver | null = null;

    @Process("download")
    public async download(job: Job<File>) {
        try {
            const { data: file } = job;
            if (!this.driver) {
                this.driver = await this.configService.getDriver();
            }

            const isExists = await this.driver.exists(file);
            if (isExists) {
                if (!file.isArchived) {
                    await this.fileService.markFileAsArchived(file);
                }

                this.logger.debug(
                    `Target file (${file.name}${file.extension}, ${file.md5}, ${fileSize(
                        file.size,
                    )}) is already archived. skip it.`,
                );

                return true;
            }

            const [mediaBuffer, thumbnailBuffer] = await Promise.all([
                BaseDriver.downloadFile(file),
                BaseDriver.downloadFile(file, true),
            ]);

            const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import("file-type")>);
            const fileType = await fileTypeFromBuffer(mediaBuffer);

            await this.driver.push(file, mediaBuffer, thumbnailBuffer);
            await this.fileService.markFileAsArchived(file);

            file.mime = fileType?.mime || "application/octet-stream";
            await this.fileService.uploadFileMimeType(file, file.mime);
            await this.fileService.updateMetadata(file, mediaBuffer);

            this.logger.debug(
                `Successfully pushed a file (${file.name}${file.extension}, ${file.md5}, ${fileSize(file.size)}).`,
            );
        } catch (e) {
            this.logger.error(e);
        }

        return true;
    }
}
