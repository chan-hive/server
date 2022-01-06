import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ThreadService } from "@thread/thread.service";
import { ThreadResolver } from "@thread/thread.resolver";

import { Thread } from "@thread/models/thread.model";

@Module({
    imports: [TypeOrmModule.forFeature([Thread])],
    providers: [ThreadService, ThreadResolver],
    exports: [ThreadService],
})
export class ThreadModule {}
