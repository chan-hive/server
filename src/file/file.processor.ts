import { Job } from "bull";
import * as fileSize from "filesize";

import { Inject, Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";

import { ConfigService } from "@config/config.service";
import { FileService } from "@file/file.service";

import { File } from "@file/models/file.model";
import { BaseDriver } from "@file/drivers/base.driver";
import { LocalDriver } from "@file/drivers/local.driver";
import { S3Driver } from "@file/drivers/s3.driver";

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
                const config = this.configService.getConfig();
                if (!config || !config.driver) {
                    return false;
                }

                switch (config.driver.type) {
                    case "local":
                        this.driver = new LocalDriver(config.driver);
                        break;

                    case "s3":
                        this.driver = new S3Driver(config.driver);
                        break;

                    default:
                        throw new Error("Failed");
                }

                await this.driver.initialize();
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
            await this.fileService.uploadFileMimeType(file, fileType?.mime || "application/octet-stream");

            this.logger.debug(
                `Successfully pushed a file (${file.name}${file.extension}, ${file.md5}, ${fileSize(file.size)}).`,
            );
        } catch (e) {
            this.logger.error(e);
        }

        return true;
    }
}
