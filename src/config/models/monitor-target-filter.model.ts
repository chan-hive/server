import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum MonitorTargetFilterAt {
    Title = "title",
    Content = "content",
}

export enum MonitorTargetFilterType {
    Text = "text",
}

registerEnumType(MonitorTargetFilterAt, { name: "MonitorTargetFilterAt" });
registerEnumType(MonitorTargetFilterType, { name: "MonitorTargetFilterType" });

@ObjectType()
export class MonitorTargetFilter {
    @Field(() => [MonitorTargetFilterAt])
    public at!: MonitorTargetFilterAt[];

    @Field(() => String)
    public content!: string;

    @Field(() => MonitorTargetFilterType)
    public type!: MonitorTargetFilterType;

    @Field(() => Boolean, { nullable: true })
    public caseSensitive?: boolean;
}
