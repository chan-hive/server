import { Module } from "@nestjs/common";

import { MonitorService } from "@monitor/monitor.service";
import { MonitorResolver } from "@monitor/monitor.resolver";
import { BoardModule } from "@board/board.module";

@Module({
    imports: [BoardModule],
    providers: [MonitorService, MonitorResolver],
})
export class MonitorModule {}
