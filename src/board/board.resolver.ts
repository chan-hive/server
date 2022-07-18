import { Inject } from "@nestjs/common";
import { Args, Context, Int, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { BoardService } from "@board/board.service";
import { Board } from "@board/models/board.model";

import { ThreadService } from "@thread/thread.service";
import { Thread } from "@thread/models/thread.model";
import { GraphQLContext } from "@utils/types";

@Resolver(() => Board)
export class BoardResolver {
    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(ThreadService) private readonly threadService: ThreadService,
    ) {}

    @Query(() => Board, { nullable: true })
    public board(@Args("id", { type: () => String }) id: string) {
        return this.boardService.getBoard(id);
    }

    @Query(() => [Board])
    public boards() {
        return this.boardService.getBoards();
    }

    @ResolveField(() => [Thread])
    public threads(@Root() board: Board, @Args("count", { type: () => Int, nullable: true }) count: number) {
        return this.threadService.getThreads(board, count);
    }

    @ResolveField(() => Int)
    public threadCount(@Root() board: Board) {
        return this.threadService.getThreadCount(board);
    }

    @ResolveField(() => Int)
    public fileCount(
        @Root() board: Board,
        @Context("boardFileCountLoader") loader: GraphQLContext["boardFileCountLoader"],
    ) {
        return loader.load(board);
    }

    @ResolveField(() => Thread, { nullable: true })
    public async latestThread(@Root() board: Board) {
        const threads = await this.threadService.getThreads(board, 1);

        return threads[0];
    }
}
