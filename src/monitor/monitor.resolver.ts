import { Inject } from "@nestjs/common";
import { Mutation, Resolver } from "@nestjs/graphql";

import { MonitorService } from "@monitor/monitor.service";

@Resolver()
export class MonitorResolver {
    public constructor(@Inject(MonitorService) private readonly monitorService: MonitorService) {}

    @Mutation(() => Boolean)
    public pollEvent() {
        return this.monitorService.pollEvent();
    }
}
