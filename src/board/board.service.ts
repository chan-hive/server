import * as _ from "lodash";
import { Repository } from "typeorm";
import { decode } from "html-entities";

import { forwardRef, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { ConfigService } from "@config/config.service";
import { InvalidationService } from "@common/invalidation.service";

import { Board } from "@board/models/board.model";

import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";
import { getEntityByIds } from "@utils/getEntityByIds";
import { ThreadService } from "@thread/thread.service";

@Injectable()
export class BoardService implements InvalidationService, OnModuleInit {
    public constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(forwardRef(() => ThreadService)) private readonly threadService: ThreadService,
        @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
    ) {}

    public async onModuleInit() {
        await this.onInvalidate();
    }

    public async getBoard(id: string) {
        return this.boardRepository.findOne({
            where: {
                id,
            },
        });
    }
    public async getBoards(all = false) {
        if (all) {
            return this.boardRepository.find();
        }

        const usedBoardIds = await this.threadService.getUsedBoardIds();

        return this.boardRepository.findByIds(usedBoardIds);
    }
    public async getBoardByIds(keys: ReadonlyArray<string>) {
        return getEntityByIds(this.boardRepository, [...keys]);
    }

    public async onInvalidate() {
        const result = await fetchJSON<API.Boards.Result>("https://a.4cdn.org/boards.json");
        const previousBoards = await this.getBoards(true);
        const previousBoardMap = _.chain(previousBoards)
            .keyBy(b => b.id)
            .mapValues()
            .value();

        const newBoards: Board[] = [];
        for (const board of result.boards) {
            if (board.board in previousBoardMap) {
                if (
                    previousBoardMap[board.board].title === board.title &&
                    previousBoardMap[board.board].isWorkSafe === (board.ws_board === 1) &&
                    previousBoardMap[board.board].description === decode(board.meta_description)
                ) {
                    continue;
                }

                previousBoardMap[board.board].title = board.title;
                previousBoardMap[board.board].isWorkSafe = board.ws_board === 1;
                previousBoardMap[board.board].description = decode(board.meta_description);
                newBoards.push(previousBoardMap[board.board]);
                continue;
            }

            const newBoard = this.boardRepository.create();
            newBoard.id = board.board;
            newBoard.title = board.title;
            newBoard.isWorkSafe = board.ws_board === 1;

            newBoards.push(newBoard);
        }

        await this.boardRepository.save(newBoards);
    }
}
