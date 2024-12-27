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
    const router = useRouter();
    const [searchType, setSearchType] = useState<SearchContainerType>("TITLE");

    const handleSearch = (keyword: string) => {
        const params = new URLSearchParams();
        params.set("page", "1");

        if (!keyword.trim()) {
            router.push(blogId ? `/${blogId}/posts/search` : `/search`);
            return;
        }

        params.set("searchType", searchType);
        params.set("keyword", keyword); // URLSearchParams가 자동으로 인코딩. 따라서 encodeURIComponent 사용 불필요요

        router.push(blogId ? `/${blogId}/posts/search?${params.toString()}` : `/search?${params.toString()}`);
    };

    return (
        <div className='mb-6 px-4'>
            <div className='flex gap-2'>
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as SearchContainerType)}
                    className='border rounded px-3 py-2'
                >
                    <option value='TITLE'>제목</option>
                    <option value='CONTENT'>내용</option>
                    <option value='ALL'>제목+내용</option>
                </select>
                <SearchInput blogId={blogId} searchType={searchType} onSearch={handleSearch} />
            </div>
        </div>
    );
}
