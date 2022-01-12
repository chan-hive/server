import { CronJob } from "cron";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";

import { BoardService } from "@board/board.service";
import { ThreadService } from "@thread/thread.service";
import { ConfigService } from "@config/config.service";

@Injectable()
export class MonitorService implements OnModuleInit {
    public constructor(
        @Inject(BoardService) private readonly boardService: BoardService,
        @Inject(ThreadService) private readonly threadService: ThreadService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    public async onModuleInit() {
        const { monitorInterval } = this.configService.getConfig();
        if (typeof monitorInterval === "string") {
            const job = new CronJob(monitorInterval, () => {
                this.pollEvent();
            });

            this.schedulerRegistry.addCronJob("pollEvent", job);
            job.start();
        } else {
            setInterval(() => {
                this.pollEvent();
            }, monitorInterval);
        }
    }

    public async pollEvent() {
        await this.boardService.onInvalidate();
        await this.threadService.onInvalidate();
        return true;
    }
}
