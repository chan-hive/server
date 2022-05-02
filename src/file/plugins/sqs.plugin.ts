import * as AWS from "aws-sdk";
import { v4 as generateUUID } from "uuid";

import { Logger } from "@nestjs/common";
import { PluginData } from "@chanhive/core";

import { BasePlugin } from "@file/plugins/base.plugin";
import { File } from "@file/models/file.model";

import { Config } from "@utils/types";

export interface SQSPluginConfig {
    type: "sqs";
    queueUrl: string;
    region: string;
    keyId: string;
    accessKey: string;
    concurrency: number;
}

export class SQSPlugin extends BasePlugin {
    private static shouldProcessFile(file: File) {
        return file.mime.startsWith("video/") && !file.mime.endsWith("mp4");
    }

    private readonly sqs: AWS.SQS;
    private readonly logger = new Logger(SQSPlugin.name);

    public constructor(private readonly config: SQSPluginConfig, private readonly appConfig: Config) {
        super(config);

        this.sqs = new AWS.SQS({
            apiVersion: "2012-11-05",
            credentials: {
                accessKeyId: config.keyId,
                secretAccessKey: config.accessKey,
            },
            region: config.region,
        });
    }

    public async initialize(): Promise<void> {
        this.logger.debug("Plugin has initialized.");
        return;
    }

    public async afterPush(file: File): Promise<File> {
        if (!SQSPlugin.shouldProcessFile(file)) {
            return file;
        }

        const message: PluginData = {
            sourceFile: File.toInformation(file, this.appConfig),
            callbackUrl: `${this.appConfig.serverUrl}/plugin/callback/${file.id}`,
            pluginName: this.config.type,
        };

        await this.sqs
            .sendMessage({
                MessageBody: JSON.stringify(message),
                QueueUrl: this.config.queueUrl,
                MessageGroupId: `chanhive-${file.id % this.config.concurrency}`,
                MessageDeduplicationId: generateUUID(),
            })
            .promise();

        return file;
    }
    public async register(files: File[]): Promise<void> {
        files = files.filter(file => SQSPlugin.shouldProcessFile(file));
        if (files.length <= 0) {
            return;
        }

        await this.sqs
            .sendMessageBatch({
                Entries: files.map((file, index) => ({
                    Id: generateUUID(),
                    MessageBody: JSON.stringify({
                        sourceFile: File.toInformation(file, this.appConfig),
                        callbackUrl: `${this.appConfig.serverUrl}/plugin/callback/${file.id}`,
                        pluginName: this.config.type,
                    }),
                    MessageGroupId: `chanhive-${index % this.config.concurrency}`,
                    MessageDeduplicationId: generateUUID(),
                })),
                QueueUrl: this.config.queueUrl,
            })
            .promise();
    }
}
