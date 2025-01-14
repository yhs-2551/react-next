import React from "react";
import Index from "./components/Index"; 
import { CacheTimes } from "@/constants/cache-constants";

export default async function IndexPage() {
    // 무한 스크롤을 위해 초기에 20개 가져옴
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?page=1&size=20`, {
        cache: "force-cache",
        next: {
            tags: ["index-posts"],
            revalidate: CacheTimes.FREQUENT.INDEX_POSTS,
        }
    });

    if (!res.ok) throw new Error("메인 페이지 데이터를 불러오는데 실패하였습니다.");

    const response = await res.json();

    const { content, totalElements } = response.data;

    return (
        <>
            <Index initialData={content} totalElements={totalElements}/>
        </>
    );
}
