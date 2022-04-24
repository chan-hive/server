import * as _ from "lodash";
import { In, Repository } from "typeorm";
import { Queue } from "bull";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectQueue } from "@nestjs/bull";

import { File } from "@file/models/file.model";
import { Board } from "@board/models/board.model";
import { Thread } from "@thread/models/thread.model";

import { ConfigService } from "@config/config.service";

import { getEntityByIds } from "@utils/getEntityByIds";
import { API } from "@utils/types";

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);

    public constructor(
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @InjectQueue("file") private fileQueue: Queue,
    ) {}

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

    public async ensure(rawFile: API.Thread.File, board: Board, thread: Thread) {
        let file = await this.fileRepository.findOne({
            where: {
                md5: rawFile.md5,
            },
        });

        if (file) {
            return file;
        }

        this.logger.debug(`Registering new file... (${rawFile.md5}, ${rawFile.filename}${rawFile.ext})`);

        file = this.fileRepository.create();
        file.name = rawFile.filename;
        file.extension = rawFile.ext;
        file.md5 = rawFile.md5;
        file.size = rawFile.fsize;
        file.width = rawFile.w;
        file.height = rawFile.h;
        file.thumbnailWidth = rawFile.tn_w;
        file.thumbnailHeight = rawFile.tn_h;
        file.uploadedTimestamp = rawFile.tim;
        file.board = board;
        file.thread = thread;

        return this.fileRepository.save(file);
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

    public async getMetadata(root: File): Promise<string | undefined | null> {
        let targetFile = await this.fileRepository.findOne({
            where: {
                id: root.id,
            },
        });

        if (!targetFile) {
            throw new Error("Tried to read not existing file.");
        }

        if (!targetFile.metadata && !targetFile.metadataChecked) {
            targetFile.metadata = await this.parseMetadata(targetFile);
            targetFile.metadataChecked = true;
            targetFile = await this.fileRepository.save(targetFile);
        }

        return targetFile.metadata;
    }

    private async parseMetadata(file: File): Promise<string | null> {
        const driver = await this.configService.getDriver();
        const data = await driver.pull(file);
        if (typeof data === "string") {
            return null;
        }

        const buffer = data;
        let element, i, size, title;
        function readInt() {
            let n = buffer[i++];
            let len = 0;
            while (n < 0x80 >> len) {
                len++;
            }

            n ^= 0x80 >> len;
            while (len-- && i < buffer.length) {
                n = (n << 8) ^ buffer[i++];
            }

            return n;
        }

        i = 0;
        while (i < data.length) {
            element = readInt();
            size = readInt();
            if (element === 0x3ba9) {
                title = "";
                while (size-- && i < data.length) {
                    title += String.fromCharCode(data[i++]);
                }

                return decodeURIComponent(escape(title));
            } else if (element !== 0x8538067 && element !== 0x549a966) {
                i += size;
            }
        }

        return null;
    }
}
