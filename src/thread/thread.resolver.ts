import { Inject } from "@nestjs/common";
import { ResolveField, Resolver, Root } from "@nestjs/graphql";

import { PostService } from "@post/post.service";

import { Thread } from "@thread/models/thread.model";
import { Post } from "@post/models/post.model";

@Resolver(() => Thread)
export class ThreadResolver {
    public constructor(@Inject(PostService) private readonly postService: PostService) {}

    @ResolveField(() => [Post])
    public async posts(@Root() thread: Thread) {
        return this.postService.getPosts(thread);
    }
}
