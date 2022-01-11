import { Inject } from "@nestjs/common";
import { Context, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { Post } from "@post/models/post.model";

import { File } from "@file/models/file.model";
import { FileService } from "@file/file.service";

import { GraphQLContext } from "@utils/types";

@Resolver(() => Post)
export class PostResolver {
    public constructor(@Inject(FileService) private readonly fileService: FileService) {}

    @ResolveField(() => File, { nullable: true })
    public async file(@Root() post: Post, @Context("fileLoader") fileLoader: GraphQLContext["fileLoader"]) {
        if (!post.fileId) {
            return null;
        }

        return fileLoader.load(post.fileId);
    }
}
