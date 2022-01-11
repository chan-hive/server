import fetch from "node-fetch";

import { File } from "@file/models/file.model";

export abstract class BaseDriver {
    public static async downloadBuffer(url: string): Promise<Buffer> {
        return fetch(url).then(res => res.buffer());
    }

    public abstract initialize(): Promise<void>;
    public abstract pull(file: File): Promise<string | Buffer>;
    public abstract exists(file: File): Promise<boolean>;
    public abstract push(file: File): Promise<void>;
}
