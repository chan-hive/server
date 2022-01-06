import { Column, Entity, PrimaryColumn } from "typeorm";
import { Field, ObjectType } from "@nestjs/graphql";

@Entity({ name: "boards" })
@ObjectType()
export class Board {
    @Field(() => String)
    @PrimaryColumn({ type: "varchar", length: 20 })
    public id!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public title!: string;
}
