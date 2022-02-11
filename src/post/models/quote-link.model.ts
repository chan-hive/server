import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class QuoteLinkContent {
    @Field(() => Int)
    public postId!: number;

    @Field(() => Boolean)
    public isOP!: boolean;
}
