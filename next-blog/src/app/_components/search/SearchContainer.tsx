"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import ClientWrapper from "@/providers/ClientWrapper";
import SearchInput from "./SearchInput";

type SearchContainerType = "TITLE" | "CONTENT" | "ALL";

export default function SearchContainer() {
    return <SearchComponent />;
}
function SearchComponent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const blogId = params.blogId as string | undefined;
    const categoryName = params.categoryName as string | undefined;
    const categoryNameByQueryParams = searchParams.get("category");

    const router = useRouter();
    const [searchType, setSearchType] = useState<SearchContainerType>("TITLE");

    const handleSearch = (keyword: string) => {
        if (!keyword.trim()) {
            router.push(blogId ? `/${blogId}/posts/search` : `/search`);
            return;
        }

        const params = new URLSearchParams();
        params.set("page", "1");

        if (categoryName) {
            // 위쪽  params.categoryName를 통해 인코딩 되었기 때문에, 따로 decodeURIComponent해주어야함
            // searchParams로 가져온 값은 decodeURIComponent안해도 되고, params로 가져온 값만 decodeURIComponent 해야함
            params.set("category", decodeURIComponent(categoryName));
        }

        // /search?page=1&category=123&searchType=TITLE&keyword=123 이런식의 URL에서 검색했을때 카테고리 페이지 검색 유지하기 위해 필요 
        if (categoryNameByQueryParams) {
            params.set("category", categoryNameByQueryParams);
        }

        params.set("searchType", searchType);
        params.set("keyword", keyword); // URLSearchParams가 자동으로 인코딩. 따라서 encodeURIComponent 사용 불필요

        router.push(blogId ? `/${blogId}/posts/search?${params.toString()}` : `/search?${params.toString()}`);
    };

    return (
        <div className='flex items-center gap-2 max-w-2xl mx-auto'>
            <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchContainerType)}
                className='border rounded px-2 py-2 text-sm w-28'
            >
                <option value='TITLE'>제목</option>
                <option value='CONTENT'>내용</option>
                <option value='ALL'>제목+내용</option>
            </select>

            <ClientWrapper>
                <SearchInput blogId={blogId} searchType={searchType} onSearch={handleSearch} categoryName={categoryName} categoryNameByQueryParams={categoryNameByQueryParams}/>
            </ClientWrapper>
        </div>
    );
}
