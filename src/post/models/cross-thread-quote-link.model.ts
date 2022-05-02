import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CrossThreadQuoteLinkContent {
    @Field(() => Int, { nullable: true })
    public targetPostId!: number | null | undefined;

    @Field(() => Boolean)
    public isOP!: boolean;

    @Field(() => String)
    public board!: string;
}
