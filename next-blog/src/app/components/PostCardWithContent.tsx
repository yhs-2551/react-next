"use client";

import { PostResponse } from "@/types/PostTypes";
import { extractImageFromPost } from "@/utils/extractImageFromHtml";
import { extractTextWithoutImages } from "@/utils/extractTextWithoutImages";
import { useEffect, useState } from "react";
import PostCard from "./PostCard";

// PostGrid Map 함수 내부에서 useEffect를 사용하면 Hook규칙을 위반하기 때문에 PostCardWithContentProps 추가
export default function PostCardWithContent(props: PostResponse) {
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        setImageUrl(extractImageFromPost(props));
        setContent(extractTextWithoutImages(props.content));
    }, [props]);

    return <PostCard {...props} content={content} imageUrl={imageUrl} />;
}
