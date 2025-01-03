"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ClientWrapper from "@/providers/ClientWrapper";
import SearchInput from "./SearchInput";

type SearchContainerType = "TITLE" | "CONTENT" | "ALL";

export default function SearchContainer() {
    return (
        <ClientWrapper>
            <SearchComponent />
        </ClientWrapper>
    );
}
function SearchComponent() {
    const params = useParams();
    const blogId = params.blogId as string | undefined;
    const categoryName = params.categoryName as string | undefined;
 
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
            params.set("category", decodeURIComponent(categoryName));
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
                className='border rounded px-2 py-2 text-sm w-24'
            >
                <option value='TITLE'>제목</option>
                <option value='CONTENT'>내용</option>
                <option value='ALL'>제목+내용</option>
            </select>
            <SearchInput blogId={blogId} searchType={searchType} onSearch={handleSearch} />
        </div>
    );
}
