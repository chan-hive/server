import * as _ from "lodash";
import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "yaml";
import * as chokidar from "chokidar";
import * as ngrok from "ngrok";
import { z } from "zod";

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { LocalDriver } from "@file/drivers/local.driver";
import { S3Driver } from "@file/drivers/s3.driver";
import { BaseDriver } from "@file/drivers/base.driver";

import { CONFIG_VALIDATION_SCHEMA } from "@constants/validation";

import { API, Config, ConfigFilter } from "@utils/types";
import { searchText } from "@utils/searchText";
import { BasePlugin } from "@file/plugins/base.plugin";
import { SQSPlugin } from "@file/plugins/sqs.plugin";

const POSSIBLE_CONFIG_FILENAMES: string[] = [".chanhiverc", "chanhiverc.yml", "chanhiverc.yaml", "chanhiverc.json"];

@Injectable()
export class ConfigService implements OnModuleInit {
    private devServerUrl: string | null = null;

    private static async tryGetConfigData(targetFilePath: string | null): Promise<[Config, string] | false> {
        const loadFile = async (filePath: string): Promise<[Config, string] | false> => {
            const content = await fs.readFile(filePath).then(buffer => buffer.toString());
            switch (path.extname(filePath).trim()) {
                case ".yml":
                case ".yaml":
                    return [yaml.parse(content), filePath];

                case ".json":
                case "": // .chanhiverc
                    return [JSON.parse(content), filePath];
            }

            return false;
        };

        if (targetFilePath) {
            return loadFile(targetFilePath);
        }

        for (const fileName of POSSIBLE_CONFIG_FILENAMES) {
            if (!fs.existsSync(fileName)) {
                continue;
            }

            targetFilePath = path.join(process.cwd(), fileName);
            return loadFile(targetFilePath);
        }

        return false;
    }

    private readonly logger = new Logger(ConfigService.name);
    private isUpdating = false;
    private configFileWatcher: chokidar.FSWatcher | null = null;
    private targetFilePath: string | null = null;
    private _config: Config | null = null;
    private _targetBoardMap: { [key: string]: Config["targets"] } | null = null;

    public async onModuleInit() {
        const config = await ConfigService.tryGetConfigData(this.targetFilePath);
        if (!config) {
            throw new Error(
                "Could not locate the configuration file. Tried:\n" +
                    POSSIBLE_CONFIG_FILENAMES.map(fileName => ` → ${path.join(process.cwd(), fileName)}`).join("\n"),
            );
        }

        try {
            CONFIG_VALIDATION_SCHEMA.parse(config[0]);
        } catch (e) {
            if (e instanceof z.ZodError) {
                const [error] = e.errors;
                throw new Error(error.message);
            } else {
                throw e;
            }
        }

        [this._config, this.targetFilePath] = config;
        this._targetBoardMap = {};
        for (const target of this._config.targets) {
            for (const boardId of target.boards) {
                if (!(boardId in this._targetBoardMap)) {
                    this._targetBoardMap[boardId] = [];
                }

                this._targetBoardMap[boardId].push(target);
            }
        }

        if (!this.configFileWatcher) {
            this.configFileWatcher = chokidar.watch(this.targetFilePath).on("change", this.handleConfigFileChange);
        }

        if (process.env.NODE_ENV !== "production" && process.env.NGROK_AUTH_TOKEN) {
            if (!this.devServerUrl) {
                this.devServerUrl = await ngrok.connect({
                    proto: "http",
                    addr: 9000,
                    authtoken: process.env.NGROK_AUTH_TOKEN,
                });

                this.logger.log(`Ngrok successfully initialized with given url: ${this.devServerUrl}`);
            }

            this._config = {
                ...this._config,
                serverUrl: this.devServerUrl,
            };
        }

        return this._config;
    }

    private handleConfigFileChange = async () => {
        if (this.isUpdating) {
            return;
        }

        this.isUpdating = true;
        this.logger.debug("Configuration file change detected. Starting hot-reloading...");

        try {
            await this.onModuleInit();
            this.logger.debug("Successfully hot-reloaded newer configuration.");
        } catch (e) {
            this.logger.error("Failed to hot-reload newer configuration with error:");
            this.logger.error((e as Error).message);
        } finally {
            this.isUpdating = false;
        }
    };

    public getArchivePath = async () => {
        if (!this._config) {
            this._config = await this.onModuleInit();
        }

        if (!this._config.driver || this._config.driver.type !== "local") {
            return null;
        }

        if (path.isAbsolute(this._config.driver.path)) {
            return this._config.driver.path;
        }

        return path.join(process.cwd(), this._config.driver.path);
    };
    public getConfig(): Config {
        if (!this._config) {
            throw new Error("You should load configuration first!");
        }

        return this._config;
    }
    public getTargetBoardMap() {
        if (!this._targetBoardMap) {
            throw new Error("You should load configuration first!");
        }

        return _.cloneDeep(this._targetBoardMap);
    }
    public async getPlugins(): Promise<BasePlugin[]> {
        const config = this.getConfig();
        if (!config || !config.plugins) {
            return [];
        }

        const targetPlugins = config.plugins.map(plugin => {
            switch (plugin.type) {
                case "sqs":
                    return new SQSPlugin(plugin, config);
            }
        });

        for (const targetPlugin of targetPlugins) {
            await targetPlugin.initialize();
        }

        return targetPlugins;
    }
    public async getDriver(): Promise<BaseDriver> {
        const config = this.getConfig();
        if (!config || !config.driver) {
            throw new Error(`Driver configuration cannot be null`);
        }

        let driver: BaseDriver;
        switch (config.driver.type) {
            case "local":
                driver = new LocalDriver(config.driver);
                break;

            case "s3":
                driver = new S3Driver(config.driver);
                break;

            default:
                throw new Error(`Unknown driver type: ${(config.driver as any).type}`);
        }

        await driver.initialize();
        return driver;
    }

    public checkFilter(thread: API.Catalog.Thread, filter: ConfigFilter) {
        if (filter.type === "text") {
            return filter.at.some(targetType => {
                let targetData: keyof typeof thread;
                switch (targetType) {
                    case "title":
                        targetData = "sub";
                        break;

                    case "content":
                        targetData = "com";
                        break;
                }

                return searchText(thread[targetData], filter.content, filter.caseSensitive);
            });
        } else {
            throw new Error(`Checking filter feature for type '${filter.type}' is not implemented yet.`);
        }
    }
}
