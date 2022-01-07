import * as moment from "moment";
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Thread } from "@thread/models/thread.model";
import { Post } from "@post/models/post.model";
import { fetchJSON } from "@utils/fetch";
import { API } from "@utils/types";

@Injectable()
export class PostService {
    public constructor(@InjectRepository(Post) private readonly postRepository: Repository<Post>) {}

    public async getPosts(thread: Thread) {
        if (thread.postIds.length <= 0) {
            return this.fetchPosts(thread);
        }

        return this.postRepository.findByIds(thread.postIds);
    }

    private async fetchPosts(thread: Thread) {
        const data = await fetchJSON<API.Thread.Result>(
            `https://a.4cdn.org/${thread.boardId}/thread/${thread.id}.json`,
        );

        const entities: Post[] = [];
        for (const post of data.posts) {
            const entity = this.postRepository.create();
            entity.id = post.no;
            entity.name = post.name;
            entity.content = post.com;
            entity.createdAt = moment(post.time).toDate();
            entity.thread = thread;

            if ("sub" in post) {
                entity.isOP = true;
                entity.title = post.sub;
            }

            entities.push(entity);
        }

        return await this.postRepository.save(entities);
    }
}
