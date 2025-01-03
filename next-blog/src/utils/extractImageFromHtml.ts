// export const extractImageFromPost = (post: any) => {
//     let imageUrl: string | undefined;

import { PostResponse } from "@/types/PostTypes";

//     if (post?.featuredImage?.fileUrl) {
//         imageUrl = post.featuredImage.fileUrl;
//     } else if (post?.content) {
//         const imgRegex = /<img.*?src=["'](.*?)["']/;
//         const match = post.content.match(imgRegex);
//         imageUrl = match ? match[1] : undefined;
//     }

//     console.log(imageUrl);

//     return imageUrl;
// };

export const extractImageFromPost = (post: PostResponse) => {
    if (typeof window === "undefined") return undefined;

    let imageUrl: string | undefined;

    if (post?.featuredImage?.fileUrl) {
        imageUrl = post.featuredImage.fileUrl;
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
