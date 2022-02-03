import { Inject } from "@nestjs/common";
import { Args, Int, Query, ResolveField, Resolver, Root } from "@nestjs/graphql";

import { BoardService } from "@board/board.service";
import { Board } from "@board/models/board.model";

import { ThreadService } from "@thread/thread.service";
import { Thread } from "@thread/models/thread.model";

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
    public threads(@Root() board: Board) {
        return this.threadService.getThreads(board);
    }

    @ResolveField(() => Int)
    public threadCount(@Root() board: Board) {
        return this.threadService.getThreadCount(board);
    }
}
