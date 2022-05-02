import { Inject } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { ConfigService } from "@config/config.service";

import { Configuration } from "@config/models/configuration.model";
import { MonitorTargetFilterAt, MonitorTargetFilterType } from "@config/models/monitor-target-filter.model";

@Resolver()
export class ConfigResolver {
    public constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

    @Query(() => Configuration)
    public config(): Configuration {
        const config = this.configService.getConfig();

        return {
            rawJson: JSON.stringify(config),
            monitorInterval: {
                inMilliseconds: typeof config.monitorInterval === "string" ? undefined : config.monitorInterval,
                inCronSchedule: typeof config.monitorInterval === "number" ? undefined : config.monitorInterval,
            },
            serverUrl: config.serverUrl,
            targets: config.targets.map(target => ({
                boards: target.boards,
                filters: target.filters.map(filter => ({
                    ...filter,
                    at: filter.at.map(item =>
                        item === "title" ? MonitorTargetFilterAt.Title : MonitorTargetFilterAt.Content,
                    ),
                    type: MonitorTargetFilterType.Text,
                })),
            })),
        };
    }
}
