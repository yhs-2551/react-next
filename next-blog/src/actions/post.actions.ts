"use server";

import { CacheTimes } from "@/constants/cache-constants"; 

export async function getInfiniteScrollPosts(page: number = 3, size: number = 10) {

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?page=${page}&size=${size}`, {
        cache: "force-cache",
        next: {
            tags: ["infinite-scroll-posts"],
            revalidate: CacheTimes.FREQUENT.INDEX_INFINITE_SCROLL_POSTS,
        },
    });

    if (!response.ok) {
        throw new Error("무한 스크롤 포스트 데이터를 불러오는데 실패 하였습니다.");
    }

    return response.json();
}
