import * as _ from "lodash";
import { Repository } from "typeorm";
import * as fileSize from "filesize";
import * as moment from "moment";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { ConfigService } from "@config/config.service";
import { PostService } from "@post/post.service";
import { BoardService } from "@board/board.service";
import { FileService } from "@file/file.service";

import { Board } from "@board/models/board.model";
import { Thread } from "@thread/models/thread.model";
import { Post } from "@post/models/post.model";
import { File } from "@file/models/file.model";

import { InvalidationService } from "@common/invalidation.service";

import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";
import { getEntityByIds } from "@utils/getEntityByIds";

@Injectable()
export class ThreadService implements InvalidationService {
    private readonly logger = new Logger(ThreadService.name);

    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(PostService) private readonly postService: PostService,
        @Inject(FileService) private readonly fileService: FileService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @InjectRepository(Thread) private readonly threadRepository: Repository<Thread>,
    ) {}

    public async getThread(boardId: string, threadId: number) {
        return this.threadRepository.findOne({
            where: {
                id: threadId,
                board: {
                    id: boardId,
                },
            },
        });
    }

    public async getThreads(board?: Board | Board["id"] | null, count?: number, before?: Date | null) {
        if (typeof board === "string") {
            const boardId = board;
            board = await this.boardService.getBoard(board);
            if (!board) {
                throw new Error(`There's no such board: /${boardId}/`);
            }
        }

        let queryBuilder = this.threadRepository.createQueryBuilder("t").select("`t`.`id`", "id").where("1 = 1");
        if (before) {
            queryBuilder = queryBuilder.andWhere("`t`.`createdAt` < :before", {
                before: moment(before).format("YYYY-MM-DD HH:mm:ss"),
            });
        }

        if (board) {
            queryBuilder = queryBuilder.andWhere("`t`.`boardId` = :boardId", {
                boardId: board.id,
            });
        }

        const ids = await queryBuilder
            .take(count)
            .orderBy("`t`.`createdAt`", "DESC")
            .getRawMany<{ id: number }>()
            .then(rows => rows.map(row => row.id));

        return getEntityByIds(this.threadRepository, ids);
    }

    public async getThreadCount(board?: Board | string | null | undefined) {
        if (board) {
            return this.threadRepository
                .createQueryBuilder("t")
                .select()
                .where("`t`.`boardId` = :boardId", { boardId: typeof board === "string" ? board : board.id })
                .getCount();
        }

        return this.threadRepository.count();
    }

    private getThreadIds(board?: Board) {
        let builder = this.threadRepository.createQueryBuilder("t").select("`t`.`id`");
        if (board) {
            builder = builder.where("`t`.`boardId` = :boardId", { boardId: board.id });
        }

        return builder.getRawMany<{ id: string }>().then(rows => rows.map(row => parseInt(row.id, 10)));
    }

    public async onInvalidate() {
        const boards = await this.boardService.getBoards(true);
        const targetBoardMap = this.configService.getTargetBoardMap();
        let newEntities: Thread[] = [];
        const oldThreadIds = new Set(await this.getThreadIds());

        for (const board of boards) {
            if (!(board.id in targetBoardMap) || targetBoardMap[board.id].length === 0) {
                continue;
            }

            let passedThreads: API.Catalog.Page["threads"] = [];
            const pages = await fetchJSON<API.Catalog.Result>(`https://a.4cdn.org/${board.id}/catalog.json`);
            const threads = _.chain(pages).map("threads").flatten().value();
            const targets = targetBoardMap[board.id];
            for (const thread of threads) {
                for (const target of targets) {
                    for (const filter of target.filters) {
                        if (!this.configService.checkFilter(thread, filter)) {
                            continue;
                        }

                        passedThreads.push(thread);
                    }
                }
            }

            passedThreads = _.uniqBy(passedThreads, thread => thread.no);
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
                entity.createdAt = moment(thread.time * 1000).toDate();

                newEntities.push(entity);
            }
        }

        newEntities = await this.threadRepository.save(newEntities);

        const newPosts: Post[] = [];
        for (let i = 0; i < newEntities.length; i++) {
            const thread = newEntities[i];

            this.logger.debug(
                `Fetching new post lists of thread #${thread.id} on board /${thread.board.id}/. (${i + 1}/${
                    newEntities.length
                })`,
            );

            newPosts.push(...(await this.postService.fetchPosts(thread)));
        }

        const allFiles = _.chain(newPosts)
            .map(p => p.file)
            .filter<File>((p: File | null): p is File => Boolean(p))
            .filter(p => !p.isArchived)
            .uniqBy(f => f.md5)
            .value();

        const totalSize = fileSize(
            _.chain(allFiles)
                .map(f => f.size)
                .sum()
                .value(),
        );

        await this.fileService.bulkDownload(allFiles);
        this.logger.debug(`Detected new ${allFiles.length} files (${totalSize}).`);
    }

    public async getUsedBoardIds() {
        const data = await this.threadRepository
            .createQueryBuilder("t")
            .select("`t`.`boardId`", "id")
            .getRawMany<{ id: string }>();

        return _.chain(data).map("id").uniq().value();
    }

    public async getFileCountByIds(keys: ReadonlyArray<number>) {
        const result = await this.threadRepository
            .createQueryBuilder("t")
            .select("t.id", "id")
            .addSelect("COUNT(t.id)", "count")
            .leftJoin(Post, "p", "t.id = p.threadId")
            .leftJoin(File, "f", "p.fileId = f.id")
            .where("p.fileId IS NOT NULL")
            .groupBy("t.id")
            .getRawMany<{ id: number; count: number }>();

        const resultMap = _.chain(result)
            .keyBy(p => p.id)
            .mapValues(p => p)
            .value();

        console.info(resultMap);

        return keys.map(key => {
            const result = resultMap[key];
            if (!result) {
                throw new Error(`Failed to get file count of thread: ${key}`);
            }

            return result.count;
        });
    }
}
