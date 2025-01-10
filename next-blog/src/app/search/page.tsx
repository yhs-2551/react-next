import React from "react";
import IndexSearchResults from "./components/IndexSearchResults"; 
import Pagination from "../_components/pagination/Pagination";
import { CacheTimes } from "@/constants/cache-constants";
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
        cache: "force-cache",
        next: {
            revalidate: CacheTimes.FREQUENT.INDEX_POSTS_SEARCH_RESULTS,
        }
    });

    const response = await res.json();

    const { totalPages, content, currentPage, totalElements } = response.data;
    
    const isExistContent = content.length > 0;

    return (
        <>
            <IndexSearchResults keyword={keyword} searchData={content} totalElements={totalElements} />
            <Pagination isExistContent={isExistContent} totalPages={totalPages} currentPage={currentPage} />
        </>
    );
}

// import React from "react";
// import Index from "./components/Index";
// import Pagination from "./[blogId]/components/Pagination";

// export default async function IndexPage(searchParams: { page?: string; searchType?: string; keyword?: string }) {
//     const { page, searchType, keyword } = await searchParams;
//     const queryParams = new URLSearchParams({
//         // page && { page } => page 존재하면 { page: page } 객체 반환
//         // 스프레드 연산자(...)로 객체를 URLSearchParams에 펼침
//         ...(page && { page }),
//         ...(searchType && { searchType }),
//         ...(keyword && { keyword }),
//         size: "20",
//     });

//     // 초기에 20개 가져옴
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PATH}/posts?${queryParams}`, {
//         cache: "force-cache",
//     });

//     const response = await res.json();

//     const { totalPages, content, currentPage } = response.data;

//     console.log("인덱스 페이지 서버 컴포넌트 실행 >>>>>>>>>>>> ", response);

//     return (
//         <>
//             <Index initialData={content} />
//             {/* 검색 파라미터가 있을 때만 페이지네이션 표시. 메인 페이지에선 무한 스크롤 방식*/}
//             {searchType && keyword && <Pagination totalPages={totalPages} currentPage={currentPage} />}
//         </>
//     );
// }
