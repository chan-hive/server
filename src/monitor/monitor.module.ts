import { Module } from "@nestjs/common";

import { MonitorService } from "@monitor/monitor.service";
import { MonitorResolver } from "@monitor/monitor.resolver";

import { BoardModule } from "@board/board.module";
import { ThreadModule } from "@thread/thread.module";

@Module({
    imports: [BoardModule, ThreadModule],
    providers: [MonitorService, MonitorResolver],
})
export class MonitorModule {}
