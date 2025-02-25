import React from "react";
import Index from "./components/Index";
// import { CacheTimes } from "@/constants/cache-constants";

// 인덱스 페이지는 모든 사용자의 포스트를 가져오는 페이지이므로, 공개 게시글만 가져올 수 있도록 서버 컴포넌트에서 처리. 로컬 스토리지에 액세스 토큰을 추가해서 요청할 필요 없음 
export default async function IndexPage() {
    // 무한 스크롤을 위해 초기에 20개 가져옴
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?page=1&size=20`, {
        cache: "no-cache",
        // next: {
        //     tags: ["index-posts"],
        //     revalidate: CacheTimes.FREQUENT.INDEX_POSTS,
        // }
    });

    if (!res.ok) throw new Error("메인 페이지 데이터를 불러오는데 실패하였습니다.");

    const response = await res.json();

    const { content, totalElements } = response.data;

    return (
        <>
            <Index initialData={content} totalElements={totalElements} />
        </>
    );
}
