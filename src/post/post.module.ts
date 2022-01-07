import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileModule } from "@file/file.module";

import { PostService } from "@post/post.service";
import { PostResolver } from "@post/post.resolver";

import { Post } from "@post/models/post.model";

@Module({
    imports: [TypeOrmModule.forFeature([Post]), FileModule],
    providers: [PostService, PostResolver],
    exports: [PostService],
})
export class PostModule {}
