import * as _ from "lodash";
import { DOMParser, HTMLElement, Node, NodeList, Text } from "linkedom";

import { Logger } from "@nestjs/common";

import type { PostContent } from "@post/models/content-row.model";
import { Post } from "@post/models/post.model";

export type PostContentItem = typeof PostContent;

const CROSS_QUOTE_REGEX = /^>>>\/([a-z0-9]*?)\/([0-9]*?)$/;

export function parsePostContent(nodes: NodeList, threadId: number): PostContentItem[][] {
    const results: PostContentItem[][] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (let i = 0; i < nodes.length; i++) {
        const node: Node = nodes[i];
        let lastLine = results[results.length - 1];
        if (!lastLine) {
            lastLine = [];
            results.push(lastLine);
        }

        if (node instanceof Text) {
            lastLine.push({
                text: node.textContent!,
            });
        }

        if (node instanceof HTMLElement) {
            if (node.tagName === "BR") {
                results.push([]);
            } else if (node.tagName === "SPAN" && node.classList.contains("quote")) {
                lastLine.push({
                    quote: node.textContent!,
                });
            } else if (node.tagName === "A" && node.classList.contains("quotelink")) {
                if (node.textContent && node.textContent.startsWith(">>>")) {
                    const results = CROSS_QUOTE_REGEX.exec(node.textContent);
                    if (!results) {
                        throw new Error(`Failed to parse cross thread quote link: ${node.textContent}`);
                    }

                    lastLine.push({
                        board: results[1],
                        isOP: false,
                        postId: parseInt(results[2], 10),
                    });
                    continue;
                }

                const targetId = parseInt(node.textContent!.replace(">>", ""), 10);
                lastLine.push({
                    postId: targetId,
                    isOP: targetId === threadId,
                });
            }
        }
    }

    return results;
}

export function bulkParsePostContent(posts: Post[], logger: Logger) {
    if (posts.length <= 0) {
        return;
    }

    const postMap = _.chain(posts)
        .keyBy(p => p.id)
        .mapValues()
        .value();

    let htmlContent = "";
    for (const { id: postId, rawContent: content, threadId } of posts) {
        if (!content) {
            continue;
        }

        const postContent = content.replace(/<wbr>/g, "");
        htmlContent += `<div data-post-id="${postId}" data-thread-id="${threadId}" class="post">${postContent}</div>`;
    }

    htmlContent = `<div id="posts">${htmlContent}</div>`;

    const parser = new DOMParser();
    const document = parser.parseFromString(htmlContent, "text/html");
    const postElements = [...document.querySelectorAll("#posts > .post")];

    for (let i = 0; i < postElements.length; i++) {
        const post = postElements[i];
        if (!(post instanceof HTMLElement)) {
            continue;
        }

        const postIdAttribute = post.getAttribute("data-post-id");
        const threadIdAttribute = post.getAttribute("data-thread-id");
        if (!postIdAttribute || !threadIdAttribute) {
            continue;
        }

        const postId = parseInt(postIdAttribute, 10);
        const threadId = parseInt(threadIdAttribute, 10);
        const data = parsePostContent(post.childNodes, threadId);

        postMap[postId].content = JSON.stringify(data);
    }

    logger.debug(`Successfully processed ${postElements.length} posts.`);
}
