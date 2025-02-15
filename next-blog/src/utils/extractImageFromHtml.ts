import { PostResponse } from "@/types/PostTypes";

export const extractImageFromPost = (post: PostResponse) => {
    if (typeof window === "undefined") return undefined;

    let imageUrl: string | undefined;

    if (post?.featuredImageUrl) {
        imageUrl = post.featuredImageUrl;
    } else if (post?.content) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(post.content, "text/html");
            const firstImg = doc.querySelector("img");
            imageUrl = firstImg?.getAttribute("src") || undefined;
        } catch (error) {
            console.error("이미지 추출 실패:", error);
            return undefined;
        }
    }

    return imageUrl;
};
