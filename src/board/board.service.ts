import * as _ from "lodash";
import { Repository } from "typeorm";

import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { ConfigService } from "@config/config.service";
import { InvalidationService } from "@common/invalidation.service";

import { Board } from "@board/models/board.model";

import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";

@Injectable()
export class BoardService implements InvalidationService {
    public constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        @InjectRepository(Board) private readonly boardRepository: Repository<Board>,
    ) {}

    public async getBoards() {
        return this.boardRepository.find();
    }

    public async onInvalidate() {
        const result = await fetchJSON<API.Boards.Result>("https://a.4cdn.org/boards.json");
        const previousBoards = await this.getBoards();
        const previousBoardMap = _.chain(previousBoards)
            .keyBy(b => b.id)
            .mapValues()
            .value();

        const newBoards: Board[] = [];
        for (const board of result.boards) {
            if (board.board in previousBoardMap) {
                if (previousBoardMap[board.board].title === board.title) {
                    continue;
                }

                previousBoardMap[board.board].title = board.title;
                newBoards.push(previousBoardMap[board.board]);
                continue;
            }

            const newBoard = this.boardRepository.create();
            newBoard.id = board.board;
            newBoard.title = board.title;

            newBoards.push(newBoard);
        }

        await this.boardRepository.save(newBoards);
    }
}
