import * as DataLoader from "dataloader";

import { PostService } from "@post/post.service";

import { Post } from "@post/models/post.model";

export function createPostLoader(postService: PostService) {
    return new DataLoader<number, Post>(async keys => {
        const data = await postService.getPostByIds(keys);
        const notParsedItem = data.filter(item => !item.content);
        if (notParsedItem.length > 0) {
            await postService.parsePosts(notParsedItem);
        }

        return data;
    });
}
