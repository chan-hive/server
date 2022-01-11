import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import fetch from "node-fetch";

import { BaseDriver } from "@file/drivers/base.driver";
import { File } from "@file/models/file.model";

import { LocalDriverConfig } from "@utils/types";

export class LocalDriver extends BaseDriver {
    private readonly config: LocalDriverConfig;

    public constructor(config: LocalDriverConfig) {
        super();

        this.config = _.cloneDeep(config);
    }

    public async initialize(): Promise<void> {
        if (!path.isAbsolute(this.config.path)) {
            this.config.path = path.join(process.cwd(), this.config.path);
        }

        await fs.ensureDir(this.config.path);
    }

    public async push(file: File): Promise<void> {
        const fileName = `${file.uploadedTimestamp}${file.extension}`;
        const fileBuffer = await fetch(`https://i.4cdn.org/${file.boardId}/${fileName}`).then(res => res.buffer());

        await fs.writeFile(path.join(this.config.path, fileName), fileBuffer);
    }

    public async pull(file: File): Promise<string | Buffer> {
        return "";
    }

    public async exists(file: File): Promise<boolean> {
        const fileName = `${file.uploadedTimestamp}${file.extension}`;

        return fs.existsSync(path.join(this.config.path, fileName));
    }
}
