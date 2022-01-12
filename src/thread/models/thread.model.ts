import { OneToMany, Column, Entity, ManyToOne, PrimaryColumn, RelationId } from "typeorm";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Board } from "@board/models/board.model";
import { Post } from "@post/models/post.model";
import { File } from "@file/models/file.model";

@Entity({ name: "threads" })
@ObjectType()
export class Thread {
    @Field(() => Int)
    @PrimaryColumn({ type: "int" })
    public id!: number;

    @Field(() => Boolean)
    @Column({ type: "bool" })
    public isDead!: boolean;

    @Field(() => Date)
    @Column({ type: "datetime" })
    public createdAt!: Date;

    //
    // Relation (Many-to-One) - Board => Thread
    //
    @ManyToOne(() => Board, board => board.threads)
    public board!: Board;

    @RelationId((entity: Thread) => entity.board)
    public boardId!: Board["id"];

    //
    // Relation (One-to-Many) - Post => Thread
    //
    @OneToMany(() => Post, post => post.thread)
    public posts!: Post[];

    @RelationId((entity: Thread) => entity.posts)
    public postIds!: Post["id"][];

    //
    // Relation (One-to-Many) - File => Thread
    //
    @OneToMany(() => File, file => file.thread)
    public files!: File[];

    @RelationId((entity: Thread) => entity.files)
    public fileIds!: File["id"][];
}
