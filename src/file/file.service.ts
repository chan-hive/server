import { Repository } from "typeorm";

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
}
