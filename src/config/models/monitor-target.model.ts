import { Field, ObjectType } from "@nestjs/graphql";

import { MonitorTargetFilter } from "@config/models/monitor-target-filter.model";

@ObjectType()
export class MonitorTarget {
    @Field(() => [String])
    public boards!: string[];

    @Field(() => [MonitorTargetFilter])
    public filters!: MonitorTargetFilter[];
}
