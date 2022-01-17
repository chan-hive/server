import * as AWS from "aws-sdk";
import * as stream from "stream";

import { BaseDriver } from "@file/drivers/base.driver";
import { File } from "@file/models/file.model";

import { S3DriverConfig } from "@utils/types";

export class S3Driver extends BaseDriver {
    private s3: AWS.S3;

    public constructor(private readonly config: S3DriverConfig) {
        super();

        this.s3 = new AWS.S3({
            apiVersion: "2006-03-01",
            credentials: {
                accessKeyId: config.keyId,
                secretAccessKey: config.accessKey,
            },
            region: config.region,
        });
    }

    private async checkBucketExists(bucketName: string) {
        try {
            await this.s3
                .headBucket({
                    Bucket: bucketName,
                })
                .promise();

            return true;
        } catch (error) {
            return false;
        }
    }
    private async ensureBucket(bucketName: string) {
        if (await this.checkBucketExists(bucketName)) {
            return;
        }

        await this.s3
            .createBucket({
                Bucket: bucketName,
            })
            .promise();
    }
    private async uploadBuffer(fileName: string, buffer: Buffer) {
        const fileStreamGenerator = () => stream.Readable.from(buffer);
        const writeStream = new stream.PassThrough();
        const uploadPromise = this.s3
            .upload({
                Bucket: this.config.bucketName,
                Key: fileName,
                Body: writeStream,
                ACL: "public-read",
            })
            .promise();

        this.s3.putObject();

        fileStreamGenerator().pipe(writeStream);

        await uploadPromise;
    }
    private async checkFileExists(fileName: string) {
        try {
            await this.s3
                .headObject({
                    Bucket: this.config.bucketName,
                    Key: fileName,
                })
                .promise();

            return true;
        } catch (e) {
            return false;
        }
    }

    public async initialize(): Promise<void> {
        await this.ensureBucket(this.config.bucketName);
    }

    public async exists(file: File): Promise<boolean> {
        return (
            (await this.checkFileExists(`${file.uploadedTimestamp}${file.extension}`)) &&
            (await this.checkFileExists(`${file.uploadedTimestamp}s.jpg`))
        );
    }
    public async pull(file: File, thumbnail?: boolean): Promise<string | Buffer> {
        const fileName = thumbnail ? `${file.uploadedTimestamp}s.jpg` : `${file.uploadedTimestamp}${file.extension}`;
        const buffer = await this.s3
            .getObject({
                Bucket: this.config.bucketName,
                Key: fileName,
            })
            .promise();

        if (!Buffer.isBuffer(buffer.Body)) {
            throw new Error("Response data isn't a vaild buffer.");
        }

        return buffer.Body;
    }
    public async push(file: File): Promise<void> {
        const [mediaBuffer, thumbnailBuffer] = await Promise.all([
            BaseDriver.downloadFile(file),
            BaseDriver.downloadFile(file, true),
        ]);

        await Promise.all([
            this.uploadBuffer(BaseDriver.getFileName(file), mediaBuffer),
            this.uploadBuffer(BaseDriver.getFileName(file, true), thumbnailBuffer),
        ]);
    }
}
