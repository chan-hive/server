import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CrossThreadQuoteLinkContent {
    @Field(() => Int)
    public postId!: number;

    @Field(() => Boolean)
    public isOP!: boolean;

    @Field(() => String)
    public board!: string;
}
