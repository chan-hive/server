import { Field, ObjectType, Int } from "@nestjs/graphql";

@ObjectType()
export class MonitorInterval {
    @Field(() => Int, { nullable: true })
    public inMilliseconds?: number;

    @Field(() => String, { nullable: true })
    public inCronSchedule?: string;
}
