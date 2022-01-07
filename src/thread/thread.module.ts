import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ThreadService } from "@thread/thread.service";
import { ThreadResolver } from "@thread/thread.resolver";

import { BoardModule } from "@board/board.module";
import { PostModule } from "@post/post.module";

import { Thread } from "@thread/models/thread.model";

@Module({
    imports: [TypeOrmModule.forFeature([Thread]), forwardRef(() => BoardModule), PostModule],
    providers: [ThreadService, ThreadResolver],
    exports: [ThreadService],
})
export class ThreadModule {}
