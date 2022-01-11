import { Inject } from "@nestjs/common";
import { ResolveField, Resolver, Root } from "@nestjs/graphql";

import { Post } from "@post/models/post.model";

import { File } from "@file/models/file.model";
import { FileService } from "@file/file.service";

@Resolver(() => Post)
export class PostResolver {
    public constructor(@Inject(FileService) private readonly fileService: FileService) {}

    @ResolveField(() => File, { nullable: true })
    public async file(@Root() post: Post) {
        return this.fileService.getFile(post.fileId);
    }
}
