import { Inject } from "@nestjs/common";
import { Args, Int, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { File } from "@file/models/file.model";
import { FileService } from "@file/file.service";
import { BaseDriver } from "@file/drivers/base.driver";

import { ConfigService } from "@config/config.service";

@Resolver(() => File)
export class FileResolver {
    public constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(FileService) private readonly fileService: FileService,
    ) {}

    @Query(() => File, { nullable: true })
    public async file(@Args("id", { type: () => Int }) id: File["id"]) {
        return this.fileService.getFile(id);
    }

    @ResolveField(() => String)
    public async metadata(
        @Root() root: File,
        @Args("refresh", { type: () => Boolean, defaultValue: true }) refresh = true,
    ) {
        return this.fileService.getMetadata(root, refresh);
    }

    @ResolveField(() => String)
    public async url(@Root() root: File) {
        const config = this.configService.getConfig();
        if (!config.driver) {
            throw new Error("You cannot get url of file without saving.");
        }

        const fileName = BaseDriver.getFileName(root);
        switch (config.driver.type) {
            case "local":
                return `/local/${fileName}`;

            case "s3":
                return `https://${config.driver.bucketName}.s3.${config.driver.region}.amazonaws.com/${fileName}`;

            default:
                throw new Error("Cannot get url of file with unknown driver: " + (config.driver as any).type);
        }
    }

    @ResolveField(() => String)
    public async thumbnailUrl(@Root() root: File) {
        const config = this.configService.getConfig();
        if (!config.driver) {
            throw new Error("You cannot get url of file without saving.");
        }

        const fileName = BaseDriver.getFileName(root, true);
        switch (config.driver.type) {
            case "local":
                return `/local/${fileName}`;

            case "s3":
                return `https://${config.driver.bucketName}.s3.${config.driver.region}.amazonaws.com/${fileName}`;

            default:
                throw new Error("Cannot get url of file with unknown driver: " + (config.driver as any).type);
        }
    }

    @ResolveField(() => Boolean)
    public async isImage(@Root() root: File) {
        return !root.extension.startsWith("image/");
    }

    @ResolveField(() => Boolean)
    public isVideo(@Root() root: File) {
        return root.mime.startsWith("video/");
    }
}
