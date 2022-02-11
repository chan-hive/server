import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TextContent {
    @Field(() => String)
    public text!: string;
}
