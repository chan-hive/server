import * as moment from "moment";
import { Repository } from "typeorm";
import { decode } from "html-entities";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { FileService } from "@file/file.service";

import { Thread } from "@thread/models/thread.model";
import { Post } from "@post/models/post.model";

import { getEntityByIds } from "@utils/getEntityByIds";
import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";
import { bulkParsePostContent } from "@utils/parsePostContent";

@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);

    public constructor(
        @InjectRepository(Post) private readonly postRepository: Repository<Post>,
        @Inject(FileService) private readonly fileService: FileService,
    ) {}

    public async getPosts(thread: Thread) {
        return this.postRepository.findByIds(thread.postIds);
    }
    public async getPostByIds(ids: ReadonlyArray<Post["id"]>) {
        return getEntityByIds(this.postRepository, [...ids]);
    }

    public async fetchPosts(thread: Thread) {
        const data = await fetchJSON<API.Thread.Result>(
            `https://a.4cdn.org/${thread.board.id}/thread/${thread.id}.json`,
        );

        const entities: Post[] = [];
        const fileBuffer: [Post, API.Thread.File][] = [];
        for (const post of data.posts) {
            const entity = this.postRepository.create();
            entity.id = post.no;
            entity.name = post.name || "Anonymous";
            entity.rawContent = post.com;
            entity.createdAt = moment(post.time * 1000).toDate();
            entity.thread = thread;
            entity.isOP = "sub" in post;

            if ("sub" in post) {
                entity.title = decode(post.sub);
            }

            if ("filename" in post) {
                fileBuffer.push([entity, post]);
            }

            entities.push(entity);
        }

        const files = await this.fileService.bulkEnsure(fileBuffer.map(t => [t[1], thread.board, thread]));
        const filePosts = fileBuffer.map(t => t[0]);
        for (let i = 0; i < fileBuffer.length; i++) {
            filePosts[i].file = files[i];
        }

        return await this.postRepository.save(entities);
    }

    public async parsePosts(posts: Post[]) {
        bulkParsePostContent(posts, this.logger);
        await this.postRepository.save(posts);
    }
}
