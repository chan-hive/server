import * as _ from "lodash";
import { Repository } from "typeorm";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { ConfigService } from "@config/config.service";
import { PostService } from "@post/post.service";
import { BoardService } from "@board/board.service";

import { Board } from "@board/models/board.model";
import { Thread } from "@thread/models/thread.model";

import { InvalidationService } from "@common/invalidation.service";

import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";

@Injectable()
export class ThreadService implements InvalidationService {
    private readonly logger = new Logger(ThreadService.name);

    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
    ) {}

    public getThreads(board?: Board) {
        if (!board) {
            return this.threadRepository.find();
        }

        return this.threadRepository.findByIds(board.threadIds);
    }

    private getThreadIds(board?: Board) {
        let builder = this.threadRepository.createQueryBuilder("t").select("`t`.`id`");
        if (board) {
            builder = builder.where("`t`.`boardId` = :boardId", { boardId: board.id });
        }

        return builder.getRawMany<{ id: string }>().then(rows => rows.map(row => parseInt(row.id, 10)));
    }

    public async onInvalidate() {
        const boards = await this.boardService.getBoards();
        const targetBoardMap = this.configService.getTargetBoardMap();
        let newEntities: Thread[] = [];
        const oldThreadIds = new Set(await this.getThreadIds());

        for (const board of boards) {
            if (!(board.id in targetBoardMap) || targetBoardMap[board.id].length === 0) {
                continue;
            }

            const passedThreads: API.Catalog.Page["threads"] = [];
            const pages = await fetchJSON<API.Catalog.Result>(`https://a.4cdn.org/${board.id}/catalog.json`);
            const threads = _.chain(pages).map("threads").flatten().value();
            const targets = targetBoardMap[board.id];
            for (const thread of threads) {
                for (const target of targets) {
                    for (const filter of target.filters) {
                        if (!this.configService.checkFilter(thread, filter)) {
                            break;
                        }

                        passedThreads.push(thread);
                    }
                }
            }

            const existing = _.countBy(passedThreads, thread => oldThreadIds.has(thread.no)).true || 0;
            const created = passedThreads.length - existing;

            this.logger.debug(
                `Found ${passedThreads.length} threads on board /${board.id}/. [Created: ${created}, Existing: ${existing}]`,
            );

            for (const thread of passedThreads) {
                const entity = this.threadRepository.create();
                entity.id = thread.no;
                entity.isDead = false;
                entity.board = board;

                newEntities.push(entity);
            }
        }

        newEntities = await this.threadRepository.save(newEntities);
        for (let i = 0; i < newEntities.length; i++) {
            const thread = newEntities[i];

            this.logger.debug(
                `Fetching new post lists of thread #${thread.id} on board /${thread.boardId}/. (${i + 1}/${
                    newEntities.length
                })`,
            );

            await this.postService.fetchPosts(thread);
        }
    }
}
