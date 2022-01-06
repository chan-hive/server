import { Inject } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { BoardService } from "@board/board.service";

import { Board } from "@board/models/board.model";

@Resolver(() => Board)
export class BoardResolver {
    public constructor(@Inject(BoardService) private readonly boardService: BoardService) {}

    @Query(() => [Board])
    public boards() {
        return this.boardService.getBoards();
    }
}
