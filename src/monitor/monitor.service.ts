import { Inject, Injectable } from "@nestjs/common";

import { BoardService } from "@board/board.service";

@Injectable()
export class MonitorService {
    public constructor(@Inject(BoardService) private readonly boardService: BoardService) {}

    public async pollEvent() {
        await this.boardService.invalidate();
        return true;
    }
}
