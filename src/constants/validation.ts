import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { Config, LocalDriverConfig, S3DriverConfig, TextConfigFilter } from "@utils/types";
import * as fs from "fs";

type ZodShape<T> = {
    // Require all the keys from T
    [key in keyof T]-?: undefined extends T[key]
        ? // When optional, require the type to be optional in zod
          z.ZodOptionalType<z.ZodType<T[key]>>
        : z.ZodType<T[key]>;
};

const CONFIG_TARGET_TEXT_FILTER: ZodShape<TextConfigFilter> = {
    type: z.enum(["text"]),
    at: z.array(z.enum(["title", "content"])),
    content: z.string(),
    caseSensitive: z.boolean().optional(),
};

const CONFIG_TARGET_VALIDATOR: ZodShape<Config["targets"][0]> = {
    boards: z.array(z.string()),
    filters: z.array(z.object(CONFIG_TARGET_TEXT_FILTER)),
};

const CONFIG_LOCAL_DRIVER: ZodShape<LocalDriverConfig> = {
    type: z.enum(["local"]),
    path: z.string(),
};

const CONFIG_S3_DRIVER: ZodShape<S3DriverConfig> = {
    type: z.enum(["s3"]),
    accessKey: z.string(),
    keyId: z.string(),
    bucketName: z.string(),
    region: z.string(),
};

const CONFIG_VALIDATOR: ZodShape<Config> = {
    driver: z.union([z.object(CONFIG_LOCAL_DRIVER), z.object(CONFIG_S3_DRIVER)]),
    targets: z.array(z.object(CONFIG_TARGET_VALIDATOR)),
    monitorInterval: z.union([z.number(), z.string()]),
};

export const CONFIG_VALIDATION_SCHEMA = z.object(CONFIG_VALIDATOR);

if (process.env.NODE_ENV !== "production") {
    const CONFIG_FILE_SCHEMA = zodToJsonSchema(CONFIG_VALIDATION_SCHEMA);

    fs.writeFileSync("./chanhiverc.schema.json", JSON.stringify(CONFIG_FILE_SCHEMA, null, 4));
}
