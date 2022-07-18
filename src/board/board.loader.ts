import * as DataLoader from "dataloader";

import { BoardService } from "@board/board.service";
import { Board } from "@board/models/board.model";

export function createBoardLoader(boardService: BoardService) {
    return new DataLoader<string, Board>(async keys => boardService.getBoardByIds(keys));
}

export function createBoardFileCountLoader(boardService: BoardService) {
    return new DataLoader<Board, number, string>(async keys => boardService.getFileCountFromBoards(keys), {
        cacheKeyFn: k => k.id,
    });
}
