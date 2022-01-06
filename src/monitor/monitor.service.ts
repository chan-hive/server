import { Inject, Injectable } from "@nestjs/common";

import { BoardService } from "@board/board.service";
import { ThreadService } from "@thread/thread.service";

@Injectable()
export class MonitorService {
    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(ThreadService) private readonly threadService: ThreadService,
    ) {}

    public async pollEvent() {
        await this.boardService.onInvalidate();
        await this.threadService.onInvalidate();
        return true;
    }
}
