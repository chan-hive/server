import { Inject } from "@nestjs/common";
import { Args, Context, Int, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { ThreadService } from "@thread/thread.service";
import { Thread } from "@thread/models/thread.model";

import { PostService } from "@post/post.service";
import { Post } from "@post/models/post.model";

import { GraphQLContext } from "@utils/types";
import { Board } from "@board/models/board.model";

@Resolver(() => Thread)
export class ThreadResolver {
    public constructor(
        @Inject(ThreadService) private readonly threadService: ThreadService,
        @Inject(PostService) private readonly postService: PostService,
    ) {}

    @Query(() => Int)
    public async threadCount(@Args("boardId", { type: () => String, nullable: true }) boardId?: string | null) {
        return this.threadService.getThreadCount(boardId);
    }

    @Query(() => Thread)
    public async thread(
        @Args("boardId", { type: () => String }) boardId: string,
        @Args("threadId", { type: () => Int }) threadId: number,
    ) {
        return this.threadService.getThread(boardId, threadId);
    }

    @Query(() => [Thread])
    public async threads(
        @Args("boardId", { type: () => String, nullable: true }) boardId: Board["id"] | null,
        @Args("count", { type: () => Int }) count: number,
        @Args("before", { type: () => Date, nullable: true }) before?: Date | null,
    ) {
        return this.threadService.getThreads(boardId, count, before);
    }

    @ResolveField(() => Int)
    public async postCount(@Root() thread: Thread) {
        return thread.postIds.length;
    }

    @ResolveField(() => Int)
    public async fileCount(
        @Root() thread: Thread,
        @Context("fileCountLoader") fileCountLoader: GraphQLContext["fileCountLoader"],
    ) {
        return fileCountLoader.load(thread.id);
    }

    @ResolveField(() => Board)
    public async board(@Root() thread: Thread, @Context("boardLoader") boardLoader: GraphQLContext["boardLoader"]) {
        return boardLoader.load(thread.boardId);
    }

    @ResolveField(() => Post)
    public async opPost(@Root() thread: Thread, @Context("postLoader") postLoader: GraphQLContext["postLoader"]) {
        return postLoader.load(thread.id);
    }

    @ResolveField(() => [Post])
    public async posts(@Root() thread: Thread, @Context("postLoader") postLoader: GraphQLContext["postLoader"]) {
        return postLoader.loadMany(thread.postIds);
    }
}
