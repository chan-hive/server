import { Column, Entity, OneToMany, PrimaryColumn, RelationId } from "typeorm";

import { Field, ObjectType } from "@nestjs/graphql";

import { Thread } from "@thread/models/thread.model";
import { File } from "@file/models/file.model";

@Entity({ name: "boards" })
@ObjectType()
export class Board {
    @Field(() => String)
    @PrimaryColumn({ type: "varchar", length: 20 })
    public id!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public title!: string;

    @Field(() => Boolean)
    @Column({ type: "bool", default: false, nullable: false })
    public isWorkSafe!: boolean;

    @Field(() => String)
    @Column({ type: "text" })
    public description!: string;

    //
    // Relation (One-to-Many) - Thread => Board
    //
    @OneToMany(() => Thread, thread => thread.board)
    public threads!: Thread[];

    @RelationId((entity: Board) => entity.threads)
    public threadIds!: Thread["id"][];

    //
    // Relation (One-to-Many) - File => Board
    //
    @OneToMany(() => File, file => file.board)
    public files!: File[];

    @RelationId((entity: Board) => entity.files)
    public fileIds!: File["id"][];
}
