import { Column, Entity, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Post } from "@post/models/post.model";

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

    @Field(() => Int)
    @Column({ type: "bigint" })
    public uploadedTimestamp!: number;

    //
    // Relation (One-to-Many) - Post => File
    //
    @OneToMany(() => Post, post => post.file)
    public posts!: Post[];

    @RelationId((entity: File) => entity.posts)
    public postIds!: Post["id"][];
}
