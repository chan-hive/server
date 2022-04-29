import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";

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

    public async push(file: File, mediaBuffer: Buffer, thumbnailBuffer: Buffer): Promise<void> {
        await fs.writeFile(path.join(this.config.path, BaseDriver.getFileName(file)), mediaBuffer);
        await fs.writeFile(path.join(this.config.path, BaseDriver.getFileName(file, true)), thumbnailBuffer);
    }
    public async pull(file: File, thumbnail?: boolean): Promise<string | Buffer> {
        return fs.readFile(path.join(this.config.path, BaseDriver.getFileName(file, thumbnail)));
    }
    public async exists(file: File): Promise<boolean> {
        return (
            fs.existsSync(path.join(this.config.path, BaseDriver.getFileName(file))) &&
            fs.existsSync(path.join(this.config.path, BaseDriver.getFileName(file, true)))
        );
    }
    public async remove(file: File, thumbnail = false): Promise<void> {
        await fs.unlink(BaseDriver.getFileName(file, thumbnail));
    }
    public async update(file: File, mediaBuffer: Buffer): Promise<void> {
        await this.remove(file);
        await fs.writeFile(file.path, mediaBuffer);
    }
}
