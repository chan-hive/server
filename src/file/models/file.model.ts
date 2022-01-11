import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

import { Post } from "@post/models/post.model";
import { Board } from "@board/models/board.model";

@Entity({ name: "files" })
@ObjectType()
export class File {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    public id!: number;

    @Field(() => String)
    @Column({ type: "text" })
    public name!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public extension!: string;

    @Field(() => String)
    @Column({ type: "varchar", length: 255, unique: true })
    public md5!: string;

    @Field(() => Int)
    @Column({ type: "int" })
    public size!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public width!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public height!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public thumbnailWidth!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    public thumbnailHeight!: number;

    @Field(() => Float)
    @Column({ type: "bigint" })
    public uploadedTimestamp!: number;

    @Field(() => Boolean)
    @Column({ type: "boolean" })
    public isArchived!: boolean;

    //
    // Relation (One-to-Many) - Post => File
    //
    @OneToMany(() => Post, post => post.file)
    public posts!: Post[];

    @RelationId((entity: File) => entity.posts)
    public postIds!: Post["id"][];

    //
    // Relation (Many-to-One) - Board => File
    //
    @ManyToOne(() => Board, board => board.files)
    public board!: Board;

    @RelationId((entity: File) => entity.board)
    public boardId!: Board["id"];
}
