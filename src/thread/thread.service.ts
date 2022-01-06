import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Board } from "@board/models/board.model";
import { Thread } from "@thread/models/thread.model";

@Injectable()
export class ThreadService {
    public constructor(@InjectRepository(Thread) private readonly threadRepository: Repository<Thread>) {}

    public getThreads(board?: Board) {
        if (!board) {
            return this.threadRepository.find();
        }

        return this.threadRepository.findByIds(board.threadIds);
    }
}
