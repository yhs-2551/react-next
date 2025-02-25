import React, { Suspense } from "react";
import IndexSearchResults from "./components/IndexSearchResults";
import Pagination from "../_components/pagination/Pagination";
// import { CacheTimes } from "@/constants/cache-constants";

// 인덱스 페이지는 모든 사용자의 포스트를 가져오는 페이지이므로, 공개 게시글만 가져올 수 있도록 서버 컴포넌트에서 처리. 로컬 스토리지에 액세스 토큰을 추가해서 요청할 필요 없음
export default async function IndexSearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const { page, searchType, keyword } = await searchParams;

    const isValidSearch = searchType && keyword;

    if (!isValidSearch) {
        return <IndexSearchResults searchData={[]} />;
    }

    const queryParams = new URLSearchParams({
        // page && { page } => page 존재하면 { page: page } 객체 반환
        // 스프레드 연산자(...)로 객체를 URLSearchParams에 펼침
        ...(page && { page }),
        searchType,
        keyword,
        size: "10",
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?${queryParams}`, {
        cache: "no-cache",
        // next: {
        //     tags: ["index-posts-search"],
        //     revalidate: CacheTimes.FREQUENT.INDEX_POSTS_SEARCH_RESULTS,
        // },
    });

    if (!res.ok) throw new Error("검색 결과 데이터를 불러오는데 실패하였습니다.");

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;

    const isExistContent = content.length > 0;

    return (
        <>
            <IndexSearchResults keyword={keyword} searchData={content} totalElements={totalElements} />
            <Suspense>
                <Pagination isExistContent={isExistContent} totalPages={totalPages} currentPage={currentPage} />
            </Suspense>
        </>
    );
}
