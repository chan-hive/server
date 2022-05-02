import * as _ from "lodash";
import { In, Repository } from "typeorm";
import { Queue } from "bull";
import * as fileSize from "filesize";

import { PluginCompletionMessage } from "@chanhive/core";

import { HttpException, HttpStatus, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectQueue } from "@nestjs/bull";

import { File } from "@file/models/file.model";
import { BasePlugin } from "@file/plugins/base.plugin";

import { Board } from "@board/models/board.model";
import { Thread } from "@thread/models/thread.model";

import { ConfigService } from "@config/config.service";

import { getEntityByIds } from "@utils/getEntityByIds";
import { API } from "@utils/types";

@Injectable()
export class FileService implements OnModuleInit {
    private readonly logger = new Logger(FileService.name);
    private readonly plugins: BasePlugin[] = [];

    public constructor(
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @InjectQueue("file") private fileQueue: Queue,
    ) {}

    public async onModuleInit() {
        this.plugins.push(...(await this.configService.getPlugins()));

        const files = await this.fileRepository
            .createQueryBuilder("f")
            .select("`f`.`id`")
            .addSelect("`f`.`appliedPlugins`")
            .getRawMany<{ id: number; appliedPlugins: string }>()
            .then(data => data.map(row => ({ ...row, appliedPlugins: row.appliedPlugins.split(",") })));

        const pluginQueue: [BasePlugin, number[]][] = [];
        for (const plugin of this.plugins) {
            const targetIds: number[] = files
                .filter(file => !file.appliedPlugins.includes(plugin.name))
                .map(file => file.id);

            pluginQueue.push([plugin, targetIds]);
        }

        const targetIds = _.chain(pluginQueue)
            .map(item => item[1])
            .flatten()
            .uniq()
            .value();

        const targets = await this.fileRepository.findByIds(targetIds);
        const fileMap = _.chain(targets)
            .keyBy(file => file.id)
            .mapValues(file => file)
            .value();

        for (const [plugin, fileIds] of pluginQueue) {
            if (fileIds.length <= 0) {
                continue;
            }

            await plugin.register(fileIds.map(id => fileMap[id]));
        }
    }

    public getFile(fileId: number) {
        return this.fileRepository.findOne({
            where: {
                id: fileId,
            },
        });
    }
    public getFileByIds(keys: ReadonlyArray<number>) {
        return getEntityByIds(this.fileRepository, [...keys]);
    }

    public async bulkEnsure(rawFiles: [API.Thread.File, Board, Thread][]) {
        const oldFiles = await this.fileRepository.find({
            where: {
                md5: In(rawFiles.map(([rf]) => rf.md5)),
            },
        });
        const oldFilesMap = _.chain(oldFiles)
            .keyBy(f => f.md5)
            .mapValues()
            .value();

        const entities = rawFiles
            .filter(([rf]) => !(rf.md5 in oldFilesMap))
            .map(([item, board, thread]) => {
                const file = this.fileRepository.create();
                file.name = item.filename;
                file.path = `${item.tim}${item.ext}`;
                file.extension = item.ext;
                file.md5 = item.md5;
                file.size = item.fsize;
                file.width = item.w;
                file.height = item.h;
                file.thumbnailWidth = item.tn_w;
                file.thumbnailHeight = item.tn_h;
                file.uploadedTimestamp = item.tim;
                file.isArchived = false;
                file.board = board;
                file.thread = thread;
                file.appliedPlugins = [];

                return file;
            });

        const newFiles = await this.fileRepository.save(entities);
        const fileMap = {
            ...oldFilesMap,
            ..._.chain(newFiles)
                .keyBy(f => f.md5)
                .mapValues()
                .value(),
        };

        return rawFiles.map(([{ md5 }]) => {
            if (!(md5 in fileMap)) {
                throw new Error(`Failed to find file with hash (${md5}) in ensured file dictionary.`);
            }

            return fileMap[md5];
        });
    }

