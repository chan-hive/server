import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Board } from "@board/models/board.model";

@Injectable()
export class BoardService {
    public constructor(@InjectRepository(Board) private readonly boardRepository: Repository<Board>) {}

    public async getBoards() {
        return this.boardRepository.find();
    }
}
