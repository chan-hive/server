import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

import { FileInformation } from "@chanhive/core";

import { Post } from "@post/models/post.model";
import { Board } from "@board/models/board.model";
import { Thread } from "@thread/models/thread.model";

import { getUrlFromFile } from "@utils/getUrlFromFile";
import { Config } from "@utils/types";

@Entity({ name: "files" })
@ObjectType()
export class File {
    public static toInformation(file: File, config: Config): FileInformation {
        return {
            url: getUrlFromFile(file, config),
            md5: file.md5,
            size: file.size,
            extension: file.extension,
            height: file.height,
            width: file.width,
            mime: file.mime,
            name: file.name,
            metadata: file.metadata,
            uploadedTimestamp: file.uploadedTimestamp,
        };
    }

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    public id!: number;

    @Field(() => String)
    @Column({ type: "varchar", length: 255, default: "application/octet-stream" })
    public mime!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public name!: string;

    @Field(() => String)
    @Column({ type: "text" })
    public path!: string;

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

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    public metadata?: string | null;

    @Field(() => String)
    @Column({ type: "boolean", default: false })
    public metadataChecked!: boolean;

    @Column({ type: "simple-array" })
    public appliedPlugins!: string[];

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

    //
    // Relation (Many-to-One) - Thread => File
    //
    @ManyToOne(() => Thread, thread => thread.files)
    public thread!: Thread;

    @RelationId((entity: File) => entity.thread)
    public threadId!: Thread["id"];
}
