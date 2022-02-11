import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class QuoteContent {
    @Field(() => String)
    public quote!: string;
}