    public async download(file: File) {
        await this.fileQueue.add("download", file, {
            removeOnComplete: true,
            removeOnFail: true,
        });
    }
    public async bulkDownload(files: File[]) {
        await this.fileQueue.addBulk(
            files.map(f => ({
                name: "download",
                data: f,
                opts: {
                    removeOnComplete: true,
                    removeOnFail: true,
                },
            })),
        );
    }

    public async markFileAsArchived(file: File) {
        await this.fileRepository.update(
            {
                id: file.id,
            },
            {
                isArchived: true,
            },
        );
    }

    public async uploadFileMimeType(file: File, mime: string) {
        await this.fileRepository.update(
            {
                id: file.id,
            },
            {
                mime,
            },
        );
    }

    public async getMetadata(root: File, refresh: boolean): Promise<string | undefined | null> {
        if (!refresh) {
            return root.metadata;
        }

        let targetFile = await this.fileRepository.findOne({
            where: {
                id: root.id,
            },
        });

        if (!targetFile) {
            throw new Error("Tried to read not existing file.");
        }

        targetFile.metadata = await this.parseMetadata(targetFile);
        targetFile.metadataChecked = true;
        targetFile = await this.fileRepository.save(targetFile);

        return targetFile.metadata;
    }
    public async updateMetadata(file: File, buffer: Buffer) {
        await this.fileRepository.update(
            {
                id: file.id,
            },
            {
                metadata: file.mime === "video/webm" ? await this.parseMetadata(buffer) : null,
                metadataChecked: true,
            },
        );
    }
    private async parseMetadata(file: File | Buffer): Promise<string | null> {
        let targetBuffer: Buffer;
        if (!Buffer.isBuffer(file)) {
            const driver = await this.configService.getDriver();
            const data = await driver.pull(file);
            if (typeof data === "string") {
                return null;
            }

            targetBuffer = data;
        } else {
            targetBuffer = file;
        }

        let element, i, size, title;
        function readInt() {
            let n = targetBuffer[i++];
            let len = 0;
            while (n < 0x80 >> len) {
                len++;
            }

            n ^= 0x80 >> len;
            while (len-- && i < targetBuffer.length) {
                n = (n << 8) ^ targetBuffer[i++];
            }

            return n;
        }

        i = 0;
        while (i < targetBuffer.length) {
            element = readInt();
            size = readInt();
            if (element === 0x3ba9) {
                title = "";
                while (size-- && i < targetBuffer.length) {
                    title += String.fromCharCode(targetBuffer[i++]);
                }

                return decodeURIComponent(escape(title));
            } else if (element !== 0x8538067 && element !== 0x549a966) {
                i += size;
            }
        }

        return null;
    }

    public async updateFile(fileId: number, data: Express.Multer.File | undefined, body: PluginCompletionMessage) {
        const targetFile = await this.getFile(fileId);
        if (!targetFile) {
            throw new HttpException("Specified file not exists", HttpStatus.NOT_FOUND);
        }

        if (!data) {
            throw new HttpException("You should send with process file binary.", HttpStatus.BAD_REQUEST);
        }

        const previousFileSize = fileSize(targetFile.size);
        const previousFilePath = targetFile.path;

        const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<typeof import("file-type")>);
        const fileType = await fileTypeFromBuffer(data.buffer);
        if (!fileType) {
            throw new HttpException(
                "Failed to read mime type of submitted file data.",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        targetFile.path = `${body.fileName}${body.extension}`;
        targetFile.size = body.size;
        targetFile.extension = body.extension;
        targetFile.mime = fileType.mime;
        targetFile.appliedPlugins.push(body.pluginName);

        const driver = await this.configService.getDriver();
        await driver.update(targetFile, data.buffer);

        await this.fileRepository.save(targetFile);

        this.logger.debug(
            `Successfully updated file #${fileId} through plugin. (${previousFilePath} => ${
                targetFile.path
            }, ${previousFileSize} => ${fileSize(targetFile.size)})`,
        );
    }
}
