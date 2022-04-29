import { BaseDriver } from "@file/drivers/base.driver";
import { File } from "@file/models/file.model";

import { Config } from "@utils/types";

export function getUrlFromFile(file: File, config: Config) {
    if (!config.driver) {
        throw new Error("You cannot get url of file without saving.");
    }

    const fileName = BaseDriver.getFileName(file);
    switch (config.driver.type) {
        case "local":
            return `/local/${fileName}`;

        case "s3":
            return `https://${config.driver.bucketName}.s3.${config.driver.region}.amazonaws.com/${fileName}`;

        default:
            throw new Error("Cannot get url of file with unknown driver: " + (config.driver as any).type);
    }
}
