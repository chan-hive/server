import * as _ from "lodash";
import { Repository } from "typeorm";

import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { BoardService } from "@board/board.service";
import { Board } from "@board/models/board.model";

import { Thread } from "@thread/models/thread.model";

import { InvalidationService } from "@common/invalidation.service";

import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";

@Injectable()
export class ThreadService implements InvalidationService {
    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
    ) {}

    public getThreads(board?: Board) {
        if (!board) {
            return this.threadRepository.find();
        }

        return this.threadRepository.findByIds(board.threadIds);
    }

    private getThreadIds(board: Board) {
        return this.threadRepository
            .createQueryBuilder("t")
            .select("`t`.`id`")
            .where("`t`.`boardId` = :boardId", { boardId: board.id })
            .getRawMany<{ id: string }>()
            .then(rows => rows.map(row => parseInt(row.id, 10)));
    }

    public async onInvalidate() {
        const boards = await this.boardService.getBoards();
        const updatedThreads: Thread[] = [];
        for (const board of boards) {
            if (board.id !== "wsg") {
                continue;
            }

            const pages = await fetchJSON<API.Catalog.Result>(`https://a.4cdn.org/${board.id}/catalog.json`);
            const oldThreadIds = await this.getThreadIds(board);

            const oldThreads = await this.threadRepository.findByIds(oldThreadIds);
            const oldThreadMap = _.chain(oldThreads)
                .keyBy(t => t.id)
                .mapValues()
                .value();

            const newThreads = _.chain(pages).map("threads").flatten().value();
            const newThreadMap = _.chain(newThreads)
                .keyBy(t => t.no)
                .mapValues()
                .value();

            // update first.
            for (const thread of oldThreads) {
                if (!(thread.id in newThreadMap)) {
                    thread.isDead = true;
                    updatedThreads.push(thread);
                }
            }

            // then insert.
            for (const thread of newThreads) {
                if (thread.no in oldThreadMap) {
                    continue;
                }

                const entity = this.threadRepository.create();
                entity.id = thread.no;
                entity.isDead = false;
                entity.board = board;

                updatedThreads.push(entity);
            }
        }

        await this.threadRepository.save(updatedThreads);
    }
}
