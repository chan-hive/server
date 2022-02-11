import { createUnionType, Field, ObjectType } from "@nestjs/graphql";

import { TextContent } from "@post/models/text.model";
import { QuoteContent } from "@post/models/quote.model";
import { QuoteLinkContent } from "@post/models/quote-link.model";
import { CrossThreadQuoteLinkContent } from "@post/models/cross-thread-quote-link.model";

export const PostContent = createUnionType<
    [typeof TextContent, typeof QuoteContent, typeof QuoteLinkContent, typeof CrossThreadQuoteLinkContent]
>({
    name: "PostContent", // the name of the GraphQL union
    types: () => [TextContent, QuoteContent, QuoteLinkContent, CrossThreadQuoteLinkContent], // function that returns tuple of object types classes
    resolveType: value => {
        if ("quote" in value) {
            return QuoteContent;
        }

        if ("text" in value) {
            return TextContent;
        }

        if ("board" in value) {
            return CrossThreadQuoteLinkContent;
        }

        if ("postId" in value) {
            return QuoteLinkContent;
        }

        return null;
    },
});

@ObjectType()
export class PostContentRow {
    @Field(() => [PostContent])
    public contents!: typeof PostContent[];
}
