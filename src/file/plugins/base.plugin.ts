import { File } from "@file/models/file.model";

export interface BasePluginConfig {
    type: string;
}

export abstract class BasePlugin {
    public get name() {
        return this.baseConfig.type;
    }

    protected constructor(private readonly baseConfig: BasePluginConfig) {}

    public abstract initialize(): Promise<void>;
    public abstract afterPush(file: File, mediaBuffer: Buffer, thumbnailBuffer: Buffer): Promise<File>;
    public abstract register(files: File[]): Promise<void>;
}
