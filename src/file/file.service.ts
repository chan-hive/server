import * as _ from "lodash";
import { In, Repository } from "typeorm";

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { File } from "@file/models/file.model";

import { API } from "@utils/types";

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);

    public constructor(@InjectRepository(File) private readonly fileRepository: Repository<File>) {}

    public async ensure(rawFile: API.Thread.File) {
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

        return this.fileRepository.save(file);
    }

    public async bulkEnsure(rawFiles: API.Thread.File[]) {
        const oldFiles = await this.fileRepository.find({
            where: {
                md5: In(rawFiles.map(rf => rf.md5)),
            },
        });
        const oldFilesMap = _.chain(oldFiles)
            .keyBy(f => f.md5)
            .mapValues()
            .value();

        let totalSize = 0;
        const entities = rawFiles
            .filter(rf => !(rf.md5 in oldFilesMap))
            .map(item => {
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
                totalSize += item.fsize;

                return file;
            });

        this.logger.debug(`Registering new ${entities.length} files. (${totalSize} bytes)`);

        const newFiles = await this.fileRepository.save(entities);
        const fileMap = {
            ...oldFilesMap,
            ..._.chain(newFiles)
                .keyBy(f => f.md5)
                .mapValues()
                .value(),
        };

        return rawFiles.map(({ md5 }) => {
            if (!(md5 in fileMap)) {
                throw new Error(`Failed to find file with hash (${md5}) in ensured file dictionary.`);
            }

            return fileMap[md5];
        });
    }
}
