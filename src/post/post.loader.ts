import * as DataLoader from "dataloader";

import { PostService } from "@post/post.service";

import { Post } from "@post/models/post.model";

export function createPostLoader(postService: PostService) {
    return new DataLoader<number, Post>(async keys => postService.getPostByIds(keys));
}
