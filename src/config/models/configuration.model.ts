import { Field, ObjectType } from "@nestjs/graphql";

import { MonitorTarget } from "@config/models/monitor-target.model";
import { MonitorInterval } from "@config/models/monitor-interval.model";

@ObjectType()
export class Configuration {
    @Field(() => String)
    public serverUrl!: string;

    @Field(() => MonitorInterval)
    public monitorInterval!: MonitorInterval;

    @Field(() => [MonitorTarget])
    public targets!: MonitorTarget[];

    @Field(() => String)
    public rawJson!: string;
}
