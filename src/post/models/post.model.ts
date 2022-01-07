import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Thread } from "@thread/models/thread.model";
import { File } from "@file/models/file.model";

@Entity({ name: "posts" })
@ObjectType()
export class Post {
    @Field(() => Int)
    @PrimaryColumn({ type: "int" })
    public id!: number;

    @Field(() => String)
    @Column({ type: "text" })
    public name!: string;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public title?: string;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public content?: string;

    @Field(() => Boolean)
    @Column({ type: "boolean" })
    public isOP!: boolean;

    @Field(() => Date)
    @Column({ type: "datetime" })
    public createdAt!: Date;

    //
    // Relation (Many-to-One) - Thread => Post
    //
    @ManyToOne(() => Thread, thread => thread.posts)
    public thread!: Thread;

    @RelationId((entity: Post) => entity.thread)
    public threadId!: Thread["id"];

    //
    // Relation (Many-to-One) - File => Post
    //
    @ManyToOne(() => File, file => file.posts)
    public file!: File;

    @RelationId((entity: Post) => entity.file)
    public fileId!: File["id"];
}
