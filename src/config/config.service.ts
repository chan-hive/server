import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "yaml";
import { z } from "zod";

import { Injectable, OnModuleInit } from "@nestjs/common";

import { Config } from "@utils/types";
import { CONFIG_VALIDATION_SCHEMA } from "@root/constants/validation";

const POSSIBLE_CONFIG_FILENAMES: string[] = [".chanhiverc", "chanhiverc.yml", "chanhiverc.yaml", "chanhiverc.json"];

@Injectable()
export class ConfigService implements OnModuleInit {
    private _config: Config | null = null;

    public getConfig(): Config {
        if (!this._config) {
            throw new Error("You should load configuration first!");
        }

        return this._config;
    }

    public async onModuleInit() {
        const config = await ConfigService.tryGetConfigData();
        if (!config) {
            throw new Error(
                "Could not locate the configuration file. Tried:\n" +
                    POSSIBLE_CONFIG_FILENAMES.map(fileName => ` → ${path.join(process.cwd(), fileName)}`).join("\n"),
            );
        }

        try {
            CONFIG_VALIDATION_SCHEMA.parse(config);
        } catch (e) {
            if (e instanceof z.ZodError) {
                const [error] = e.errors;
                throw new Error(error.message);
            } else {
                throw e;
            }
        }

        this._config = config;
    }

    private static async tryGetConfigData(): Promise<Config | false> {
        for (const fileName of POSSIBLE_CONFIG_FILENAMES) {
            if (!fs.existsSync(fileName)) {
                continue;
            }

            const content = await fs.readFile(path.join(process.cwd(), fileName)).then(buffer => buffer.toString());
            switch (path.extname(fileName).trim()) {
                case ".yml":
                case ".yaml":
                    return yaml.parse(content);

                case ".json":
                case "": // .chanhiverc
                    return JSON.parse(content);
            }
        }

        return false;
    }
}
