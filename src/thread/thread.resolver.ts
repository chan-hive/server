import { Inject } from "@nestjs/common";
import { Context, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { PostService } from "@post/post.service";

import { Thread } from "@thread/models/thread.model";
import { Post } from "@post/models/post.model";

import { GraphQLContext } from "@utils/types";

@Resolver(() => Thread)
export class ThreadResolver {
    public constructor(@Inject(PostService) private readonly postService: PostService) {}

    @ResolveField(() => Post)
    public async opPost(@Root() thread: Thread) {
        return this.postService.getOPPost(thread);
    }

    @ResolveField(() => [Post])
    public async posts(@Root() thread: Thread, @Context("postLoader") postLoader: GraphQLContext["postLoader"]) {
        return postLoader.loadMany(thread.postIds);
    }
}
